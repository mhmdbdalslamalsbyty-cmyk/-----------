import { describe, expect, it } from "vitest";
import {
  PUBLIC_CERTIFICATE_PASSING_SCORE,
  evaluateCertificateEligibility,
  publicCertificateId,
} from "./certificatePolicy";

describe("سياسة إصدار الشهادة العامة", () => {
  it("تسمح بالإصدار عند إكمال جميع الدروس واجتياز التقييم النهائي", () => {
    expect(
      evaluateCertificateEligibility({
        learnerName: "ليان أحمد",
        completedLessons: 12,
        totalLessons: 12,
        finalReviewScore: PUBLIC_CERTIFICATE_PASSING_SCORE,
      })
    ).toEqual({ eligible: true });
  });

  it("ترفض الشهادة عندما لا يكتمل المسار أو لا تصل الدرجة إلى حد النجاح", () => {
    expect(
      evaluateCertificateEligibility({
        learnerName: "ليان أحمد",
        completedLessons: 11,
        totalLessons: 12,
        finalReviewScore: 100,
      })
    ).toMatchObject({ eligible: false, reason: "أكمل جميع دروس المسار أولًا." });

    expect(
      evaluateCertificateEligibility({
        learnerName: "ليان أحمد",
        completedLessons: 12,
        totalLessons: 12,
        finalReviewScore: 79,
      })
    ).toMatchObject({ eligible: false, reason: expect.stringContaining("80%") });
  });

  it("ينشئ معرفًا عامًا موحد البادئة وعالي الوضوح", () => {
    expect(publicCertificateId(2026, "a9f1k2")).toBe("DSA-2026-A9F1K2");
  });
});
