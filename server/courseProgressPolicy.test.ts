import { describe, expect, it } from "vitest";
import { calculateFinalReview, COURSE_LESSON_IDS, FINAL_REVIEW_ANSWER_KEY } from "./courseProgressPolicy";

describe("سياسة احتساب المراجعة النهائية", () => {
  it("لا يحتسب معدل اجتياز قبل تسليم المراجعة", () => {
    expect(calculateFinalReview({ answers: FINAL_REVIEW_ANSWER_KEY })).toMatchObject({ submitted: false, percent: 100 });
  });

  it("يحتسب الإجابات الصحيحة ونسبة الاجتياز من مفتاح المنهج الموحد", () => {
    const result = calculateFinalReview({ submitted: true, answers: FINAL_REVIEW_ANSWER_KEY });
    expect(result).toEqual({ submitted: true, correct: COURSE_LESSON_IDS.length, total: COURSE_LESSON_IDS.length, percent: 100 });
  });
});
