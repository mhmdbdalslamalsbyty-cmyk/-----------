import { describe, expect, it, beforeEach, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  attachCertificateToLearnerProgress: vi.fn(),
  consumePasswordResetToken: vi.fn(),
  createCertificate: vi.fn(),
  createLearnerAccount: vi.fn(),
  deleteLearnerAccountAndPrivateData: vi.fn(),
  exportLearnerData: vi.fn(),
  getAdminOverview: vi.fn(),
  getCertificateById: vi.fn(),
  getCertificateByOwner: vi.fn(),
  getLearnerAccountByEmail: vi.fn(),
  getLearnerAccountByUserId: vi.fn(),
  getLearnerProgress: vi.fn(),
  getUserById: vi.fn(),
  getUserByOpenId: vi.fn(),
  listAdminAuditLogs: vi.fn(),
  listAdminCertificates: vi.fn(),
  listAdminLearners: vi.fn(),
  markLearnerCourseCompleted: vi.fn(),
  recordAdminAuditEvent: vi.fn(),
  restoreCertificate: vi.fn(),
  revokeCertificate: vi.fn(),
  rotateLearnerPasswordAndInvalidateSessions: vi.fn(),
  setUserOpenId: vi.fn(),
  updateLearnerAccountLogin: vi.fn(),
  updateLearnerDisplayName: vi.fn(),
  upsertLearnerProgress: vi.fn(),
  upsertUser: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn(), hash: vi.fn() } }));
vi.mock("./_core/sdk", () => ({ sdk: { createSessionToken: vi.fn() } }));

import { appRouter } from "./routers";

const certificate = {
  id: 1,
  certificateId: "DSA-2026-ADMIN123",
  ownerUserId: 101,
  learnerName: "ليان أحمد",
  courseTitle: "هياكل البيانات",
  completedLessons: 12,
  totalLessons: 12,
  finalReviewScore: 90,
  status: "revoked" as const,
  revokedAt: new Date("2026-08-20T00:00:00.000Z"),
  revocationReason: "تدقيق إداري",
  issuedAt: new Date("2026-08-18T00:00:00.000Z"),
};

function context(role: "user" | "admin") {
  return {
    user: {
      id: 7,
      openId: "local:7",
      name: "مدير الأكاديمية",
      email: "admin@example.test",
      loginMethod: "email",
      role,
      sessionVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { headers: {} },
    res: { cookie: vi.fn(), clearCookie: vi.fn() },
  } as never;
}

function guestContext() {
  return { user: null, req: { headers: {} }, res: { cookie: vi.fn(), clearCookie: vi.fn() } } as never;
}

describe("مركز التحكم الإداري", () => {
  beforeEach(() => vi.clearAllMocks());

  it("يرفض مؤشرات الإدارة للمتعلم قبل تنفيذ أي استعلام بيانات", async () => {
    await expect(appRouter.createCaller(context("user")).admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getAdminOverview).not.toHaveBeenCalled();
  });

  it("يرفض الضيف قبل الوصول إلى قائمة المتعلمين التي تتضمن بيانات تعريفية", async () => {
    await expect(appRouter.createCaller(guestContext()).admin.learners({ limit: 20 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.listAdminLearners).not.toHaveBeenCalled();
  });

  it("يعيد المؤشرات الحقيقية للمدير المخول فقط", async () => {
    dbMocks.getAdminOverview.mockResolvedValue({ metrics: { totalLearners: 2 }, recentLearners: [], audit: [] });

    await expect(appRouter.createCaller(context("admin")).admin.overview()).resolves.toMatchObject({ metrics: { totalLearners: 2 } });
    expect(dbMocks.getAdminOverview).toHaveBeenCalledTimes(1);
  });

  it("يوثق إبطال الشهادة واستعادتها مع هوية المدير ومن دون سبب الإبطال الحساس", async () => {
    dbMocks.revokeCertificate.mockResolvedValue(certificate);
    dbMocks.restoreCertificate.mockResolvedValue({ ...certificate, status: "valid", revokedAt: null, revocationReason: null });
    const caller = appRouter.createCaller(context("admin"));

    await expect(caller.certificate.revoke({ certificateId: certificate.certificateId, reason: "تدقيق إداري" })).resolves.toMatchObject({ revoked: true });
    await expect(caller.admin.restoreCertificate({ certificateId: certificate.certificateId })).resolves.toMatchObject({ restored: true });

    expect(dbMocks.recordAdminAuditEvent).toHaveBeenNthCalledWith(1, expect.objectContaining({
      actorUserId: 7,
      action: "admin.certificate_revoked",
      targetId: certificate.certificateId,
      result: "success",
      metadata: { status: "revoked" },
    }));
    expect(dbMocks.recordAdminAuditEvent).toHaveBeenNthCalledWith(2, expect.objectContaining({
      actorUserId: 7,
      action: "admin.certificate_restored",
      targetId: certificate.certificateId,
      result: "success",
      metadata: { status: "valid" },
    }));
  });
});
