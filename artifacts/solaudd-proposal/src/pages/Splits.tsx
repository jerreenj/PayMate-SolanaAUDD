import React from "react";
import { useListSplits, useCreateSplit, useSettleSplitParticipant, getListSplitsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const participantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  walletAddress: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
  shareAudd: z.coerce.number().min(0.01, "Share must be greater than 0"),
  settled: z.boolean().default(false),
});

const splitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  totalAudd: z.coerce.number().min(0.01, "Total must be greater than 0"),
  participants: z.array(participantSchema).min(2, "At least 2 participants required"),
});

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function Splits() {
  const { data: splits, isLoading } = useListSplits();
  const createSplit = useCreateSplit();
  const settleParticipant = useSettleSplitParticipant();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof splitSchema>>({
    resolver: zodResolver(splitSchema),
    defaultValues: {
      title: "",
      totalAudd: 0,
      participants: [
        { name: "Me", walletAddress: "", shareAudd: 0, settled: true },
        { name: "", walletAddress: "", shareAudd: 0, settled: false }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "participants",
  });

  const onSubmit = (data: z.infer<typeof splitSchema>) => {
    createSplit.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSplitsQueryKey() });
        toast({ title: "Split created successfully" });
        setOpen(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to create split", variant: "destructive" });
      }
    });
  };

  const handleSettle = (splitId: string, participantName: string) => {
    settleParticipant.mutate({ id: splitId, data: { participantName } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSplitsQueryKey() });
        toast({ title: "Participant marked as settled" });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">SPLIT LEDGER</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-2 transition-colors">
              [+ NEW SPLIT]
            </button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-none font-mono">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">CREATE EXPENSE SPLIT</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">DESCRIPTION</FormLabel>
                        <FormControl>
                          <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Dinner at Miku" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalAudd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">TOTAL (AUDD)</FormLabel>
                        <FormControl>
                          <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] text-white/50 uppercase tracking-widest">PARTICIPANTS</h3>
                    <button type="button" className="text-[10px] text-white/50 uppercase tracking-widest hover:text-white transition-colors" onClick={() => append({ name: "", walletAddress: "", shareAudd: 0, settled: false })}>
                      [+ ADD PERSON]
                    </button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-4 p-4 border border-white/10 relative bg-transparent">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`participants.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px] text-white/30 uppercase tracking-widest">NAME</FormLabel>
                                <FormControl>
                                  <input className="w-full bg-black border border-white/20 px-3 py-1 text-sm focus:outline-none focus:border-white/60 text-white" {...field} />
                                </FormControl>
                                <FormMessage className="text-[10px] text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`participants.${index}.shareAudd`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px] text-white/30 uppercase tracking-widest">SHARE (AUDD)</FormLabel>
                                <FormControl>
                                  <input className="w-full bg-black border border-white/20 px-3 py-1 text-sm focus:outline-none focus:border-white/60 text-white" type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage className="text-[10px] text-red-400" />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`participants.${index}.walletAddress`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[9px] text-white/30 uppercase tracking-widest">WALLET (OPTIONAL)</FormLabel>
                              <FormControl>
                                <input className="w-full bg-black border border-white/20 px-3 py-1 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Solana Address" {...field} />
                              </FormControl>
                              <FormMessage className="text-[10px] text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>
                      {index > 1 && (
                        <button type="button" className="absolute top-2 right-2 text-[10px] text-white/30 hover:text-red-400 transition-colors uppercase tracking-widest" onClick={() => remove(index)}>
                          [DEL]
                        </button>
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

      <div className="space-y-6">
        {isLoading ? (
          <>
            <Skeleton className="h-48 w-full bg-white/10" />
            <Skeleton className="h-48 w-full bg-white/10" />
          </>
        ) : !splits || splits.length === 0 ? (
          <div className="py-24 text-center border border-white/10 bg-transparent flex flex-col items-center justify-center">
            <div className="text-[11px] uppercase tracking-widest text-white/30">NO SPLITS YET</div>
          </div>
        ) : (
          splits.map((split) => {
            const settledCount = split.participants.filter(p => p.settled).length;
            const totalParticipants = split.participants.length;
            const isFullySettled = settledCount === totalParticipants;

            return (
              <div key={split.id} className={`border border-white/10 p-6 md:p-8 transition-opacity relative bg-transparent ${isFullySettled ? "opacity-60" : ""}`}>
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/30" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/30" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/30" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/30" />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">{split.title}</h3>
                    <div className="text-white/50 mt-2 flex items-center gap-3 text-xs tracking-widest">
                      <span className="font-bold text-primary tabular-nums">TOTAL: A${split.totalAudd}</span>
                      <span className="text-white/30">|</span>
                      <span>{settledCount}/{totalParticipants} SETTLED</span>
                    </div>
                  </div>
                  {isFullySettled && (
                    <span className="border border-white/30 text-white/60 text-[10px] uppercase tracking-widest px-2 py-1">
                      FULLY SETTLED
                    </span>
                  )}
                </div>

                <div className="space-y-4 border-t border-white/5 pt-6">
                  <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">PARTICIPANTS</div>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {split.participants.map((p, idx) => (
                      <div key={idx} className="p-4 border border-white/10 bg-transparent flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="border border-white/20 h-6 w-6 flex items-center justify-center text-[10px] font-bold text-white">
                            {getInitials(p.name)}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white uppercase">{p.name}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between mt-auto">
                          <div className="text-sm font-bold text-white tabular-nums">A${p.shareAudd}</div>
                          {p.settled ? (
                            <span className="text-[9px] uppercase tracking-widest text-white/50">
                              [SETTLED]
                            </span>
                          ) : (
                            <button 
                              className="text-[9px] uppercase tracking-widest text-white hover:text-primary transition-colors"
                              onClick={() => handleSettle(split.id, p.name)}
                              disabled={settleParticipant.isPending}
                            >
                              [MARK SETTLED]
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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