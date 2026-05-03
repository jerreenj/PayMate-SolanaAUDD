import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { SolanaWalletProvider } from "@/components/SolanaWalletProvider";
import { lazy, Suspense } from "react";
import Landing from "@/pages/Landing";

const Dashboard         = lazy(() => import("@/pages/Dashboard"));
const Invoices          = lazy(() => import("@/pages/Invoices"));
const PaymentLinks      = lazy(() => import("@/pages/PaymentLinks"));
const PaymentRequests   = lazy(() => import("@/pages/PaymentRequests"));
const Recurring         = lazy(() => import("@/pages/Recurring"));
const Splits            = lazy(() => import("@/pages/Splits"));
const Contacts          = lazy(() => import("@/pages/Contacts"));
const TransactionHistory = lazy(() => import("@/pages/TransactionHistory"));
const NotFound          = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function PageShell() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-white/50 animate-pulse" />
          <div className="w-1.5 h-1.5 bg-white/50 animate-pulse" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 bg-white/50 animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
        <div className="text-white/30 text-[10px] tracking-widest uppercase">Loading</div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageShell />}>
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
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SolanaWalletProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
        </SolanaWalletProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
