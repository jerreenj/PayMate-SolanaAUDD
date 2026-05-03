import { Router } from "express";
import { db } from "@workspace/db";
import { splitsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const fmt = (s: typeof splitsTable.$inferSelect) => ({
  ...s,
  totalAudd: Number(s.totalAudd),
  createdAt: s.createdAt.toISOString(),
});

router.get("/splits", async (req, res) => {
  try {
    const splits = await db.select().from(splitsTable).orderBy(splitsTable.createdAt);
    res.json(splits.map(fmt));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/splits", async (req, res) => {
  try {
    const { title, totalAudd, participants } = req.body;
    if (!title || !totalAudd || !participants) return res.status(400).json({ error: "Missing required fields" });
    const participantsWithSettled = participants.map((p: { name: string; walletAddress: string; shareAudd: number }) => ({
      ...p,
      settled: false,
    }));
    const [split] = await db.insert(splitsTable).values({
      title, totalAudd: String(totalAudd), participants: participantsWithSettled,
    }).returning();
    res.status(201).json(fmt(split));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/splits/:id", async (req, res) => {
  try {
    const [split] = await db.select().from(splitsTable).where(eq(splitsTable.id, req.params.id));
    if (!split) return res.status(404).json({ error: "Not found" });
    res.json(fmt(split));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/splits/:id", async (req, res) => {
  try {
    await db.delete(splitsTable).where(eq(splitsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/splits/:id/settle", async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const [split] = await db.select().from(splitsTable).where(eq(splitsTable.id, req.params.id));
    if (!split) return res.status(404).json({ error: "Not found" });
    const participants = (split.participants as Array<{ name: string; walletAddress: string; shareAudd: number; settled: boolean }>).map(p =>
      p.walletAddress === walletAddress ? { ...p, settled: true } : p
    );
    const [updated] = await db.update(splitsTable).set({ participants }).where(eq(splitsTable.id, req.params.id)).returning();
    res.json(fmt(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
