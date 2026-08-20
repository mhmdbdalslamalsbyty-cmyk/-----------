import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/Dashboard.tsx"), "utf8");
const recoverySource = readFileSync(resolve(process.cwd(), "client/src/pages/PasswordRecovery.tsx"), "utf8");

describe("انحدار واجهات حساب المتعلم المتجاوبة", () => {
  it("يستدعي كل Hooks لوحة المتعلم قبل أي مسار عرض مبكر", () => {
    expect(dashboardSource.indexOf("const queuedCount = useMemo")).toBeLessThan(dashboardSource.indexOf("if (learner.isPending"));
  });

  it("يبقي صفحة الاستعادة في عمود واحد على العرض المتوسط", () => {
    expect(recoverySource).toContain("xl:grid-cols-[.9fr_1.1fr]");
    expect(recoverySource).not.toContain("lg:grid-cols-[.9fr_1.1fr]");
  });
});
