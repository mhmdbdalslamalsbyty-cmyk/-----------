import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authPage = readFileSync(new URL("../client/src/pages/LearnerAuth.tsx", import.meta.url), "utf8");
const academy = readFileSync(new URL("../client/script.js", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../client/src/pages/Dashboard.tsx", import.meta.url), "utf8");

describe("عودة المتعلم من الحساب إلى الأكاديمية", () => {
  it("يرطب الجلسة ثم يعيد المتعلم إلى مسار أكاديمية محلي آمن", () => {
    expect(authPage).toContain("await me.refetch()");
    expect(authPage).toContain("window.location.assign(returnTo)");
    expect(authPage).toContain("candidate.origin === window.location.origin");
    expect(authPage).toContain('candidate.pathname === "/"');
  });

  it("يحفظ سياق الدرس عند فتح الدخول من الأكاديمية", () => {
    expect(academy).toContain("function learnerAuthHref()");
    expect(academy).toContain('`/?lesson=${encodeURIComponent(activeId)}`');
    expect(academy).toContain('learnerSession.authenticated ? "/dashboard" : learnerAuthHref()');
    expect(authPage).toContain("function authRoute(pathname: string, returnTo: string)");
    expect(authPage).toContain('authRoute(isRegister ? "/login" : "/register", returnTo)');
  });

  it("يعيد الخروج إلى الأكاديمية المجهولة لا إلى صفحة حساب وسيطة", () => {
    expect(dashboard).toContain('onSuccess: () => window.location.assign("/")');
  });
});
