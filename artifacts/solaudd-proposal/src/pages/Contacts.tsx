import React from "react";
import { useListContacts, useCreateContact, useDeleteContact, getListContactsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  walletAddress: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  note: z.string().optional(),
});

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function Contacts() {
  const { data: contacts, isLoading } = useListContacts();
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      walletAddress: "",
      email: "",
      note: "",
    },
  });

  const onSubmit = (data: z.infer<typeof contactSchema>) => {
    createContact.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
        toast({ title: "Contact created successfully" });
        setOpen(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to create contact", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteContact.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
        toast({ title: "Contact deleted" });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">ADDRESS BOOK</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-2 transition-colors">
              [+ ADD CONTACT]
            </button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/20 text-white sm:max-w-[425px] rounded-none font-mono">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">NEW CONTACT</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">NAME</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Alice" {...field} />
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
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">SOLANA WALLET ADDRESS</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="Eg. 7X...aT" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] text-white/50 uppercase tracking-widest">EMAIL (OPTIONAL)</FormLabel>
                      <FormControl>
                        <input className="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/60 text-white" placeholder="alice@example.com" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400" />
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <button type="submit" disabled={createContact.isPending} className="w-full bg-white text-black hover:bg-white/90 font-mono text-[11px] uppercase tracking-widest px-4 py-3 transition-colors">
                    {createContact.isPending ? "SAVING..." : "[SAVE CONTACT]"}
                  </button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-40 w-full bg-white/10" />
            <Skeleton className="h-40 w-full bg-white/10" />
            <Skeleton className="h-40 w-full bg-white/10" />
          </>
        ) : !contacts || contacts.length === 0 ? (
          <div className="col-span-full py-24 text-center border border-white/10 bg-transparent flex flex-col items-center justify-center">
            <div className="text-[11px] uppercase tracking-widest text-white/30">NO CONTACTS YET</div>
          </div>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="border border-white/10 p-6 relative group flex flex-col bg-transparent">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/30" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/30" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/30" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/30" />

              <div className="flex items-start gap-4">
                <div className="border border-white/20 h-8 w-8 flex items-center justify-center text-[10px] font-bold shrink-0 text-white">
                  {getInitials(contact.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white truncate text-sm uppercase">{contact.name}</h3>
                    <button 
                      className="text-[9px] uppercase tracking-widest text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(contact.id)}
                    >
                      [DEL]
                    </button>
                  </div>
                  {contact.email && (
                    <div className="text-[10px] text-white/50 mt-1 truncate tracking-widest">
                      {contact.email}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">WALLET</div>
                <div className="text-xs font-mono text-white/70 truncate">
                  {contact.walletAddress}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}