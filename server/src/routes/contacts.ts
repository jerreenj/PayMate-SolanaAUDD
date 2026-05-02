import { Router } from "express";
import { db } from "@workspace/db";
import { contactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/contacts", async (req, res) => {
  try {
    const contacts = await db.select().from(contactsTable).orderBy(contactsTable.createdAt);
    res.json(contacts.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/contacts", async (req, res) => {
  try {
    const { name, walletAddress, email, note } = req.body;
    if (!name || !walletAddress) return res.status(400).json({ error: "name and walletAddress required" });
    const [contact] = await db.insert(contactsTable).values({ name, walletAddress, email, note }).returning();
    res.status(201).json({ ...contact, createdAt: contact.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contacts/:id", async (req, res) => {
  try {
    const [contact] = await db.select().from(contactsTable).where(eq(contactsTable.id, req.params.id));
    if (!contact) return res.status(404).json({ error: "Not found" });
    res.json({ ...contact, createdAt: contact.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/contacts/:id", async (req, res) => {
  try {
    const { name, walletAddress, email, note } = req.body;
    const [contact] = await db.update(contactsTable).set({ name, walletAddress, email, note }).where(eq(contactsTable.id, req.params.id)).returning();
    if (!contact) return res.status(404).json({ error: "Not found" });
    res.json({ ...contact, createdAt: contact.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/contacts/:id", async (req, res) => {
  try {
    await db.delete(contactsTable).where(eq(contactsTable.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
