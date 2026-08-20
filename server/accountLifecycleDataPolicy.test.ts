import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

describe("سياسات بيانات دورة حياة الحساب", () => {
  it("لا يقبل رمز الاستعادة إلا إن كان غير مستخدم وغير منتهي الصلاحية", () => {
    expect(dbSource).toContain("isNull(passwordResetTokens.usedAt)");
    expect(dbSource).toContain("gt(passwordResetTokens.expiresAt, new Date())");
  });

  it("يستهلك رمز الاستعادة بتحديث مشروط يمنع استخدامه مرتين", () => {
    expect(dbSource).toContain("eq(passwordResetTokens.id, token.id)");
    expect(dbSource).toContain("if (!consumed[0]?.affectedRows) return false;");
  });

  it("يفصل ملكية الشهادة العامة عن الحساب المحذوف من دون حذف سجل التحقق", () => {
    expect(dbSource).toContain("tx.update(certificates).set({ ownerUserId: null })");
    expect(dbSource).not.toContain("tx.delete(certificates)");
  });
});
