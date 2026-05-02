import { pgTable, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentRequestsTable = pgTable("payment_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  toName: text("to_name").notNull(),
  toWallet: text("to_wallet").notNull(),
  amountAudd: numeric("amount_audd", { precision: 18, scale: 6 }).notNull(),
  note: text("note"),
  status: text("status").notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentRequestSchema = createInsertSchema(paymentRequestsTable).omit({ id: true, createdAt: true });
export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type PaymentRequest = typeof paymentRequestsTable.$inferSelect;
