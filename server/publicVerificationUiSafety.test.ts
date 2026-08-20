import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const script = readFileSync(new URL("../client/script.js", import.meta.url), "utf8");

describe("واجهة التحقق العام", () => {
  it("لا تعرض حمولة أو رسالة تحقق داخلية للزائر عند خطأ الصيغة", () => {
    expect(script).toContain("أدخل رقم الشهادة بالصيغة الظاهرة في الشهادة");
    expect(script).toContain("لا تعرض هذه الصفحة تفاصيل فنية عن طلب التحقق");
    expect(script).not.toContain('escapeHtml(error?.message || "أعد المحاولة لاحقًا.")');
  });
});
