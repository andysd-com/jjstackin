import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import JobsPage from "@/pages/jobs";
import MapPage from "@/pages/map";
import RoutesPage from "@/pages/routes";
import EarningsPage from "@/pages/earnings";
import IntegrationsPage from "@/pages/integrations";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/jobs" component={JobsPage} />
      <Route path="/map" component={MapPage} />
      <Route path="/routes" component={RoutesPage} />
      <Route path="/earnings" component={EarningsPage} />
      <Route path="/integrations" component={IntegrationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
