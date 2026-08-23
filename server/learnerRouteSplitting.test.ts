import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("موثوقية مسارات المتعلم", () => {
  const source = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");

  it("يبقي صفحات الحساب والإدارة ضمن الحزمة المضمونة لنقطة دخول الحساب", () => {
    expect(source).toContain('import Dashboard from "./pages/Dashboard";');
    expect(source).toContain('import AdminCenter from "./pages/AdminCenter";');
    expect(source).toContain('import LearnerAuth from "./pages/LearnerAuth";');
    expect(source).toContain('import PasswordRecovery from "./pages/PasswordRecovery";');
    expect(source).not.toContain("lazy(() => import(");
  });

  it("يوجه كل مسار حساب صراحة إلى مكوّن ظاهر", () => {
    expect(source).toContain('<Route path="/login">{() => <LearnerAuth mode="login" />}</Route>');
    expect(source).toContain('<Route path="/dashboard" component={Dashboard} />');
  });
});
