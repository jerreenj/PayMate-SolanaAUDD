import React, { useState } from "react";
import { useListSplits, useCreateSplit, useDeleteSplit, useSettleSplitParticipant, getListSplitsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuddTransfer } from "@/hooks/useAuddTransfer";

const AUDD_MINT = "AuDDuMCindiXzSrBgUvXL5uJkr5kXRpEhMJPBiSTGzj";
const TEMPLATE_WALLET = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

const participantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  walletAddress: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
  shareAudd: z.coerce.number().min(0.01, "Share must be greater than 0"),
  settled: z.boolean().default(false),
});

const splitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  totalAudd: z.coerce.number().min(0.01, "Total must be greater than 0"),
  organizerWallet: z.string().min(32, "Invalid Solana address").max(44, "Organizer wallet required so participants can pay you"),
  participants: z.array(participantSchema).min(2, "At least 2 participants required"),
});

function getInitials(name: string) { return name.slice(0, 2).toUpperCase(); }

function solanaPay(recipientWallet: string, amount: number, label: string, message: string) {
  const params = new URLSearchParams({ amount: amount.toString(), "spl-token": AUDD_MINT, label, message });
  return `solana:${recipientWallet}?${params.toString()}`;
}

function qrUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data)}`;
}

function isTemplate(split: { participants: any[] }) {
  return split.participants?.some((p: any) => p.walletAddress === TEMPLATE_WALLET);
}

const TemplateBadge = () => (
  <span className="inline-flex items-center gap-1 bg-yellow-400/20 border border-yellow-400 text-yellow-300 font-bold text-[9px] uppercase tracking-widest px-2 py-0.5">
    ★ TEMPLATE
  </span>
);

type Participant = { name: string; walletAddress: string; shareAudd: number; settled: boolean };

export default function Splits() {
  const { data: splits, isLoading } = useListSplits();
  const createSplit = useCreateSplit();
  const deleteSplit = useDeleteSplit();
  const settleParticipant = useSettleSplitParticipant();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [settlingKey, setSettlingKey] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ url: string; name: string; amount: number } | null>(null);
  const { transfer, status: txStatus, reset: resetTx, publicKey } = useAuddTransfer();

  const form = useForm<z.infer<typeof splitSchema>>({
    resolver: zodResolver(splitSchema),
    defaultValues: {
      title: "", totalAudd: 0, organizerWallet: "",
      participants: [
        { name: "Me", walletAddress: "", shareAudd: 0, settled: true },
        { name: "", walletAddress: "", shareAudd: 0, settled: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "participants" });

  const onSubmit = (data: z.infer<typeof splitSchema>) => {
    const { organizerWallet, ...rest } = data;
    const participants = rest.participants.map(p =>
      p.name === "Me" ? { ...p, walletAddress: organizerWallet, settled: true } : p
    );
    createSplit.mutate({ data: { ...rest, participants } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSplitsQueryKey() });
        toast({ title: "Split created" });
        setOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Failed to create split", variant: "destructive" }),
    });
  };

  const handleDelete = (id: string, label = "Split deleted") => {
    deleteSplit.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSplitsQueryKey() });
        toast({ title: label });
      },
    });
  };

  const handleSettleOnChain = async (split: { id: string; title: string }, p: Participant) => {
    if (!publicKey) { toast({ title: "Connect a wallet to settle on-chain", variant: "destructive" }); return; }
    const organizerWallet = splits?.find(s => s.id === split.id)?.participants.find((x: Participant) => x.settled && x.walletAddress)?.walletAddress;
    if (!organizerWallet) { toast({ title: "Cannot determine organizer wallet — mark settled manually", variant: "destructive" }); return; }
    const key = `${split.id}-${p.walletAddress}`;
    setSettlingKey(key);
    resetTx();
    try {
      const signature = await transfer(organizerWallet, p.shareAudd);
      settleParticipant.mutate({ id: split.id, data: { walletAddress: p.walletAddress } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSplitsQueryKey() });
          toast({ title: `A$${p.shareAudd} settled on-chain`, description: (<a href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noopener noreferrer" className="underline text-white/70">View on Solscan</a>) as unknown as string });
        },
      });
    } catch {
      toast({ title: "Settlement failed — check wallet and AUDD balance", variant: "destructive" });
    } finally { setSettlingKey(null); resetTx(); }
  };

  const handleMarkSettled = (splitId: string, walletAddress: string) => {
    settleParticipant.mutate({ id: splitId, data: { walletAddress } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSplitsQueryKey() });
        toast({ title: "Marked as settled" });
      },
    });
  };

  const settleLabel = (key: string) => {
    if (settlingKey !== key) return "[SETTLE →]";
    if (txStatus === "signing") return "SIGNING...";
    if (txStatus === "confirming") return "CONFIRMING...";
    return "[SETTLE →]";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[10px] uppercase tracking-widest text-white/40">SPLIT LEDGER</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-2 transition-colors">[+ NEW SPLIT]</button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-none font-mono">
            <DialogHeader><DialogTitle className="text-sm font-bold uppercase tracking-widest">CREATE EXPENSE SPLIT</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">DESCRIPTION</FormLabel><FormControl><input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Team Dinner" {...field} /></FormControl><FormMessage className="text-[10px] text-red-400" /></FormItem>
                  )} />
                  <FormField control={form.control} name="totalAudd" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">TOTAL (AUDD)</FormLabel><FormControl><input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" type="number" step="0.01" {...field} /></FormControl><FormMessage className="text-[10px] text-red-400" /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="organizerWallet" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">YOUR WALLET (RECEIVES PAYMENTS)</FormLabel><FormControl><input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white font-mono" placeholder="Your Solana address" {...field} /></FormControl><FormMessage className="text-[10px] text-red-400" /></FormItem>
                )} />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] text-white/50 uppercase tracking-widest">PARTICIPANTS</h3>
                    <button type="button" className="text-[10px] text-white/50 uppercase tracking-widest hover:text-white transition-colors" onClick={() => append({ name: "", walletAddress: "", shareAudd: 0, settled: false })}>[+ ADD PERSON]</button>
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-4 p-4 border border-white/10 relative bg-transparent">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name={`participants.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel className="text-[9px] text-white/30 uppercase tracking-widest">NAME</FormLabel><FormControl><input className="w-full bg-black border border-white/20 px-3 py-1 text-sm focus:outline-none focus:border-white/60 text-white" {...field} /></FormControl><FormMessage className="text-[10px] text-red-400" /></FormItem>
                          )} />
                          <FormField control={form.control} name={`participants.${index}.shareAudd`} render={({ field }) => (
                            <FormItem><FormLabel className="text-[9px] text-white/30 uppercase tracking-widest">SHARE (AUDD)</FormLabel><FormControl><input className="w-full bg-black border border-white/20 px-3 py-1 text-sm focus:outline-none focus:border-white/60 text-white" type="number" step="0.01" {...field} /></FormControl><FormMessage className="text-[10px] text-red-400" /></FormItem>
                          )} />
                        </div>
                        {index > 0 && (
                          <FormField control={form.control} name={`participants.${index}.walletAddress`} render={({ field }) => (
                            <FormItem><FormLabel className="text-[9px] text-white/30 uppercase tracking-widest">WALLET ADDRESS</FormLabel><FormControl><input className="w-full bg-black border border-white/20 px-3 py-1 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Solana Address" {...field} /></FormControl><FormMessage className="text-[10px] text-red-400" /></FormItem>
                          )} />
                        )}
                      </div>
                      {index > 1 && (
                        <button type="button" className="absolute top-2 right-2 text-[10px] text-white/30 hover:text-red-400 transition-colors uppercase tracking-widest" onClick={() => remove(index)}>[DEL]</button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={createSplit.isPending} className="w-full bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-3 transition-colors">
                    {createSplit.isPending ? "CREATING..." : "[CREATE SPLIT]"}
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Solana Pay QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setQrModal(null)}>
          <div className="bg-black border border-white/20 p-8 max-w-xs w-full space-y-6 font-mono" onClick={e => e.stopPropagation()}>
            <div className="text-[10px] uppercase tracking-widest text-white/40">SOLANA PAY REQUEST</div>
            <div className="text-white font-bold uppercase">{qrModal.name}</div>
            <div className="text-2xl font-bold text-primary">A${qrModal.amount}</div>
            <div className="flex justify-center"><img src={qrUrl(qrModal.url)} alt="Solana Pay QR" className="w-44 h-44 bg-white p-2" /></div>
            <p className="text-[9px] text-white/40 uppercase tracking-widest text-center">Scan with Phantom or any Solana Pay wallet</p>
            <button onClick={() => setQrModal(null)} className="w-full border border-white/20 text-white/60 text-[10px] uppercase tracking-widest py-2 hover:border-white/40 hover:text-white transition-colors">[CLOSE]</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <Skeleton className="h-48 w-full bg-white/10" />
        ) : !splits || splits.length === 0 ? (
          <div className="py-24 text-center border border-white/10 bg-transparent flex flex-col items-center justify-center">
            <div className="text-[11px] uppercase tracking-widest text-white/30">NO SPLITS YET</div>
          </div>
        ) : (
          splits.map((split) => {
            const participants = split.participants as Participant[];
            const settledCount = participants.filter(p => p.settled).length;
            const totalParticipants = participants.length;
            const isFullySettled = settledCount === totalParticipants;
            const organizerWallet = participants.find(p => p.settled && p.walletAddress)?.walletAddress;
            const demo = isTemplate(split);

            return (
              <div key={split.id} className={`border p-6 md:p-8 relative bg-transparent transition-all ${demo ? "border-yellow-400/40" : "border-white/10"} ${isFullySettled && !demo ? "opacity-60" : ""}`}>
                <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${demo ? "border-yellow-400/50" : "border-white/30"}`} />
                <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${demo ? "border-yellow-400/50" : "border-white/30"}`} />
                <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${demo ? "border-yellow-400/50" : "border-white/30"}`} />
                <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${demo ? "border-yellow-400/50" : "border-white/30"}`} />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider">{split.title}</h3>
                      {demo && <TemplateBadge />}
                    </div>
                    <div className="text-white/50 flex items-center gap-3 text-xs tracking-widest">
                      <span className="font-bold text-primary tabular-nums">TOTAL: A${split.totalAudd}</span>
                      <span className="text-white/30">|</span>
                      <span>{settledCount}/{totalParticipants} SETTLED</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isFullySettled && !demo && (
                      <span className="border border-white/30 text-white/60 text-[10px] uppercase tracking-widest px-2 py-1">FULLY SETTLED</span>
                    )}
                    {demo ? (
                      <button
                        className="text-[9px] uppercase tracking-widest text-red-400 hover:text-red-300 border border-red-400/50 hover:border-red-300 px-3 py-1.5 transition-colors"
                        onClick={() => handleDelete(split.id, "Template removed")}
                      >
                        [× REMOVE TEMPLATE]
                      </button>
                    ) : (
                      <button
                        className="text-[9px] uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors"
                        onClick={() => handleDelete(split.id)}
                      >
                        [DEL]
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4 border-t border-white/5 pt-6">
                  <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">PARTICIPANTS</div>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {participants.map((p, idx) => {
                      const settleKey = `${split.id}-${p.walletAddress}`;
                      const payUrl = organizerWallet
                        ? solanaPay(organizerWallet, p.shareAudd, split.title, `Split: ${p.name}`)
                        : null;

                      return (
                        <div key={idx} className="p-4 border border-white/10 bg-transparent flex flex-col justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="border border-white/20 h-6 w-6 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">{getInitials(p.name)}</div>
                            <div className="font-bold text-xs text-white uppercase truncate">{p.name}</div>
                          </div>
                          <div className="text-sm font-bold text-primary tabular-nums">A${p.shareAudd}</div>
                          {p.settled ? (
                            <span className="text-[9px] uppercase tracking-widest text-white/40">[SETTLED ✓]</span>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {publicKey && p.walletAddress && organizerWallet && p.walletAddress !== organizerWallet && (
                                <button className="text-[9px] uppercase tracking-widest text-white hover:text-primary transition-colors disabled:opacity-40 text-left" onClick={() => handleSettleOnChain(split, p)} disabled={settlingKey === settleKey}>
                                  {settleLabel(settleKey)}
                                </button>
                              )}
                              {payUrl && organizerWallet && p.walletAddress !== organizerWallet && (
                                <button className="text-[9px] uppercase tracking-widest text-white/50 hover:text-white transition-colors text-left" onClick={() => setQrModal({ url: payUrl, name: p.name, amount: p.shareAudd })}>
                                  [SHOW QR]
                                </button>
                              )}
                              <button className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors text-left" onClick={() => handleMarkSettled(split.id, p.walletAddress)} disabled={settleParticipant.isPending}>
                                [MARK SETTLED]
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
