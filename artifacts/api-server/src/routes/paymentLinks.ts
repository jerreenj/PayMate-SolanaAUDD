import { Router } from "express";
import { db } from "@workspace/db";
import { paymentLinksTable } from "@workspace/db";
import { eq, like } from "drizzle-orm";

const router = Router();

const fmt = (pl: typeof paymentLinksTable.$inferSelect) => ({
  ...pl,
  amountAudd: pl.amountAudd ? Number(pl.amountAudd) : null,
  totalReceived: Number(pl.totalReceived),
  createdAt: pl.createdAt.toISOString(),
});

router.get("/payment-links", async (req, res) => {
  try {
    const links = await db.select().from(paymentLinksTable).orderBy(paymentLinksTable.createdAt);
    res.json(links.map(fmt));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/payment-links", async (req, res) => {
  try {
    const { label, amountAudd, walletAddress } = req.body;
    if (!label || !walletAddress) return res.status(400).json({ error: "Missing required fields" });
    // Remove template entries for this section before creating a real one
    await db.delete(paymentLinksTable).where(like(paymentLinksTable.slug, "template%"));
    const slug = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const [link] = await db.insert(paymentLinksTable).values({
      label, amountAudd: amountAudd ? String(amountAudd) : null, walletAddress, slug,
    }).returning();
    res.status(201).json(fmt(link));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/payment-links/:id", async (req, res) => {
  try {
    const [link] = await db.select().from(paymentLinksTable).where(eq(paymentLinksTable.id, req.params.id));
    if (!link) return res.status(404).json({ error: "Not found" });
    res.json(fmt(link));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/payment-links/:id", async (req, res) => {
  try {
    await db.delete(paymentLinksTable).where(eq(paymentLinksTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
