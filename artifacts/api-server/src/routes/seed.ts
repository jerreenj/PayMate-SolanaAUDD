import { Router } from "express";
import { db } from "@workspace/db";
import {
  contactsTable, invoicesTable, paymentLinksTable,
  paymentRequestsTable, recurringPaymentsTable, splitsTable, transactionsTable,
} from "@workspace/db";
import { count } from "drizzle-orm";

const router = Router();

const TEMPLATE_WALLET_A = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const TEMPLATE_WALLET_B = "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV1";

async function truncateAll() {
  await db.delete(transactionsTable);
  await db.delete(splitsTable);
  await db.delete(recurringPaymentsTable);
  await db.delete(paymentRequestsTable);
  await db.delete(paymentLinksTable);
  await db.delete(invoicesTable);
  await db.delete(contactsTable);
}

export async function seedIfEmpty() {
  const [{ value: contactCount }] = await db.select({ value: count() }).from(contactsTable);
  if (Number(contactCount) > 0) return;

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await db.insert(contactsTable).values([
    { name: "Sarah Chen", walletAddress: TEMPLATE_WALLET_A, email: "sarah@designstudio.au", note: "[[template]]" },
  ]);

  await db.insert(invoicesTable).values([
    {
      title: "Brand Identity Package",
      recipientName: "Sarah Chen", recipientWallet: TEMPLATE_WALLET_A,
      amountAudd: "850.00", dueDate: "2026-12-31", status: "sent",
      note: "[[template]]",
    },
  ]);

  await db.insert(paymentLinksTable).values([
    { label: "Coffee Tip Jar", walletAddress: TEMPLATE_WALLET_A, slug: "template-coffee-tip", amountAudd: null, active: true, totalReceived: "0", paymentCount: 0 },
  ]).onConflictDoNothing();

  await db.insert(paymentRequestsTable).values([
    { toName: "Marcus Webb", toWallet: TEMPLATE_WALLET_B, amountAudd: "250.00", note: "[[template]]", status: "pending" },
  ]);

  await db.insert(recurringPaymentsTable).values([
    {
      label: "Figma Subscription",
      recipientName: "Figma Inc",
      recipientWallet: TEMPLATE_WALLET_A,
      amountAudd: "75.00",
      frequency: "monthly",
      nextRunAt: nextMonth,
      active: true,
    },
  ]);

  await db.insert(splitsTable).values([
    {
      title: "Team Offsite — Byron Bay",
      totalAudd: "600.00",
      participants: [
        { name: "You", walletAddress: TEMPLATE_WALLET_A, shareAudd: 300, settled: true },
        { name: "Marcus Webb", walletAddress: TEMPLATE_WALLET_B, shareAudd: 300, settled: false },
      ],
    },
  ]);

  // No template transaction — dashboard and ledger start empty
}

router.post("/seed", async (req, res) => {
  try {
    await seedIfEmpty();
    res.json({ ok: true, message: "Seed complete (skipped if data existed)" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Seed failed" });
  }
});

router.post("/seed/reset", async (req, res) => {
  try {
    await truncateAll();
    await seedIfEmpty();
    res.json({ ok: true, message: "Reset and reseeded" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Reset failed" });
  }
});

export default router;
