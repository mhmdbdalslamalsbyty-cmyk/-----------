import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("سياسة فهرسة المسارات العامة", () => {
  it("تسمح بالدروس والتحقق العام وتحجب المسارات الخاصة فقط", () => {
    const robots = readFileSync(resolve(process.cwd(), "client/public/robots.txt"), "utf8");

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /verify");
    expect(robots).toContain("Disallow: /admin/");
    expect(robots).toContain("Disallow: /dashboard");
    expect(robots).not.toContain("Disallow: /verify");
  });
});
