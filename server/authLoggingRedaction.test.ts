import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const oauthSource = readFileSync(new URL("./_core/oauth.ts", import.meta.url), "utf8");
const sdkSource = readFileSync(new URL("./_core/sdk.ts", import.meta.url), "utf8");
const collectorSource = readFileSync(new URL("../client/public/__manus__/debug-collector.js", import.meta.url), "utf8");

describe("تنقيح سجلات المصادقة", () => {
  it("لا يمرر كائن خطأ OAuth الخام إلى console.error", () => {
    expect(oauthSource).toContain("function safeOAuthFailureSummary(error: unknown)");
    expect(oauthSource).not.toContain('console.error("[OAuth] Callback failed", error)');
    expect(oauthSource).not.toContain('console.error("[Audit] Failed to record admin OAuth login", error)');
    expect(sdkSource).toContain("const safeOAuthFailureSummary = (error: unknown)");
    expect(sdkSource).not.toContain('console.error("[Auth] Failed to sync user from OAuth:", error)');
  });

  it("ينقح Headers الحساسة قبل إيداع سجل شبكة التطوير", () => {
    expect(collectorSource).toContain("function sanitizeHeaders(headers)");
    expect(collectorSource).toContain('safe[key] = isSensitive ? "[REDACTED]"');
    expect(collectorSource).toContain("requestHeaders = sanitizeHeaders(Object.fromEntries(new Headers(init.headers).entries()));");
    expect(collectorSource).toContain("headers: sanitizeHeaders(Object.fromEntries(response.headers.entries()))");
  });
});
