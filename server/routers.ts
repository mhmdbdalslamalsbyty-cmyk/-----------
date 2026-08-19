import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import {
  COURSE_TITLE,
  evaluateCertificateEligibility,
  publicCertificateId,
} from "./certificatePolicy";
import { createCertificate, getCertificateById, revokeCertificate } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

const issueCertificateInput = z.object({
  learnerName: z.string().trim().min(2).max(120),
  completedLessons: z.number().int().min(0).max(200),
  totalLessons: z.number().int().min(1).max(200),
  finalReviewScore: z.number().int().min(0).max(100),
});

const certificateIdPattern = /^DSA-\d{4}-[A-Z0-9_-]{6,30}$/;

const verifyCertificateInput = z.object({
  certificateId: z.string().trim().toUpperCase().regex(
    certificateIdPattern,
    "رقم الشهادة غير صالح. استخدم الصيغة DSA-YYYY-XXXXXXXXXX."
  ),
});

const revokeCertificateInput = verifyCertificateInput.extend({
  reason: z.string().trim().min(4).max(240),
});

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
  certificate: router({
    issue: publicProcedure.input(issueCertificateInput).mutation(async ({ input }) => {
      const eligibility = evaluateCertificateEligibility(input);
      if (!eligibility.eligible) {
        throw new TRPCError({ code: "BAD_REQUEST", message: eligibility.reason });
      }

      const certificateId = publicCertificateId(new Date().getUTCFullYear(), nanoid(10));
      try {
        const record = await createCertificate({
          certificateId,
          learnerName: input.learnerName.trim().replace(/\s+/g, " "),
          courseTitle: COURSE_TITLE,
          completedLessons: input.completedLessons,
          totalLessons: input.totalLessons,
          finalReviewScore: input.finalReviewScore,
          status: "valid",
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
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Certificate Not Found / رقم الشهادة غير موجود في السجل العام.",
          });
        }
        return { found: true as const, valid: certificate.status === "valid", certificate };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Certificates] verification failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر الوصول إلى سجل التحقق الآن. حاول مرة أخرى." });
      }
    }),
    revoke: adminProcedure.input(revokeCertificateInput).mutation(async ({ input }) => {
      try {
        const record = await revokeCertificate(input.certificateId, input.reason);
        const certificate = toPublicCertificate(record);
        if (!certificate) throw new TRPCError({ code: "NOT_FOUND", message: "لا توجد شهادة بهذا الرقم." });
        return { revoked: true as const, certificate };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Certificates] revocation failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إبطال الشهادة الآن. حاول مرة أخرى." });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
