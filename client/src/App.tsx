import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import LearnerAuth from "./pages/LearnerAuth";
import PasswordRecovery from "./pages/PasswordRecovery";

function Router() {
  return (
    <Switch>
      <Route path="/login">{() => <LearnerAuth mode="login" />}</Route>
      <Route path="/register">{() => <LearnerAuth mode="register" />}</Route>
      <Route path="/forgot-password">{() => <PasswordRecovery mode="request" />}</Route>
      <Route path="/reset-password">{() => <PasswordRecovery mode="reset" />}</Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
