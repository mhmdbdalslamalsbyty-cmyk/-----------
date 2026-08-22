import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const scriptPath = new URL("../client/script.js", import.meta.url);
const catalogSource = readFileSync(scriptPath, "utf8");
const libraryPath = new URL("../VIDEO_LIBRARY.md", import.meta.url);
const librarySource = readFileSync(libraryPath, "utf8");

const publishedAssets = {
  "why-data-structures": ["V01", "/manus-storage/V01-why-data-structures-ar-animated_191b6b5e.mp4"],
  "singly-linked-basics": ["V03", "/manus-storage/V03-linked-list-ar-animated_561fdacc.mp4"],
  "singly-linked-operations": ["V04", "/manus-storage/V04-linked-list-operations-ar-animated_1059b3a9.mp4"],
  "doubly-linked": ["V05", "/manus-storage/V05-linked-list-doubly-ar-animated_601c351c.mp4"],
  "stack-array": ["V06", "/manus-storage/V06-stack-array-ar-animated_fdc5faaf.mp4"],
  "stack-linked": ["V07", "/manus-storage/V07-stack-linked-ar-animated_08380b83.mp4"],
  "queue-array": ["V08", "/manus-storage/V08-queue-array-ar-animated_17686618.mp4"],
  "queue-linked": ["V09", "/manus-storage/V09-queue-linked-ar-animated_9dd0454f.mp4"],
  recursion: ["V10", "/manus-storage/V10-recursion-ar_dca1ba2d.mp4"],
  trees: ["V11", "/manus-storage/V11-bst-ar_c8ae9e81.mp4"],
  graphs: ["V12", "/manus-storage/V12-graph-traversal-ar_1001cd68.mp4"],
} as const;

describe("LESSON_VIDEO_CATALOG", () => {
  it("يربط كل معرف درس قانوني بالأصل المنشور الصحيح", () => {
    for (const [lessonId, [videoId, source]] of Object.entries(publishedAssets)) {
      expect(catalogSource).toMatch(
        new RegExp(`(?:"${lessonId}"|\\b${lessonId}\\b): \\{ id: "${videoId}", status: "PUBLISHED"`),
      );
      expect(catalogSource).toContain(`source: "${source}"`);
    }
  });

  it("لا يعيد إدخال معرفي tree وgraph غير القانونيين في كتالوج الفيديو", () => {
    expect(catalogSource).not.toContain('tree: { id: "V11"');
    expect(catalogSource).not.toContain('graph: { id: "V12"');
    expect(catalogSource).toContain('trees: { id: "V11"');
    expect(catalogSource).toContain('graphs: { id: "V12"');
  });

  it("لا يعرض V02 كمشغّل منشور ما دام أصله التاريخي غير قابل للتحقق", () => {
    expect(catalogSource).toMatch(/array: \{ id: "V02", status: "EXTERNAL_LICENSE_REQUIRED"/);
    expect(catalogSource).not.toContain('array: { id: "V02", status: "PUBLISHED"');
    expect(catalogSource).not.toContain('array: { id: "V02", status: "EXTERNAL_LICENSE_REQUIRED", title: "المصفوفة: رفّ مرقّم", objective: "فهم الفهرسة والوصول المباشر وكلفة الإزاحة عند الإدراج.", duration: "90.9 ثانية", source:');
  });

  it("لا يمنح المشغّل حالة نشر لأي فيديو بلا مسار تخزين حقيقي", () => {
    expect(catalogSource).not.toContain('status: "READY"');
    expect(catalogSource).toContain('const sourceReady = video.status === "PUBLISHED" && Boolean(video.source);');
  });

  it("يحمي كل مشغّل منشور بنوع MP4 ومسار حقيقي ومنطق تقدم موحّد", () => {
    for (const [lessonId, [, source]] of Object.entries(publishedAssets)) {
      expect(source).toMatch(/^\/manus-storage\/.+\.mp4$/);
      expect(catalogSource).toContain(`source: "${source}"`);
      expect(catalogSource).toMatch(
        new RegExp(`(?:"${lessonId}"|\\b${lessonId}\\b): \\{ id: "V\\d{2}", status: "PUBLISHED"`),
      );
    }
    expect(catalogSource).toContain('type="video/mp4"');
    expect(catalogSource).toContain('if (LESSON_VIDEO_CATALOG[currentLesson().id]?.status === "PUBLISHED") bindVideoProgress();');
    expect(catalogSource).toContain('state.watched[lessonId] = { percent, completed: percent >= 80, updatedAt: new Date().toISOString() };');
    expect(catalogSource).toContain('state.watched[lessonId] = { percent: 100, completed: true, updatedAt: new Date().toISOString() };');
    expect(catalogSource).toContain('video.currentTime = Math.min(video.duration - 0.25, (video.duration * savedPercent) / 100);');
  });

  it("يوثق VIDEO_LIBRARY كل أصل منشور ومعرفي الأشجار والرسوم البيانية القانونيين", () => {
    for (const [lessonId, [videoId, source]] of Object.entries(publishedAssets)) {
      expect(librarySource).toContain(`| ${videoId} |`);
      expect(librarySource).toContain(source);
      expect(librarySource).toContain(`\`${lessonId}\``);
    }
    expect(librarySource).toContain("| V02 | 02 | `array` |");
    expect(librarySource).toContain("`EXTERNAL_LICENSE_REQUIRED`");
    expect(librarySource).toContain("| V11 | 11 | `trees` |");
    expect(librarySource).toContain("| V12 | 12 | `graphs` |");
  });
});
