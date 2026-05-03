import React from "react";
import { useListTransactions } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

function isReceive(type: string) {
  return type === "receive" || type === "invoice" || type === "payment_link";
}

function isTemplate(tx: { note?: string | null }) {
  return tx.note?.includes("[[template]]") ?? false;
}

export default function TransactionHistory() {
  const { data: transactions, isLoading } = useListTransactions();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/transactions/export');
      if (!response.ok) throw new Error("Export failed");
      const rows: { date: string; type: string; counterparty: string; amountAudd: number; txSignature: string; note: string }[] = await response.json();
      const headers = ["Date", "Type", "Counterparty", "Amount (AUDD)", "TX Signature", "Note"];
      const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csvRows = rows.map(r => [r.date, r.type, r.counterparty, r.amountAudd, r.txSignature, r.note].map(escape).join(","));
      const csv = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `paymate_transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: `Exported ${rows.length} transaction${rows.length !== 1 ? "s" : ""}` });
    } catch (error) {
      console.error(error);
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">TRANSACTION LOG</h1>
        </div>
        <button
          className="border border-white/30 text-white hover:bg-white hover:text-black font-mono text-[11px] uppercase tracking-widest px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExport}
          disabled={isExporting || isLoading || !transactions || transactions.length === 0}
        >
          {isExporting ? "EXPORTING..." : "[EXPORT CSV]"}
        </button>
      </div>

      <div className="border border-white/10 bg-transparent overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="text-[11px] uppercase tracking-widest text-white/30">NO TRANSACTIONS YET</div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-white/10 text-[9px] uppercase tracking-widest text-white/30 font-bold">
                <div>DIR</div>
                <div>DETAILS</div>
                <div>DATE</div>
                <div>TX</div>
                <div className="text-right">AMOUNT</div>
              </div>

              <div className="divide-y divide-white/5">
                {transactions.map((tx) => {
                  const incoming = isReceive(tx.type);
                  const demo = isTemplate(tx);
                  return (
                    <div key={tx.id} className={`grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group ${demo ? "opacity-50" : ""}`}>
                      <div className={`text-[10px] ${incoming ? "text-green-400" : "text-red-400"}`}>
                        {incoming ? "[←]" : "[→]"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-xs text-white uppercase truncate">
                            {tx.counterpartyName || tx.counterpartyWallet || (tx.type.charAt(0).toUpperCase() + tx.type.slice(1).replace("_", " "))}
                          </div>
                          {demo && (
                            <span className="border border-yellow-500/60 text-yellow-400 text-[8px] uppercase tracking-widest px-1.5 py-0.5 flex-shrink-0">TEMPLATE</span>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-white/50 tracking-widest uppercase">
                        {format(new Date(tx.createdAt), "dd MMM yyyy")}
                      </div>
                      <div className="text-[10px]">
                        {tx.txSignature ? (
                          <a
                            href={`https://solscan.io/tx/${tx.txSignature}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                          >
                            [VIEW]
                          </a>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </div>
                      <div className={`text-sm font-bold tabular-nums tracking-tight text-right ${incoming ? "text-green-400" : "text-red-400"}`}>
                        {incoming ? "+" : "-"}A${tx.amountAudd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
