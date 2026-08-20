import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import {
  COURSE_TITLE,
  evaluateCertificateEligibility,
  publicCertificateId,
} from "./certificatePolicy";
import { calculateFinalReview, COURSE_LESSON_IDS } from "./courseProgressPolicy";
import {
  attachCertificateToLearnerProgress,
  consumePasswordResetToken,
  createCertificate,
  createLearnerAccount,
  deleteLearnerAccountAndPrivateData,
  exportLearnerData,
  getCertificateById,
  getCertificateByOwner,
  getLearnerAccountByEmail,
  getLearnerAccountByUserId,
  getLearnerProgress,
  getUserById,
  getUserByOpenId,
  getAdminOverview,
  listAdminAuditLogs,
  listAdminCertificates,
  listAdminLearners,
  markLearnerCourseCompleted,
  recordAdminAuditEvent,
  revokeCertificate,
  restoreCertificate,
  rotateLearnerPasswordAndInvalidateSessions,
  setUserOpenId,
  updateLearnerAccountLogin,
  updateLearnerDisplayName,
  upsertLearnerProgress,
  upsertUser,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const certificateIdPattern = /^DSA-\d{4}-[A-Z0-9_-]{6,30}$/;
const emailSchema = z.string().trim().toLowerCase().email("أدخل بريدًا إلكترونيًا صحيحًا.").max(320);
const passwordSchema = z.string().min(12, "يجب أن تتكون كلمة المرور من 12 حرفًا على الأقل.").max(128);
const displayNameSchema = z.string().trim().min(2).max(120);
const progressRecordSchema = z.record(z.string(), z.unknown()).refine(
  value => Object.keys(value).length <= 500,
  "تجاوزت بيانات التقدم الحجم المسموح."
);

const issueCertificateInput = z.object({ learnerName: displayNameSchema.optional() });
const verifyCertificateInput = z.object({
  certificateId: z.string().trim().toUpperCase().regex(
    certificateIdPattern,
    "رقم الشهادة غير صالح. استخدم الصيغة DSA-YYYY-XXXXXXXXXX."
  ),
});
const revokeCertificateInput = verifyCertificateInput.extend({
  reason: z.string().trim().min(4).max(240),
});
const progressInput = z.object({
  completedLessons: progressRecordSchema.default({}),
  watchedVideos: progressRecordSchema.default({}),
  quizAttempts: progressRecordSchema.default({}),
  lastLessonId: z.string().trim().min(1).max(80).nullable().optional(),
  finalReview: progressRecordSchema.default({}),
});
const importLocalInput = z.object({
  localState: z.object({
    completed: progressRecordSchema.optional(),
    watched: progressRecordSchema.optional(),
    answered: progressRecordSchema.optional(),
    activeId: z.string().trim().min(1).max(80).optional(),
    finalReview: progressRecordSchema.optional(),
  }),
});
const resetTokenSchema = z.string().trim().min(32).max(256);
const deleteAccountInput = z.object({ confirmation: z.literal("حذف حسابي") });
const adminListInput = z.object({
  query: z.string().trim().max(120).optional(),
  limit: z.number().int().min(1).max(100).default(50),
}).default({ limit: 50 });
const restoreCertificateInput = verifyCertificateInput;

function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function parseRecord(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function isCompleted(value: unknown): boolean {
  if (value === true) return true;
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return item.completed === true || typeof item.completedAt === "string";
  }
  return false;
}

function meetsCourseCompletion(progress: NonNullable<Awaited<ReturnType<typeof getLearnerProgress>>>) {
  const completedLessons = parseRecord(progress.completedLessonsJson);
  const review = calculateFinalReview(parseRecord(progress.finalReviewJson));
  return COURSE_LESSON_IDS.every(lessonId => isCompleted(completedLessons[lessonId]))
    && review.submitted
    && review.percent >= 80;
}

function toPublicCertificate(record: Awaited<ReturnType<typeof getCertificateById>>) {
  if (!record) return null;
  return {
    certificateId: record.certificateId,
    learnerName: record.learnerName,
    courseTitle: record.courseTitle,
    completedLessons: record.completedLessons,
    totalLessons: record.totalLessons,
    finalReviewScore: record.finalReviewScore,
    status: record.status,
    issuedAt: record.issuedAt.getTime(),
    revokedAt: record.revokedAt?.getTime() ?? null,
    revocationReason: record.revocationReason ?? null,
  };
}

function serializeProgress(progress: Awaited<ReturnType<typeof getLearnerProgress>>) {
  if (!progress) {
    return {
      completedLessons: {}, watchedVideos: {}, quizAttempts: {}, finalReview: {},
      lastLessonId: null, courseCompletedAt: null, certificateId: null, importedAt: null, updatedAt: null,
    };
  }
  return {
    completedLessons: parseRecord(progress.completedLessonsJson),
    watchedVideos: parseRecord(progress.watchedVideosJson),
    quizAttempts: parseRecord(progress.quizAttemptsJson),
    finalReview: parseRecord(progress.finalReviewJson),
    lastLessonId: progress.lastLessonId,
    courseCompletedAt: progress.courseCompletedAt?.getTime() ?? null,
    certificateId: progress.certificateId,
    importedAt: progress.importedAt?.getTime() ?? null,
    updatedAt: progress.updatedAt.getTime(),
  };
}

async function setLearnerSession(ctx: any, openId: string, displayName: string, sessionVersion = 0) {
  const token = await sdk.createSessionToken(openId, { name: displayName, sessionVersion });
  ctx.res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(ctx.req),
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  learner: router({
    register: publicProcedure.input(z.object({
      email: emailSchema,
      password: passwordSchema,
      displayName: displayNameSchema,
    })).mutation(async ({ ctx, input }) => {
      const existing = await getLearnerAccountByEmail(input.email);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "يوجد حساب مسجل بهذا البريد الإلكتروني. سجّل الدخول بدلًا من ذلك." });
      }

      const displayName = normalizeDisplayName(input.displayName);
      const provisionalOpenId = `local:pending:${nanoid(24)}`;
      const passwordHash = await bcrypt.hash(input.password, 12);
      await upsertUser({ openId: provisionalOpenId, name: displayName, email: input.email, loginMethod: "email", lastSignedIn: new Date() });
      const user = await getUserByOpenId(provisionalOpenId);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إنشاء هوية الحساب. حاول مرة أخرى." });

      const account = await createLearnerAccount({ userId: user.id, email: input.email, passwordHash, displayName });
      const openId = `local:${account.userId}`;
      await setUserOpenId(account.userId, openId);
      await setLearnerSession(ctx, openId, displayName, user.sessionVersion);
      return { authenticated: true as const, account: { email: account.email, displayName: account.displayName } };
    }),
    login: publicProcedure.input(z.object({ email: emailSchema, password: z.string().min(1).max(128) }))
      .mutation(async ({ ctx, input }) => {
        const account = await getLearnerAccountByEmail(input.email);
        const passwordValid = account ? await bcrypt.compare(input.password, account.passwordHash) : false;
        if (!account || !passwordValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صحيحين." });
        }
        const user = await getUserById(account.userId);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "تعذر التحقق من هوية الحساب." });
        await updateLearnerAccountLogin(account.userId);
        await setLearnerSession(ctx, `local:${account.userId}`, account.displayName, user.sessionVersion);
        return { authenticated: true as const, account: { email: account.email, displayName: account.displayName } };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return { authenticated: false as const, account: null };
      const account = await getLearnerAccountByUserId(ctx.user.id);
      return {
        authenticated: true as const,
        account: account ? { email: account.email, displayName: account.displayName } : null,
        user: { name: ctx.user.name, email: ctx.user.email, loginMethod: ctx.user.loginMethod },
      };
    }),
    updateProfile: protectedProcedure.input(z.object({ displayName: displayNameSchema }))
      .mutation(async ({ ctx, input }) => {
        const account = await updateLearnerDisplayName(ctx.user.id, normalizeDisplayName(input.displayName));
        if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد ملف متعلم محلي لهذا الحساب." });
        return { account: { email: account.email, displayName: account.displayName } };
      }),
    requestPasswordReset: publicProcedure.input(z.object({ email: emailSchema })).mutation(async () => {
      /** لا قناة بريد مهيأة؛ الاستجابة موحدة كي لا تكشف وجود الحساب ولا تعطي رابطًا وهميًا. */
      return { accepted: true as const, deliveryAvailable: false as const };
    }),
    resetPassword: publicProcedure.input(z.object({ token: resetTokenSchema, password: passwordSchema }))
      .mutation(async ({ ctx, input }) => {
        const tokenHash = createHash("sha256").update(input.token).digest("hex");
        const passwordHash = await bcrypt.hash(input.password, 12);
        const changed = await consumePasswordResetToken(tokenHash, passwordHash);
        if (!changed) throw new TRPCError({ code: "BAD_REQUEST", message: "رابط إعادة التعيين غير صالح أو انتهت صلاحيته." });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        return { reset: true as const };
      }),
    changePassword: protectedProcedure.input(z.object({ currentPassword: z.string().min(1).max(128), newPassword: passwordSchema }))
      .mutation(async ({ ctx, input }) => {
        const account = await getLearnerAccountByUserId(ctx.user.id);
        if (!account || !(await bcrypt.compare(input.currentPassword, account.passwordHash))) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور الحالية غير صحيحة." });
        }
        const sessionVersion = await rotateLearnerPasswordAndInvalidateSessions(ctx.user.id, await bcrypt.hash(input.newPassword, 12));
        await setLearnerSession(ctx, ctx.user.openId, account.displayName, sessionVersion);
        return { changed: true as const };
      }),
    exportData: protectedProcedure.query(async ({ ctx }) => {
      const record = await exportLearnerData(ctx.user.id);
      const account = record.account;
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد ملف متعلم محلي لهذا الحساب." });
      return {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        account: { email: account.email, displayName: account.displayName, createdAt: account.createdAt.getTime() },
        progress: serializeProgress(record.progress),
        certificates: record.certificates.map(toPublicCertificate).filter((value): value is NonNullable<typeof value> => Boolean(value)),
      };
    }),
    deleteAccount: protectedProcedure.input(deleteAccountInput).mutation(async ({ ctx }) => {
      const account = await getLearnerAccountByUserId(ctx.user.id);
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد ملف متعلم محلي لهذا الحساب." });
      await deleteLearnerAccountAndPrivateData(ctx.user.id);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { deleted: true as const };
    }),
  }),
  progress: router({
    get: protectedProcedure.query(async ({ ctx }) => serializeProgress(await getLearnerProgress(ctx.user.id))),
    sync: protectedProcedure.input(progressInput).mutation(async ({ ctx, input }) => {
      let progress = await upsertLearnerProgress(ctx.user.id, input);
      if (!progress.courseCompletedAt && meetsCourseCompletion(progress)) {
        progress = await markLearnerCourseCompleted(ctx.user.id);
      }
      return serializeProgress(progress);
    }),
    importLocal: protectedProcedure.input(importLocalInput).mutation(async ({ ctx, input }) => {
      const local = input.localState;
      let progress = await upsertLearnerProgress(ctx.user.id, {
        completedLessons: local.completed ?? {},
        watchedVideos: local.watched ?? {},
        quizAttempts: local.answered ?? {},
        lastLessonId: local.activeId ?? null,
        finalReview: local.finalReview ?? {},
        importedAt: new Date(),
        preserveLastLesson: true,
      });
      if (!progress.courseCompletedAt && meetsCourseCompletion(progress)) {
        progress = await markLearnerCourseCompleted(ctx.user.id);
      }
      return serializeProgress(progress);
    }),
  }),
  certificate: router({
    issue: protectedProcedure.input(issueCertificateInput).mutation(async ({ ctx, input }) => {
      const account = await getLearnerAccountByUserId(ctx.user.id);
      const progress = await getLearnerProgress(ctx.user.id);
      const completedLessons = progress ? parseRecord(progress.completedLessonsJson) : {};
      const finalReview = progress ? parseRecord(progress.finalReviewJson) : {};
      const completedCount = COURSE_LESSON_IDS.filter(lessonId => isCompleted(completedLessons[lessonId])).length;
      const review = calculateFinalReview(finalReview);
      const learnerName = normalizeDisplayName(input.learnerName ?? account?.displayName ?? ctx.user.name ?? "");
      const eligibility = evaluateCertificateEligibility({
        learnerName,
        completedLessons: completedCount,
        totalLessons: COURSE_LESSON_IDS.length,
        finalReviewScore: review.submitted ? review.percent : 0,
      });
      if (!eligibility.eligible) throw new TRPCError({ code: "BAD_REQUEST", message: eligibility.reason });

      if (!progress?.courseCompletedAt) await markLearnerCourseCompleted(ctx.user.id);

      const existing = await getCertificateByOwner(ctx.user.id);
      if (existing) {
        await attachCertificateToLearnerProgress(ctx.user.id, existing.certificateId);
        return { valid: existing.status === "valid", certificate: toPublicCertificate(existing) };
      }

      const certificateId = publicCertificateId(new Date().getUTCFullYear(), nanoid(10));
      try {
        const record = await createCertificate({
          certificateId,
          ownerUserId: ctx.user.id,
          learnerName,
          courseTitle: COURSE_TITLE,
          completedLessons: completedCount,
          totalLessons: COURSE_LESSON_IDS.length,
          finalReviewScore: review.percent,
          status: "valid",
        });
        await attachCertificateToLearnerProgress(ctx.user.id, record.certificateId);
        await recordAdminAuditEvent({
          actorUserId: ctx.user.id,
          action: "learner.certificate_issued",
          targetType: "certificate",
          targetId: record.certificateId,
          result: "success",
          metadata: { status: record.status },
        });
        return { valid: true as const, certificate: toPublicCertificate(record) };
      } catch (error) {
        console.error("[Certificates] issuance failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إصدار الشهادة الآن. حاول مرة أخرى." });
      }
    }),
    verify: publicProcedure.input(verifyCertificateInput).query(async ({ input }) => {
      try {
        const record = await getCertificateById(input.certificateId);
        const certificate = toPublicCertificate(record);
        if (!certificate) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Certificate Not Found / رقم الشهادة غير موجود في السجل العام." });
        }
        return { found: true as const, valid: certificate.status === "valid", certificate };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Certificates] verification failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر الوصول إلى سجل التحقق الآن. حاول مرة أخرى." });
      }
    }),
    revoke: adminProcedure.input(revokeCertificateInput).mutation(async ({ ctx, input }) => {
      try {
        const record = await revokeCertificate(input.certificateId, input.reason);
        const certificate = toPublicCertificate(record);
        if (!certificate) throw new TRPCError({ code: "NOT_FOUND", message: "لا توجد شهادة بهذا الرقم." });
        await recordAdminAuditEvent({
          actorUserId: ctx.user.id,
          action: "admin.certificate_revoked",
          targetType: "certificate",
          targetId: input.certificateId,
          result: "success",
          metadata: { status: "revoked" },
        });
        return { revoked: true as const, certificate };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Certificates] revocation failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إبطال الشهادة الآن. حاول مرة أخرى." });
      }
    }),
  }),
  admin: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    learners: adminProcedure.input(adminListInput).query(({ input }) => listAdminLearners(input)),
    certificates: adminProcedure.input(adminListInput).query(({ input }) => listAdminCertificates(input)),
    audit: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).optional() }).default({})).query(({ input }) => listAdminAuditLogs(input.limit ?? 50)),
    restoreCertificate: adminProcedure.input(restoreCertificateInput).mutation(async ({ ctx, input }) => {
      const record = await restoreCertificate(input.certificateId);
      const certificate = toPublicCertificate(record);
      if (!certificate) throw new TRPCError({ code: "NOT_FOUND", message: "لا توجد شهادة بهذا الرقم." });
      await recordAdminAuditEvent({
        actorUserId: ctx.user.id,
        action: "admin.certificate_restored",
        targetType: "certificate",
        targetId: input.certificateId,
        result: "success",
        metadata: { status: "valid" },
      });
      return { restored: true as const, certificate };
    }),
  }),
});

export type AppRouter = typeof appRouter;
