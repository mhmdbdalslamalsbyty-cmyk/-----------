import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const script = readFileSync(new URL("../client/script.js", import.meta.url), "utf8");

describe("مسارات الواجهة العامة غير المعروفة", () => {
  it("تعرض صفحة 404 مفهومة ولا تسمح بفهرستها", () => {
    expect(script).toContain("function renderNotFoundPage()");
    expect(script).toContain("الصفحة غير موجودة");
    expect(script).toContain("noindex,nofollow");
    expect(script).toContain("if (!isAcademyHomeRoute()) { renderNotFoundPage(); return; }");
  });
});
