import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const fmt = (t: typeof transactionsTable.$inferSelect) => ({
  ...t,
  amountAudd: Number(t.amountAudd),
  createdAt: t.createdAt.toISOString(),
});

router.get("/transactions", async (req, res) => {
  try {
    const txs = await db.select().from(transactionsTable).orderBy(transactionsTable.createdAt);
    res.json(txs.map(fmt));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/transactions", async (req, res) => {
  try {
    const { type, counterpartyName, counterpartyWallet, amountAudd, txSignature, note } = req.body;
    if (!type || !amountAudd) return res.status(400).json({ error: "Missing required fields" });
    const [tx] = await db.insert(transactionsTable).values({
      type, counterpartyName, counterpartyWallet, amountAudd: String(amountAudd), txSignature, note,
    }).returning();
    res.status(201).json(fmt(tx));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/transactions/export", async (req, res) => {
  try {
    const txs = await db.select().from(transactionsTable).orderBy(transactionsTable.createdAt);
    const rows = txs.map(t => ({
      date: t.createdAt.toISOString(),
      type: t.type,
      counterparty: t.counterpartyName || "",
      amountAudd: Number(t.amountAudd),
      txSignature: t.txSignature || "",
      note: t.note || "",
    }));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
