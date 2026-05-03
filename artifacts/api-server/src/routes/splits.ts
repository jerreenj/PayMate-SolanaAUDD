import { Router } from "express";
import { db } from "@workspace/db";
import { splitsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const TEMPLATE_WALLET = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

const fmt = (s: typeof splitsTable.$inferSelect) => ({
  ...s,
  totalAudd: Number(s.totalAudd),
  createdAt: s.createdAt.toISOString(),
});

function isTemplateSplit(s: typeof splitsTable.$inferSelect) {
  const participants = s.participants as Array<{ walletAddress: string }>;
  return participants.some(p => p.walletAddress === TEMPLATE_WALLET);
}

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
    // Remove template splits before creating a real one
    const existing = await db.select().from(splitsTable);
    const templateIds = existing.filter(isTemplateSplit).map(s => s.id);
    for (const id of templateIds) {
      await db.delete(splitsTable).where(eq(splitsTable.id, id));
    }
    const participantsWithSettled = participants.map((p: { name: string; walletAddress: string; shareAudd: number; settled?: boolean }) => ({
      ...p,
      settled: p.settled ?? false,
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
