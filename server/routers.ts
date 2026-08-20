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
  exportAdminLearners,
  exportLearnerData,
  getCertificateById,
  getCertificateByOwner,
  getLearnerAccountByEmail,
  getLearnerAccountByUserId,
  getLearnerProgress,
  getUserById,
  getUserByOpenId,
  getAdminLearnerDetail,
  getAdminOverview,
  listAdminAuditLogs,
  listAdminCertificates,
  listAdminLearners,
  listAdminLearnersPage,
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
const adminDateRangeInput = z.object({
  preset: z.enum(["today", "7d", "30d", "90d", "all", "custom"]).default("all"),
  from: z.number().int().nonnegative().optional(),
  to: z.number().int().nonnegative().optional(),
  timezoneOffsetMinutes: z.number().int().min(-840).max(840).optional(),
}).superRefine((value, ctx) => {
  if (value.preset === "custom" && (value.from === undefined || value.to === undefined)) {
    ctx.addIssue({ code: "custom", message: "يتطلب النطاق المخصص تاريخ بداية ونهاية." });
  }
  if (value.from !== undefined && value.to !== undefined && value.from > value.to) {
    ctx.addIssue({ code: "custom", message: "يجب أن يكون تاريخ البداية قبل تاريخ النهاية." });
  }
});
const adminListInput = z.object({
  query: z.string().trim().max(120).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  dateRange: adminDateRangeInput.optional(),
}).default({ limit: 50 });
const adminLearnerPageInput = z.object({
  query: z.string().trim().max(120).optional(),
  limit: z.number().int().min(5).max(100).default(20),
  page: z.number().int().min(1).default(1),
  dateRange: adminDateRangeInput.optional(),
}).default({ limit: 20, page: 1 });
const adminLearnerDetailInput = z.object({
  userId: z.number().int().positive(),
  dateRange: adminDateRangeInput.optional(),
});
const adminExportInput = z.object({
  query: z.string().trim().max(120).optional(),
  dateRange: adminDateRangeInput.optional(),
}).default({});
const restoreCertificateInput = verifyCertificateInput;

function resolveAdminDateRange(input?: z.infer<typeof adminDateRangeInput>) {
  const preset = input?.preset ?? "all";
  if (preset === "all") return undefined;
  if (preset === "custom") return { from: new Date(input!.from!), to: new Date(input!.to!) };

  const now = new Date();
  if (preset === "today") {
    const offset = input?.timezoneOffsetMinutes ?? 0;
    const viewerNow = new Date(now.getTime() - offset * 60 * 1000);
    const viewerDayStartUtc = Date.UTC(viewerNow.getUTCFullYear(), viewerNow.getUTCMonth(), viewerNow.getUTCDate()) + offset * 60 * 1000;
    return { from: new Date(viewerDayStartUtc), to: now };
  }
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  return { from: new Date(now.getTime() - days * 24 * 60 * 60 * 1000), to: now };
}

function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function csvDate(value?: Date | null) {
  return value ? value.toISOString() : "";
}

function buildLearnersCsv(rows: Awaited<ReturnType<typeof exportAdminLearners>>) {
  const header = ["معرّف المتعلم", "الاسم", "البريد الإلكتروني", "تاريخ التسجيل", "آخر نشاط", "التقدم", "الدروس المكتملة", "أفضل نتيجة اختبار", "حالة الشهادة"];
  const values = rows.map(row => [
    row.userId,
    row.displayName,
    row.email,
    csvDate(row.createdAt),
    csvDate(row.lastActivityAt),
    `${row.progressPercent}%`,
    row.completedLessons,
    row.bestQuizScore,
    row.certificateStatus === "valid" ? "سارية" : row.certificateStatus === "revoked" ? "ملغاة" : "لا توجد شهادة",
  ]);
  return "\uFEFF" + [header, ...values].map(row => row.map(csvCell).join(",")).join("\r\n");
}

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
    logout: publicProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role === "admin") {
        try {
          await recordAdminAuditEvent({
            actorUserId: ctx.user.id,
            action: "admin.logged_out",
            targetType: "session",
            targetId: String(ctx.user.id),
            result: "success",
            metadata: { loginMethod: ctx.user.loginMethod ?? null },
          });
        } catch (error) {
          console.error("[Audit] Failed to record admin logout", error);
        }
      }
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
    overview: adminProcedure.input(z.object({ dateRange: adminDateRangeInput.optional() }).default({})).query(({ input }) => getAdminOverview({ dateRange: resolveAdminDateRange(input.dateRange) })),
    learners: adminProcedure.input(adminListInput).query(({ input }) => listAdminLearners({ ...input, dateRange: resolveAdminDateRange(input.dateRange) })),
    learnersPage: adminProcedure.input(adminLearnerPageInput).query(({ input }) => listAdminLearnersPage({ ...input, dateRange: resolveAdminDateRange(input.dateRange) })),
    learnerDetail: adminProcedure.input(adminLearnerDetailInput).query(async ({ ctx, input }) => {
      const learner = await getAdminLearnerDetail(input.userId, { dateRange: resolveAdminDateRange(input.dateRange) });
      if (!learner) throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد متعلم بهذا المعرّف." });
      await recordAdminAuditEvent({
        actorUserId: ctx.user.id,
        action: "admin.learner_detail_viewed",
        targetType: "learner_account",
        targetId: String(input.userId),
        result: "success",
        metadata: { dateRangePreset: input.dateRange?.preset ?? "all" },
      });
      return learner;
    }),
    certificates: adminProcedure.input(adminListInput).query(({ input }) => listAdminCertificates({ ...input, dateRange: resolveAdminDateRange(input.dateRange) })),
    audit: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).optional(), dateRange: adminDateRangeInput.optional() }).default({})).query(({ input }) => listAdminAuditLogs({ limit: input.limit ?? 50, dateRange: resolveAdminDateRange(input.dateRange) })),
    exportLearnersCSV: adminProcedure.input(adminExportInput).mutation(async ({ ctx, input }) => {
      const dateRange = resolveAdminDateRange(input.dateRange);
      const rows = await exportAdminLearners({ query: input.query, dateRange });
      const csv = buildLearnersCsv(rows);
      await recordAdminAuditEvent({
        actorUserId: ctx.user.id,
        action: "admin.learners_exported",
        targetType: "learner_export",
        result: "success",
        metadata: {
          recordCount: rows.length,
          dateRangePreset: input.dateRange?.preset ?? "all",
          queryApplied: Boolean(input.query),
        },
      });
      return {
        csv,
        filename: `طلاب-أكاديمية-هياكل-البيانات-${new Date().toISOString().slice(0, 10)}.csv`,
        recordCount: rows.length,
      };
    }),
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
