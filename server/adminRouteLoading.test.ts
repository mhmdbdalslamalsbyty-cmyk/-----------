import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("تحميل مسارات مركز التحكم", () => {
  it("يوجه جميع مسارات الإدارة إلى نقطة دخول React بدلاً من واجهة الدروس المستقلة", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
    for (const route of ["/admin", "/admin/learners", "/admin/certificates", "/admin/videos", "/admin/course", "/admin/activity"]) {
      expect(source).toContain(`"${route}"`);
    }
    expect(source).toContain("/^\\/admin\\/learners\\/\\d+$/");
    expect(source).toContain('import { bootstrapLearnerApp } from "./learner-entry";');
    expect(source).toContain("bootstrapLearnerApp();");
  });
});
