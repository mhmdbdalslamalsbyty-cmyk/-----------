export const COURSE_TITLE = "هياكل البيانات للمبتدئين";
export const PUBLIC_CERTIFICATE_PASSING_SCORE = 80;

export type CertificateEligibilityInput = {
  learnerName: string;
  completedLessons: number;
  totalLessons: number;
  finalReviewScore: number;
};

export type CertificateEligibility =
  | { eligible: true }
  | { eligible: false; reason: string };

/**
 * قواعد الإصدار مشتركة بين المسار الخادمي والاختبارات. لا تكفي معاينة
 * الشهادة أو حفظها محليًا؛ يجب استيفاء كامل المسار ودرجة التقييم النهائي.
 */
export function evaluateCertificateEligibility(
  input: CertificateEligibilityInput
): CertificateEligibility {
  const learnerName = input.learnerName.trim().replace(/\s+/g, " ");

  if (!learnerName) {
    return { eligible: false, reason: "أدخل اسم المتعلم قبل إصدار الشهادة." };
  }
  if (!Number.isInteger(input.totalLessons) || input.totalLessons < 1) {
    return { eligible: false, reason: "بيانات الدروس غير صالحة لإصدار الشهادة." };
  }
  if (input.completedLessons !== input.totalLessons) {
    return { eligible: false, reason: "أكمل جميع دروس المسار أولًا." };
  }
  if (!Number.isInteger(input.finalReviewScore) || input.finalReviewScore < 0 || input.finalReviewScore > 100) {
    return { eligible: false, reason: "درجة التقييم النهائي غير صالحة." };
  }
  if (input.finalReviewScore < PUBLIC_CERTIFICATE_PASSING_SCORE) {
    return {
      eligible: false,
      reason: `يلزم الحصول على ${PUBLIC_CERTIFICATE_PASSING_SCORE}% على الأقل في التقييم النهائي.`,
    };
  }

  return { eligible: true };
}

export function publicCertificateId(year: number, token: string): string {
  return `DSA-${year}-${token.toUpperCase()}`;
}
