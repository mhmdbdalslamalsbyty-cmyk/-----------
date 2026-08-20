import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  attachCertificateToLearnerProgress: vi.fn(),
  createCertificate: vi.fn(),
  createLearnerAccount: vi.fn(),
  getCertificateById: vi.fn(),
  getCertificateByOwner: vi.fn(),
  getLearnerAccountByEmail: vi.fn(),
  getLearnerAccountByUserId: vi.fn(),
  getLearnerProgress: vi.fn(),
  getUserByOpenId: vi.fn(),
  markLearnerCourseCompleted: vi.fn(),
  recordAdminAuditEvent: vi.fn(),
  revokeCertificate: vi.fn(),
  setUserOpenId: vi.fn(),
  updateLearnerAccountLogin: vi.fn(),
  updateLearnerDisplayName: vi.fn(),
  upsertLearnerProgress: vi.fn(),
  upsertUser: vi.fn(),
}));

vi.mock("./db", () => mocks);
vi.mock("nanoid", () => ({ nanoid: () => "testtoken1" }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const issuedAt = new Date("2026-08-20T10:00:00.000Z");
const validRecord = {
  id: 1,
  certificateId: "DSA-2026-TESTTOKEN1",
  learnerName: "ليان أحمد",
  courseTitle: "هياكل البيانات للمبتدئين",
  completedLessons: 12,
  totalLessons: 12,
  finalReviewScore: 92,
  status: "valid",
  revokedAt: null,
  revocationReason: null,
  issuedAt,
};

function publicCaller() {
  const ctx = { user: null, req: { protocol: "https", headers: {} }, res: {} } as TrpcContext;
  return appRouter.createCaller(ctx);
}

function learnerCaller() {
  const ctx = {
    user: { id: 7, openId: "local:7", email: "learner@example.test", name: "ليان أحمد", loginMethod: "email", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} },
    res: { cookie: vi.fn(), clearCookie: vi.fn() },
  } as unknown as TrpcContext;
  return appRouter.createCaller(ctx);
}

function eligibleProgress() {
  const ids = ["why-data-structures", "array", "singly-linked-basics", "singly-linked-operations", "doubly-linked", "stack-array", "stack-linked", "queue-array", "queue-linked", "recursion", "trees", "graphs"];
  const answers = { "why-data-structures": 1, array: 0, "singly-linked-basics": 0, "singly-linked-operations": 1, "doubly-linked": 0, "stack-array": 1, "stack-linked": 0, "queue-array": 0, "queue-linked": 0, recursion: 0, trees: 0, graphs: 0 };
  return { completedLessonsJson: JSON.stringify(Object.fromEntries(ids.map(id => [id, { completed: true }]))), finalReviewJson: JSON.stringify({ answers, submitted: true }), courseCompletedAt: new Date() };
}

describe("راوتر الشهادات العامة", () => {
  beforeEach(() => vi.clearAllMocks());

  it("يصدر شهادة عندما تكتمل متطلبات المسار", async () => {
    mocks.createCertificate.mockResolvedValue(validRecord);
    mocks.getLearnerAccountByUserId.mockResolvedValue({ userId: 7, email: "learner@example.test", displayName: "ليان أحمد" });
    mocks.getLearnerProgress.mockResolvedValue(eligibleProgress());
    mocks.getCertificateByOwner.mockResolvedValue(undefined);
    const result = await learnerCaller().certificate.issue({ learnerName: "ليان أحمد" });

    expect(mocks.createCertificate).toHaveBeenCalledWith(expect.objectContaining({
      certificateId: "DSA-2026-TESTTOKEN1",
      learnerName: "ليان أحمد",
      status: "valid",
      ownerUserId: 7,
    }));
    expect(result).toMatchObject({ valid: true, certificate: { certificateId: validRecord.certificateId } });
  });

  it("يعيد 404 منظّمًا للشهادة غير المسجلة بدل نتيجة فارغة أو 200", async () => {
    mocks.getCertificateById.mockResolvedValue(undefined);
    await expect(publicCaller().certificate.verify({ certificateId: "DSA-2026-NOTFOUND" })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Certificate Not Found / رقم الشهادة غير موجود في السجل العام.",
    });
  });

  it("يرفض المعرف الفارغ أو المخالف للصيغة ويقبل المسافات المحيطة بالمعرف الصحيح", async () => {
    await expect(publicCaller().certificate.verify({ certificateId: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(publicCaller().certificate.verify({ certificateId: "WRONG-FORMAT" })).rejects.toMatchObject({ code: "BAD_REQUEST" });

    mocks.getCertificateById.mockResolvedValue(validRecord);
    await expect(publicCaller().certificate.verify({ certificateId: `  ${validRecord.certificateId.toLowerCase()}  ` })).resolves.toMatchObject({
      found: true,
      valid: true,
      certificate: { certificateId: validRecord.certificateId },
    });
    expect(mocks.getCertificateById).toHaveBeenCalledWith(validRecord.certificateId);
  });

  it("يرفض الإصدار عندما لا يحقق سجل المراجعة الخادمي 80% حتى لو أرسل العميل حقولًا إضافية", async () => {
    const insufficientProgress = eligibleProgress();
    insufficientProgress.finalReviewJson = JSON.stringify({ answers: {}, submitted: true });
    mocks.getLearnerAccountByUserId.mockResolvedValue({ userId: 7, email: "learner@example.test", displayName: "ليان أحمد" });
    mocks.getLearnerProgress.mockResolvedValue(insufficientProgress);
    mocks.getCertificateByOwner.mockResolvedValue(undefined);

    await expect(learnerCaller().certificate.issue({
      learnerName: "ليان أحمد",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createCertificate).not.toHaveBeenCalled();
  });

  it("يعرض السجل الصالح ويعكس حالة الإبطال عند التحقق", async () => {
    mocks.getCertificateById.mockResolvedValue(validRecord);
    await expect(publicCaller().certificate.verify({ certificateId: validRecord.certificateId })).resolves.toMatchObject({
      found: true,
      valid: true,
      certificate: { learnerName: "ليان أحمد", finalReviewScore: 92 },
    });

    mocks.getCertificateById.mockResolvedValue({ ...validRecord, status: "revoked", revocationReason: "سجل إداري" });
    await expect(publicCaller().certificate.verify({ certificateId: validRecord.certificateId })).resolves.toMatchObject({
      found: true,
      valid: false,
      certificate: { status: "revoked", revocationReason: "سجل إداري" },
    });
  });
});
