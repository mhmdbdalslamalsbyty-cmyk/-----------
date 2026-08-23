import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const academyScript = readFileSync(resolve(root, "client/script.js"), "utf8");
const storageProxy = readFileSync(resolve(root, "server/_core/storageProxy.ts"), "utf8");

describe("تقديم الفيديو بعد توثيق المتعلم", () => {
  it("يبقي كتالوج الفيديو على مفاتيح التخزين ويحول المشغل فقط إلى مسار خادمي مخصص", () => {
    expect(academyScript).toContain('const storagePrefix = "/manus-storage/"');
    expect(academyScript).toContain('`/api/media/${source.slice(storagePrefix.length)}`');
    expect(academyScript).toContain('src="${videoPlayerSource(video.source)}"');
  });

  it("يقدم مسار الوسائط الجديد التحويل الموقّع نفسه لمسار التخزين القديم", () => {
    expect(storageProxy).toContain('app.get("/manus-storage/*", redirectToStorage)');
    expect(storageProxy).toContain('app.get("/api/media/*", redirectToStorage)');
    expect(storageProxy).toContain('res.redirect(307, url)');
  });
});
