import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { lessons } from "../client/lessons/data.js";

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:3000/";
const debugPort = Number(process.env.QA_DEBUG_PORT || 9333);
const profilePath = `/tmp/dsa-certificate-qa-${process.pid}`;
const artifactDirectory = "/home/ubuntu/qa-artifacts";
const pdfPath = `${artifactDirectory}/certificate-print-qa.pdf`;

const seedState = {
  activeId: "array",
  completed: Object.fromEntries(lessons.map((lesson) => [lesson.id, true])),
  answered: {},
  watched: {},
  labUsed: {},
  labSnapshots: {},
  practice: {},
  javaExercises: {},
  theme: "light",
  learnerName: "متعلم اختبار تشغيلي",
  // يُمنع الاتصال بخدمة الإصدار في اختبار القبول: المعرّف محلي ومعزول في ملف المتصفح المؤقت.
  publicCertificateId: "DSA-2026-PRINT-QA-LOCAL",
  publicCertificateIssuedAt: "2026-08-20T00:00:00.000Z",
  certificateId: "DSA-2026-PRINT-QA-LOCAL",
  completionDate: "20 أغسطس 2026",
  finalReview: {
    answers: Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson.quiz[0].answer])),
    submitted: true,
    completedAt: "20 أغسطس 2026",
  },
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForDebugger() {
  const endpoint = `http://127.0.0.1:${debugPort}/json/list`;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return response.json();
    } catch {
      // يبدأ Chromium عادةً بعد المحاولة الأولى أو الثانية.
    }
    await sleep(150);
  }
  throw new Error("تعذر الاتصال ببروتوكول تصحيح Chromium.");
}

async function connectCdp(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let nextId = 1;

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("تعذر فتح اتصال CDP.")), { once: true });
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(String(event.data));
    const request = pending.get(payload.id);
    if (!request) return;
    pending.delete(payload.id);
    if (payload.error) request.reject(new Error(payload.error.message));
    else request.resolve(payload.result);
  });

  return {
    call(method, params = {}) {
      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    close() {
      socket.close();
    },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "فشل تنفيذ فحص الصفحة.");
  return result.result?.value;
}

const chrome = spawn("/usr/bin/chromium", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profilePath}`,
  "about:blank",
], { stdio: "ignore" });

try {
  const targets = await waitForDebugger();
  const target = targets.find((item) => item.type === "page");
  assert(target?.webSocketDebuggerUrl, "لم يُعثر على صفحة Chromium قابلة للتدقيق.");
  const cdp = await connectCdp(target.webSocketDebuggerUrl);

  const stateJson = JSON.stringify(seedState).replace(/</g, "\\u003c");
  await cdp.call("Page.navigate", { url: origin });

  for (let attempt = 0; attempt < 150; attempt += 1) {
    const ready = await evaluate(cdp, "document.readyState === 'complete'");
    if (ready) break;
    await sleep(200);
  }
  await evaluate(cdp, `localStorage.setItem("dsa-academy-progress-v2", ${JSON.stringify(stateJson)}); true;`);
  await cdp.call("Page.reload", { ignoreCache: true });
  await sleep(2_000);

  for (let attempt = 0; attempt < 150; attempt += 1) {
    const ready = await evaluate(cdp, "Boolean(document.querySelector('#certificate-preview-trigger'))");
    if (ready) break;
    await sleep(200);
  }
  const pageAudit = await evaluate(cdp, `({
    ready: Boolean(document.querySelector('#certificate-preview-trigger')),
    href: location.href,
    state: document.readyState,
    storage: localStorage.getItem('dsa-academy-progress-v2') || '',
    body: document.body?.innerText?.slice(0, 300) || '',
  })`);
  assert(pageAudit.ready, `لم تُحمّل واجهة الشهادة: ${JSON.stringify(pageAudit)}`);

  await evaluate(cdp, "document.querySelector('#certificate-preview-trigger').click(); true;");
  await sleep(100);
  const previewIsVisible = await evaluate(cdp, "document.body.classList.contains('certificate-preview-open') && Boolean(document.querySelector('.certificate-paper'))");
  assert(previewIsVisible, "لم تُفتح معاينة الشهادة.");
  const seededPreview = await evaluate(cdp, `({
    certificateText: document.querySelector('.certificate-paper')?.textContent || '',
    storedState: localStorage.getItem('dsa-academy-progress-v2') || '',
  })`);
  assert(seededPreview.certificateText.includes("DSA-2026-PRINT-QA-LOCAL"), "لم تُحمّل حالة الشهادة المعزولة في المعاينة.");

  await evaluate(cdp, "window.__certificatePrintCalled = false; window.print = () => { window.__certificatePrintCalled = true; }; true;");
  await evaluate(cdp, "document.querySelector('#certificate-preview-print').click(); true;");
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await evaluate(cdp, "window.__certificatePrintCalled === true")) break;
    await sleep(100);
  }
  const printAudit = await evaluate(cdp, `({
    printCalled: window.__certificatePrintCalled === true,
    certificateText: document.querySelector('.certificate-paper')?.textContent || '',
    location: window.location.href,
  })`);
  assert(printAudit.printCalled, "لم يستدع زر الطباعة نافذة الطباعة الحالية.");
  assert(printAudit.certificateText.includes("DSA-2026-PRINT-QA-LOCAL"), "لم يظهر معرّف الشهادة في معاينة الطباعة.");
  assert(printAudit.certificateText.includes("نسبة المراجعة النهائية"), "لم تظهر تسمية نتيجة المراجعة النهائية في الشهادة.");
  assert(printAudit.certificateText.includes("100% (12/12)"), "لا تعرض الشهادة نتيجة المراجعة النهائية الفعلية.");
  assert(!printAudit.location.startsWith("about:blank"), "تمت الطباعة من صفحة فارغة بدل صفحة الأكاديمية.");

  await mkdir(artifactDirectory, { recursive: true });
  const pdf = await cdp.call("Page.printToPDF", { printBackground: true, preferCSSPageSize: true });
  await writeFile(pdfPath, Buffer.from(pdf.data, "base64"));
  const signature = (await readFile(pdfPath)).subarray(0, 4).toString("utf8");
  assert(signature === "%PDF", "لم ينتج مسار الطباعة ملف PDF صالحًا.");

  console.log(JSON.stringify({
    passed: true,
    origin,
    pdfPath,
    printCalled: printAudit.printCalled,
    certificateId: "DSA-2026-PRINT-QA-LOCAL",
  }));
  cdp.close();
} finally {
  if (!chrome.killed) {
    chrome.kill("SIGTERM");
    await Promise.race([once(chrome, "close"), sleep(2_000)]);
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rm(profilePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      break;
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(200);
    }
  }
}
