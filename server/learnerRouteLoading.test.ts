import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const entryPath = new URL("../client/src/main.tsx", import.meta.url);
const entrySource = readFileSync(entryPath, "utf8");

describe("تحميل مسارات حساب المتعلم", () => {
  it("يحمّل واجهة React لمسارات الدخول والتسجيل والاستعادة ولوحة المتعلم", () => {
    for (const route of [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/dashboard",
    ]) {
      expect(entrySource).toContain(`"${route}"`);
    }

    expect(entrySource).toContain('import("./learner-entry")');
  });
});
