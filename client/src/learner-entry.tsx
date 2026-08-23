import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";
import { trpc } from "./lib/trpc";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      // جلسة المتعلم تصدر في استجابة register/login؛ اجعل اعتماد Cookie
      // صريحًا حتى يحفظها المتصفح ويرسلها في learner.me اللاحق.
      fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
    }),
  ],
});

export function bootstrapLearnerApp() {
  const app = document.getElementById("app");
  if (!app) throw new Error("حاوية التطبيق غير متاحة.");

  createRoot(app).render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
