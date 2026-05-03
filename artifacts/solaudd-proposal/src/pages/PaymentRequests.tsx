import React from "react";
import { useListPaymentRequests, useCreatePaymentRequest, getListPaymentRequestsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const requestSchema = z.object({
  toName: z.string().min(1, "Recipient name is required"),
  toWallet: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
  amountAudd: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  note: z.string().optional(),
});

function isTemplate(req: { toName?: string; note?: string }) {
  const fields = [req.toName, req.note].filter(Boolean) as string[];
  return fields.some(f => f.toLowerCase().includes("demo") || f.toLowerCase().includes("template"));
}

export default function PaymentRequests() {
  const { data: requests, isLoading } = useListPaymentRequests();
  const createRequest = useCreatePaymentRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { toName: "", toWallet: "", amountAudd: 0, note: "" },
  });

  const onSubmit = (data: z.infer<typeof requestSchema>) => {
    createRequest.mutate({ data: { ...data, status: "pending" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPaymentRequestsQueryKey() });
        toast({ title: "Payment request sent" });
        setOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Failed to send request", variant: "destructive" }),
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "paid":      return <span className="border border-white/30 text-white/60 text-[10px] uppercase tracking-widest px-2 py-1">PAID</span>;
      case "pending":   return <span className="border border-yellow-500/50 text-yellow-400 text-[10px] uppercase tracking-widest px-2 py-1">PENDING</span>;
      case "cancelled": return <span className="border border-white/10 text-white/30 text-[10px] uppercase tracking-widest px-2 py-1">CANCELLED</span>;
      default:          return <span className="border border-white/10 text-white/30 text-[10px] uppercase tracking-widest px-2 py-1">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">PAYMENT REQUESTS</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-2 transition-colors">
              [+ NEW REQUEST]
            </button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/20 text-white sm:max-w-[425px] rounded-none font-mono">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">SEND REQUEST</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="amountAudd" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">AMOUNT (AUDD)</FormLabel>
                    <FormControl>
                      <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-400" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="toName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">TO (NAME)</FormLabel>
                    <FormControl>
                      <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Bob" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-400" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="toWallet" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">WALLET ADDRESS</FormLabel>
                    <FormControl>
                      <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Solana Address" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-400" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="note" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">NOTE (OPTIONAL)</FormLabel>
                    <FormControl>
                      <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="For dinner last night" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-400" />
                  </FormItem>
                )} />
                <div className="pt-4">
                  <button type="submit" disabled={createRequest.isPending} className="w-full bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-3 transition-colors">
                    {createRequest.isPending ? "SENDING..." : "[SEND REQUEST]"}
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-white/10 bg-transparent overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-16 w-full bg-white/10" />
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="text-[11px] uppercase tracking-widest text-white/30">NO REQUESTS</div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-white/10 text-[9px] uppercase tracking-widest text-white/30">
                <div>TO</div>
                <div>NOTE</div>
                <div className="text-right">AMOUNT</div>
                <div>DATE</div>
                <div>STATUS</div>
              </div>
              <div className="divide-y divide-white/5">
                {requests.map((req) => {
                  const demo = isTemplate(req);
                  return (
                    <div key={req.id} className={`grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${demo ? "opacity-60" : ""}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-xs text-white truncate">{req.toName}</div>
                          {demo && <span className="border border-yellow-500/60 text-yellow-400 text-[8px] uppercase tracking-widest px-1.5 py-0.5 flex-shrink-0">TEMPLATE</span>}
                        </div>
                        <div className="text-[10px] text-white/40 truncate font-mono mt-1">{req.toWallet}</div>
                      </div>
                      <div className="text-xs text-white/60 truncate">{req.note || "—"}</div>
                      <div className="text-sm font-bold text-white tabular-nums text-right">
                        A${req.amountAudd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-white/50 tracking-widest">
                        {format(new Date(req.createdAt), "dd MMM yyyy")}
                      </div>
                      <div>{getStatusBadge(req.status)}</div>
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
