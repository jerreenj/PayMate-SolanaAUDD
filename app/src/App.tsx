import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import PaymentLinks from "@/pages/PaymentLinks";
import PaymentRequests from "@/pages/PaymentRequests";
import Recurring from "@/pages/Recurring";
import Splits from "@/pages/Splits";
import Contacts from "@/pages/Contacts";
import TransactionHistory from "@/pages/TransactionHistory";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/invoices">
        <Layout><Invoices /></Layout>
      </Route>
      <Route path="/payment-links">
        <Layout><PaymentLinks /></Layout>
      </Route>
      <Route path="/payment-requests">
        <Layout><PaymentRequests /></Layout>
      </Route>
      <Route path="/recurring">
        <Layout><Recurring /></Layout>
      </Route>
      <Route path="/splits">
        <Layout><Splits /></Layout>
      </Route>
      <Route path="/contacts">
        <Layout><Contacts /></Layout>
      </Route>
      <Route path="/transactions">
        <Layout><TransactionHistory /></Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
