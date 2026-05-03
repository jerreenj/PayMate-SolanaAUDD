import { Router } from "express";
import { db } from "@workspace/db";
import { recurringPaymentsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const fmt = (rp: typeof recurringPaymentsTable.$inferSelect) => ({
  ...rp,
  amountAudd: Number(rp.amountAudd),
  nextRunAt: rp.nextRunAt.toISOString(),
  createdAt: rp.createdAt.toISOString(),
});

router.get("/recurring", async (req, res) => {
  try {
    const items = await db.select().from(recurringPaymentsTable).orderBy(recurringPaymentsTable.createdAt);
    res.json(items.map(fmt));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/recurring", async (req, res) => {
  try {
    const { label, recipientName, recipientWallet, amountAudd, frequency } = req.body;
    if (!label || !recipientName || !recipientWallet || !amountAudd || !frequency) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const nextRunAt = new Date();
    if (frequency === "weekly") {
      nextRunAt.setDate(nextRunAt.getDate() + 7);
    } else {
      nextRunAt.setMonth(nextRunAt.getMonth() + 1);
    }
    const [rp] = await db.insert(recurringPaymentsTable).values({
      label, recipientName, recipientWallet, amountAudd: String(amountAudd), frequency, nextRunAt, active: true,
    }).returning();
    res.status(201).json(fmt(rp));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/recurring/:id", async (req, res) => {
  try {
    await db.update(recurringPaymentsTable).set({ active: false }).where(eq(recurringPaymentsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/recurring/:id/execute", async (req, res) => {
  try {
    const { txSignature } = req.body;
    if (!txSignature) return res.status(400).json({ error: "txSignature required" });

    const [plan] = await db.select().from(recurringPaymentsTable).where(eq(recurringPaymentsTable.id, req.params.id));
    if (!plan) return res.status(404).json({ error: "Not found" });

    const nextRunAt = new Date();
    if (plan.frequency === "weekly") {
      nextRunAt.setDate(nextRunAt.getDate() + 7);
    } else {
      nextRunAt.setMonth(nextRunAt.getMonth() + 1);
    }

    const [updated] = await db.update(recurringPaymentsTable)
      .set({ nextRunAt })
      .where(eq(recurringPaymentsTable.id, req.params.id))
      .returning();

    await db.insert(transactionsTable).values({
      type: "send",
      counterpartyName: plan.recipientName,
      counterpartyWallet: plan.recipientWallet,
      amountAudd: plan.amountAudd,
      txSignature,
      note: `Recurring — ${plan.label}`,
    });

    res.json(fmt(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
