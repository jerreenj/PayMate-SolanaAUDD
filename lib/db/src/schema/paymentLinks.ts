import { pgTable, text, numeric, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentLinksTable = pgTable("payment_links", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  label: text("label").notNull(),
  amountAudd: numeric("amount_audd", { precision: 18, scale: 6 }),
  walletAddress: text("wallet_address").notNull(),
  slug: text("slug").notNull().unique(),
  active: boolean("active").notNull().default(true),
  totalReceived: numeric("total_received", { precision: 18, scale: 6 }).notNull().default("0"),
  paymentCount: integer("payment_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentLinkSchema = createInsertSchema(paymentLinksTable).omit({ id: true, createdAt: true, slug: true, totalReceived: true, paymentCount: true });
export type InsertPaymentLink = z.infer<typeof insertPaymentLinkSchema>;
export type PaymentLink = typeof paymentLinksTable.$inferSelect;
