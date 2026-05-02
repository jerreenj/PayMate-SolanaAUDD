import { pgTable, text, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recurringPaymentsTable = pgTable("recurring_payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  label: text("label").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientWallet: text("recipient_wallet").notNull(),
  amountAudd: numeric("amount_audd", { precision: 18, scale: 6 }).notNull(),
  frequency: text("frequency").notNull(),
  nextRunAt: timestamp("next_run_at").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecurringPaymentSchema = createInsertSchema(recurringPaymentsTable).omit({ id: true, createdAt: true });
export type InsertRecurringPayment = z.infer<typeof insertRecurringPaymentSchema>;
export type RecurringPayment = typeof recurringPaymentsTable.$inferSelect;
