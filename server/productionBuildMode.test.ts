import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const viteServerSource = readFileSync(new URL("./_core/vite.ts", import.meta.url), "utf8");

describe("production build mode", () => {
  it("pins Vite to production mode before bundling the client", () => {
    const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { scripts?: Record<string, string> };
    expect(packageJson.scripts?.build).toMatch(/^NODE_ENV=production vite build/);
  });

  it("لا يخزّن عامل الخدمة الثابت حتى تصل تحديثات سياسة الجلسة", () => {
    expect(viteServerSource).toContain('app.get("/sw.js"');
    expect(viteServerSource).toContain('"no-cache, no-store, must-revalidate"');
  });
});
