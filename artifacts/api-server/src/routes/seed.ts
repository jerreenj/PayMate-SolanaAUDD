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

export async function seedIfEmpty() {
  const [{ value: txCount }] = await db.select({ value: count() }).from(transactionsTable);
  if (Number(txCount) > 0) return;

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // One template entry per section — clearly labelled as demo data
  await db.insert(contactsTable).values([
    { name: "Demo Contact", walletAddress: DEMO_WALLET_A, email: "demo@paymate.template", note: "Template — replace with your real contacts" },
  ]);

  await db.insert(invoicesTable).values([
    {
      title: "Demo Invoice",
      recipientName: "Demo Client", recipientWallet: DEMO_WALLET_A,
      amountAudd: "500.00", dueDate: "2026-12-31", status: "sent",
      note: "Template — connect your wallet and create a real invoice",
    },
  ]);

  await db.insert(paymentLinksTable).values([
    { label: "Demo Payment Link", walletAddress: DEMO_WALLET_A, slug: "demo-link", amountAudd: "50.00", active: true, totalReceived: "0", paymentCount: 0 },
  ]);

  await db.insert(paymentRequestsTable).values([
    { toName: "Demo Recipient", toWallet: DEMO_WALLET_B, amountAudd: "100.00", note: "Template — replace with a real payment request", status: "pending" },
  ]);

  await db.insert(recurringPaymentsTable).values([
    {
      label: "Demo Recurring Payment",
      recipientName: "Demo Payee",
      recipientWallet: DEMO_WALLET_A,
      amountAudd: "75.00",
      frequency: "monthly",
      nextRunAt: nextMonth,
      active: true,
    },
  ]);

  await db.insert(splitsTable).values([
    {
      title: "Demo Expense Split",
      totalAudd: "300.00",
      participants: [
        { name: "You", walletAddress: DEMO_WALLET_A, shareAudd: 150, settled: true },
        { name: "Demo Person", walletAddress: DEMO_WALLET_B, shareAudd: 150, settled: false },
      ],
    },
  ]);

  await db.insert(transactionsTable).values([
    { type: "receive", counterpartyName: "Demo Transaction", counterpartyWallet: DEMO_WALLET_A, amountAudd: "250.00", note: "Template — your real transactions will appear here after connecting your wallet" },
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
