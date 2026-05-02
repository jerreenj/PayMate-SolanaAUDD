import React from "react";
import { useListTransactions } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function TransactionHistory() {
  const { data: transactions, isLoading } = useListTransactions();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/transactions/export');
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `paymate_transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Export successful" });
    } catch (error) {
      console.error(error);
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const getTransactionSign = (type: string) => {
    switch (type) {
      case "receive":
      case "invoice":
      case "payment_link":
        return "+";
      case "send":
      case "split":
      case "recurring":
        return "-";
      default:
        return "";
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
            <Skeleton className="h-12 w-full bg-white/10" />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="py-24 text-center text-white/30 flex flex-col items-center justify-center">
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
                  const sign = getTransactionSign(tx.type);
                  const isPositive = sign === "+";
                  return (
                    <div key={tx.id} className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group">
                      <div className="text-white/50 text-[10px]">
                        {isPositive ? "[←]" : "[→]"}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white uppercase truncate">
                          {tx.counterpartyName || tx.counterpartyWallet || (tx.note ? `Note: ${tx.note}` : (tx.type.charAt(0).toUpperCase() + tx.type.slice(1).replace("_", " ")))}
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
                      <div className={`text-sm font-bold tabular-nums tracking-tight text-right ${isPositive ? "text-primary" : "text-white"}`}>
                        {sign}A${tx.amountAudd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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