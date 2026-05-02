import { pgTable, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const splitsTable = pgTable("splits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  totalAudd: numeric("total_audd", { precision: 18, scale: 6 }).notNull(),
  participants: jsonb("participants").notNull().$type<Array<{
    name: string;
    walletAddress: string;
    shareAudd: number;
    settled: boolean;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSplitSchema = createInsertSchema(splitsTable).omit({ id: true, createdAt: true });
export type InsertSplit = z.infer<typeof insertSplitSchema>;
export type Split = typeof splitsTable.$inferSelect;
