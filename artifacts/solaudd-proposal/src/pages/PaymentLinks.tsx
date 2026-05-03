import React from "react";
import { useListPaymentLinks, useCreatePaymentLink, useDeletePaymentLink, getListPaymentLinksQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const AUDD_MINT = "AuDDuMCindiXzSrBgUvXL5uJkr5kXRpEhMJPBiSTGzj";

const linkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  amountAudd: z.coerce.number().optional(),
  walletAddress: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
});

function SolanaPayQR({ walletAddress, amountAudd, label }: { walletAddress: string; amountAudd?: number | null; label: string }) {
  const params = new URLSearchParams({
    "spl-token": AUDD_MINT,
    label: `PayMate — ${label}`,
  });
  if (amountAudd) params.set("amount", String(amountAudd));
  const solanaPayUrl = `solana:${walletAddress}?${params.toString()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(solanaPayUrl)}&size=160x160&format=svg&color=FFFFFF&bgcolor=000000&margin=8`;
  return <img src={qrUrl} alt="Solana Pay QR" width={80} height={80} className="block opacity-80" />;
}

export default function PaymentLinks() {
  const { data: links, isLoading } = useListPaymentLinks();
  const createLink = useCreatePaymentLink();
  const deleteLink = useDeletePaymentLink();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [qrLinkId, setQrLinkId] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
    defaultValues: { label: "", amountAudd: undefined, walletAddress: "" },
  });

  const onSubmit = (data: z.infer<typeof linkSchema>) => {
    createLink.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPaymentLinksQueryKey() });
        toast({ title: "Payment link created" });
        setOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Failed to create link", variant: "destructive" }),
    });
  };

  const copyToClipboard = (text: string, label = "Copied") => {
    navigator.clipboard.writeText(text);
    toast({ title: label });
  };

  const handleDelete = (id: string) => {
    deleteLink.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPaymentLinksQueryKey() });
        toast({ title: "Link deleted" });
      }
    });
  };

  const selectedLink = links?.find(l => l.id === qrLinkId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[10px] uppercase tracking-widest text-white/40 mb-1">PAYMENT LINKS</h2>
          <p className="text-xs text-white/30">Shareable Solana Pay links for instant AUDD collection</p>
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
                <FormField control={form.control} name="label" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">LABEL</FormLabel>
                    <FormControl>
                      <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Coffee Fund, Invoice #42..." {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-400" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="amountAudd" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">FIXED AMOUNT AUDD (OPTIONAL)</FormLabel>
                    <FormControl>
                      <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" type="number" step="0.01" placeholder="Leave empty for open amount" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-400" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="walletAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">DESTINATION WALLET</FormLabel>
                    <FormControl>
                      <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Solana address" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-400" />
                  </FormItem>
                )} />
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

      {/* QR Dialog */}
      {selectedLink && (
        <Dialog open={!!qrLinkId} onOpenChange={() => setQrLinkId(null)}>
          <DialogContent className="bg-black border-white/20 text-white sm:max-w-[360px] rounded-none font-mono">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">SOLANA PAY QR</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="border border-white/20 p-3">
                {(() => {
                  const params = new URLSearchParams({ "spl-token": AUDD_MINT, label: `PayMate — ${selectedLink.label}` });
                  if (selectedLink.amountAudd) params.set("amount", String(selectedLink.amountAudd));
                  const url = `solana:${selectedLink.walletAddress}?${params.toString()}`;
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=240x240&format=svg&color=FFFFFF&bgcolor=000000&margin=12`;
                  return <img src={qrUrl} alt="QR" width={220} height={220} />;
                })()}
              </div>
              <div className="text-center space-y-1">
                <div className="font-bold text-white uppercase tracking-wider">{selectedLink.label}</div>
                <div className="text-primary font-bold">{selectedLink.amountAudd ? `A$${selectedLink.amountAudd}` : "OPEN AMOUNT"}</div>
              </div>
              <div className="text-[9px] text-white/30 uppercase tracking-widest">Scan with Phantom, Solflare, or any Solana Pay wallet</div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-56 w-full bg-white/10" />
            <Skeleton className="h-56 w-full bg-white/10" />
          </>
        ) : !links || links.length === 0 ? (
          <div className="col-span-full py-24 text-center border border-white/10 flex flex-col items-center justify-center gap-3">
            <div className="text-[11px] uppercase tracking-widest text-white/30">NO PAYMENT LINKS YET</div>
            <div className="text-[10px] text-white/20">Create a Solana Pay link to start accepting AUDD</div>
          </div>
        ) : (
          links.map((link) => {
            const url = `${window.location.origin}/pay/${link.slug}`;
            return (
              <div key={link.id} className={`border border-white/10 p-5 flex flex-col relative transition-opacity bg-transparent ${!link.active ? "opacity-50" : ""}`}>
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/30" />

                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider truncate">{link.label}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-lg font-bold text-primary tabular-nums">
                        {link.amountAudd ? `A$${link.amountAudd}` : "OPEN AMOUNT"}
                      </span>
                      <span className={`border px-2 py-0.5 text-[9px] uppercase tracking-widest ${link.active ? 'border-white/30 text-white/60' : 'border-white/10 text-white/30'}`}>
                        {link.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setQrLinkId(link.id)}
                    className="flex-shrink-0 border border-white/20 p-1.5 hover:border-white/50 transition-colors"
                    title="Show Solana Pay QR"
                  >
                    <SolanaPayQR walletAddress={link.walletAddress} amountAudd={link.amountAudd} label={link.label} />
                  </button>
                </div>

                <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest">
                    <span>{link.paymentCount} PAYMENTS</span>
                    <span>A${link.totalReceived} RECEIVED</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] text-white/40 truncate flex-1">{url}</div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors" onClick={() => copyToClipboard(url, "Link copied")}>
                        [COPY]
                      </button>
                      <button className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors" onClick={() => setQrLinkId(link.id)}>
                        [QR]
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
