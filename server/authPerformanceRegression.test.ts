import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const entrySource = readFileSync(new URL("../client/src/learner-entry.tsx", import.meta.url), "utf8");
const authSource = readFileSync(new URL("../client/src/pages/LearnerAuth.tsx", import.meta.url), "utf8");
const recoverySource = readFileSync(new URL("../client/src/pages/PasswordRecovery.tsx", import.meta.url), "utf8");

describe("انحدارات أداء مصادقة المتعلم", () => {
  it("يتداخل فحص البريد وتجزئة كلمة المرور ويصدر openId محليًا مرة واحدة عند التسجيل", () => {
    expect(routerSource).toContain("const [existing, passwordHash] = await Promise.all([");
    expect(routerSource).toContain("getLearnerAccountByEmail(input.email)");
    expect(routerSource).toContain("bcrypt.hash(input.password, 12)");
    expect(routerSource).toContain("const openId = `local:${nanoid(24)}`");
    expect(routerSource).not.toContain("local:pending:");
  });

  it("يوازي استرجاع هوية المستخدم وتسجيل الدخول بعد تحقق كلمة المرور", () => {
    expect(routerSource).toContain("getLearnerLoginByEmail(input.email)");
    expect(routerSource).toContain("updateLearnerAccountLogin(account.userId)");
    expect(routerSource).toContain("account.openId, account.displayName, account.sessionVersion");
  });

  it("يوقف طلبات المصادقة العالقة ويعرض نتيجة عربية واضحة", () => {
    expect(entrySource).toContain("const AUTH_REQUEST_TIMEOUT_MS = 12_000");
    expect(entrySource).toContain("new AbortController()");
    expect(entrySource).toContain("controller.abort()");
    expect(authSource).toContain("انتهت مهلة الاتصال. تحقق من الشبكة ثم أعد المحاولة.");
    expect(recoverySource).toContain("انتهت مهلة الاتصال. تحقق من الشبكة ثم أعد المحاولة.");
    expect(dbSource).toContain("const AUTH_DATABASE_CONNECT_TIMEOUT_MS = 5_000");
    expect(dbSource).toContain("connectTimeout: AUTH_DATABASE_CONNECT_TIMEOUT_MS");
  });

  it("يعيد إلى الدرس أو لوحة المتعلم بعد النجاح بدل انتظار refetch", () => {
    expect(authSource).toContain('candidate.pathname === "/dashboard"');
    expect(authSource).toContain("window.location.assign(returnTo)");
    expect(authSource).not.toContain("await me.refetch()");
  });
});
