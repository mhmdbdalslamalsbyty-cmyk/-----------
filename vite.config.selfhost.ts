import path from "node:path";
import { defineConfig } from "vite";

/**
 * إعداد بناء محايد للاستضافة الذاتية.
 * لا يحتوي على أدوات جمع السجلات أو التخزين الخاصة ببيئة التطوير المستضافة.
 */
export default defineConfig({
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000,
  },
});
