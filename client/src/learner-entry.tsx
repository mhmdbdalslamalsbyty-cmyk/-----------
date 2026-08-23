import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";
import { trpc } from "./lib/trpc";

const AUTH_REQUEST_TIMEOUT_MS = 12_000;
const AUTH_TIMEOUT_PROCEDURES = [
  "learner.register",
  "learner.login",
  "learner.requestPasswordReset",
];

function isAuthTimeoutRequest(url: RequestInfo | URL) {
  const requestUrl = typeof url === "string" ? url : url.toString();
  return AUTH_TIMEOUT_PROCEDURES.some(procedure => requestUrl.includes(`/api/trpc/${procedure}`));
}

async function learnerFetch(url: RequestInfo | URL, options?: RequestInit) {
  const controller = new AbortController();
  const timeout = isAuthTimeoutRequest(url)
    ? window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS)
    : undefined;
  const abortFromCaller = () => controller.abort();
  options?.signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    return await fetch(url, { ...options, credentials: "include", signal: controller.signal });
  } finally {
    if (timeout !== undefined) window.clearTimeout(timeout);
    options?.signal?.removeEventListener("abort", abortFromCaller);
  }
}

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
      fetch: learnerFetch,
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
