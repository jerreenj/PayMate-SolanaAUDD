import { useGetDashboardSummary, useGetExchangeRates } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: rates, isLoading: loadingRates } = useGetExchangeRates();

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h2 className="text-[10px] text-white/30 uppercase tracking-widest">AUDD FINANCE TERMINAL</h2>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </header>

      {/* Hero Balance Card */}
      <div className="relative border border-white/10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-transparent">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30" />

        <div className="space-y-2">
          <div className="text-[9px] uppercase tracking-widest text-white/30">TOTAL BALANCE</div>
          {loadingSummary ? (
            <Skeleton className="h-16 w-64 bg-white/10" />
          ) : (
            <div className="text-5xl font-bold text-primary tracking-tight tabular-nums">
              A${summary?.balanceAudd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
            </div>
          )}
          <div className="pt-4 flex gap-4">
            <button className="border-white/30 text-white hover:bg-white hover:text-black font-mono text-[11px] uppercase tracking-widest rounded-none px-4 py-2 border transition-colors">
              [↙ RECEIVE]
            </button>
            <button className="border-white/30 text-white hover:bg-white hover:text-black font-mono text-[11px] uppercase tracking-widest rounded-none px-4 py-2 border transition-colors">
              [↗ SEND]
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 md:gap-10">
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">SENT</div>
            {loadingSummary ? (
              <Skeleton className="h-6 w-20 bg-white/10" />
            ) : (
              <div className="text-xl font-bold text-white tabular-nums">
                A${summary?.totalSentAudd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">RECEIVED</div>
            {loadingSummary ? (
              <Skeleton className="h-6 w-20 bg-white/10" />
            ) : (
              <div className="text-xl font-bold text-white tabular-nums">
                A${summary?.totalReceivedAudd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">EST. SOL</div>
            {loadingSummary || loadingRates ? (
              <Skeleton className="h-6 w-20 bg-white/10" />
            ) : (
              <div className="text-xl font-bold text-white tabular-nums">
                {summary?.balanceAudd && rates?.AUDD_SOL ? (summary.balanceAudd * rates.AUDD_SOL).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "PENDING INVOICES", count: summary?.pendingInvoicesCount ?? 0 },
          { label: "ACTIVE LINKS", count: summary?.activePaymentLinks ?? 0 },
          { label: "RECURRING", count: summary?.activeRecurring ?? 0 },
          { label: "SOL VALUE", count: summary?.balanceAudd && rates?.AUDD_SOL ? (summary.balanceAudd * rates.AUDD_SOL).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0" }
        ].map((stat, i) => (
          <div key={i} className="p-4 border border-white/10 bg-transparent flex flex-col justify-center space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">{stat.label}</div>
            <div className="text-xl font-bold text-white tabular-nums">
              {loadingSummary ? <Skeleton className="h-6 w-12 bg-white/10" /> : stat.count}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-widest text-white/40">RECENT ACTIVITY</h3>
          <Link href="/transactions" className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            [VIEW ALL]
          </Link>
        </div>
        
        <div className="border border-white/10 bg-transparent overflow-hidden divide-y divide-white/5">
          {loadingSummary ? (
            <div className="p-6 space-y-4">
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
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-white/50 text-xs">
                      {isReceive ? "[←]" : "[→]"}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{tx.counterpartyName || tx.counterpartyWallet || "UNKNOWN"}</div>
                      <div className="text-[10px] text-white/40 mt-1 tracking-widest uppercase">{format(new Date(tx.createdAt), "dd MMM yyyy")}</div>
                    </div>
                  </div>
                  <div className={`font-bold text-sm tabular-nums ${isReceive ? "text-primary" : "text-white"}`}>
                    {isReceive ? "+" : "-"}A${tx.amountAudd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}