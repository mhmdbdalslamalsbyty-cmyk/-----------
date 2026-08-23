import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminCenter from "./pages/AdminCenter";
import Dashboard from "./pages/Dashboard";
import LearnerAuth from "./pages/LearnerAuth";
import NotFound from "./pages/NotFound";
import PasswordRecovery from "./pages/PasswordRecovery";

function Router() {
  return <Switch>
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
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
