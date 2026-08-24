import { readingUnits, sourceLibrary } from "./source-library.js";

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
}

function normalise(value) {
  return String(value || "").toLowerCase().replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
}

function sourceById(id) {
  return sourceLibrary.find((source) => source.id === id);
}

function unitHref(unitId) {
  return `/sources?unit=${encodeURIComponent(unitId)}`;
}

function sourceHref(sourceId) {
  return `/sources?source=${encodeURIComponent(sourceId)}`;
}

function sourceAssetLink(source, label = "عرض المصدر الأصلي") {
  if (!source?.asset) return `<span class="source-unavailable">المصدر الأصلي غير متاح في هذه النسخة.</span>`;
  return `<a class="source-file-link" href="${source.asset}" target="_blank" rel="noreferrer">↗ ${escapeHtml(label)} <small>${escapeHtml(source.type)}</small></a>`;
}

function sourceSearchTerms(unit) {
  return [unit.title, unit.category, unit.lede, unit.explanation, unit.terms.flat().join(" "), unit.example, unit.notes.join(" "), unit.sourceIds.join(" ")].join(" ");
}

function renderTopbar(theme) {
  return `<header class="library-topbar"><a class="brand" href="/" aria-label="العودة إلى الأكاديمية"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><b></b></span><span class="brand-copy"><strong>أكاديمية هياكل البيانات</strong><em>SOURCE LIBRARY</em><span>المصدر · الفكرة · الفهم</span></span></a><nav class="library-route-nav" aria-label="تنقل المكتبة"><a href="/">الدروس التفاعلية</a><a href="/sources" aria-current="page">📚 مكتبة المصادر</a></nav><button class="icon-button" id="library-theme-toggle" type="button" aria-label="تبديل الوضع الليلي والنهاري">${theme === "dark" ? "☀" : "◐"}</button></header>`;
}

function renderHero() {
  return `<section class="library-hero" aria-labelledby="library-title"><div><span class="eyebrow">SOURCE-DRIVEN · قراءة فقط · دون احتساب درجات</span><h1 id="library-title">📚 مكتبة المصادر التعليمية</h1><p>طبقة قراءة منظمة فوق المصادر المرفقة: كل صفحة تبيّن مصدرها، وتبقي الأصل متاحًا، وتفصل أسئلة المراجعة عن الاختبارات الرسمية.</p><div class="library-hero-metrics"><span><b>${sourceLibrary.length}</b> مصادر أصلية</span><span><b>${readingUnits.length}</b> وحدة قراءة</span><span><b>2</b> بنكا أسئلة</span></div></div><aside><b>مسار القراءة</b><ol><li>افتح المصدر</li><li>اقرأ الفكرة المبسطة</li><li>تتبع المصطلحات والمثال</li><li>ارجع للأصل أو أسئلة المراجعة</li></ol></aside></section>`;
}

function renderSourceCard(source) {
  const relatedCount = readingUnits.filter((unit) => unit.sourceIds.includes(source.id)).length;
  return `<article class="source-card"><header><span class="source-id">${escapeHtml(source.id)}</span><span class="source-type">${escapeHtml(source.type)} · ${escapeHtml(source.pages)}</span></header><h2>${escapeHtml(source.arabicTitle)}</h2><p class="source-original-title">${escapeHtml(source.title)}</p><p>${escapeHtml(source.description)}</p><dl><div><dt>الأقسام</dt><dd>${escapeHtml(source.sections)}</dd></div><div><dt>الموضوعات</dt><dd>${source.topics.map((topic) => `<span>${escapeHtml(topic)}</span>`).join("")}</dd></div></dl><p class="source-status">${escapeHtml(source.status)}</p><footer><a class="action-btn" href="${sourceHref(source.id)}">استعرض وحداته (${relatedCount})</a>${sourceAssetLink(source)}</footer></article>`;
}

function renderUnitCard(unit) {
  const sources = unit.sourceIds.map(sourceById).filter(Boolean);
  return `<article class="library-unit-card"><span class="library-category">${escapeHtml(unit.category)}</span><h2>${escapeHtml(unit.title)}</h2><p>${escapeHtml(unit.lede)}</p><div class="library-source-pills">${sources.map((source) => `<span>${escapeHtml(source.id)} · ${escapeHtml(source.arabicTitle)}</span>`).join("")}</div><footer><span>${escapeHtml(unit.pages)}</span><a class="action-btn" href="${unitHref(unit.id)}">ابدأ القراءة</a></footer></article>`;
}

function renderAuditNote() {
  return `<aside class="library-audit-note"><b>ملاحظة مصدرية</b><p>المصدران S04 وS11 ملفان مصوّران؛ تقتصر صفحات القراءة على ما أمكن التحقق منه. كما أن عبارات الصح/الخطأ في بنك الأسئلة تبقى أسئلة ولا تُعرض بوصفها حقائق. راجع وثيقتي <code>SOURCE_LIBRARY_INDEX.md</code> و<code>SOURCE_COVERAGE_REPORT.md</code> داخل المشروع للتدقيق الكامل.</p></aside>`;
}

function renderIndex(searchParams) {
  const sourceFilter = searchParams.get("source") || "";
  const query = searchParams.get("q") || "";
  const normalizedQuery = normalise(query);
  const sources = sourceFilter ? sourceLibrary.filter((source) => source.id === sourceFilter) : sourceLibrary;
  const units = readingUnits.filter((unit) => {
    const sourceMatch = !sourceFilter || unit.sourceIds.includes(sourceFilter);
    const searchMatch = !normalizedQuery || normalise(sourceSearchTerms(unit)).includes(normalizedQuery);
    return sourceMatch && searchMatch;
  });
  const sourceHeading = sourceFilter ? `مصدر ${escapeHtml(sourceFilter)} ووحداته` : "كل المصادر الأصلية";
  return `<main class="library-main" id="top"><a class="skip-link" href="#library-reading-units">تجاوز إلى وحدات القراءة</a>${renderHero()}<section class="library-search-panel" aria-labelledby="library-search-title"><div><span class="route-caption">ابحث في طبقة القراءة</span><h2 id="library-search-title">ابحث بالعربية أو English</h2><p>يبحث هذا الحقل في عناوين الوحدات ومصطلحاتها ونصوصها المصدرية المبسطة. لا يسجل البحث ولا يغيّر تقدم الدروس.</p></div><label><span class="sr-only">بحث مكتبة المصادر</span><input id="library-search" type="search" value="${escapeHtml(query)}" placeholder="Array · Stack · Queue · Linked List · Big-O · Pseudocode · BFS" autocomplete="off" /><button class="action-btn primary" id="library-search-submit" type="button">بحث</button></label></section><section class="library-source-section" aria-labelledby="library-sources-title"><header><div><span class="route-caption">هوية كل مصدر محفوظة</span><h2 id="library-sources-title">${sourceHeading}</h2></div>${sourceFilter ? `<a class="action-btn" href="/sources">عرض جميع المصادر</a>` : ""}</header><div class="source-card-grid">${sources.map(renderSourceCard).join("")}</div></section><section class="library-reading-section" id="library-reading-units" aria-labelledby="library-reading-title"><header><div><span class="route-caption">شرح مبسط ملتزم بالمصدر</span><h2 id="library-reading-title">وحدات القراءة</h2></div><small>${units.length} وحدة ظاهرة</small></header>${units.length ? `<div class="library-unit-grid">${units.map(renderUnitCard).join("")}</div>` : `<div class="library-empty"><b>لا توجد وحدة مطابقة</b><p>جرّب كلمة أخرى، أو أعد إلى عرض جميع المصادر.</p><a class="action-btn" href="/sources">إزالة عامل التصفية</a></div>`}</section>${renderAuditNote()}</main>`;
}

function renderReader(unit) {
  const sources = unit.sourceIds.map(sourceById).filter(Boolean);
  return `<main class="library-main reader-main" id="top"><a class="skip-link" href="#reader-content">تجاوز إلى المحتوى</a><nav class="reader-breadcrumb" aria-label="مسار القراءة"><a href="/sources">مكتبة المصادر</a><span>←</span><span>${escapeHtml(unit.category)}</span></nav><div class="reader-layout" id="reader-content"><article class="reading-card"><header><span class="library-category">${escapeHtml(unit.category)}</span><h1>${escapeHtml(unit.title)}</h1><p class="lede">${escapeHtml(unit.lede)}</p><div class="reader-source-bar"><span>مستند إلى: ${sources.map((source) => escapeHtml(source.id)).join("، ")}</span><span>${escapeHtml(unit.pages)}</span></div></header><section><h2>الأهداف</h2><ul class="reader-goals">${unit.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("")}</ul></section><section><h2>الفكرة والشرح</h2><p>${escapeHtml(unit.explanation)}</p></section><section><h2>المصطلحات</h2><dl class="term-grid">${unit.terms.map(([arabic, english]) => `<div><dt>${escapeHtml(arabic)}</dt><dd>${escapeHtml(english)}</dd></div>`).join("")}</dl></section><section><h2>مثال من المصدر</h2><div class="source-example">${escapeHtml(unit.example)}</div></section><section><h2>نقاط مهمة</h2><ul class="source-notes">${unit.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul></section><section class="reader-review"><h2>أسئلة مراجعة من المصدر</h2><p>هذه أسئلة للتفكير الذاتي؛ لا تُسجل إجاباتك ولا تؤثر في الاختبارات أو الشهادة.</p><ol>${unit.questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ol></section><footer class="reader-actions"><a class="action-btn" href="/sources">العودة إلى المكتبة</a>${sources.map((source) => sourceAssetLink(source, `فتح ${source.id} الأصلي`)).join("")}</footer></article><aside class="reader-aside"><section><span class="route-caption">المصادر المرتبطة</span><h2>افتح الأصل عند التوسع</h2>${sources.map((source) => `<div class="reader-source-item"><b>${escapeHtml(source.id)} · ${escapeHtml(source.arabicTitle)}</b><small>${escapeHtml(source.sections)}</small>${sourceAssetLink(source)}</div>`).join("")}</section><section><span class="route-caption">حدود القراءة</span><p>إذا لم يذكر المصدر نقطة ما صراحة، فلا تعوضها هذه الصفحة بمعرفة خارجية.</p></section></aside></div></main>`;
}

export function renderSourceLibrary(theme) {
  const params = new URLSearchParams(window.location.search);
  const unit = readingUnits.find((item) => item.id === params.get("unit"));
  return `<div class="source-library-shell">${renderTopbar(theme)}${unit ? renderReader(unit) : renderIndex(params)}<footer class="library-footer">مكتبة للقراءة فقط مبنية على المصادر المرفقة. لا تؤثر صفحاتها في التقدم أو الشهادات أو المختبرات.</footer></div>`;
}

export function bindSourceLibraryEvents(onThemeToggle) {
  document.querySelector("#library-theme-toggle")?.addEventListener("click", onThemeToggle);
  const submit = () => {
    const input = document.querySelector("#library-search");
    const query = input?.value?.trim() || "";
    window.location.assign(query ? `/sources?q=${encodeURIComponent(query)}` : "/sources");
  };
  document.querySelector("#library-search-submit")?.addEventListener("click", submit);
  document.querySelector("#library-search")?.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); submit(); } });
}
