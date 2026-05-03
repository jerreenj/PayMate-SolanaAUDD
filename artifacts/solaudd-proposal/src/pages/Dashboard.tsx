import { useState } from "react";
import { useGetDashboardSummary, useGetExchangeRates } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";
import { SendModal } from "@/components/SendModal";
import { ReceiveModal } from "@/components/ReceiveModal";

const DEMO_SUMMARY = {
  balanceAudd: 4692, balanceAud: 4692, balanceUsd: 3002.88,
  totalSentAudd: 1450, totalReceivedAudd: 1142,
  pendingInvoicesCount: 2, pendingInvoicesAudd: 3050,
  activePaymentLinks: 2, activeRecurring: 2,
  recentTransactions: [
    { id: "1", type: "receive", counterpartyName: "Workshop Registration", counterpartyWallet: null, amountAudd: 597, createdAt: "2026-04-26T13:31:36.774Z" },
    { id: "2", type: "send",    counterpartyName: "Sarah Chen",            counterpartyWallet: "7xKL9mN", amountAudd: 250, createdAt: "2026-04-25T13:31:36.774Z" },
    { id: "3", type: "receive", counterpartyName: "Coffee Tip Jar",        counterpartyWallet: null, amountAudd: 45,  createdAt: "2026-04-18T13:31:36.774Z" },
    { id: "4", type: "send",    counterpartyName: "Marcus Webb",           counterpartyWallet: "3aBcD",   amountAudd: 1200, createdAt: "2026-04-02T13:31:36.774Z" },
    { id: "5", type: "receive", counterpartyName: "Priya Kumar",           counterpartyWallet: "9pQrS",   amountAudd: 500,  createdAt: "2026-03-28T13:31:36.774Z" },
  ],
};
const DEMO_RATES = { AUDD_AUD: 1, AUDD_USD: 0.6412, AUDD_SOL: 0.00391, updatedAt: new Date().toISOString() };

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({ placeholderData: DEMO_SUMMARY });
  const { data: rates, isLoading: loadingRates } = useGetExchangeRates({ placeholderData: DEMO_RATES });
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

  return (
    <div className="space-y-6 md:space-y-10">
      <header className="space-y-1">
        <h2 className="text-[10px] text-white/30 uppercase tracking-widest">AUDD FINANCE TERMINAL</h2>
        <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
      </header>

      {/* Hero Balance Card */}
      <div className="relative border border-white/10 p-4 md:p-8 flex flex-col gap-6 bg-transparent">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30" />

        <div className="space-y-3">
          <div className="text-[9px] uppercase tracking-widest text-white/30">TOTAL BALANCE</div>
          {loadingSummary ? (
            <Skeleton className="h-12 w-48 bg-white/10" />
          ) : (
            <div className="text-4xl md:text-5xl font-bold text-primary tracking-tight tabular-nums">
              A${summary?.balanceAudd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setReceiveOpen(true)}
              className="border-white/30 text-white hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-widest rounded-none px-3 py-2 border transition-colors"
            >
              [↙ RECEIVE]
            </button>
            <button
              onClick={() => setSendOpen(true)}
              className="border-white/30 text-white hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-widest rounded-none px-3 py-2 border transition-colors"
            >
              [↗ SEND]
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-10 border-t border-white/10 pt-4">
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">SENT</div>
            {loadingSummary ? (
              <Skeleton className="h-5 w-16 bg-white/10" />
            ) : (
              <div className="text-base md:text-xl font-bold text-white tabular-nums">
                A${summary?.totalSentAudd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">RECEIVED</div>
            {loadingSummary ? (
              <Skeleton className="h-5 w-16 bg-white/10" />
            ) : (
              <div className="text-base md:text-xl font-bold text-white tabular-nums">
                A${summary?.totalReceivedAudd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">EST. SOL</div>
            {loadingSummary || loadingRates ? (
              <Skeleton className="h-5 w-16 bg-white/10" />
            ) : (
              <div className="text-base md:text-xl font-bold text-white tabular-nums">
                {summary?.balanceAudd && rates?.AUDD_SOL
                  ? (summary.balanceAudd * rates.AUDD_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : "0"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "PENDING INVOICES", count: summary?.pendingInvoicesCount ?? 0 },
          { label: "ACTIVE LINKS", count: summary?.activePaymentLinks ?? 0 },
          { label: "RECURRING", count: summary?.activeRecurring ?? 0 },
          { label: "SOL VALUE", count: summary?.balanceAudd && rates?.AUDD_SOL
              ? (summary.balanceAudd * rates.AUDD_SOL).toLocaleString(undefined, { maximumFractionDigits: 4 })
              : "0" }
        ].map((stat, i) => (
          <div key={i} className="p-3 md:p-4 border border-white/10 bg-transparent flex flex-col justify-center space-y-1">
            <div className="text-[8px] md:text-[9px] uppercase tracking-widest text-white/30 leading-tight">{stat.label}</div>
            <div className="text-lg md:text-xl font-bold text-white tabular-nums">
              {loadingSummary ? <Skeleton className="h-5 w-10 bg-white/10" /> : stat.count}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-widest text-white/40">RECENT ACTIVITY</h3>
          <Link href="/transactions" className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            [VIEW ALL]
          </Link>
        </div>

        <div className="border border-white/10 bg-transparent overflow-hidden divide-y divide-white/5">
          {loadingSummary ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-8 w-full bg-white/10" />
              <Skeleton className="h-8 w-full bg-white/10" />
            </div>
          ) : !summary?.recentTransactions || summary.recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-[11px] uppercase tracking-widest">
              NO RECENT TRANSACTIONS
            </div>
          ) : (
            summary.recentTransactions.map((tx: any) => {
              const isReceive = tx.type === "receive" || tx.type === "invoice" || tx.type === "payment_link";
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-white/[0.02] transition-colors gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-white/50 text-xs flex-shrink-0">{isReceive ? "[←]" : "[→]"}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{tx.counterpartyName || tx.counterpartyWallet || "UNKNOWN"}</div>
                      <div className="text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">{format(new Date(tx.createdAt), "dd MMM yyyy")}</div>
                    </div>
                  </div>
                  <div className={`font-bold text-sm tabular-nums flex-shrink-0 ${isReceive ? "text-primary" : "text-white"}`}>
                    {isReceive ? "+" : "-"}A${tx.amountAudd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <SendModal open={sendOpen} onClose={() => setSendOpen(false)} />
      <ReceiveModal open={receiveOpen} onClose={() => setReceiveOpen(false)} />
    </div>
  );
}
