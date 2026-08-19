/**
 * خريطة المعرفة الحية: يربط هذا المدخل مسار بناء Vite بواجهة الأكاديمية
 * المستقلة التي تُرسم داخل #app، بدل محاولة تركيب React في #root غير الموجود.
 */
import "../script.js";

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
