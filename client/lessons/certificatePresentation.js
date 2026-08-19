export function finalReviewCertificateDetail(score) {
  const normalized = {
    correct: Number.isFinite(score?.correct) ? score.correct : 0,
    total: Number.isFinite(score?.total) ? score.total : 0,
    percent: Number.isFinite(score?.percent) ? score.percent : 0,
  };

  return {
    label: "نسبة المراجعة النهائية",
    value: `${normalized.percent}% (${normalized.correct}/${normalized.total})`,
  };
}
