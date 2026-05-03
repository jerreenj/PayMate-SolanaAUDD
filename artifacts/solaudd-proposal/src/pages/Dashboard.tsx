import { useState } from "react";
import { useGetDashboardSummary, useGetExchangeRates } from "@/lib/api";
import { useAuddBalance } from "@/hooks/useAuddBalance";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";
import { SendModal } from "@/components/SendModal";
import { ReceiveModal } from "@/components/ReceiveModal";

const DEMO_SUMMARY = {
  balanceAudd: 0, balanceAud: 0, balanceUsd: 0,
  totalSentAudd: 0, totalReceivedAudd: 0,
  pendingInvoicesCount: 1, pendingInvoicesAudd: 850,
  activePaymentLinks: 1, activeRecurring: 1,
  recentTransactions: [],
};
const DEMO_RATES = { AUDD_AUD: 1, AUDD_USD: 0.6412, AUDD_SOL: 0.00391, updatedAt: new Date().toISOString() };

function isTemplateTransaction(tx: any) {
  return tx.note?.includes("[[template]]");
}

function isReceive(type: string) {
  return type === "receive" || type === "invoice" || type === "payment_link";
}

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({ placeholderData: DEMO_SUMMARY });
  const { data: rates, isLoading: loadingRates } = useGetExchangeRates({ placeholderData: DEMO_RATES });
  const { balance: auddBalance, loading: balanceLoading } = useAuddBalance();
  const { connected, publicKey } = useWallet();
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

  const displayBalance = connected ? (auddBalance ?? 0) : null;
  const isLoadingBalance = connected && balanceLoading;

  const visibleTransactions = (summary?.recentTransactions ?? [])
    .filter((tx: any) => !isTemplateTransaction(tx));

  return (
    <div className="space-y-6 md:space-y-10">
      <header className="space-y-1">
        <h2 className="text-[10px] text-white/30 uppercase tracking-widest">AUDD FINANCE TERMINAL</h2>
        <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
      </header>

      {/* Wallet Connect CTA */}
      {!connected && (
        <div className="relative border border-white/20 p-6 md:p-8 bg-transparent">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/40" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/40" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/40" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/40" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-[9px] uppercase tracking-widest text-white/40">STEP 1 OF 1</div>
              <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-wide">Connect Your Wallet</h2>
              <p className="text-[11px] text-white/50 tracking-widest leading-relaxed max-w-sm">
                Connect Phantom or Solflare to view your real AUDD balance and use all features.
              </p>
            </div>
            <div className="flex-shrink-0">
              <WalletButton />
            </div>
          </div>
        </div>
      )}

      {/* Hero Balance Card */}
      <div className="relative border border-white/10 p-4 md:p-8 flex flex-col gap-6 bg-transparent">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30" />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-[9px] uppercase tracking-widest text-white/30">AUDD BALANCE</div>
            {connected && (
              <div className="text-[8px] uppercase tracking-widest text-white/30 border border-white/20 px-1.5 py-0.5">
                LIVE · MAINNET
              </div>
            )}
          </div>

          {!connected ? (
            <div className="text-4xl md:text-5xl font-bold text-white/20 tracking-tight">—</div>
          ) : isLoadingBalance ? (
            <Skeleton className="h-12 w-48 bg-white/10" />
          ) : (
            <div className="text-4xl md:text-5xl font-bold text-primary tracking-tight tabular-nums">
              A${displayBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00"}
            </div>
          )}

          {connected && publicKey && (
            <div className="text-[9px] text-white/30 font-mono tracking-wider truncate max-w-xs">
              {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-6)}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setReceiveOpen(true)}
              disabled={!connected}
              className="border-white/30 text-white hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-widest rounded-none px-3 py-2 border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              [↙ RECEIVE]
            </button>
            <button
              onClick={() => setSendOpen(true)}
              disabled={!connected}
              className="border-white/30 text-white hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-widest rounded-none px-3 py-2 border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              [↗ SEND]
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-10 border-t border-white/10 pt-4">
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">SENT</div>
            <div className="text-base md:text-xl font-bold tabular-nums">
              {connected
                ? (loadingSummary ? <Skeleton className="h-5 w-16 bg-white/10" /> : <span className="text-red-400">A${(summary?.totalSentAudd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>)
                : <span className="text-white/20">—</span>}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">RECEIVED</div>
            <div className="text-base md:text-xl font-bold tabular-nums">
              {connected
                ? (loadingSummary ? <Skeleton className="h-5 w-16 bg-white/10" /> : <span className="text-green-400">A${(summary?.totalReceivedAudd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>)
                : <span className="text-white/20">—</span>}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-white/30">EST. SOL</div>
            <div className="text-base md:text-xl font-bold text-white tabular-nums">
              {connected && displayBalance != null && rates?.AUDD_SOL
                ? (displayBalance * rates.AUDD_SOL).toLocaleString(undefined, { maximumFractionDigits: 4 })
                : <span className="text-white/20">—</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "PENDING INVOICES", count: summary?.pendingInvoicesCount ?? 0 },
          { label: "ACTIVE LINKS",     count: summary?.activePaymentLinks ?? 0 },
          { label: "RECURRING",        count: summary?.activeRecurring ?? 0 },
          {
            label: "SOL VALUE",
            count: connected && displayBalance != null && rates?.AUDD_SOL
              ? (displayBalance * rates.AUDD_SOL).toLocaleString(undefined, { maximumFractionDigits: 4 })
              : "—"
          },
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
            <div className="p-4">
              <Skeleton className="h-8 w-full bg-white/10" />
            </div>
          ) : visibleTransactions.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-[11px] uppercase tracking-widest">
              {connected ? "NO TRANSACTIONS YET" : "CONNECT WALLET TO SEE YOUR ACTIVITY"}
            </div>
          ) : (
            visibleTransactions.map((tx: any) => {
              const incoming = isReceive(tx.type);
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-white/[0.02] transition-colors gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`text-xs flex-shrink-0 ${incoming ? "text-green-400" : "text-red-400"}`}>
                      {incoming ? "[←]" : "[→]"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{tx.counterpartyName || tx.counterpartyWallet || "UNKNOWN"}</div>
                      <div className="text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">{format(new Date(tx.createdAt), "dd MMM yyyy")}</div>
                    </div>
                  </div>
                  <div className={`font-bold text-sm tabular-nums flex-shrink-0 ${incoming ? "text-green-400" : "text-red-400"}`}>
                    {incoming ? "+" : "-"}A${tx.amountAudd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
