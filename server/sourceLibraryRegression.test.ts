import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readingUnits, sourceLibrary } from "../client/source-library.js";

const scriptPath = new URL("../client/script.js", import.meta.url);
const viewPath = new URL("../client/source-library-view.js", import.meta.url);
const stylesPath = new URL("../client/styles.css", import.meta.url);
const scriptSource = readFileSync(scriptPath, "utf8");
const viewSource = readFileSync(viewPath, "utf8");
const stylesSource = readFileSync(stylesPath, "utf8");

describe("مكتبة المصادر التعليمية", () => {
  it("تفهرس كل الأصول المرفقة ببطاقة فريدة قابلة للفتح", () => {
    expect(sourceLibrary).toHaveLength(12);
    expect(new Set(sourceLibrary.map((source) => source.id)).size).toBe(sourceLibrary.length);
    expect(sourceLibrary.map((source) => source.id)).toEqual([
      "S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09", "S10", "S11", "S12",
    ]);

    for (const source of sourceLibrary) {
      expect(source.asset).toMatch(/^\/manus-storage\//);
      expect(source.title).not.toHaveLength(0);
      expect(source.arabicTitle).not.toHaveLength(0);
      expect(source.topics.length).toBeGreaterThan(0);
      expect(source.status).not.toHaveLength(0);
    }
  });

  it("يربط كل وحدة قراءة بمصدر معروف وبمراجعة غير مصححة تلقائيًا", () => {
    expect(readingUnits).toHaveLength(31);
    const sourceIds = new Set(sourceLibrary.map((source) => source.id));

    for (const unit of readingUnits) {
      expect(unit.sourceIds.length).toBeGreaterThan(0);
      expect(unit.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(unit.goals.length).toBeGreaterThan(0);
      expect(unit.terms.length).toBeGreaterThan(0);
      expect(unit.questions.length).toBeGreaterThan(0);
      expect(unit.explanation).not.toHaveLength(0);
    }
  });

  it("يضيف S12 ووحداته بصفحات المصدر وأصله الحقيقي دون تكرار بطاقة قائمة", () => {
    const source = sourceLibrary.find((item) => item.id === "S12");
    expect(source).toMatchObject({
      title: "Data Structure Basic Concepts",
      pages: "110 صفحات",
      asset: "/manus-storage/datastructure-basic-concepts_6dcd0db2.pdf",
      status: "نص قابل للاستخراج",
    });
    const units = readingUnits.filter((item) => item.sourceIds.includes("S12"));
    expect(units).toHaveLength(7);
    expect(units.every((unit) => /^S12 ص/.test(unit.pages))).toBe(true);
    expect(units.map((unit) => unit.id)).toEqual([
      "s12-data-adt", "s12-algorithm-specification", "s12-complexity-pseudocode", "s12-arrays", "s12-list-adts", "s12-stack-infix-postfix", "s12-queues-linked-lists",
    ]);
  });

  it("يعزل مسار /sources عن الدروس والتقدم والشهادات", () => {
    expect(scriptSource).toContain('=== "/sources"');
    expect(scriptSource).toContain("renderSourceLibrary(state.theme)");
    expect(scriptSource).toContain("bindSourceLibraryEvents");
    expect(viewSource).toContain("لا تؤثر صفحاتها في التقدم أو الشهادات أو المختبرات");
    expect(viewSource).toContain("لا تُسجل إجاباتك ولا تؤثر في الاختبارات أو الشهادة");
    expect(viewSource).not.toContain("state.completed");
    expect(viewSource).not.toContain("certificate");
  });

  it("يوفر صفحة فهرسة وصفحة قراءة وبحثًا محليًا واستجابة للمقاسات", () => {
    expect(viewSource).toContain("id=\"library-search\"");
    expect(viewSource).toContain("sourceSearchTerms");
    expect(viewSource).toContain("target=\"_blank\"");
    expect(viewSource).toContain("أسئلة مراجعة من المصدر");
    expect(stylesSource).toContain(".source-library-shell");
    expect(stylesSource).toContain(".reader-layout");
    expect(stylesSource).toContain("@media (max-width: 620px)");
  });
});
