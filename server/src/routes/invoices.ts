import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const fmt = (inv: typeof invoicesTable.$inferSelect) => ({
  ...inv,
  amountAudd: Number(inv.amountAudd),
  createdAt: inv.createdAt.toISOString(),
  paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
});

router.get("/invoices", async (req, res) => {
  try {
    const invoices = await db.select().from(invoicesTable).orderBy(invoicesTable.createdAt);
    res.json(invoices.map(fmt));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/invoices", async (req, res) => {
  try {
    const { title, recipientName, recipientWallet, recipientEmail, amountAudd, dueDate, note, status } = req.body;
    if (!title || !recipientName || !recipientWallet || !amountAudd) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const [inv] = await db.insert(invoicesTable).values({
      title, recipientName, recipientWallet, recipientEmail, amountAudd: String(amountAudd), dueDate, note, status: status || "draft",
    }).returning();
    res.status(201).json(fmt(inv));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/invoices/:id", async (req, res) => {
  try {
    const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, req.params.id));
    if (!inv) return res.status(404).json({ error: "Not found" });
    res.json(fmt(inv));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/invoices/:id", async (req, res) => {
  try {
    const { title, recipientName, recipientWallet, recipientEmail, amountAudd, dueDate, note, status } = req.body;
    const [inv] = await db.update(invoicesTable).set({
      title, recipientName, recipientWallet, recipientEmail,
      amountAudd: amountAudd ? String(amountAudd) : undefined,
      dueDate, note, status,
    }).where(eq(invoicesTable.id, req.params.id)).returning();
    if (!inv) return res.status(404).json({ error: "Not found" });
    res.json(fmt(inv));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/invoices/:id", async (req, res) => {
  try {
    await db.delete(invoicesTable).where(eq(invoicesTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/invoices/:id/mark-paid", async (req, res) => {
  try {
    const { txSignature } = req.body;
    const [inv] = await db.update(invoicesTable).set({
      status: "paid",
      txSignature: txSignature || null,
      paidAt: new Date(),
    }).where(eq(invoicesTable.id, req.params.id)).returning();
    if (!inv) return res.status(404).json({ error: "Not found" });
    res.json(fmt(inv));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
