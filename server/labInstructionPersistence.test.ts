import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const scriptPath = new URL("../client/script.js", import.meta.url);
const scriptSource = readFileSync(scriptPath, "utf8");
const lessonDataPath = new URL("../client/lessons/data.js", import.meta.url);
const lessonDataSource = readFileSync(lessonDataPath, "utf8");

describe("استمرارية إرشادات المختبر", () => {
  it("يحفظ آخر تفسير للعملية في لقطة المختبر بدل الاعتماد على DOM المؤقت", () => {
    expect(scriptSource).toContain("labState.note = message;");
    expect(scriptSource).toContain("function restoreLabNote(fallback)");
  });

  it("يعيد كل مختبر قائم آخر إرشاد أو تعليمته الابتدائية عند عدم وجود عملية سابقة", () => {
    expect((scriptSource.match(/restoreLabNote\(/g) || []).length).toBeGreaterThanOrEqual(9);
    expect(scriptSource).not.toContain('document.querySelector("#lab-note")?.textContent || ""');
  });

  it("يمثل BFS وDFS كخطوات محفوظة تطابق الرسم والإرشاد بدل القفز إلى النتيجة النهائية", () => {
    expect(scriptSource).toContain("const GRAPH_TRAVERSAL_STEPS");
    expect(scriptSource).toContain("function advanceGraphTraversal(mode)");
    expect(scriptSource).toContain("labState.graphStep = nextStep;");
    expect(scriptSource).toContain("labState.graphVisited = [...current.visited];");
    expect(scriptSource).toContain("labState.graphActiveEdge = current.edge ? [...current.edge] : null;");
    expect(scriptSource).toContain("BFS — Breadth-First Search");
    expect(scriptSource).toContain("DFS — Depth-First Search");
    expect(scriptSource).not.toContain('labState.graphVisited = ["A","B","C","D","E","F"]');
  });

  it("يعيد زر الرسم كل حالة اجتياز وإرشاده إلى البداية دون لمس التقدم", () => {
    expect(scriptSource).toContain("function resetGraphTraversal()");
    expect(scriptSource).toContain("labState.graphMode = null;");
    expect(scriptSource).toContain("labState.graphStep = 0;");
    expect(scriptSource).toContain("labState.graphVisited = [];");
    expect(scriptSource).toContain("اختر BFS — Breadth-First Search أو DFS — Depth-First Search");
  });

  it("يطبع لقطات الرسم البياني القديمة التي لا تحمل وضع اجتياز قبل استعادة الإرشاد", () => {
    expect(scriptSource).toContain("function normalizeGraphTraversalSnapshot()");
    expect(scriptSource).toContain("normalizeGraphTraversalSnapshot();");
    expect(scriptSource).toContain("labState.graphMode = null;");
    expect(scriptSource).toContain("labState.note = \"\";");
  });

  it("يظهر المصطلح العربي والإنجليزي في أسماء المختبرات وقواعدها التعليمية", () => {
    expect(scriptSource).toContain("مختبر الرسم البياني (Graph)");
    expect(scriptSource).toContain("مختبر القائمة المرتبطة (Linked List)");
    expect(scriptSource).toContain("المكدس (Stack)");
    expect(scriptSource).toContain("المؤشر (Pointer)");
  });

  it("يعطي Peek front في الطابور أثرًا مرئيًا وإرشادًا يطابق عدم الحذف", () => {
    expect(scriptSource).toContain("labState.queuePeekPulse");
    expect(scriptSource).toContain('data-peek-pulse=');
    expect(scriptSource).toContain("Peek لا يحذف العنصر");
  });

  it("يوحّد المصطلحات الثنائية في محتوى الدروس من دون تغيير معرفات الدروس", () => {
    expect(lessonDataSource).toContain('id: "array"');
    expect(lessonDataSource).toContain('id: "graphs"');
    expect(lessonDataSource).toContain("عنصر (Element)");
    expect(lessonDataSource).toContain("القائمة المرتبطة الأحادية (Singly Linked List)");
    expect(lessonDataSource).toContain("الدالة العودية (Recursive Function)");
    expect(lessonDataSource).toContain("شجرة البحث الثنائية (Binary Search Tree, BST)");
    expect(lessonDataSource).toContain("BFS — Breadth-First Search");
    expect(lessonDataSource).toContain("مصفوفة تجاور (Adjacency Matrix)");
  });
});
