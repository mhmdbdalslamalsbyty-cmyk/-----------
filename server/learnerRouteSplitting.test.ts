import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("learner route splitting", () => {
  const source = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");

  it("keeps account and admin pages behind lazy route boundaries", () => {
    expect(source).toContain('lazy(() => import("./pages/Dashboard"))');
    expect(source).toContain('lazy(() => import("./pages/AdminCenter"))');
    expect(source).toContain('lazy(() => import("./pages/LearnerAuth"))');
    expect(source).toContain('lazy(() => import("./pages/PasswordRecovery"))');
  });

  it("provides an Arabic Suspense fallback while a route chunk loads", () => {
    expect(source).toContain("<Suspense fallback={<RouteLoading />}>");
    expect(source).toContain("جارٍ فتح الصفحة…");
  });
});
