import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const serviceWorkerPath = new URL("../client/public/sw.js", import.meta.url);
const serviceWorkerSource = readFileSync(serviceWorkerPath, "utf8");

describe("سياسة تخزين العامل الخدمي", () => {
  it("تحدّث نسخة التخزين المؤقت وتستبدل المخازن القديمة عند التنشيط", () => {
    expect(serviceWorkerSource).toContain('const CACHE_NAME = "dsa-academy-shell-v5";');
    expect(serviceWorkerSource).toContain("caches.delete(key)");
    expect(serviceWorkerSource).toContain("self.skipWaiting()");
    expect(serviceWorkerSource).toContain("self.clients.claim()");
  });

  it("يجلب مستندات التنقل من الشبكة أولًا ويستخدم القشرة المحلية فقط عند انقطاع الشبكة", () => {
    expect(serviceWorkerSource).toContain('const isNavigation = event.request.mode === "navigate";');
    expect(serviceWorkerSource).toContain("fetch(event.request)");
    expect(serviceWorkerSource).toContain('.catch(() => caches.match("/"))');
  });

  it("لا يضع استجابة HTML في ذاكرة مسار فرعي مثل حزمة Vite المجزأة", () => {
    expect(serviceWorkerSource).toContain('!contentType.includes("text/html")');
    expect(serviceWorkerSource).not.toContain('catch(() => caches.match("/index.html"))');
  });
});
