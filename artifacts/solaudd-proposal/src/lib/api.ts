import { useQuery, useMutation } from "@tanstack/react-query";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// Dashboard
export const getListInvoicesQueryKey        = () => ["invoices"]         as const;
export const getListPaymentLinksQueryKey    = () => ["payment-links"]    as const;
export const getListPaymentRequestsQueryKey = () => ["payment-requests"] as const;
export const getListRecurringPaymentsQueryKey = () => ["recurring"]      as const;
export const getListSplitsQueryKey          = () => ["splits"]           as const;
export const getListContactsQueryKey        = () => ["contacts"]         as const;

export function useGetDashboardSummary(opts?: { placeholderData?: any }) {
  return useQuery({ queryKey: ["dashboard", "summary"], queryFn: () => get<any>("/api/dashboard/summary"), ...opts });
}
export function useGetExchangeRates(opts?: { placeholderData?: any }) {
  return useQuery({ queryKey: ["dashboard", "rates"], queryFn: () => get<any>("/api/dashboard/rates"), ...opts });
}

// Invoices
export function useListInvoices() {
  return useQuery({ queryKey: getListInvoicesQueryKey(), queryFn: () => get<any[]>("/api/invoices") });
}
export function useCreateInvoice() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => post<any>("/api/invoices", data) });
}
export function useMarkInvoicePaid() {
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => patch<any>(`/api/invoices/${id}/pay`, data) });
}

// Payment Links
export function useListPaymentLinks() {
  return useQuery({ queryKey: getListPaymentLinksQueryKey(), queryFn: () => get<any[]>("/api/payment-links") });
}
export function useCreatePaymentLink() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => post<any>("/api/payment-links", data) });
}
export function useDeletePaymentLink() {
  return useMutation({ mutationFn: ({ id }: { id: string }) => del<any>(`/api/payment-links/${id}`) });
}

// Payment Requests
export function useListPaymentRequests() {
  return useQuery({ queryKey: getListPaymentRequestsQueryKey(), queryFn: () => get<any[]>("/api/payment-requests") });
}
export function useCreatePaymentRequest() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => post<any>("/api/payment-requests", data) });
}

// Recurring
export function useListRecurringPayments() {
  return useQuery({ queryKey: getListRecurringPaymentsQueryKey(), queryFn: () => get<any[]>("/api/recurring") });
}
export function useCreateRecurringPayment() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => post<any>("/api/recurring", data) });
}
export function useDeleteRecurringPayment() {
  return useMutation({ mutationFn: ({ id }: { id: string }) => del<any>(`/api/recurring/${id}`) });
}

// Splits
export function useListSplits() {
  return useQuery({ queryKey: getListSplitsQueryKey(), queryFn: () => get<any[]>("/api/splits") });
}
export function useCreateSplit() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => post<any>("/api/splits", data) });
}
export function useSettleSplitParticipant() {
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => post<any>(`/api/splits/${id}/settle`, data) });
}

// Contacts
export function useListContacts() {
  return useQuery({ queryKey: getListContactsQueryKey(), queryFn: () => get<any[]>("/api/contacts") });
}
export function useCreateContact() {
  return useMutation({ mutationFn: ({ data }: { data: any }) => post<any>("/api/contacts", data) });
}
export function useDeleteContact() {
  return useMutation({ mutationFn: ({ id }: { id: string }) => del<any>(`/api/contacts/${id}`) });
}

// Transactions
export function useListTransactions() {
  return useQuery({ queryKey: ["transactions"], queryFn: () => get<any[]>("/api/transactions") });
}
