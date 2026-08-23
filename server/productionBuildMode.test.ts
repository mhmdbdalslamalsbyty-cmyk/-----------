import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const viteServerSource = readFileSync(new URL("./_core/vite.ts", import.meta.url), "utf8");
const serverEntrySource = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");

describe("production build mode", () => {
  it("pins Vite to production mode before bundling the client", () => {
    const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { scripts?: Record<string, string> };
    expect(packageJson.scripts?.build).toMatch(/^NODE_ENV=production vite build/);
  });

  it("لا يخزّن عامل الخدمة الثابت حتى تصل تحديثات سياسة الجلسة", () => {
    expect(viteServerSource).toContain('app.get("/sw.js"');
    expect(viteServerSource).toContain('"no-cache, no-store, must-revalidate"');
  });

  it("يقدّم عامل الخدمة الإصدار الجديد من الخادم عند غياب الأصل الساكن", () => {
    expect(serverEntrySource).toContain('app.get("/sw-v10.js"');
    expect(serverEntrySource).toContain('res\n      .type("application/javascript")');
    expect(serverEntrySource).toContain('const learnerServiceWorkerV10');
  });
});
