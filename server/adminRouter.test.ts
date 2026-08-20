import { describe, expect, it, beforeEach, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  attachCertificateToLearnerProgress: vi.fn(),
  consumePasswordResetToken: vi.fn(),
  createCertificate: vi.fn(),
  createLearnerAccount: vi.fn(),
  deleteLearnerAccountAndPrivateData: vi.fn(),
  exportAdminLearners: vi.fn(),
  exportLearnerData: vi.fn(),
  getAdminLearnerDetail: vi.fn(),
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
  listAdminLearnersPage: vi.fn(),
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

  it("يمرر نطاقات الزمن الجاهزة والمخصصة إلى قوائم الإدارة الخادمية", async () => {
    dbMocks.listAdminLearners.mockResolvedValue([]);
    dbMocks.listAdminCertificates.mockResolvedValue([]);
    dbMocks.listAdminAuditLogs.mockResolvedValue([]);
    dbMocks.getAdminOverview.mockResolvedValue({ metrics: {}, recentLearners: [], audit: [] });
    const caller = appRouter.createCaller(context("admin"));
    const from = Date.UTC(2026, 7, 1);
    const to = Date.UTC(2026, 7, 20, 23, 59, 59, 999);

    await caller.admin.learners({ limit: 20, dateRange: { preset: "7d" } });
    await caller.admin.certificates({ limit: 20, dateRange: { preset: "custom", from, to } });
    await caller.admin.audit({ limit: 20, dateRange: { preset: "today" } });
    await caller.admin.overview({ dateRange: { preset: "90d" } });

    expect(dbMocks.listAdminLearners).toHaveBeenCalledWith(expect.objectContaining({
      limit: 20,
      dateRange: expect.objectContaining({ from: expect.any(Date), to: expect.any(Date) }),
    }));
    expect(dbMocks.listAdminCertificates).toHaveBeenCalledWith(expect.objectContaining({
      dateRange: { from: new Date(from), to: new Date(to) },
    }));
    expect(dbMocks.listAdminAuditLogs).toHaveBeenCalledWith(expect.objectContaining({
      limit: 20,
      dateRange: expect.objectContaining({ from: expect.any(Date), to: expect.any(Date) }),
    }));
    expect(dbMocks.getAdminOverview).toHaveBeenCalledWith(expect.objectContaining({
      dateRange: expect.objectContaining({ from: expect.any(Date), to: expect.any(Date) }),
    }));
  });

  it("ينفذ بحث المتعلمين وترقيمهم خادميًا مع الاحتفاظ بالنطاق الزمني", async () => {
    dbMocks.listAdminLearnersPage.mockResolvedValue({ items: [], page: 2, pageSize: 20, total: 23, totalPages: 2 });

    await expect(appRouter.createCaller(context("admin")).admin.learnersPage({
      page: 2,
      limit: 20,
      query: "42",
      dateRange: { preset: "30d" },
    })).resolves.toMatchObject({ page: 2, total: 23, totalPages: 2 });

    expect(dbMocks.listAdminLearnersPage).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
      limit: 20,
      query: "42",
      dateRange: expect.objectContaining({ from: expect.any(Date), to: expect.any(Date) }),
    }));
  });

  it("يرفض البحث المرقم ووصف المتعلم للضيف وللمتعلم قبل تنفيذ أي قراءة، بما يمنع الوصول المتقاطع", async () => {
    await expect(appRouter.createCaller(guestContext()).admin.learnersPage({ page: 1, limit: 20 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("user")).admin.learnerDetail({ userId: 101 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("user")).admin.learnerDetail({ userId: 202 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.listAdminLearnersPage).not.toHaveBeenCalled();
    expect(dbMocks.getAdminLearnerDetail).not.toHaveBeenCalled();
  });

  it("يعيد للمدير فقط ملخص تفاصيل متعلم خاليًا من الأسرار ويسجل الفتح بأقل بيانات لازمة", async () => {
    dbMocks.getAdminLearnerDetail.mockResolvedValue({
      profile: { userId: 101, displayName: "ليان أحمد", email: "learner@example.test", createdAt: new Date(), lastLoginAt: new Date(), lastActivityAt: new Date() },
      progress: { completedLessons: 8, progressPercent: 67, completedVideos: 7, videoProgressPercent: 58, quizAttempts: 4, bestQuizScore: 92, courseCompletedAt: null },
      certificates: [{ certificateId: "DSA-2026-101", status: "valid", issuedAt: new Date(), revokedAt: null }],
      recentActivity: [],
    });

    const result = await appRouter.createCaller(context("admin")).admin.learnerDetail({ userId: 101, dateRange: { preset: "7d" } });

    expect(result).toMatchObject({ profile: { userId: 101 }, progress: { completedLessons: 8, bestQuizScore: 92 } });
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("sessionToken");
    expect(result).not.toHaveProperty("resetToken");
    expect(dbMocks.getAdminLearnerDetail).toHaveBeenCalledWith(101, expect.objectContaining({ dateRange: expect.objectContaining({ from: expect.any(Date), to: expect.any(Date) }) }));
    expect(dbMocks.recordAdminAuditEvent).toHaveBeenCalledWith({
      actorUserId: 7,
      action: "admin.learner_detail_viewed",
      targetType: "learner_account",
      targetId: "101",
      result: "success",
      metadata: { dateRangePreset: "7d" },
    });
  });

  it("يرفض تصدير CSV للضيف والمتعلم قبل قراءة البيانات", async () => {
    const input = { dateRange: { preset: "all" as const } };
    await expect(appRouter.createCaller(guestContext()).admin.exportLearnersCSV(input)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("user")).admin.exportLearnersCSV(input)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.exportAdminLearners).not.toHaveBeenCalled();
  });

  it("يُنتج CSV عربيًا مع BOM وتهريب حقن الصيغ بلا حقول حساسة ويسجل التصدير", async () => {
    dbMocks.exportAdminLearners.mockResolvedValue([{
      userId: 19,
      displayName: '=إدخال "خاص"',
      email: "learner@example.test",
      createdAt: new Date("2026-08-01T08:00:00.000Z"),
      lastActivityAt: new Date("2026-08-20T08:00:00.000Z"),
      progressPercent: 75,
      completedLessons: 9,
      bestQuizScore: 94,
      certificateStatus: "valid",
      passwordHash: "لا يجب أن يظهر",
    }]);

    const exported = await appRouter.createCaller(context("admin")).admin.exportLearnersCSV({ query: "إدخال", dateRange: { preset: "30d" } });

    expect(exported.csv.startsWith("\uFEFF")).toBe(true);
    expect(exported.csv).toContain("معرّف المتعلم");
    expect(exported.csv).toContain("سارية");
    expect(exported.csv).toContain("'=إدخال " + '""خاص""');
    expect(exported.csv).not.toContain("passwordHash");
    expect(exported.csv).not.toContain("لا يجب أن يظهر");
    expect(dbMocks.exportAdminLearners).toHaveBeenCalledWith(expect.objectContaining({
      query: "إدخال",
      dateRange: expect.objectContaining({ from: expect.any(Date), to: expect.any(Date) }),
    }));
    expect(dbMocks.recordAdminAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      actorUserId: 7,
      action: "admin.learners_exported",
      targetType: "learner_export",
      result: "success",
      metadata: expect.objectContaining({ recordCount: 1, dateRangePreset: "30d", queryApplied: true }),
    }));
  });

  it("يسجل خروج المدير الناجح دون إيقاف إزالة الجلسة عند تعذر سجل التدقيق", async () => {
    const adminContext = context("admin") as { res: { clearCookie: ReturnType<typeof vi.fn> } };
    await expect(appRouter.createCaller(adminContext as never).auth.logout()).resolves.toEqual({ success: true });
    expect(dbMocks.recordAdminAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      actorUserId: 7,
      action: "admin.logged_out",
      targetType: "session",
      result: "success",
    }));
    expect(adminContext.res.clearCookie).toHaveBeenCalledTimes(1);
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
