import React from "react";
import { useListRecurringPayments, useCreateRecurringPayment, useDeleteRecurringPayment, getListRecurringPaymentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const recurringSchema = z.object({
  label: z.string().min(1, "Label is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientWallet: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
  amountAudd: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  frequency: z.enum(["weekly", "monthly"]),
});

export default function Recurring() {
  const { data: recurring, isLoading } = useListRecurringPayments();
  const createRecurring = useCreateRecurringPayment();
  const deleteRecurring = useDeleteRecurringPayment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof recurringSchema>>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      label: "",
      recipientName: "",
      recipientWallet: "",
      amountAudd: 0,
      frequency: "monthly",
    },
  });

  const onSubmit = (data: z.infer<typeof recurringSchema>) => {
    createRecurring.mutate({ data: { ...data, active: true } as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecurringPaymentsQueryKey() });
        toast({ title: "Recurring payment created" });
        setOpen(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to create recurring payment", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteRecurring.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecurringPaymentsQueryKey() });
        toast({ title: "Recurring payment deleted" });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">RECURRING PLANS</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-2 transition-colors">
              [+ NEW PLAN]
            </button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/20 text-white sm:max-w-[425px] rounded-none font-mono">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">CREATE RECURRING PLAN</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">LABEL</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Office Rent" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">FREQUENCY</FormLabel>
                        <FormControl>
                          <select className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" {...field}>
                            <option value="weekly">WEEKLY</option>
                            <option value="monthly">MONTHLY</option>
                          </select>
                        </FormControl>
                        <FormMessage className="text-[10px] text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">RECIPIENT NAME</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Landlord" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recipientWallet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">RECIPIENT WALLET</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Solana Address" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <button type="submit" disabled={createRecurring.isPending} className="w-full bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-3 transition-colors">
                    {createRecurring.isPending ? "CREATING..." : "[CREATE PLAN]"}
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
        ) : !recurring || recurring.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="text-[11px] uppercase tracking-widest text-white/30">NO RECURRING PLANS</div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 border-b border-white/10 text-[9px] uppercase tracking-widest text-white/30">
                <div>LABEL</div>
                <div>RECIPIENT</div>
                <div className="text-right">AMOUNT</div>
                <div>FREQUENCY</div>
                <div>NEXT RUN</div>
                <div>STATUS</div>
                <div className="text-right">—</div>
              </div>
              <div className="divide-y divide-white/5">
                {recurring.map((plan) => (
                  <div key={plan.id} className={`grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group ${!plan.active ? 'opacity-50' : ''}`}>
                    <div className="font-bold text-xs text-white truncate">{plan.label}</div>
                    <div className="text-xs text-white/70 truncate">{plan.recipientName}</div>
                    <div className="text-sm font-bold text-white tabular-nums text-right">
                      A${plan.amountAudd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-white/70 uppercase tracking-widest">{plan.frequency}</div>
                    <div className="text-[10px] text-white/50 tracking-widest">
                      {format(new Date(plan.nextRunAt), "dd MMM yyyy")}
                    </div>
                    <div>
                      <span className={`border px-2 py-1 text-[10px] uppercase tracking-widest ${plan.active ? 'border-white/30 text-white/60' : 'border-white/10 text-white/30'}`}>
                        {plan.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="text-right">
                      <button 
                        className="text-[10px] uppercase text-white/40 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity tracking-widest"
                        onClick={() => handleDelete(plan.id)}
                      >
                        [DEL]
                      </button>
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