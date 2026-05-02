import React from "react";
import { useListPaymentLinks, useCreatePaymentLink, useDeletePaymentLink, getListPaymentLinksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const linkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  amountAudd: z.coerce.number().optional(),
  walletAddress: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
});

export default function PaymentLinks() {
  const { data: links, isLoading } = useListPaymentLinks();
  const createLink = useCreatePaymentLink();
  const deleteLink = useDeletePaymentLink();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      label: "",
      amountAudd: undefined,
      walletAddress: "",
    },
  });

  const onSubmit = (data: z.infer<typeof linkSchema>) => {
    createLink.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPaymentLinksQueryKey() });
        toast({ title: "Payment link created" });
        setOpen(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to create link", variant: "destructive" });
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleDelete = (id: string) => {
    deleteLink.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPaymentLinksQueryKey() });
        toast({ title: "Link deleted" });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">PAYMENT LINKS</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-2 transition-colors">
              [+ NEW LINK]
            </button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/20 text-white sm:max-w-[425px] rounded-none font-mono">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">NEW PAYMENT LINK</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">LABEL (INTERNAL)</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Coffee Fund" {...field} />
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
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">FIXED AMOUNT (OPTIONAL)</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" type="number" step="0.01" placeholder="Leave empty for open amount" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">DESTINATION WALLET</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Your Solana Address" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <button type="submit" disabled={createLink.isPending} className="w-full bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-3 transition-colors">
                    {createLink.isPending ? "CREATING..." : "[CREATE LINK]"}
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-48 w-full bg-white/10" />
            <Skeleton className="h-48 w-full bg-white/10" />
          </>
        ) : !links || links.length === 0 ? (
          <div className="col-span-full py-24 text-center border border-white/10 bg-transparent flex flex-col items-center justify-center">
            <div className="text-[11px] uppercase tracking-widest text-white/30">NO PAYMENT LINKS</div>
          </div>
        ) : (
          links.map((link) => {
            const url = `${window.location.origin}/pay/${link.slug}`;
            return (
              <div key={link.id} className={`border border-white/10 p-5 flex flex-col relative transition-opacity bg-transparent ${!link.active ? "opacity-50" : ""}`}>
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/30" />

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{link.label}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-lg font-bold text-primary tabular-nums">
                        {link.amountAudd ? `A$${link.amountAudd}` : "OPEN AMOUNT"}
                      </span>
                      <span className={`border px-2 py-0.5 text-[9px] uppercase tracking-widest ${link.active ? 'border-white/30 text-white/60' : 'border-white/10 text-white/30'}`}>
                        {link.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest">
                    <span>{link.paymentCount} PAYMENTS</span>
                    <span>A${link.totalReceived} RECEIVED</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-white/50 truncate max-w-[200px]">
                      {url}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors" onClick={() => copyToClipboard(url)}>
                        [COPY]
                      </button>
                      <button className="text-[10px] uppercase tracking-widest text-white/50 hover:text-red-400 transition-colors" onClick={() => handleDelete(link.id)}>
                        [DEL]
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}