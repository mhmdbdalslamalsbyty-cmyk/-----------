import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  certificates,
  type Certificate,
  type InsertCertificate,
  type InsertUser,
  learnerAccounts,
  learnerProgress,
  type LearnerAccount,
  type LearnerProgress,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setUserOpenId(userId: number, openId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات المستخدمين غير متاحة حاليًا.");

  await db.update(users).set({ openId, lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function createCertificate(input: InsertCertificate): Promise<Certificate> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الشهادات غير متاحة حاليًا.");

  await db.insert(certificates).values(input);
  const created = await getCertificateById(input.certificateId);
  if (!created) throw new Error("تعذر استرجاع الشهادة بعد إصدارها.");
  return created;
}

export async function getCertificateById(certificateId: string): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الشهادات غير متاحة حاليًا.");

  const result = await db
    .select()
    .from(certificates)
    .where(eq(certificates.certificateId, certificateId))
    .limit(1);
  return result[0];
}

export async function revokeCertificate(certificateId: string, reason: string): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الشهادات غير متاحة حاليًا.");

  await db
    .update(certificates)
    .set({ status: "revoked", revokedAt: new Date(), revocationReason: reason })
    .where(eq(certificates.certificateId, certificateId));
  return getCertificateById(certificateId);
}

export type LearnerProgressInput = {
  completedLessons: Record<string, unknown>;
  watchedVideos: Record<string, unknown>;
  quizAttempts: Record<string, unknown>;
  lastLessonId?: string | null;
  finalReview: Record<string, unknown>;
  courseCompletedAt?: Date | null;
  certificateId?: string | null;
  importedAt?: Date | null;
  preserveLastLesson?: boolean;
};

type JsonRecord = Record<string, unknown>;

function parseJsonRecord(raw: string): JsonRecord {
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as JsonRecord)
      : {};
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stableKey(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** يمنع دمج التقدم جهازًا متأخرًا من خفض أفضل نتيجة أو حذف إنجاز محفوظ. */
function mergeProgressValue(current: unknown, incoming: unknown): unknown {
  if (typeof current === "number" && typeof incoming === "number") {
    return Math.max(current, incoming);
  }

  if (typeof current === "boolean" && typeof incoming === "boolean") {
    return current || incoming;
  }

  if (Array.isArray(current) && Array.isArray(incoming)) {
    const unique = new Map<string, unknown>();
    [...current, ...incoming].forEach(value => unique.set(stableKey(value), value));
    return Array.from(unique.values());
  }

  if (isRecord(current) && isRecord(incoming)) {
    const merged: JsonRecord = { ...current };
    for (const [key, value] of Object.entries(incoming)) {
      merged[key] = key in current ? mergeProgressValue(current[key], value) : value;
    }
    return merged;
  }

  if (current === undefined || current === null || current === false || current === 0 || current === "") {
    return incoming;
  }

  return current;
}

function mergeProgressRecord(current: JsonRecord, incoming: JsonRecord): JsonRecord {
  return mergeProgressValue(current, incoming) as JsonRecord;
}

export async function createLearnerAccount(input: {
  userId: number;
  email: string;
  passwordHash: string;
  displayName: string;
}): Promise<LearnerAccount> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");

  await db.insert(learnerAccounts).values({ ...input, lastLoginAt: new Date() });
  const account = await getLearnerAccountByUserId(input.userId);
  if (!account) throw new Error("تعذر استرجاع حساب المتعلم بعد إنشائه.");
  return account;
}

export async function getLearnerAccountByEmail(email: string): Promise<LearnerAccount | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");

  const result = await db.select().from(learnerAccounts).where(eq(learnerAccounts.email, email)).limit(1);
  return result[0];
}

export async function getLearnerAccountByUserId(userId: number): Promise<LearnerAccount | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");

  const result = await db.select().from(learnerAccounts).where(eq(learnerAccounts.userId, userId)).limit(1);
  return result[0];
}

export async function updateLearnerAccountLogin(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");

  await db.update(learnerAccounts).set({ lastLoginAt: new Date() }).where(eq(learnerAccounts.userId, userId));
}

export async function updateLearnerDisplayName(
  userId: number,
  displayName: string
): Promise<LearnerAccount | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");

  await db.update(learnerAccounts).set({ displayName }).where(eq(learnerAccounts.userId, userId));
  return getLearnerAccountByUserId(userId);
}

export async function getLearnerProgress(userId: number): Promise<LearnerProgress | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات تقدم المتعلمين غير متاحة حاليًا.");

  const result = await db.select().from(learnerProgress).where(eq(learnerProgress.userId, userId)).limit(1);
  return result[0];
}

export async function upsertLearnerProgress(
  userId: number,
  input: LearnerProgressInput
): Promise<LearnerProgress> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات تقدم المتعلمين غير متاحة حاليًا.");

  const existing = await getLearnerProgress(userId);
  const completedLessons = mergeProgressRecord(existing ? parseJsonRecord(existing.completedLessonsJson) : {}, input.completedLessons);
  const watchedVideos = mergeProgressRecord(existing ? parseJsonRecord(existing.watchedVideosJson) : {}, input.watchedVideos);
  const quizAttempts = mergeProgressRecord(existing ? parseJsonRecord(existing.quizAttemptsJson) : {}, input.quizAttempts);
  const finalReview = mergeProgressRecord(existing ? parseJsonRecord(existing.finalReviewJson) : {}, input.finalReview);
  const values = {
    completedLessonsJson: JSON.stringify(completedLessons),
    watchedVideosJson: JSON.stringify(watchedVideos),
    quizAttemptsJson: JSON.stringify(quizAttempts),
    finalReviewJson: JSON.stringify(finalReview),
    lastLessonId: input.lastLessonId?.trim()
      ? (input.preserveLastLesson ? existing?.lastLessonId || input.lastLessonId.trim() : input.lastLessonId.trim())
      : existing?.lastLessonId || null,
    courseCompletedAt: input.courseCompletedAt ?? existing?.courseCompletedAt ?? null,
    certificateId: input.certificateId?.trim() || existing?.certificateId || null,
    importedAt: input.importedAt ?? existing?.importedAt ?? null,
  };

  if (existing) {
    await db.update(learnerProgress).set(values).where(eq(learnerProgress.userId, userId));
  } else {
    await db.insert(learnerProgress).values({ userId, ...values });
  }

  const stored = await getLearnerProgress(userId);
  if (!stored) throw new Error("تعذر استرجاع التقدم بعد حفظه.");
  return stored;
}

export async function attachCertificateToLearnerProgress(userId: number, certificateId: string): Promise<LearnerProgress> {
  const existing = await getLearnerProgress(userId);
  return upsertLearnerProgress(userId, {
    completedLessons: existing ? parseJsonRecord(existing.completedLessonsJson) : {},
    watchedVideos: existing ? parseJsonRecord(existing.watchedVideosJson) : {},
    quizAttempts: existing ? parseJsonRecord(existing.quizAttemptsJson) : {},
    lastLessonId: existing?.lastLessonId ?? null,
    finalReview: existing ? parseJsonRecord(existing.finalReviewJson) : {},
    courseCompletedAt: existing?.courseCompletedAt ?? new Date(),
    certificateId,
    importedAt: existing?.importedAt ?? null,
  });
}

export async function markLearnerCourseCompleted(userId: number): Promise<LearnerProgress> {
  const existing = await getLearnerProgress(userId);
  return upsertLearnerProgress(userId, {
    completedLessons: existing ? parseJsonRecord(existing.completedLessonsJson) : {},
    watchedVideos: existing ? parseJsonRecord(existing.watchedVideosJson) : {},
    quizAttempts: existing ? parseJsonRecord(existing.quizAttemptsJson) : {},
    lastLessonId: existing?.lastLessonId ?? null,
    finalReview: existing ? parseJsonRecord(existing.finalReviewJson) : {},
    courseCompletedAt: existing?.courseCompletedAt ?? new Date(),
    certificateId: existing?.certificateId ?? null,
    importedAt: existing?.importedAt ?? null,
  });
}

export async function linkCertificateToUser(certificateId: string, userId: number): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الشهادات غير متاحة حاليًا.");

  await db.update(certificates).set({ ownerUserId: userId }).where(eq(certificates.certificateId, certificateId));
  return getCertificateById(certificateId);
}

export async function getCertificateByOwner(userId: number): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الشهادات غير متاحة حاليًا.");

  const result = await db.select().from(certificates).where(eq(certificates.ownerUserId, userId)).limit(1);
  return result[0];
}
