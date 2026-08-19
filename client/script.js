/* خريطة المعرفة الحية: تفاعل مباشر يحفظ التقدم محليًا ويشرح أثر كل عملية باللغة العربية؛ تمارين Java قصيرة تتبع المختبر البصري نفسه. */
import { lessons } from "./lessons/data.js";

const STORAGE = "dsa-academy-progress-v2";
const LEGACY_STORAGE = "dsa-academy-progress-v1";
// خريطة المعرفة الحية: منطق تعليمي مباشر، مشغّل مكتفٍ بذاته، وحفظ محلي واضح للتقدم.
// لا يُربط هذا الموضع إلا بفيديو عربي كامل اجتاز حزمة الإنتاج الموثقة في ARRAY_VIDEO_READY_PACKAGE.md.
const ARRAY_VIDEO_SOURCE = "/manus-storage/array-full-explainer-ar_e95f40af.mp4";
const quizLetters = ["أ", "ب", "ج", "د"];
let state = loadState();
let activeId = state.activeId && lessons.some((lesson) => lesson.id === state.activeId) ? state.activeId : lessons[0].id;
let labState = {};
const javaExerciseSets = {
  array: {
    label: "المصفوفة Array",
    exercises: [
      { id: "array-read-index", level: "1 · اقرأ قيمة", title: "اقرأ العنصر الثالث", prompt: "لدينا المصفوفة `scores`. اكتب سطر Java يخزن القيمة ذات الفهرس 2 في متغير اسمه `thirdScore`.", starter: "int[] scores = {70, 82, 94, 88};", hint: "الفهرس يبدأ من 0، لذلك العنصر الثالث هو `scores[2]`. ابدأ بتعريف متغير `int` ثم استخدم علامة `= `.", solution: "int thirdScore = scores[2];", explanation: "الفهرس 2 يشير مباشرة إلى القيمة 94؛ ولهذا تكون القراءة بالفهرس وصولًا مباشرًا O(1)." },
      { id: "array-update-index", level: "2 · عدّل قيمة", title: "حدّث درجة موجودة", prompt: "اكتب سطر Java يبدّل القيمة في الفهرس 1 إلى 85 داخل المصفوفة `scores`.", starter: "int[] scores = {70, 82, 94, 88};", hint: "لا تنشئ مصفوفة جديدة. اختر الخانة أولًا بالفهرس ثم أعطها القيمة الجديدة بعلامة `=`.", solution: "scores[1] = 85;", explanation: "هذه عملية تحديث: بقي حجم المصفوفة وترتيبها كما هما، وتغير محتوى خانة واحدة فقط من 82 إلى 85." },
      { id: "array-insert-front", level: "3 · أدرج في البداية", title: "مثّل كلفة الإدراج", prompt: "لأن مصفوفة Java ثابتة الحجم، اكتب سطرًا ينشئ مصفوفة جديدة تبدأ بـ 5 ثم تنسخ عناصر `scores` الأربعة بالترتيب.", starter: "int[] scores = {70, 82, 94, 88};", hint: "استخدم تهيئة مصفوفة جديدة بين `{ }`. ضع `5` أولًا، ثم اكتب `scores[0]` حتى `scores[3]` بالترتيب.", solution: "int[] withFirst = {5, scores[0], scores[1], scores[2], scores[3]};", explanation: "في مصفوفة ثابتة لا توجد خانة فارغة في البداية؛ صنعنا مصفوفة جديدة ووضعنا 5 أولًا، ثم حرّكنا العناصر منطقيًا موضعًا واحدًا." }
    ]
  },
  linked: {
    label: "القائمة المرتبطة Linked List",
    exercises: [
      { id: "linked-create-node", level: "1 · أنشئ عقدة", title: "أنشئ العقدة الجديدة", prompt: "داخل دالة `insertAtHead`، اكتب السطر الذي ينشئ عقدة جديدة بالقيمة `value` في متغير اسمه `newNode`.", starter: "Node head = new Node(20);\n// اكتب السطر هنا", hint: "اسم الصنف هو `Node`، ووسيط الباني موجود أصلًا في المتغير `value`.", solution: "Node newNode = new Node(value);", explanation: "في البداية نحتاج كائنًا مستقلًا يمثل العقدة الجديدة قبل تغيير أي رابط في القائمة." },
      { id: "linked-save-head", level: "2 · احفظ الطريق", title: "اربط العقدة بالرأس القديم", prompt: "اكتب السطر الذي يجعل `newNode` تشير إلى الرأس الحالي `head` قبل تغيير الرأس.", starter: "Node newNode = new Node(value);\nNode head = new Node(20);", hint: "يجب أن يكون الحقل على يسار `=` هو رابط العقدة الجديدة، والقيمة على اليمين هي الرأس القديم.", solution: "newNode.next = head;", explanation: "نحفظ أولًا رابط الرأس القديم داخل `newNode.next`؛ لذلك لا تضيع بقية القائمة عند تحديث الرأس." },
      { id: "linked-update-head", level: "3 · حرّك الرأس", title: "أكمل إدراج الرأس", prompt: "بعد حفظ الرابط، اكتب السطر الذي يجعل `head` يشير إلى `newNode`.", starter: "newNode.next = head;\n// اكتب السطر هنا", hint: "هذه آخر خطوة: غيّر المتغير الذي يمثل بداية القائمة، لا رابط العقدة القديمة.", solution: "head = newNode;", explanation: "الآن أصبحت العقدة الجديدة أول عقدة في القائمة. التغييران الأخيران فقط يجعلان العملية O(1)." }
    ]
  },
  stack: {
    label: "المكدس Stack",
    exercises: [
      { id: "stack-push", level: "1 · Push", title: "أضف قيمة إلى القمة", prompt: "لدينا `int[] stack` و`int top = -1`. اكتب سطر Java يدفع القيمة 42 إلى القمة.", starter: "int[] stack = new int[5];\nint top = -1;", hint: "حرّك `top` إلى الموضع الجديد أولًا باستخدام الزيادة السابقة، ثم ضع القيمة في هذه الخانة.", solution: "stack[++top] = 42;", explanation: "زيادة `top` قبل الوصول للمصفوفة تجعل أول Push يكتب في الفهرس 0، وهو موضع القمة الجديدة." },
      { id: "stack-peek", level: "2 · Peek", title: "انظر إلى القمة", prompt: "اكتب سطرًا يرجع قيمة القمة من دون حذفها داخل دالة `peek`.", starter: "int top = 2;\n// لا تعدّل top", hint: "استخدم `return` واقرأ الخانة عند `top` فقط. لا تستعمل `--` هنا.", solution: "return stack[top];", explanation: "Peek تقرأ القمة ولا تغيّر المؤشر؛ لهذا تظل العناصر في المكدس كما كانت." },
      { id: "stack-pop", level: "3 · Pop", title: "أزل القمة", prompt: "اكتب سطرًا يرجع القمة ثم ينقص `top` في عملية `pop`.", starter: "int top = 2;\n// يجب إعادة القيمة القديمة ثم إنقاص top", hint: "استخدم الإنقاص اللاحق مع فهرس المصفوفة حتى تُقرأ الخانة قبل تغيير المؤشر.", solution: "return stack[top--];", explanation: "Pop تعيد القيمة عند القمة الحالية ثم تحرّك القمة خطوة للأسفل؛ لذلك يخرج آخر عنصر دخل أولًا." }
    ]
  },
  queue: {
    label: "الطابور Queue",
    exercises: [
      { id: "queue-enqueue", level: "1 · Enqueue", title: "أدخل في الخلف", prompt: "لدينا `int[] queue` و`int rear = -1`. اكتب سطرًا يضيف 18 إلى نهاية الطابور.", starter: "int[] queue = new int[5];\nint rear = -1;", hint: "تحرّك إلى موضع الخلف التالي قبل التخزين، تمامًا كما حرّكنا قمة المكدس عند Push.", solution: "queue[++rear] = 18;", explanation: "العنصر الجديد يدخل عند الخلف فقط؛ لا نلمس `front` أثناء Enqueue." },
      { id: "queue-dequeue", level: "2 · Dequeue", title: "أخرج من الأمام", prompt: "لدينا `int front = 0`. اكتب سطرًا يرجع أول عنصر ثم يحرّك `front` للأمام.", starter: "int front = 0;\n// أخرج أقدم عنصر", hint: "اقرأ عند `front` ثم استعمل الزيادة اللاحقة حتى يتحرك المؤشر بعد الإرجاع.", solution: "return queue[front++];", explanation: "Dequeue لا تلمس الخلف؛ تحرّك فقط بداية الطابور بعد إخراج أقدم عنصر." },
      { id: "queue-wrap", level: "3 · Circular Queue", title: "التفّ إلى البداية", prompt: "اكتب سطرًا يحدّث `rear` في طابور دائري سعته `capacity` بحيث يعود إلى البداية عند النهاية.", starter: "int rear = capacity - 1;\nint capacity = 5;", hint: "استخدم العامل `%` بعد زيادة `rear` بمقدار 1؛ الباقي 0 عندما يصل الموضع إلى capacity.", solution: "rear = (rear + 1) % capacity;", explanation: "عملية modulo تجعل المؤشر يعيد استخدام الخانات الفارغة في بداية المصفوفة بدل إهدارها." }
    ]
  }
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || localStorage.getItem(LEGACY_STORAGE));
    return { completed: {}, answered: {}, theme: "light", watched: {}, labUsed: {}, practice: {}, javaExercises: {}, finalReview: { answers: {}, submitted: false, completedAt: "" }, learnerName: "", ...(saved || {}) };
  } catch {
    return { completed: {}, answered: {}, theme: "light", watched: {}, labUsed: {}, practice: {}, javaExercises: {}, finalReview: { answers: {}, submitted: false, completedAt: "" }, learnerName: "" };
  }
}

function saveState() {
  state.activeId = activeId;
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

function currentLesson() { return lessons.find((lesson) => lesson.id === activeId) || lessons[0]; }
function completedCount() { return Object.keys(state.completed).filter((id) => state.completed[id]).length; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char])); }
function quizScore() {
  const questions = lessons.flatMap((lesson) => lesson.quiz.map((question, index) => ({ lesson, question, index })));
  const correct = questions.filter(({ lesson, question, index }) => state.answered?.[lesson.id]?.[index] === question.answer).length;
  return questions.length ? Math.round((correct / questions.length) * 100) : 0;
}
function certificateId() {
  if (!state.certificateId) state.certificateId = `DSA-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return state.certificateId;
}
function completionDate() {
  if (!state.completionDate) state.completionDate = new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
  return state.completionDate;
}

function renderApp() {
  document.body.classList.toggle("dark", state.theme === "dark");
  const completed = completedCount();
  const progress = Math.round((completed / lessons.length) * 100);
  document.querySelector("#app").innerHTML = `
    <div class="site-shell">
      <header class="topbar">
        <button class="icon-button menu-toggle" id="menu-toggle" aria-label="فتح فهرس الدروس" aria-expanded="false" aria-controls="lesson-nav">☰</button>
        <a class="brand" href="#top" aria-label="العودة لبداية المنصة">
          <img src="/manus-storage/academy-mark_0758e4e4.png" alt="رمز أكاديمية هياكل البيانات" />
          <span class="brand-copy"><strong>أكاديمية هياكل البيانات</strong><em>مسار · تجربة · فهم</em><span>افهم التشبيه، ارسم الهيكل، ثم اكتب الخوارزمية</span></span>
        </a>
        <label class="lesson-search"><span class="sr-only">ابحث في الدروس</span><span aria-hidden="true">⌕</span><input id="lesson-search" type="search" placeholder="ابحث ثم اضغط Enter…" autocomplete="off" /></label>
        <div class="top-progress" aria-label="تقدمك في الدروس">
          <div class="progress-track"><span style="width:${progress}%"></span></div>
          <span class="progress-copy">${completed} من ${lessons.length} دروس مكتملة</span>
        </div>
        <button class="icon-button" id="theme-toggle" aria-label="تبديل الوضع الليلي والنهاري">${state.theme === "dark" ? "☀" : "◐"}</button>
      </header>
      <aside class="lesson-nav" id="lesson-nav" aria-label="فهرس الدروس">
        <p class="nav-label"><span>خريطة المنهج</span><span>${progress}%</span></p>
        <nav class="lesson-list">${renderNav()}</nav>
      </aside>
      <main class="main" id="top">
        ${activeId === lessons[0].id ? renderHero() : ""}
        ${renderProgressBoard(progress, completed)}
        ${activeId === lessons[0].id ? renderFinalReview() : ""}
        <div class="lesson-layout" id="lesson-content">${renderLesson()}</div>
      </main>
      <footer class="footer">
        صُممت الشروحات والاختبارات في هذه المنصة بصياغة تعليمية أصلية مستندة إلى موضوعات الدورة والمواد المرجعية، من دون نسخ نصوص الفيديو حرفيًا. <a href="https://youtube.com/playlist?list=PL1DUmTEdeA6K2yGIRxMvK9nTfRIiWXAWV" target="_blank" rel="noreferrer">فتح قائمة التشغيل المرجعية</a>
      </footer>
    </div>
    ${renderCertificate(progress, completed)}
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;
  bindAppEvents();
  bindLabEvents();
}

function renderNav() {
  const lessonLinks = lessons.map((lesson) => `
    <button class="lesson-link ${lesson.id === activeId ? "active" : ""} ${state.completed[lesson.id] ? "done" : ""}" data-lesson="${lesson.id}">
      <span class="lesson-dot">${state.completed[lesson.id] ? "✓" : lesson.number}</span>
      <span class="lesson-title-nav">${lesson.title}</span>
    </button>`).join("");
  return `${lessonLinks}<button class="final-review-link" type="button" data-open-review><span>✦</span><b>المراجعة النهائية</b><small>12 سؤالًا من المسار</small></button>`;
}

function renderHero() {
  const firstOpen = lessons.find((lesson) => !state.completed[lesson.id]) || lessons[0];
  return `<section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <span class="eyebrow">ابدأ من هنا · مسار عربي تفاعلي · 12 محطة</span>
      <h1 id="hero-title">لا تحفظ شكل البنية؛ حرّكها وشاهد لماذا تعمل.</h1>
      <p>في كل محطة: تشبيه من الحياة، شرح مركز، كود Java صغير، مختبر بصري، واختبار بتصحيح يوضح لك السبب.</p>
      <div class="hero-actions">
        <button class="action-btn primary" data-continue="${firstOpen.id}">ابدأ من ${firstOpen.number} · ${firstOpen.title}</button>
        <button class="action-btn secondary" type="button" data-open-review>اختبر المسار كاملًا</button>
        <a class="action-btn secondary" href="/manus-storage/data-structures-learning-guide-ar_295744bc.pdf" target="_blank" rel="noreferrer">الدليل الشامل PDF</a>
        <a class="action-btn secondary" href="/manus-storage/data-structures-quick-review-ar_3e15ca83.pdf" target="_blank" rel="noreferrer">ورقة مراجعة PDF</a>
      </div>
    </div>
  </section>`;
}

function finalReviewQuestions() {
  return lessons.map((lesson) => ({ lesson, question: lesson.quiz[0] }));
}

function finalReviewData() {
  state.finalReview ||= { answers: {}, submitted: false, completedAt: "" };
  state.finalReview.answers ||= {};
  return state.finalReview;
}

function finalReviewScore() {
  const review = finalReviewData();
  const questions = finalReviewQuestions();
  const correct = questions.filter(({ lesson, question }) => review.answers[lesson.id] === question.answer).length;
  return { correct, total: questions.length, percent: Math.round((correct / questions.length) * 100) };
}

function renderFinalReview() {
  const review = finalReviewData();
  const questions = finalReviewQuestions();
  const answered = Object.keys(review.answers).length;
  const score = finalReviewScore();
  const summary = review.submitted ? (score.percent >= 80 ? "ممتاز. لديك أساس متين؛ انتقل إلى الحلول البرمجية بثقة." : score.percent >= 50 ? "تقدّم جيد. راجع تفسير كل إجابة ثم أعد المحاولة لتثبيت الروابط بين المفاهيم." : "ابدأ من الأسئلة التي أخطأت فيها، وافتح محطاتها من الخريطة قبل إعادة المحاولة.") : "اختر إجابة واحدة لكل محطة. النتيجة والتفسير يُحفظان على جهازك فقط.";
  return `<section class="final-review" id="final-review" aria-labelledby="final-review-title"><header class="final-review-head"><div><span class="route-caption">نقطة نهاية المسار · مراجعة تراكمية</span><h2 id="final-review-title">اربط خريطة هياكل البيانات في ذهنك</h2><p>سؤال واحد من كل محطة: من الذاكرة إلى الرسوم البيانية، لتعرف أين تحتاج إلى عودة قصيرة.</p></div><div class="review-meter" aria-label="عدد الأسئلة المجاب عنها"><b>${answered}</b><span>من ${questions.length}<small>إجابات</small></span></div></header><div class="final-review-questions">${questions.map(({ lesson, question }, index) => { const selected = review.answers[lesson.id]; return `<article class="final-review-question"><div class="review-station"><span>محطة ${String(lesson.number).padStart(2, "0")}</span><b>${lesson.kind}</b></div><h3>${index + 1}. ${question.q}</h3><div class="review-choices">${question.options.map((option, optionIndex) => { const selectedClass = selected === optionIndex ? "selected" : ""; const outcome = review.submitted && selected === optionIndex ? (optionIndex === question.answer ? "correct" : "wrong") : ""; return `<button class="review-choice ${selectedClass} ${outcome}" type="button" data-final-answer="${optionIndex}" data-final-lesson="${lesson.id}"><span>${quizLetters[optionIndex]}</span>${option}</button>`; }).join("")}</div><p class="review-feedback ${review.submitted ? "visible" : ""}">${review.submitted ? (selected === question.answer ? `✓ صحيح. ${question.why}` : `الإجابة الصحيحة: ${question.options[question.answer]}. ${question.why}`) : ""}</p></article>`; }).join("")}</div><footer class="final-review-footer"><div class="review-summary ${review.submitted ? "result" : ""}"><b>${review.submitted ? `${score.correct}/${score.total} · ${score.percent}%` : "مراجعة ذاتية"}</b><p>${summary}</p></div><div class="review-actions"><button class="action-btn primary" id="final-review-submit" type="button">احسب النتيجة</button><button class="action-btn" id="final-review-reset" type="button">إعادة المحاولة</button></div></footer></section>`;
}

function renderProgressBoard(progress, completed) {
  const labs = Object.keys(state.labUsed || {}).filter((id) => state.labUsed[id]).length;
  const practices = Object.keys(state.practice || {}).filter((id) => state.practice[id]).length;
  const ready = progress === 100;
  const learner = state.learnerName || "";
  const exportLabel = ready ? "تنزيل ملف تقدّمي وشهادتي" : "تنزيل ملف تقدّمي";
  return `<section class="progress-board" aria-labelledby="progress-title">
    <div class="map-pin" aria-hidden="true">✦</div>
    <div class="progress-board-copy"><span class="route-caption">لوحة الرحلة</span><h2 id="progress-title">كل مفهوم تصبح قادرًا على تحريكه بنفسك.</h2><p>لا نعدّ القراءة وحدها؛ نفهم تقدّمك عبر الاختبار والمختبر والتطبيق العملي.</p><form class="learner-profile" id="learner-profile-form"><label for="learner-name">ملف المتعلم <span>${learner ? `مرحبًا، ${escapeHtml(learner)}` : "أضف اسمك ليظهر في الشهادة"}</span></label><div><input id="learner-name" name="learnerName" type="text" value="${escapeHtml(learner)}" maxlength="60" autocomplete="name" placeholder="اكتب اسمك هنا" /><button class="profile-save" type="submit">حفظ الاسم</button></div></form></div>
    <div class="progress-stats" aria-label="تفاصيل تقدّمك">
      <div><b>${completed}<small>درس مكتمل</small></b><span>من ${lessons.length}</span></div>
      <div><b>${labs}<small>مختبر جُرّب</small></b><span>تعلّم عملي</span></div>
      <div><b>${practices}<small>تطبيق محفوظ</small></b><span>مراجعة عملية</span></div>
    </div>
    <div class="certificate-action"><span class="certificate-action-label">شهادتك التعليمية</span><button class="action-btn certificate-preview-button" id="certificate-preview-trigger" type="button">👁️ معاينة نموذج الشهادة</button><div class="certificate-buttons"><button class="action-btn ${ready ? "primary" : ""}" id="certificate-trigger" ${ready ? "" : "disabled"}>🖨️ طباعة الشهادة</button><button class="action-btn" id="certificate-pdf-action" ${ready ? "" : "disabled"}>📄 حفظ الشهادة PDF</button></div><button class="action-btn progress-export" id="progress-export" type="button">↧ ${exportLabel}</button><small>${ready ? "افتح المعاينة أولًا أو استخدم زرَي الطباعة والحفظ؛ يفتح الحفظ نافذة النظام نفسها لاختيار Save as PDF." : `معاينة النموذج متاحة الآن. أكمل ${lessons.length - completed} محطات لفتح الطباعة والحفظ الرسميين.`}</small></div>
  </section>`;
}

function renderCertificate(progress, completed) {
  const complete = progress === 100;
  const learner = state.learnerName || "اسم الطالب";
  const certificateNumber = complete ? (state.certificateId || "يُنشأ عند طلب الطباعة") : "نموذج معاينة";
  const date = complete ? (state.completionDate || "تاريخ الإكمال يظهر عند طلب الطباعة") : "يظهر عند إتمام المسار";
  return `<section class="certificate-print" id="certificate-print" role="dialog" aria-modal="true" aria-labelledby="certificate-title">
    <div class="certificate-preview-toolbar"><div><span>معاينة الشهادة</span><small>${complete ? "شهادة إكمالك جاهزة للطباعة أو الحفظ" : "نموذج تعليمي؛ يتحول إلى شهادة إكمال عند إتمام جميع الدروس"}</small></div><div class="certificate-preview-actions"><button class="action-btn" id="certificate-preview-close" type="button">إغلاق</button><button class="action-btn ${complete ? "primary" : ""}" id="certificate-preview-print" type="button">🖨️ ${complete ? "طباعة الشهادة" : "طباعة النموذج"}</button><button class="action-btn" id="certificate-preview-pdf" type="button">📄 ${complete ? "حفظ PDF" : "حفظ النموذج PDF"}</button></div></div>
    <div class="certificate-paper ${complete ? "certificate-complete" : "certificate-sample"}">
      <div class="certificate-topline"><span>أكاديمية هياكل البيانات</span><span class="certificate-mark">✦</span><span>مسار · تجربة · فهم</span></div>
      <p class="certificate-kicker">CERTIFICATE OF COMPLETION</p>
      ${complete ? "" : "<p class=\"certificate-sample-ribbon\">نموذج معاينة · ليس شهادة إتمام بعد</p>"}<h1 id="certificate-title">شهادة إكمال مسار تعلّم</h1>
      <p class="certificate-intro">تُمنح هذه الشهادة التعليمية إلى</p>
      <p class="certificate-name">${escapeHtml(learner)}</p>
      <p class="certificate-copy">تأكيدًا لإتمام مسار <strong>هياكل البيانات للمبتدئين</strong> في الأكاديمية، بما يتضمن الدروس التفاعلية والمختبرات والاختبارات.</p>
      <dl class="certificate-details"><div><dt>تاريخ الإكمال</dt><dd>${escapeHtml(date)}</dd></div><div><dt>نسبة الإنجاز</dt><dd>${progress}% (${completed}/${lessons.length})</dd></div><div><dt>نسبة الاختبار</dt><dd>${quizScore()}%</dd></div><div><dt>رقم الشهادة الداخلي</dt><dd>${escapeHtml(certificateNumber)}</dd></div></dl>
      <div class="certificate-signature"><span>فريق أكاديمية هياكل البيانات</span><small>شهادة تعلم محلية غير معتمدة أكاديميًا أو مهنيًا.</small></div>
    </div>
  </section>`;
}

function renderLesson() {
  const lesson = currentLesson();
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  return `
    <article class="lesson-card">
      <div class="lesson-meta"><span class="station-stamp">محطة ${String(lesson.number).padStart(2, "0")}</span><span class="tag">خريطة التعلّم</span><span>${lesson.kind}</span><span>·</span><span>${lesson.duration}</span></div>
      <h2>${lesson.title}</h2>
      <p class="lede">${lesson.lede}</p>
      ${lesson.image ? `<img class="topic-art" src="${lesson.image}" alt="رسم توضيحي لمفهوم ${lesson.kind}" />` : ""}
      <h3 class="section-title">في نهاية الدرس ستعرف</h3>
      <ul class="goal-list">${lesson.goals.map((goal) => `<li>${goal}</li>`).join("")}</ul>
      <div class="analogy"><strong>التشبيه أولًا:</strong> ${lesson.analogy}</div>
      <h3 class="section-title">الفكرة ببساطة</h3>
      <p class="explanation">${lesson.explanation}</p>
      <h3 class="section-title">خطوات التفكير</h3>
      <ol class="step-list">${lesson.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      <div class="code-wrap"><span class="code-label">مثال Java مبسّط</span><pre><code>${escapeHtml(lesson.code)}</code></pre></div>
      <div class="mistake"><b>تنبيه للمبتدئ</b><span>${lesson.mistake}</span></div>
      ${renderLessonVideo(lesson)}
      ${renderLab(lesson)}
      ${renderQuiz(lesson)}
      ${renderPractice(lesson)}
      ${renderJavaExercises(lesson)}
      <div class="next-row">
        ${previous ? `<button class="action-btn" data-lesson="${previous.id}">← الدرس السابق</button>` : `<span></span>`}
        ${next ? `<button class="action-btn" data-lesson="${next.id}">الدرس التالي →</button>` : `<button class="action-btn" data-continue="${lessons[0].id}">راجع المنهج من البداية</button>`}
      </div>
    </article>
    <aside class="lesson-aside">
      <section class="aside-card"><h3>طريقة العمل هنا</h3><div class="mini-path"><div><i>1</i> اقرأ التشبيه</div><div><i>2</i> شغّل المختبر</div><div><i>3</i> حل الاختبار</div></div></section>
      <section class="aside-card"><h3>داخل هذا الدرس</h3><ul class="outline-list"><li><button data-scroll=".analogy">التشبيه</button></li><li><button data-scroll=".lab">المختبر المرئي</button></li><li><button data-scroll=".quiz">اختبر فهمك</button></li></ul></section>
      <section class="aside-card"><h3>قاعدة سريعة</h3><p>${quickRule(lesson.lab)}</p></section>
    </aside>`;
}

function renderLessonVideo(lesson) {
  if (lesson.lab !== "array") return "";
  const sourceReady = Boolean(ARRAY_VIDEO_SOURCE);
  return `<section class="lesson-video" aria-label="فيديو شرح المصفوفة">
    <h3 class="sr-only">شرح المصفوفة باللغة العربية</h3>
    <div class="video-frame ${sourceReady ? "video-ready" : "video-reserved"}">${sourceReady ? `<video id="lesson-video" controls preload="metadata" poster="/manus-storage/array-video-primary-reference_1664c28d.png" aria-label="فيديو عربي كامل يشرح المصفوفة والفهرسة والمختبر التفاعلي"><source src="${ARRAY_VIDEO_SOURCE}" type="video/mp4" />متصفحك لا يدعم تشغيل الفيديو.</video><div class="video-progress" aria-hidden="true"><span id="video-progress-fill" style="width:${state.watched?.[lesson.id] ? "100" : "0"}%"></span></div>` : `<div class="video-production-slot" role="status"><img src="/manus-storage/array-video-primary-reference_1664c28d.png" alt="تصور مرئي لمشهد فيديو المصفوفة" /><div><span>فيديو شرح عربي كامل</span><strong>قيد الإنتاج وفق حزمة من 7 مشاهد</strong><p>سيظهر هنا ملف MP4 حقيقي مدته 1–3 دقائق بعد تسجيل الشرح والمحاكاة.</p><button class="action-btn secondary" data-scroll=".lab">بعد مشاهدة الشرح جرّب بنفسك</button></div></div>`}</div>
  </section>`;
}

function renderPractice(lesson) {
  const done = state.practice?.[lesson.id];
  const prompt = lesson.lab === "array" ? "رتّب خطوات قراءة array[2]" : `صح أم خطأ: يمكن فهم ${lesson.kind} بصورة أفضل عندما نراقب أثر العملية في المختبر.`;
  return `<section class="practice-card" aria-labelledby="practice-title"><div><span class="route-caption">تطبيق سريع</span><h3 id="practice-title">${prompt}</h3><p>${lesson.lab === "array" ? "اختر التسلسل الذي يعبّر عن الوصول بالفهرس." : "اختبر الفكرة العملية قبل الانتقال للمحطة التالية."}</p></div><div class="practice-controls">${lesson.lab === "array" ? `<button data-practice="wrong">افحص كل الخانات ← خذ 2</button><button data-practice="right">استخدم الفهرس 2 ← اقرأ الخانة</button>` : `<button data-practice="right">صح</button><button data-practice="wrong">خطأ</button>`}</div><p class="practice-feedback ${done ? "visible" : ""}">${done ? "✓ ممتاز. حُفظ هذا التطبيق ضمن رحلتك التعليمية." : ""}</p></section>`;
}

function renderJavaExercises(lesson) {
  const set = javaExerciseSets[lesson.lab];
  if (!set) return "";
  const entries = state.javaExercises || {};
  const passed = set.exercises.filter((exercise) => entries[exercise.id]?.correct).length;
  return `<section class="java-exercises" aria-labelledby="java-exercises-title">
    <div class="java-exercises-head"><div><span class="route-caption">مختبر Java المصغّر · ${set.label}</span><h3 id="java-exercises-title">اكتب الفكرة قبل أن تحفظها</h3><p>هذه التمارين تفحص شكل الحل المطلوب محليًا، ثم تشرح أثره خطوة بخطوة.</p></div><span class="exercise-counter">${passed}/${set.exercises.length} متقنة</span></div>
    <div class="java-exercise-list">${set.exercises.map((exercise) => {
      const result = entries[exercise.id] || {};
      const status = result.checked ? (result.correct ? "correct" : "incorrect") : "";
      return `<article class="java-exercise ${result.correct ? "passed" : ""}" data-java-exercise="${exercise.id}">
        <header><span class="exercise-level">${exercise.level}</span><h4>${exercise.title}</h4></header>
        <p class="exercise-prompt">${exercise.prompt}</p>
        <pre class="exercise-starter"><code>${escapeHtml(exercise.starter)}</code></pre>
        <label class="exercise-answer-label" for="java-answer-${exercise.id}">اكتب السطر المطلوب</label>
        <textarea id="java-answer-${exercise.id}" class="java-answer" rows="2" spellcheck="false" dir="ltr" placeholder="اكتب Java هنا…">${escapeHtml(result.answer || "")}</textarea>
        <div class="exercise-actions"><button class="exercise-check" type="button" data-java-action="check" data-java-id="${exercise.id}">تحقق من الإجابة</button><button type="button" data-java-action="hint" data-java-id="${exercise.id}">تلميح</button><button type="button" data-java-action="solution" data-java-id="${exercise.id}">عرض الحل</button></div>
        <p class="exercise-result ${status}" aria-live="polite">${result.checked ? (result.correct ? `✓ إجابة صحيحة. ${exercise.explanation}` : "ليست الصيغة المطلوبة بعد. استخدم التلميح، وراجع الفهرس أو شكل المصفوفة ثم جرّب مجددًا.") : ""}</p>
        ${result.hint ? `<aside class="exercise-hint"><b>تلميح:</b> ${exercise.hint}</aside>` : ""}
        ${result.solution ? `<aside class="exercise-solution"><b>حل نموذجي:</b><code dir="ltr">${escapeHtml(exercise.solution)}</code><span>${exercise.explanation}</span></aside>` : ""}
      </article>`;
    }).join("")}</div>
  </section>`;
}

function quickRule(lab) {
  const rules = { memory: "اسأل دائمًا: كيف سيصل البرنامج إلى البيانات التي يحتاجها؟", array: "الفهرس يعطيك وصولًا مباشرًا، لكن الإزاحة تكلف عند الإدراج.", linked: "لا تغيّر رابطًا قبل أن تحفظ الطريق إلى العقدة التالية.", double: "المؤشر الإضافي يسهّل الرجوع، لكنه يضيف تحديثات وذاكرة.", stack: "الإضافة والحذف من القمة فقط: LIFO.", queue: "الدخول من الخلف والخروج من الأمام: FIFO.", recursion: "كل استدعاء يجب أن يقترب من Base Case.", tree: "كل مقارنة في BST تلغي فرعًا كاملًا.", graph: "BFS طبقات بطابور؛ DFS عمق بمكدس أو Recursion." };
  return rules[lab] || "اختر الهيكل بحسب العملية التي تتكرر أكثر.";
}

function renderLab(lesson) {
  const labels = { memory: "رحلة البيانات", array: "مختبر المصفوفة", linked: "مختبر الروابط", double: "مختبر الاتجاهين", stack: "مختبر القمة", queue: "مختبر الطابور", recursion: "مختبر Call Stack", tree: "مختبر البحث", graph: "مختبر الاستكشاف" };
  return `<section class="lab" id="lab-${lesson.id}"><div class="lab-head"><div><span class="route-caption">المسار الحي ← تحرّك وشاهد الأثر</span><h3>${labels[lesson.lab]}</h3><p>نفّذ خطوة واحدة ولاحظ ما الذي تغير في البنية.</p></div><span class="lab-chip">تجربة آمنة</span></div><div class="lab-canvas" id="lab-canvas"></div><div class="lab-controls" id="lab-controls"></div><p class="lab-note" id="lab-note" aria-live="polite"></p></section>`;
}

function renderQuiz(lesson) {
  const answered = state.answered[lesson.id] || {};
  const isDone = state.completed[lesson.id];
  return `<section class="quiz" id="quiz"><div class="quiz-head"><div><h3>اختبر فهمك الآن</h3><p class="quiz-intro">أجب عن السؤالين. عند الإجابة الصحيحة ستظهر الفكرة التي تثبت الإجابة.</p></div><span class="lab-chip">${isDone ? "تم اجتياز الاختبار" : "سؤالان قصيران"}</span></div>
    ${lesson.quiz.map((question, questionIndex) => `<div class="question" data-question="${questionIndex}"><p>${questionIndex + 1}. ${question.q}</p><div class="choices">${question.options.map((option, optionIndex) => {
      const selected = answered[questionIndex];
      const style = selected === optionIndex ? (optionIndex === question.answer ? "correct" : "wrong") : "";
      return `<button class="choice ${style}" data-answer="${optionIndex}" data-question="${questionIndex}"><span>${quizLetters[optionIndex]}</span>${option}</button>`;
    }).join("")}</div><p class="feedback ${answered[questionIndex] === question.answer ? "success" : ""}">${answered[questionIndex] !== undefined ? (answered[questionIndex] === question.answer ? `صحيح. ${question.why}` : "ليست الإجابة المناسبة بعد. راجع الفكرة ثم جرّب خيارًا آخر.") : ""}</p></div>`).join("")}
    <div class="lesson-complete ${isDone ? "visible" : ""}">✓ اكتملت هذه المحطة. صار بإمكانك الانتقال بثقة إلى الدرس التالي.</div>
  </section>`;
}

function bindAppEvents() {
  document.querySelectorAll("[data-lesson]").forEach((button) => button.addEventListener("click", () => selectLesson(button.dataset.lesson)));
  document.querySelectorAll("[data-continue]").forEach((button) => button.addEventListener("click", () => selectLesson(button.dataset.continue)));
  document.querySelector("#theme-toggle").addEventListener("click", () => { state.theme = state.theme === "dark" ? "light" : "dark"; saveState(); renderApp(); });
  const menuToggle = document.querySelector("#menu-toggle");
  const lessonNav = document.querySelector("#lesson-nav");
  const siteShell = document.querySelector(".site-shell");
  const syncLessonNavToggle = () => {
    if (!menuToggle || !lessonNav || !siteShell) return;
    const desktopMode = window.matchMedia("(min-width: 941px)").matches;
    const collapsed = desktopMode
      ? siteShell.classList.contains("lesson-nav-collapsed")
      : !lessonNav.classList.contains("open");
    menuToggle.setAttribute("aria-expanded", String(!collapsed));
    menuToggle.setAttribute("aria-label", collapsed ? "إظهار فهرس الدروس" : "إخفاء فهرس الدروس");
    lessonNav.setAttribute("aria-hidden", String(collapsed));
  };
  menuToggle?.addEventListener("click", () => {
    const desktopMode = window.matchMedia("(min-width: 941px)").matches;
    if (desktopMode) {
      siteShell?.classList.toggle("lesson-nav-collapsed");
    } else {
      lessonNav?.classList.toggle("open");
    }
    syncLessonNavToggle();
  });
  syncLessonNavToggle();
  document.querySelectorAll("[data-scroll]").forEach((button) => button.addEventListener("click", () => document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" })));
  document.querySelectorAll(".choice").forEach((button) => button.addEventListener("click", () => answerQuestion(Number(button.dataset.question), Number(button.dataset.answer))));
  document.querySelectorAll("[data-practice]").forEach((button) => button.addEventListener("click", () => answerPractice(button.dataset.practice)));
  document.querySelector("#learner-profile-form")?.addEventListener("submit", (event) => { event.preventDefault(); saveLearnerProfile(document.querySelector("#learner-name")?.value || ""); });
  document.querySelectorAll("[data-java-action]").forEach((button) => button.addEventListener("click", () => handleJavaExercise(button.dataset.javaId, button.dataset.javaAction)));
  document.querySelectorAll("[data-open-review]").forEach((button) => button.addEventListener("click", openFinalReview));
  document.querySelectorAll("[data-final-answer]").forEach((button) => button.addEventListener("click", () => answerFinalReview(button.dataset.finalLesson, Number(button.dataset.finalAnswer))));
  document.querySelector("#final-review-submit")?.addEventListener("click", submitFinalReview);
  document.querySelector("#final-review-reset")?.addEventListener("click", resetFinalReview);
  document.querySelector("#lesson-search")?.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); searchLessons(event.target.value); } });
  document.querySelector("#certificate-trigger")?.addEventListener("click", () => printCertificate("print"));
  document.querySelector("#certificate-pdf-action")?.addEventListener("click", () => printCertificate("pdf"));
  document.querySelector("#certificate-preview-trigger")?.addEventListener("click", openCertificatePreview);
  document.querySelector("#certificate-preview-close")?.addEventListener("click", closeCertificatePreview);
  document.querySelector("#certificate-preview-print")?.addEventListener("click", () => printCertificate("print", true));
  document.querySelector("#certificate-preview-pdf")?.addEventListener("click", () => printCertificate("pdf", true));
  document.querySelector("#progress-export")?.addEventListener("click", downloadLearnerRecord);
  if (ARRAY_VIDEO_SOURCE) bindVideoProgress();
}

function selectLesson(id) {
  activeId = id;
  labState = {};
  saveState();
  renderApp();
  document.querySelector("#top")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function answerQuestion(questionIndex, answerIndex) {
  const lesson = currentLesson();
  state.answered[lesson.id] ||= {};
  state.answered[lesson.id][questionIndex] = answerIndex;
  const allCorrect = lesson.quiz.every((question, index) => state.answered[lesson.id][index] === question.answer);
  if (allCorrect) { state.completed[lesson.id] = true; showToast("أحسنت، اكتملت المحطة وحُفظ تقدّمك."); }
  saveState();
  const oldScroll = window.scrollY;
  renderApp();
  window.scrollTo({ top: oldScroll });
}

function answerPractice(answer) {
  if (answer !== "right") { showToast("عد إلى التشبيه: ركّز على العملية التي توفرها البنية مباشرة."); return; }
  state.practice ||= {};
  state.practice[currentLesson().id] = true;
  saveState();
  renderApp();
  showToast("أحسنت. أضفنا هذا التطبيق إلى سجل تقدمك.");
}

function openFinalReview() {
  if (activeId !== lessons[0].id) {
    activeId = lessons[0].id;
    saveState();
    renderApp();
    requestAnimationFrame(() => document.querySelector("#final-review")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return;
  }
  document.querySelector("#final-review")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function answerFinalReview(lessonId, answerIndex) {
  const review = finalReviewData();
  review.answers[lessonId] = answerIndex;
  review.submitted = false;
  saveState();
  renderApp();
  requestAnimationFrame(() => document.querySelector("#final-review")?.scrollIntoView({ block: "start" }));
}

function submitFinalReview() {
  const review = finalReviewData();
  const total = finalReviewQuestions().length;
  const answered = Object.keys(review.answers).length;
  if (answered < total) { showToast(`أجب عن ${total - answered} أسئلة أخرى قبل حساب النتيجة.`); return; }
  review.submitted = true;
  review.completedAt = new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
  saveState();
  renderApp();
  requestAnimationFrame(() => document.querySelector("#final-review")?.scrollIntoView({ block: "start" }));
  const score = finalReviewScore();
  showToast(`نتيجتك ${score.percent}%. التفسير موجود تحت كل محطة لتعرف ما الذي تراجعه.`);
}

function resetFinalReview() {
  state.finalReview = { answers: {}, submitted: false, completedAt: "" };
  saveState();
  renderApp();
  requestAnimationFrame(() => document.querySelector("#final-review")?.scrollIntoView({ block: "start" }));
  showToast("بدأت محاولة جديدة. خذ وقتك واربط كل سؤال بالمختبر المناسب.");
}

function saveLearnerProfile(value) {
  const learner = value.trim().replace(/\s+/g, " ");
  if (!learner) { showToast("اكتب اسمًا قصيرًا قبل الحفظ؛ سيظهر الاسم نفسه في شهادتك."); return; }
  state.learnerName = learner.slice(0, 60);
  saveState();
  const oldScroll = window.scrollY;
  renderApp();
  window.scrollTo({ top: oldScroll });
  showToast("حُفظ اسمك محليًا وسيظهر تلقائيًا في الشهادة عند اكتمال المسار.");
}

function normalizeJavaCode(value) {
  return String(value || "").replace(/\/\/.*$/gm, "").replace(/\s|;/g, "").toLowerCase();
}

function isJavaExerciseCorrect(id, answer) {
  const code = normalizeJavaCode(answer);
  if (id === "array-read-index") return /(?:int)?thirdscore=scores\[2\]/.test(code);
  if (id === "array-update-index") return /scores\[1\]=85/.test(code);
  if (id === "array-insert-front") return /(?:int\[\])?[a-z_$][\w$]*=\{5,scores\[0\],scores\[1\],scores\[2\],scores\[3\]\}/.test(code);
  if (id === "linked-create-node") return /node(?:newnode)?=newnode\(value\)/.test(code);
  if (id === "linked-save-head") return /newnode\.next=head/.test(code);
  if (id === "linked-update-head") return /head=newnode/.test(code);
  if (id === "stack-push") return /stack\[\+\+top\]=42/.test(code);
  if (id === "stack-peek") return /returnstack\[top\]/.test(code);
  if (id === "stack-pop") return /returnstack\[top--\]/.test(code);
  if (id === "queue-enqueue") return /queue\[\+\+rear\]=18/.test(code);
  if (id === "queue-dequeue") return /returnqueue\[front\+\+\]/.test(code);
  if (id === "queue-wrap") return /rear=\(rear\+1\)%capacity/.test(code);
  return false;
}

function handleJavaExercise(id, action) {
  const exercise = Object.values(javaExerciseSets).flatMap((set) => set.exercises).find((item) => item.id === id);
  if (!exercise) return;
  state.javaExercises ||= {};
  const result = state.javaExercises[id] ||= {};
  if (action === "check") {
    result.answer = document.querySelector(`#java-answer-${id}`)?.value || "";
    result.checked = true;
    result.correct = isJavaExerciseCorrect(id, result.answer);
  }
  if (action === "hint") result.hint = true;
  if (action === "solution") result.solution = true;
  saveState();
  const oldScroll = window.scrollY;
  renderApp();
  window.scrollTo({ top: oldScroll });
  if (action === "check") showToast(result.correct ? "أحسنت. ثبّت هذا السطر في ذاكرتك ثم انتقل للتمرين التالي." : "ما زالت الإجابة تحتاج تعديلًا بسيطًا. افتح التلميح واقرأ المطلوب حرفيًا.");
}

function searchLessons(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return;
  const match = lessons.find((lesson) => [lesson.title, lesson.kind, lesson.lede, lesson.explanation, lesson.lab].join(" ").toLowerCase().includes(normalized));
  if (match) { selectLesson(match.id); showToast(`فتحنا المحطة الأقرب لعبارة: ${query}`); }
}

function bindVideoProgress() {
  const video = document.querySelector("#lesson-video");
  if (!video) return;
  const fill = document.querySelector("#video-progress-fill");
  let lastSaved = 0;
  video.addEventListener("timeupdate", () => {
    const percent = video.duration ? Math.round((video.currentTime / video.duration) * 100) : 0;
    if (fill) fill.style.width = `${percent}%`;
    if (percent > lastSaved + 20) { state.watched ||= {}; state.watched[currentLesson().id] = percent >= 80; saveState(); lastSaved = percent; }
  });
  video.addEventListener("ended", () => { state.watched ||= {}; state.watched[currentLesson().id] = true; saveState(); renderApp(); showToast("اكتملت المشاهدة. جرّب الآن تحريك المصفوفة بنفسك."); });
}

function openCertificatePreview() {
  document.body.classList.add("certificate-preview-open");
  document.querySelector("#certificate-preview-close")?.focus();
}

function closeCertificatePreview() {
  document.body.classList.remove("certificate-preview-open");
  document.querySelector("#certificate-preview-trigger")?.focus();
}

function printCertificate(mode, previewOnly = false) {
  const complete = completedCount() === lessons.length;
  if (!complete && !previewOnly) {
    showToast("أكمل جميع الدروس أولًا. يمكنك الآن فتح نموذج الشهادة لمعاينته.");
    return;
  }
  if (!state.learnerName && !previewOnly) {
    const learner = window.prompt("اكتب اسمك كما تريد ظهوره في شهادة التعلّم:", "");
    if (!learner?.trim()) return;
    state.learnerName = learner.trim().replace(/\s+/g, " ").slice(0, 60);
  }
  if (complete && !previewOnly) { certificateId(); completionDate(); }
  saveState();
  document.body.classList.remove("certificate-preview-open");
  renderApp();
  requestAnimationFrame(() => {
    if (mode === "pdf") showToast(previewOnly && !complete ? "في نافذة النظام اختر «Save as PDF» لحفظ نموذج المعاينة." : "في نافذة النظام اختر «Save as PDF» أو «حفظ كـ PDF».");
    window.print();
  });
}

function downloadLearnerRecord() {
  if (!state.learnerName) {
    const learner = window.prompt("اكتب اسمك قبل تنزيل ملف التقدم:", "");
    if (!learner?.trim()) return;
    state.learnerName = learner.trim().replace(/\s+/g, " ").slice(0, 60);
  }
  const completed = completedCount();
  const progress = Math.round((completed / lessons.length) * 100);
  const certificateReady = progress === 100;
  if (certificateReady) { certificateId(); completionDate(); }
  saveState();
  const review = finalReviewData();
  const reviewScore = review.submitted ? finalReviewScore() : null;
  const labs = Object.keys(state.labUsed || {}).filter((id) => state.labUsed[id]).length;
  const practices = Object.keys(state.practice || {}).filter((id) => state.practice[id]).length;
  const javaPassed = Object.values(state.javaExercises || {}).filter((item) => item?.correct).length;
  const javaTotal = Object.values(javaExerciseSets).reduce((total, set) => total + set.exercises.length, 0);
  const exportedOn = new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
  const lessonRows = lessons.map((lesson) => `<tr><td>${String(lesson.number).padStart(2, "0")}</td><td>${escapeHtml(lesson.title)}</td><td>${state.completed?.[lesson.id] ? "مكتمل" : "قيد التعلّم"}</td></tr>`).join("");
  const reviewBlock = reviewScore ? `<section><h2>نتيجة المراجعة النهائية</h2><p class="score">${reviewScore.correct}/${reviewScore.total} · ${reviewScore.percent}%</p><p>أُنجزت في ${escapeHtml(review.completedAt || exportedOn)}. راجع المنصة لتقرأ تفسير كل سؤال.</p></section>` : `<section><h2>المراجعة النهائية</h2><p>لم تُحسب نتيجة نهائية بعد. افتح «المراجعة النهائية» في المنصة عند الاستعداد.</p></section>`;
  const certificateBlock = certificateReady ? `<section class="certificate"><span>أكاديمية هياكل البيانات · مسار · تجربة · فهم</span><h1>شهادة إكمال مسار تعلّم</h1><p>تُمنح هذه الشهادة التعليمية إلى</p><strong>${escapeHtml(state.learnerName)}</strong><p>تأكيدًا لإتمام مسار <b>هياكل البيانات للمبتدئين</b> بما يتضمن الدروس التفاعلية والمختبرات والاختبارات.</p><dl><div><dt>تاريخ الإكمال</dt><dd>${escapeHtml(state.completionDate)}</dd></div><div><dt>نسبة الإنجاز</dt><dd>${progress}% (${completed}/${lessons.length})</dd></div><div><dt>نسبة الاختبار</dt><dd>${quizScore()}%</dd></div><div><dt>الرقم الداخلي</dt><dd>${escapeHtml(state.certificateId)}</dd></div></dl><small>شهادة تعلم محلية غير معتمدة أكاديميًا أو مهنيًا.</small></section>` : `<section class="pending"><h2>الشهادة</h2><p>لم تُدرج الشهادة بعد لأن المسار لم يكتمل. أكمل ${lessons.length - completed} محطات ثم نزّل الملف مجددًا.</p></section>`;
  const documentHtml = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ملف تقدم ${escapeHtml(state.learnerName)}</title><style>body{margin:0;padding:30px;background:#fffaf1;color:#18343a;font-family:Tahoma,Arial,sans-serif;line-height:1.8}.page{max-width:880px;margin:auto;background:#fff;padding:34px;border:1px solid #d9e3df;box-shadow:0 14px 35px #173c3215}header{border-bottom:4px solid #0f766e;padding-bottom:18px}header span{color:#0f766e;font-weight:700}h1,h2{font-family:Tahoma,Arial,sans-serif}h1{font-size:28px;margin:.4em 0}h2{font-size:18px;color:#0f766e;margin:1.6em 0 .4em}.meta,.stats{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0}.meta span,.stats div{background:#edf7f4;padding:9px 12px;border-radius:8px}.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.stats b{display:block;font-size:24px;color:#e76f51}.score{font-size:23px;font-weight:700;color:#d05c40}table{width:100%;border-collapse:collapse}th,td{text-align:right;padding:9px;border-bottom:1px solid #d9e3df}.certificate{margin-top:28px;padding:28px;text-align:center;border:5px double #d99119;background:#fffaf1}.certificate h1{color:#0f766e}.certificate strong{display:block;font-size:26px;margin:12px;color:#e76f51}.certificate dl{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;text-align:right}.certificate dl div{padding:9px;background:#fff}.certificate dt{font-size:12px;color:#5d7478}.certificate dd{margin:3px 0;font-weight:700}.pending{padding:15px;border-right:4px solid #d99119;background:#fff4d8}@media(max-width:600px){body{padding:12px}.page{padding:20px}.stats{grid-template-columns:1fr}.certificate dl{grid-template-columns:1fr}}</style></head><body><main class="page"><header><span>ملف تعلّم شخصي · أُنشئ محليًا</span><h1>${escapeHtml(state.learnerName)}</h1><p>تقرير تقدّم في «هياكل البيانات للمبتدئين» — تاريخ التصدير: ${exportedOn}</p></header><div class="meta"><span>الإنجاز: ${progress}%</span><span>الدروس: ${completed}/${lessons.length}</span><span>نتيجة الاختبارات: ${quizScore()}%</span></div><section><h2>مؤشرات التعلّم العملي</h2><div class="stats"><div><b>${labs}</b>مختبرات جُرّبت</div><div><b>${practices}</b>تطبيقات قصيرة محفوظة</div><div><b>${javaPassed}/${javaTotal}</b>تمارين Java متقنة</div></div></section>${reviewBlock}<section><h2>خريطة تقدّم الدروس</h2><table><thead><tr><th>المحطة</th><th>الدرس</th><th>الحالة</th></tr></thead><tbody>${lessonRows}</tbody></table></section>${certificateBlock}</main></body></html>`;
  const blob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dsa-progress-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  renderApp();
  showToast(certificateReady ? "نُزّل ملف تقدّمك مع نص الشهادة. يمكنك مشاركته أو فتحه ثم طباعته كـ PDF." : "نُزّل ملف تقدّمك. ستُضاف الشهادة إليه تلقائيًا بعد إتمام المسار.");
}

function showToast(message) {
  setTimeout(() => { const toast = document.querySelector("#toast"); if (!toast) return; toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2600); }, 0);
}

function bindLabEvents() {
  const lab = currentLesson().lab;
  if (lab === "memory") return renderMemoryLab();
  if (lab === "array") return renderArrayLab();
  if (lab === "linked") return renderLinkedLab();
  if (lab === "double") return renderDoubleLab();
  if (lab === "stack") return renderStackLab();
  if (lab === "queue") return renderQueueLab();
  if (lab === "recursion") return renderRecursionLab();
  if (lab === "tree") return renderTreeLab();
  if (lab === "graph") return renderGraphLab();
}

function labParts() { return { canvas: document.querySelector("#lab-canvas"), controls: document.querySelector("#lab-controls"), note: document.querySelector("#lab-note") }; }
function setLabNote(text) { const { note } = labParts(); if (note) note.textContent = text; }
function attachControls(items) { const { controls } = labParts(); controls.innerHTML = items.map((item, index) => `<button data-lab-action="${index}">${item.label}</button>`).join(""); controls.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => { state.labUsed ||= {}; state.labUsed[currentLesson().id] = true; saveState(); items[Number(button.dataset.labAction)].run(); })); }

function renderMemoryLab() {
  const { canvas } = labParts();
  const inRam = labState.inRam || false;
  canvas.innerHTML = `<div style="display:flex;align-items:center;gap:.7rem;direction:ltr;min-width:max-content"><div class="node ${inRam ? "" : "flash"}">Disk</div><span style="color:var(--teal);font-size:1.5rem">→</span><div class="node ${inRam ? "flash" : ""}">RAM</div><span style="color:var(--teal);font-size:1.5rem">→</span><div class="node">CPU</div></div>`;
  attachControls([{ label: "انقل البيانات إلى RAM", run: () => { labState.inRam = true; renderMemoryLab(); setLabNote("الآن أصبحت البيانات في ذاكرة العمل السريعة، فيستطيع CPU معالجتها بكفاءة."); } }]);
  setLabNote(inRam ? "البرنامج يعالج البيانات بعد تجهيزها في RAM." : "اضغط لترى مرحلة تجهيز البيانات قبل المعالجة.");
}
function renderArrayLab() {
  labState.array ||= [10, 20, 30, 40];
  const { canvas } = labParts();
  canvas.innerHTML = `<div class="array-row">${labState.array.map((value, index) => `<div class="array-cell ${labState.arrayFlash === index ? "flash" : ""}">${value}<small>${index}</small></div>`).join("")}</div>`;
  attachControls([
    { label: "اقرأ الفهرس 2", run: () => { labState.arrayFlash = 2; renderArrayLab(); setLabNote(`array[2] = ${labState.array[2]} — وصلنا مباشرة إلى الخانة ذات الفهرس 2.`); } },
    { label: "أدرج 5 في البداية", run: () => { labState.array.unshift(5); labState.arrayFlash = 0; renderArrayLab(); setLabNote("لاحظ أن الخانات تحركت لتفتح مكانًا في البداية؛ هذه هي كلفة الإزاحة."); } },
    { label: "إعادة التجربة", run: () => { labState.array = [10, 20, 30, 40]; labState.arrayFlash = null; renderArrayLab(); setLabNote("عادت المصفوفة إلى وضع البداية."); } }
  ]);
  setLabNote(labState.arrayFlash === undefined ? "الفهارس أسفل الخانات. جرّب قراءة عنصر أو إدراجه." : document.querySelector("#lab-note")?.textContent || "" );
}
function renderLinkedLab() {
  labState.linked ||= [10, 20, 30];
  const { canvas } = labParts();
  canvas.innerHTML = `<div class="linked-row"><span class="head-tag">HEAD</span>${labState.linked.map((value, index) => `<div class="node ${labState.linkFlash === index ? "flash" : ""}">${value}</div>`).join("")}</div>`;
  attachControls([
    { label: "أضف 5 عند الرأس", run: () => { labState.linked.unshift(5); labState.linkFlash = 0; renderLinkedLab(); setLabNote("رُبطت العقدة الجديدة بالرأس القديم ثم أصبحت هي HEAD. لا نحتاج المرور على بقية العقد."); } },
    { label: "اتبع next", run: () => { labState.linkFlash = (labState.linkFlash ?? -1) + 1; if (labState.linkFlash >= labState.linked.length) labState.linkFlash = 0; renderLinkedLab(); setLabNote(`أنت الآن عند العقدة ${labState.linkFlash + 1}. للوصول للعقدة التالية اتبع رابط next.`); } },
    { label: "إعادة التجربة", run: () => { labState.linked = [10, 20, 30]; labState.linkFlash = null; renderLinkedLab(); setLabNote("عادت القائمة إلى وضع البداية."); } }
  ]);
  if (labState.linkFlash === undefined) setLabNote("العقد متصلة بروابط. جرّب إدراج عقدة عند الرأس أو اتباع next.");
}
function renderDoubleLab() {
  const { canvas } = labParts();
  const focus = labState.doubleFocus ?? 1;
  canvas.innerHTML = `<div class="double-row">${[10,20,30].map((value, index) => `<div class="double-node ${focus === index ? "flash" : ""}">${value}</div>${index < 2 ? `<span class="double-arrow">↔</span>` : ""}`).join("")}</div>`;
  attachControls([
    { label: "تحرك إلى التالي", run: () => { labState.doubleFocus = Math.min(2, focus + 1); renderDoubleLab(); setLabNote("استخدمنا next للاتجاه إلى الأمام."); } },
    { label: "ارجع إلى السابق", run: () => { labState.doubleFocus = Math.max(0, focus - 1); renderDoubleLab(); setLabNote("استخدمنا prev للعودة من العقدة الحالية."); } }
  ]);
  setLabNote("العقد المزدوجة تملك سهمًا إلى الأمام وآخر إلى الخلف.");
}
function renderStackLab() {
  labState.stack ||= ["A", "B", "C"];
  const { canvas } = labParts();
  canvas.innerHTML = `<div style="display:grid;justify-items:center"><div class="stack-top">TOP ↑</div><div class="stack-view">${labState.stack.map((value, index) => `<div class="stack-card ${labState.stackFlash === index ? "flash" : ""}">${value}</div>`).join("")}</div></div>`;
  attachControls([
    { label: "Push D", run: () => { labState.stack.push("D"); labState.stackFlash = labState.stack.length - 1; renderStackLab(); setLabNote("وُضعت D على القمة. آخر داخل هو أقرب عنصر للخروج."); } },
    { label: "Pop", run: () => { const removed = labState.stack.pop(); labState.stackFlash = null; renderStackLab(); setLabNote(removed ? `خرجت ${removed} من القمة. هذه قاعدة LIFO.` : "المكدس فارغ: هذه حالة Underflow."); } },
    { label: "Peek", run: () => { const top = labState.stack.at(-1); labState.stackFlash = labState.stack.length - 1; renderStackLab(); setLabNote(top ? `القمة هي ${top}، وقد نظرنا إليها من دون حذفها.` : "لا توجد قمة في مكدس فارغ."); } }
  ]);
  if (labState.stackFlash === undefined) setLabNote("كل العمليات هنا تحدث عند TOP فقط.");
}
function renderQueueLab() {
  labState.queue ||= ["A", "B", "C"];
  const { canvas } = labParts();
  canvas.innerHTML = `<div class="queue-wrap"><div class="queue-labels"><span>front / خروج</span><span>rear / دخول</span></div><div class="queue-row">${labState.queue.map((value, index) => `<div class="queue-token ${labState.queueFlash === index ? "flash" : ""}">${value}</div>`).join("")}</div></div>`;
  attachControls([
    { label: "Enqueue D", run: () => { labState.queue.push("D"); labState.queueFlash = labState.queue.length - 1; renderQueueLab(); setLabNote("دخلت D من rear؛ ستنتظر العناصر التي قبلها."); } },
    { label: "Dequeue", run: () => { const removed = labState.queue.shift(); labState.queueFlash = 0; renderQueueLab(); setLabNote(removed ? `خرجت ${removed} من front لأنها وصلت أولًا. هذه FIFO.` : "الطابور فارغ: لا توجد قيمة لإخراجها."); } },
    { label: "Peek front", run: () => { labState.queueFlash = 0; renderQueueLab(); setLabNote(labState.queue[0] ? `أول عنصر هو ${labState.queue[0]}، وقد نظرنا إليه فقط.` : "الطابور فارغ."); } }
  ]);
  if (labState.queueFlash === undefined) setLabNote("لاحظ أن الدخول والخروج يحدثان من طرفين مختلفين.");
}
function renderRecursionLab() {
  labState.frames ||= ["factorial(4)", "factorial(3)", "factorial(2)", "factorial(1) → 1"];
  labState.frameCount ||= 1;
  const { canvas } = labParts();
  canvas.innerHTML = `<div class="call-stack">${labState.frames.slice(0, labState.frameCount).map((frame) => `<div class="call-frame">${frame}</div>`).join("")}</div>`;
  attachControls([
    { label: "استدعاء أصغر", run: () => { labState.frameCount = Math.min(labState.frames.length, labState.frameCount + 1); renderRecursionLab(); setLabNote(labState.frameCount === 4 ? "وصلنا إلى Base Case. الآن ستعود النتائج للخلف." : "انظر إلى Call Stack: أضفنا مشكلة أصغر فوق المشكلات السابقة."); } },
    { label: "ارجع بالنتيجة", run: () => { labState.frameCount = Math.max(1, labState.frameCount - 1); renderRecursionLab(); setLabNote("عندما يحل الاستدعاء الأصغر مشكلته، تعود النتيجة إلى الاستدعاء الذي قبله."); } }
  ]);
  setLabNote("ابدأ بـ factorial(4) ثم أضف استدعاءات حتى تصل إلى حالة الأساس.");
}
function renderTreeLab() {
  const { canvas } = labParts();
  const path = labState.treePath || [];
  const nodes = [{v:8,x:194,y:5},{v:3,x:100,y:75},{v:10,x:288,y:75},{v:1,x:55,y:150},{v:6,x:145,y:150},{v:14,x:340,y:150},{v:4,x:122,y:190},{v:7,x:170,y:190},{v:13,x:315,y:190}];
  const edges = [[8,3],[8,10],[3,1],[3,6],[10,14],[6,4],[6,7],[14,13]];
  const byValue = Object.fromEntries(nodes.map((node) => [node.v, node]));
  canvas.innerHTML = `<div class="tree-diagram">${edges.map(([a,b]) => { const p=byValue[a], c=byValue[b]; const dx=c.x-p.x, dy=c.y-p.y, length=Math.hypot(dx,dy); const angle=Math.atan2(dy,dx)*180/Math.PI; return `<span class="tree-edge" style="left:${p.x+22}px;top:${p.y+22}px;width:${length}px;transform:rotate(${angle}deg)"></span>`; }).join("")}${nodes.map((node) => `<div class="tree-node ${path.includes(node.v) ? "path" : ""}" style="left:${node.x}px;top:${node.y}px">${node.v}</div>`).join("")}</div>`;
  attachControls([
    { label: "ابحث عن 4", run: () => { labState.treePath = [8,3,6,4]; renderTreeLab(); setLabNote("8 → 3 → 6 → 4. كل مقارنة تخبرنا بالفرع الذي نتجاهله." ); } },
    { label: "اجتياز Inorder", run: () => { labState.treePath = []; renderTreeLab(); setLabNote("Inorder لهذه BST: 1، 3، 4، 6، 7، 8، 10، 13، 14 — ترتيب تصاعدي." ); } }
  ]);
  if (!labState.treePath) setLabNote("جرّب البحث: لا نزور كل العقد، بل نسير في فرع واحد وفق المقارنة.");
}
function renderGraphLab() {
  const { canvas } = labParts();
  const positions = {A:[30,93],B:[130,25],C:[130,165],D:[250,25],E:[250,165],F:[350,93]};
  const edges = [["A","B"],["A","C"],["B","D"],["C","E"],["D","F"],["E","F"]];
  const visited = labState.graphVisited || [];
  canvas.innerHTML = `<div class="graph-diagram">${edges.map(([from,to]) => { const [x1,y1]=positions[from], [x2,y2]=positions[to]; const length=Math.hypot(x2-x1,y2-y1); const angle=Math.atan2(y2-y1,x2-x1)*180/Math.PI; const active=visited.includes(from)&&visited.includes(to); return `<span class="graph-edge ${active ? "active" : ""}" style="left:${x1+21}px;top:${y1+21}px;width:${length}px;transform:rotate(${angle}deg)"></span>`; }).join("")}${Object.entries(positions).map(([node,[x,y]]) => `<div class="graph-node ${visited.includes(node) ? "visited" : ""}" style="left:${x}px;top:${y}px">${node}</div>`).join("")}</div>`;
  attachControls([
    { label: "شاهد BFS من A", run: () => { labState.graphVisited = ["A","B","C","D","E","F"]; renderGraphLab(); setLabNote("BFS: A ثم B,C ثم D,E ثم F. يزور الرسم طبقة بعد طبقة باستخدام Queue."); } },
    { label: "شاهد DFS من A", run: () => { labState.graphVisited = ["A","B","D","F","E","C"]; renderGraphLab(); setLabNote("DFS: A ثم B ثم D ثم F ثم E ثم C. يغوص في طريق قبل أن يرجع للخلف."); } },
    { label: "إعادة الرسم", run: () => { labState.graphVisited = []; renderGraphLab(); setLabNote("الرسم جاهز لتجربة مسار جديد."); } }
  ]);
  if (!visited.length) setLabNote("الرؤوس تمثل أماكن، والحواف تمثل العلاقات. جرّب طريقتي الاستكشاف.");
}

renderApp();
