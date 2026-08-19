import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCertificate: vi.fn(),
  getCertificateById: vi.fn(),
  revokeCertificate: vi.fn(),
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

describe("راوتر الشهادات العامة", () => {
  beforeEach(() => vi.clearAllMocks());

  it("يصدر شهادة عندما تكتمل متطلبات المسار", async () => {
    mocks.createCertificate.mockResolvedValue(validRecord);
    const result = await publicCaller().certificate.issue({
      learnerName: "ليان أحمد",
      completedLessons: 12,
      totalLessons: 12,
      finalReviewScore: 92,
    });

    expect(mocks.createCertificate).toHaveBeenCalledWith(expect.objectContaining({
      certificateId: "DSA-2026-TESTTOKEN1",
      learnerName: "ليان أحمد",
      status: "valid",
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

  it("يرفض الإصدار بخط أن نهاية أقل من 80% من دون كتابة سجل", async () => {
    await expect(publicCaller().certificate.issue({
      learnerName: "ليان أحمد",
      completedLessons: 12,
      totalLessons: 12,
      finalReviewScore: 79,
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
