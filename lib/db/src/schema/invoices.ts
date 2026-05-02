import { pgTable, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const invoicesTable = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientWallet: text("recipient_wallet").notNull(),
  recipientEmail: text("recipient_email"),
  amountAudd: numeric("amount_audd", { precision: 18, scale: 6 }).notNull(),
  dueDate: text("due_date"),
  status: text("status").notNull().default("draft"),
  txSignature: text("tx_signature"),
  note: text("note"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({ id: true, createdAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
