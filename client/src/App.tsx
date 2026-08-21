import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminCenter = lazy(() => import("./pages/AdminCenter"));
const LearnerAuth = lazy(() => import("./pages/LearnerAuth"));
const PasswordRecovery = lazy(() => import("./pages/PasswordRecovery"));

function RouteLoading() {
  return <main className="grid min-h-screen place-items-center bg-[#071521] px-4 text-center text-sm font-bold text-teal-100" dir="rtl">جارٍ فتح الصفحة…</main>;
}

function Router() {
  return <Suspense fallback={<RouteLoading />}><Switch>
    <Route path="/login">{() => <LearnerAuth mode="login" />}</Route>
    <Route path="/register">{() => <LearnerAuth mode="register" />}</Route>
    <Route path="/forgot-password">{() => <PasswordRecovery mode="request" />}</Route>
    <Route path="/reset-password">{() => <PasswordRecovery mode="reset" />}</Route>
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/admin" component={AdminCenter} />
    <Route path="/admin/learners/:id" component={AdminCenter} />
    <Route path="/admin/learners" component={AdminCenter} />
    <Route path="/admin/certificates" component={AdminCenter} />
    <Route path="/admin/videos" component={AdminCenter} />
    <Route path="/admin/course" component={AdminCenter} />
    <Route path="/admin/activity" component={AdminCenter} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></Suspense>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
