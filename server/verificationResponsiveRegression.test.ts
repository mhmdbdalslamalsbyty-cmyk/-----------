import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const academy = readFileSync(new URL("../client/script.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/styles.css", import.meta.url), "utf8");

describe("تحقق الشهادة المتجاوب والحالة غير الصالحة", () => {
  it("يوضح أن الشهادة المفقودة أو غير الصالحة ليست نتيجة صالحة", () => {
    expect(academy).toContain("الشهادة غير موجودة أو غير صالحة");
    expect(academy).toContain("الشهادة غير صالحة حاليًا");
  });

  it("يحمي رأس ومسار ونتيجة التحقق من تجاوز العرض", () => {
    expect(styles).toContain("width:min(940px,calc(100vw - 2rem))");
    expect(styles).toContain("max-width:calc(100vw - 2rem)");
    expect(styles).toContain("grid-template-columns:minmax(0,1fr) auto");
    expect(styles).toContain("grid-template-columns:auto minmax(0,1fr) auto");
    expect(styles).toContain(".verify-route-trace { grid-column:1 / -1; display:flex; flex-wrap:wrap;");
    expect(styles).toContain("overflow-wrap:anywhere");
  });
});
