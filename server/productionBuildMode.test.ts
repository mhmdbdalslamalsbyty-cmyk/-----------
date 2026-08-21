import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production build mode", () => {
  it("pins Vite to production mode before bundling the client", () => {
    const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { scripts?: Record<string, string> };
    expect(packageJson.scripts?.build).toMatch(/^NODE_ENV=production vite build/);
  });
});
