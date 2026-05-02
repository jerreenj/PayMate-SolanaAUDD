import { Router } from "express";
import { db } from "@workspace/db";
import { paymentRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const fmt = (pr: typeof paymentRequestsTable.$inferSelect) => ({
  ...pr,
  amountAudd: Number(pr.amountAudd),
  createdAt: pr.createdAt.toISOString(),
  paidAt: pr.paidAt ? pr.paidAt.toISOString() : null,
});

router.get("/payment-requests", async (req, res) => {
  try {
    const requests = await db.select().from(paymentRequestsTable).orderBy(paymentRequestsTable.createdAt);
    res.json(requests.map(fmt));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/payment-requests", async (req, res) => {
  try {
    const { toName, toWallet, amountAudd, note } = req.body;
    if (!toName || !toWallet || !amountAudd) return res.status(400).json({ error: "Missing required fields" });
    const [pr] = await db.insert(paymentRequestsTable).values({
      toName, toWallet, amountAudd: String(amountAudd), note, status: "pending",
    }).returning();
    res.status(201).json(fmt(pr));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/payment-requests/:id", async (req, res) => {
  try {
    const [pr] = await db.select().from(paymentRequestsTable).where(eq(paymentRequestsTable.id, req.params.id));
    if (!pr) return res.status(404).json({ error: "Not found" });
    res.json(fmt(pr));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/payment-requests/:id", async (req, res) => {
  try {
    await db.delete(paymentRequestsTable).where(eq(paymentRequestsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
