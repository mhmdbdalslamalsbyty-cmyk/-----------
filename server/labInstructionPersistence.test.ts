import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const scriptPath = new URL("../client/script.js", import.meta.url);
const scriptSource = readFileSync(scriptPath, "utf8");

describe("استمرارية إرشادات المختبر", () => {
  it("يحفظ آخر تفسير للعملية في لقطة المختبر بدل الاعتماد على DOM المؤقت", () => {
    expect(scriptSource).toContain("labState.note = message;");
    expect(scriptSource).toContain("function restoreLabNote(fallback)");
  });

  it("يعيد كل مختبر قائم آخر إرشاد أو تعليمته الابتدائية عند عدم وجود عملية سابقة", () => {
    expect((scriptSource.match(/restoreLabNote\(/g) || []).length).toBeGreaterThanOrEqual(9);
    expect(scriptSource).not.toContain('document.querySelector("#lab-note")?.textContent || ""');
  });
});
