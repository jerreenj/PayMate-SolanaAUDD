import { Router } from "express";
import { db } from "@workspace/db";
import {
  contactsTable, invoicesTable, paymentLinksTable,
  paymentRequestsTable, recurringPaymentsTable, splitsTable, transactionsTable,
} from "@workspace/db";
import { count } from "drizzle-orm";

const router = Router();

const DEMO_WALLET_A = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const DEMO_WALLET_B = "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV1";
const DEMO_WALLET_C = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export async function seedIfEmpty() {
  const [{ value: txCount }] = await db.select({ value: count() }).from(transactionsTable);
  if (Number(txCount) > 0) return;

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await db.insert(contactsTable).values([
    { name: "Sarah Chen", walletAddress: DEMO_WALLET_A, email: "sarah@paymate.demo", note: "Design partner — Brand Identity" },
    { name: "Marcus Webb", walletAddress: DEMO_WALLET_B, email: "marcus@paymate.demo", note: "Full-stack dev, hourly rate A$150" },
    { name: "The Coffee Collective", walletAddress: DEMO_WALLET_C, email: "hello@coffeecollective.demo", note: "Regular client, weekly invoices" },
  ]);

  await db.insert(invoicesTable).values([
    {
      title: "Brand Identity Design",
      recipientName: "Marcus Webb", recipientWallet: DEMO_WALLET_B,
      recipientEmail: "marcus@paymate.demo",
      amountAudd: "1200.00", dueDate: "2026-06-01", status: "sent",
      note: "Full brand package: logo, style guide, icon set",
    },
    {
      title: "Workshop Registration Fee",
      recipientName: "Sarah Chen", recipientWallet: DEMO_WALLET_A,
      amountAudd: "597.00", status: "paid",
      note: "UX Design Workshop — April 2026",
    },
  ]);

  await db.insert(paymentLinksTable).values([
    { label: "Coffee Tip Jar", walletAddress: DEMO_WALLET_A, slug: "coffee-tip", amountAudd: null, active: true, totalReceived: "45.00", paymentCount: 3 },
    { label: "Team Lunch — Split", walletAddress: DEMO_WALLET_B, slug: "team-lunch-split", amountAudd: "42.50", active: true, totalReceived: "0", paymentCount: 0 },
  ]);

  await db.insert(paymentRequestsTable).values([
    { toName: "Marcus Webb", toWallet: DEMO_WALLET_B, amountAudd: "250.00", note: "Team dinner — Noma Sydney", status: "pending" },
  ]);

  await db.insert(recurringPaymentsTable).values([
    {
      label: "Figma Subscription", recipientName: "Figma Inc",
      recipientWallet: DEMO_WALLET_C, amountAudd: "75.00",
      frequency: "monthly", nextRunAt: nextMonth, active: true,
    },
    {
      label: "Sarah Chen — Retainer", recipientName: "Sarah Chen",
      recipientWallet: DEMO_WALLET_A, amountAudd: "800.00",
      frequency: "monthly", nextRunAt: nextMonth, active: true,
    },
  ]);

  await db.insert(splitsTable).values([
    {
      title: "Team Offsite — Byron Bay",
      totalAudd: "840.00",
      participants: [
        { name: "Sarah Chen", walletAddress: DEMO_WALLET_A, shareAudd: 280, settled: true },
        { name: "Marcus Webb", walletAddress: DEMO_WALLET_B, shareAudd: 280, settled: false },
        { name: "You", walletAddress: DEMO_WALLET_C, shareAudd: 280, settled: true },
      ],
    },
  ]);

  await db.insert(transactionsTable).values([
    { type: "receive", counterpartyName: "Workshop Registration", counterpartyWallet: DEMO_WALLET_A, amountAudd: "597.00", note: "Invoice paid on-chain" },
    { type: "send", counterpartyName: "Sarah Chen", counterpartyWallet: DEMO_WALLET_A, amountAudd: "250.00", note: "Split settlement" },
    { type: "receive", counterpartyName: "Coffee Tip Jar", counterpartyWallet: null, amountAudd: "45.00", note: "Payment link received" },
    { type: "send", counterpartyName: "Marcus Webb", counterpartyWallet: DEMO_WALLET_B, amountAudd: "1200.00", note: "Brand Identity invoice settled" },
    { type: "receive", counterpartyName: "The Coffee Collective", counterpartyWallet: DEMO_WALLET_C, amountAudd: "450.00", note: "Consulting retainer" },
    { type: "send", counterpartyName: "Figma Inc", counterpartyWallet: DEMO_WALLET_C, amountAudd: "75.00", note: "Recurring — Figma Subscription" },
    { type: "receive", counterpartyName: "Sarah Chen", counterpartyWallet: DEMO_WALLET_A, amountAudd: "50.00", note: "Expense reimbursement" },
  ]);
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

export default router;
