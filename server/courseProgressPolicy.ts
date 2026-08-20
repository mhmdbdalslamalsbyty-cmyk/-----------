export const COURSE_LESSON_IDS = [
  "why-data-structures", "array", "singly-linked-basics", "singly-linked-operations",
  "doubly-linked", "stack-array", "stack-linked", "queue-array", "queue-linked",
  "recursion", "trees", "graphs",
] as const;

export const FINAL_REVIEW_ANSWER_KEY: Record<(typeof COURSE_LESSON_IDS)[number], number> = {
  "why-data-structures": 1, array: 0, "singly-linked-basics": 0, "singly-linked-operations": 1,
  "doubly-linked": 0, "stack-array": 1, "stack-linked": 0, "queue-array": 0,
  "queue-linked": 0, recursion: 0, trees: 0, graphs: 0,
};

export function calculateFinalReview(finalReview: Record<string, unknown>) {
  const answers = finalReview.answers && typeof finalReview.answers === "object"
    ? finalReview.answers as Record<string, unknown>
    : {};
  const correct = COURSE_LESSON_IDS.filter(lessonId => answers[lessonId] === FINAL_REVIEW_ANSWER_KEY[lessonId]).length;
  const total = COURSE_LESSON_IDS.length;
  return { submitted: finalReview.submitted === true, correct, total, percent: Math.round((correct / total) * 100) };
}
