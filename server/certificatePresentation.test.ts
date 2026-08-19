import { describe, expect, it } from "vitest";
import { finalReviewCertificateDetail } from "../client/lessons/certificatePresentation.js";

describe("finalReviewCertificateDetail", () => {
  it("يعرض نتيجة المراجعة النهائية ذاتها التي تستخدمها بوابة إصدار الشهادة", () => {
    expect(finalReviewCertificateDetail({ correct: 10, total: 12, percent: 83 }))
      .toEqual({ label: "نسبة المراجعة النهائية", value: "83% (10/12)" });
  });

  it("لا يستبدل الدرجة ببيانات اختبار دروس غير متاحة", () => {
    expect(finalReviewCertificateDetail()).toEqual({ label: "نسبة المراجعة النهائية", value: "0% (0/0)" });
  });
});
