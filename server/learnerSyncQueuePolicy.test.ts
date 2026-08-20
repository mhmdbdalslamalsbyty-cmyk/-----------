import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const academyScriptPath = new URL("../client/script.js", import.meta.url);
const academyScript = readFileSync(academyScriptPath, "utf8");

describe("سياسة طابور مزامنة المتعلم", () => {
  it("يحفظ لقطات تقدم محدودة عند تعذر الشبكة بدل فقدها", () => {
    expect(academyScript).toContain("const SYNC_QUEUE_STORAGE");
    expect(academyScript).toContain("const MAX_SYNC_QUEUE_ITEMS");
    expect(academyScript).toContain("queue.slice(-MAX_SYNC_QUEUE_ITEMS)");
    expect(academyScript).toContain('setSyncStatus("offline")');
    expect(academyScript).toContain('navigator.onLine === false ? "offline" : "failed"');
  });

  it("لا يزيل طابور التقدم إلا بعد مزامنة ناجحة ويعيد المحاولة عند عودة الاتصال", () => {
    const successPath = academyScript.slice(
      academyScript.indexOf("const progress = await callTrpcApi(\"progress.sync\"") ,
      academyScript.indexOf("} catch (error)", academyScript.indexOf("async function syncProgressToServer")),
    );

    expect(successPath).toContain("removeQueuedProgressThrough(queuedEntry.id)");
    expect(academyScript).toContain("window.addEventListener(\"online\"");
    expect(academyScript).toContain("queueProgressSync({ persistSnapshot: false })");
    expect(academyScript).toContain("window.addEventListener(\"offline\"");
  });
});
