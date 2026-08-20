import { and, desc, eq, gt, isNull, like, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  adminAuditLogs,
  type AdminAuditLog,
  certificates,
  type Certificate,
  type InsertCertificate,
  type InsertUser,
  learnerAccounts,
  learnerProgress,
  type LearnerAccount,
  type LearnerProgress,
  passwordResetTokens,
  type PasswordResetToken,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { calculateFinalReview } from "./courseProgressPolicy";

let _db: ReturnType<typeof drizzle> | null = null;

type AuditEvent = {
  actorUserId?: number | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  result?: "success" | "denied" | "failed";
  metadata?: Record<string, string | number | boolean | null>;
};

function auditPayload(metadata?: AuditEvent["metadata"]) {
  return JSON.stringify(metadata ?? {});
}

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

  await db.transaction(async tx => {
    await tx.insert(learnerAccounts).values({ ...input, lastLoginAt: new Date() });
    await tx.insert(adminAuditLogs).values({
      actorUserId: input.userId,
      action: "learner.account_created",
      targetType: "learner_account",
      targetId: String(input.userId),
      metadataJson: auditPayload(),
    });
  });
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

  await db.transaction(async tx => {
    await tx.update(learnerAccounts).set({ lastLoginAt: new Date() }).where(eq(learnerAccounts.userId, userId));
    await tx.insert(adminAuditLogs).values({
      actorUserId: userId,
      action: "learner.logged_in",
      targetType: "learner_account",
      targetId: String(userId),
      metadataJson: auditPayload(),
    });
  });
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

export async function getCertificatesByOwner(userId: number): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الشهادات غير متاحة حاليًا.");
  return db.select().from(certificates).where(eq(certificates.ownerUserId, userId));
}

export async function createPasswordResetToken(input: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}): Promise<PasswordResetToken> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");
  await db.transaction(async tx => {
    await tx.insert(passwordResetTokens).values(input);
    await tx.insert(adminAuditLogs).values({
      actorUserId: input.userId,
      action: "learner.password_reset_requested",
      targetType: "learner_account",
      targetId: String(input.userId),
      metadataJson: auditPayload(),
    });
  });
  const created = await db.select().from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, input.tokenHash)).limit(1);
  if (!created[0]) throw new Error("تعذر حفظ رمز الاستعادة.");
  return created[0];
}

export async function getUsablePasswordResetToken(tokenHash: string): Promise<PasswordResetToken | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");
  const result = await db.select().from(passwordResetTokens).where(and(
    eq(passwordResetTokens.tokenHash, tokenHash),
    isNull(passwordResetTokens.usedAt),
    gt(passwordResetTokens.expiresAt, new Date())
  )).limit(1);
  return result[0];
}

export async function rotateLearnerPasswordAndInvalidateSessions(userId: number, passwordHash: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");
  const user = await getUserById(userId);
  if (!user) throw new Error("تعذر العثور على هوية المتعلم.");
  return db.transaction(async tx => {
    await tx.update(learnerAccounts).set({ passwordHash }).where(eq(learnerAccounts.userId, userId));
    await tx.update(users).set({ sessionVersion: sql`${users.sessionVersion} + 1` }).where(eq(users.id, userId));
    await tx.insert(adminAuditLogs).values({
      actorUserId: userId,
      action: "learner.password_changed",
      targetType: "learner_account",
      targetId: String(userId),
      metadataJson: auditPayload(),
    });
    const rotated = await tx.select({ sessionVersion: users.sessionVersion }).from(users).where(eq(users.id, userId)).limit(1);
    if (!rotated[0]) throw new Error("تعذر تأكيد تدوير الجلسة الآمنة.");
    return rotated[0].sessionVersion;
  });
}

/** يستهلك الرمز مرة واحدة فقط قبل تدوير كلمة المرور وإبطال الجلسات المحلية. */
export async function consumePasswordResetToken(tokenHash: string, passwordHash: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");
  const token = await getUsablePasswordResetToken(tokenHash);
  if (!token) return false;

  return db.transaction(async tx => {
    const consumed = await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(and(
      eq(passwordResetTokens.id, token.id),
      isNull(passwordResetTokens.usedAt)
    ));
    if (!consumed[0]?.affectedRows) return false;
    await tx.update(learnerAccounts).set({ passwordHash }).where(eq(learnerAccounts.userId, token.userId));
    await tx.update(users).set({ sessionVersion: sql`${users.sessionVersion} + 1` }).where(eq(users.id, token.userId));
    await tx.insert(adminAuditLogs).values({
      actorUserId: token.userId,
      action: "learner.password_reset_completed",
      targetType: "learner_account",
      targetId: String(token.userId),
      metadataJson: auditPayload(),
    });
    return true;
  });
}

export async function exportLearnerData(userId: number) {
  const account = await getLearnerAccountByUserId(userId);
  const progress = await getLearnerProgress(userId);
  const ownedCertificates = await getCertificatesByOwner(userId);
  return { account, progress, certificates: ownedCertificates };
}

/** حذف حساب البريد وبياناته الخاصة فقط؛ تبقى الشهادة العامة قابلة للتحقق من سجلها العلني. */
export async function deleteLearnerAccountAndPrivateData(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات حسابات المتعلمين غير متاحة حاليًا.");
  await db.transaction(async tx => {
    await tx.update(certificates).set({ ownerUserId: null }).where(eq(certificates.ownerUserId, userId));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    await tx.delete(learnerProgress).where(eq(learnerProgress.userId, userId));
    await tx.delete(learnerAccounts).where(eq(learnerAccounts.userId, userId));
    await tx.insert(adminAuditLogs).values({
      actorUserId: userId,
      action: "learner.account_deleted",
      targetType: "learner_account",
      targetId: String(userId),
      metadataJson: auditPayload({ publicCertificatesRetained: true }),
    });
    await tx.delete(users).where(eq(users.id, userId));
  });
}

export async function recordAdminAuditEvent(event: AuditEvent): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات التدقيق غير متاحة حاليًا.");
  await db.insert(adminAuditLogs).values({
    actorUserId: event.actorUserId ?? null,
    action: event.action,
    targetType: event.targetType,
    targetId: event.targetId ?? null,
    result: event.result ?? "success",
    metadataJson: auditPayload(event.metadata),
  });
}

function parseAdminJson(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function completedLessonCount(value?: string) {
  return Object.values(parseAdminJson(value ?? "{}")).filter(item => item === true || (item && typeof item === "object" && (item as Record<string, unknown>).completed === true)).length;
}

function quizAttemptCount(value?: string) {
  return Object.values(parseAdminJson(value ?? "{}")).reduce<number>((total, item) => {
    if (!item || typeof item !== "object") return total;
    const attempts = (item as Record<string, unknown>).attempts;
    return total + (typeof attempts === "number" && Number.isFinite(attempts) ? Math.max(0, Math.floor(attempts)) : 0);
  }, 0);
}

function videoCompletionCount(value?: string) {
  return Object.values(parseAdminJson(value ?? "{}")).filter(item => item === true || (item && typeof item === "object" && (item as Record<string, unknown>).completed === true)).length;
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الإدارة غير متاحة حاليًا.");
  const [learners, certificateRows, auditRows] = await Promise.all([
    db.select({
      userId: learnerAccounts.userId,
      displayName: learnerAccounts.displayName,
      email: learnerAccounts.email,
      createdAt: learnerAccounts.createdAt,
      lastLoginAt: learnerAccounts.lastLoginAt,
      progressUpdatedAt: learnerProgress.updatedAt,
      courseCompletedAt: learnerProgress.courseCompletedAt,
      completedLessonsJson: learnerProgress.completedLessonsJson,
      watchedVideosJson: learnerProgress.watchedVideosJson,
      quizAttemptsJson: learnerProgress.quizAttemptsJson,
      finalReviewJson: learnerProgress.finalReviewJson,
    }).from(learnerAccounts).leftJoin(learnerProgress, eq(learnerProgress.userId, learnerAccounts.userId)),
    db.select().from(certificates),
    db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(12),
  ]);
  const activeAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const totalQuizAttempts = learners.reduce<number>((total, learner) => total + quizAttemptCount(learner.quizAttemptsJson ?? undefined), 0);
  const totalCompletedLessons = learners.reduce<number>((total, learner) => total + completedLessonCount(learner.completedLessonsJson ?? undefined), 0);
  const videoCompletions = learners.reduce<number>((total, learner) => total + videoCompletionCount(learner.watchedVideosJson ?? undefined), 0);
  const averageProgressPercent = learners.length
    ? Math.round(learners.reduce<number>((total, learner) => total + (completedLessonCount(learner.completedLessonsJson ?? undefined) / 12) * 100, 0) / learners.length)
    : 0;
  const finalReviewResults = learners.map(learner => calculateFinalReview(parseAdminJson(learner.finalReviewJson ?? "{}")));
  const submittedFinalReviews = finalReviewResults.filter(review => review.submitted);
  const finalReviewPasses = submittedFinalReviews.filter(review => review.percent >= 80).length;
  const finalReviewPassRate = submittedFinalReviews.length ? Math.round((finalReviewPasses / submittedFinalReviews.length) * 100) : 0;
  return {
    metrics: {
      totalLearners: learners.length,
      activeLearners30d: learners.filter(learner => learner.lastLoginAt >= activeAfter).length,
      courseCompletions: learners.filter(learner => Boolean(learner.courseCompletedAt)).length,
      issuedCertificates: certificateRows.length,
      validCertificates: certificateRows.filter(certificate => certificate.status === "valid").length,
      revokedCertificates: certificateRows.filter(certificate => certificate.status === "revoked").length,
      totalQuizAttempts,
      totalCompletedLessons,
      videoCompletions,
      averageProgressPercent,
      submittedFinalReviews: submittedFinalReviews.length,
      finalReviewPasses,
      finalReviewPassRate,
    },
    recentLearners: learners.sort((a, b) => b.lastLoginAt.getTime() - a.lastLoginAt.getTime()).slice(0, 6).map(learner => ({
      userId: learner.userId,
      displayName: learner.displayName,
      lastLoginAt: learner.lastLoginAt,
      courseCompletedAt: learner.courseCompletedAt,
      completedLessons: completedLessonCount(learner.completedLessonsJson ?? undefined),
    })),
    audit: auditRows.map(row => ({ ...row, metadata: parseAdminJson(row.metadataJson) })),
  };
}

export async function listAdminLearners(input: { query?: string; limit: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الإدارة غير متاحة حاليًا.");
  const query = input.query?.trim();
  const rows = await db.select({
    userId: learnerAccounts.userId,
    displayName: learnerAccounts.displayName,
    email: learnerAccounts.email,
    createdAt: learnerAccounts.createdAt,
    lastLoginAt: learnerAccounts.lastLoginAt,
    progressUpdatedAt: learnerProgress.updatedAt,
    courseCompletedAt: learnerProgress.courseCompletedAt,
    certificateId: learnerProgress.certificateId,
    completedLessonsJson: learnerProgress.completedLessonsJson,
    quizAttemptsJson: learnerProgress.quizAttemptsJson,
  }).from(learnerAccounts).leftJoin(learnerProgress, eq(learnerProgress.userId, learnerAccounts.userId))
    .where(query ? or(like(learnerAccounts.displayName, `%${query}%`), like(learnerAccounts.email, `%${query}%`)) : undefined)
    .orderBy(desc(learnerAccounts.lastLoginAt)).limit(input.limit);
  return rows.map(row => ({
    ...row,
    completedLessons: completedLessonCount(row.completedLessonsJson ?? undefined),
    quizAttempts: quizAttemptCount(row.quizAttemptsJson ?? undefined),
  }));
}

export async function listAdminCertificates(input: { query?: string; limit: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الشهادات غير متاحة حاليًا.");
  const query = input.query?.trim();
  return db.select().from(certificates)
    .where(query ? or(like(certificates.certificateId, `%${query}%`), like(certificates.learnerName, `%${query}%`)) : undefined)
    .orderBy(desc(certificates.issuedAt)).limit(input.limit);
}

export async function restoreCertificate(certificateId: string): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات الشهادات غير متاحة حاليًا.");
  await db.update(certificates).set({ status: "valid", revokedAt: null, revocationReason: null }).where(eq(certificates.certificateId, certificateId));
  return getCertificateById(certificateId);
}

export async function listAdminAuditLogs(limit = 50): Promise<Array<AdminAuditLog & { metadata: Record<string, unknown> }>> {
  const db = await getDb();
  if (!db) throw new Error("قاعدة بيانات التدقيق غير متاحة حاليًا.");
  const rows = await db.select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(limit);
  return rows.map(row => ({ ...row, metadata: parseAdminJson(row.metadataJson) }));
}
