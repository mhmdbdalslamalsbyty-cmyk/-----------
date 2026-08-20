const learnerRoutes = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/admin",
  "/admin/learners",
  "/admin/certificates",
  "/admin/videos",
  "/admin/course",
  "/admin/activity",
]);

if (learnerRoutes.has(window.location.pathname)) {
  void import("./learner-entry");
} else {
  // @ts-expect-error واجهة الأكاديمية القديمة JavaScript مستقلة ولا تملك تعريفات TypeScript.
  void import("../script.js");
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
