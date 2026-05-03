import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, invoicesTable, paymentLinksTable, recurringPaymentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const transactions = await db.select().from(transactionsTable).orderBy(desc(transactionsTable.createdAt));
    const invoices = await db.select().from(invoicesTable);
    const paymentLinks = await db.select().from(paymentLinksTable);
    const recurring = await db.select().from(recurringPaymentsTable);

    const totalReceived = transactions
      .filter(t => t.type === "receive" || t.type === "invoice" || t.type === "payment_link")
      .reduce((sum, t) => sum + Number(t.amountAudd), 0);

    const totalSent = transactions
      .filter(t => t.type === "send" || t.type === "recurring")
      .reduce((sum, t) => sum + Number(t.amountAudd), 0);

    const balanceAudd = 5000 + totalReceived - totalSent;
    const AUDD_AUD = 1.0;
    const AUDD_USD = 0.64;

    const pendingInvoices = invoices.filter(i => i.status === "sent" || i.status === "draft");
    const pendingInvoicesAudd = pendingInvoices.reduce((sum, i) => sum + Number(i.amountAudd), 0);

    const recentTransactions = transactions.slice(0, 10).map(t => ({
      ...t,
      amountAudd: Number(t.amountAudd),
      createdAt: t.createdAt.toISOString(),
    }));

    res.json({
      balanceAudd,
      balanceAud: balanceAudd * AUDD_AUD,
      balanceUsd: balanceAudd * AUDD_USD,
      totalSentAudd: totalSent,
      totalReceivedAudd: totalReceived,
      pendingInvoicesCount: pendingInvoices.length,
      pendingInvoicesAudd,
      activePaymentLinks: paymentLinks.filter(pl => pl.active).length,
      activeRecurring: recurring.filter(r => r.active).length,
      recentTransactions,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/rates", async (_req, res) => {
  res.json({
    AUDD_AUD: 1.0,
    AUDD_USD: 0.6412,
    AUDD_SOL: 0.00391,
    updatedAt: new Date().toISOString(),
  });
});

export default router;
