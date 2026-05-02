import React from "react";
import { useListInvoices, useCreateInvoice, useMarkInvoicePaid, getListInvoicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const invoiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amountAudd: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientWallet: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
  recipientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  dueDate: z.string().optional(),
});

export default function Invoices() {
  const { data: invoices, isLoading } = useListInvoices();
  const createInvoice = useCreateInvoice();
  const markPaid = useMarkInvoicePaid();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      title: "",
      amountAudd: 0,
      recipientName: "",
      recipientWallet: "",
      recipientEmail: "",
      dueDate: "",
    },
  });

  const onSubmit = (data: z.infer<typeof invoiceSchema>) => {
    createInvoice.mutate({ data: { ...data, status: "draft" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
        toast({ title: "Invoice created" });
        setOpen(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to create invoice", variant: "destructive" });
      }
    });
  };

  const handleMarkPaid = (id: string) => {
    markPaid.mutate({ id, data: { txSignature: "manual-mark" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
        toast({ title: "Invoice marked as paid" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "paid": return <span className="border border-white/30 text-white/60 text-[10px] uppercase tracking-widest px-2 py-1">PAID</span>;
      case "sent": return <span className="border border-white/20 text-white/50 text-[10px] uppercase tracking-widest px-2 py-1">SENT</span>;
      case "overdue": return <span className="border border-red-500/50 text-red-400 text-[10px] uppercase tracking-widest px-2 py-1">OVERDUE</span>;
      default: return <span className="border border-white/10 text-white/30 text-[10px] uppercase tracking-widest px-2 py-1">DRAFT</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">INVOICE LEDGER</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-2 transition-colors">
              [+ NEW INVOICE]
            </button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/20 text-white sm:max-w-[425px] rounded-none font-mono">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">NEW INVOICE</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">DESCRIPTION</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Freelance Dev Work" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amountAudd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">AMOUNT (AUDD)</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recipientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">CLIENT NAME</FormLabel>
                        <FormControl>
                          <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">DUE DATE</FormLabel>
                        <FormControl>
                          <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white [color-scheme:dark]" type="date" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="recipientWallet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">CLIENT WALLET</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Address" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <button type="submit" disabled={createInvoice.isPending} className="w-full bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-3 transition-colors">
                    {createInvoice.isPending ? "CREATING..." : "[SUBMIT INVOICE]"}
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
            <Skeleton className="h-10 w-full bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
          </div>
        ) : !invoices || invoices.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="text-[11px] uppercase tracking-widest text-white/30">NO INVOICES YET</div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 px-6 py-4 border-b border-white/10 text-[9px] uppercase tracking-widest text-white/30">
                <div>TITLE</div>
                <div>RECIPIENT</div>
                <div className="text-right">AMOUNT</div>
                <div>DUE DATE</div>
                <div>STATUS</div>
                <div className="text-right">—</div>
              </div>
              <div className="divide-y divide-white/5">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group">
                    <div className="font-bold text-xs text-white truncate">{invoice.title}</div>
                    <div className="text-xs text-white/70 truncate">{invoice.recipientName}</div>
                    <div className="text-sm font-bold text-white tabular-nums text-right">
                      A${invoice.amountAudd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-white/50">
                      {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, yyyy") : "—"}
                    </div>
                    <div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="text-right">
                      {invoice.status !== "paid" && (
                        <button 
                          className="text-[10px] uppercase text-white/40 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity tracking-widest"
                          onClick={() => handleMarkPaid(invoice.id)}
                          disabled={markPaid.isPending}
                        >
                          [MARK PAID]
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}