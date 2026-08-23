import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routerPath = new URL("./routers.ts", import.meta.url);
const dbPath = new URL("./db.ts", import.meta.url);
const accountSettingsPath = new URL("../client/src/components/AccountSettings.tsx", import.meta.url);
const routerSource = readFileSync(routerPath, "utf8");
const dbSource = readFileSync(dbPath, "utf8");
const accountSettingsSource = readFileSync(accountSettingsPath, "utf8");

describe("انحدارات سلامة دورة حساب المتعلم", () => {
  it("يطبع البريد ويتحقق من bcrypt عند التسجيل والدخول", () => {
    expect(routerSource).toContain('z.string().trim().toLowerCase().email');
    expect(routerSource).toContain("bcrypt.hash(input.password, 12)");
    expect(routerSource).toContain("bcrypt.compare(input.password, account.passwordHash)");
  });

  it("لا يعرض في نموذج الحساب رسائل SQL أو تفاصيل اتصال داخلية", () => {
    expect(accountSettingsSource).not.toContain("Failed query:");
    const authSource = readFileSync(new URL("../client/src/pages/LearnerAuth.tsx", import.meta.url), "utf8");
    expect(authSource).toContain("function safeAuthError");
    expect(authSource).toContain("تعذر تسجيل الدخول الآن. أعد المحاولة بعد لحظات.");
  });

  it("يبطل الجلسة الخادمية عند الخروج ويحافظ على الحذف الذري والشهادات العامة", () => {
    expect(routerSource).toContain("await invalidateLearnerSessions(ctx.user.id);");
    expect(dbSource).toContain("export async function deleteLearnerAccountAndPrivateData");
    expect(dbSource).toContain("await db.transaction(async tx => {");
    expect(dbSource).toContain("await tx.update(certificates).set({ ownerUserId: null })");
    expect(dbSource).toContain("await tx.delete(learnerAccounts)");
  });

  it("يمسح جميع آثار تقدم العميل عند حذف الحساب", () => {
    expect(accountSettingsSource).toContain('const PENDING_IMPORT_STORAGE = "dsa-academy-pending-server-import-v1"');
    expect(accountSettingsSource).toContain('localStorage.removeItem(PENDING_IMPORT_STORAGE)');
    expect(accountSettingsSource).toContain('setLocation("/register")');
  });
});
