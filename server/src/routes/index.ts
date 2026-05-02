import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactsRouter from "./contacts";
import invoicesRouter from "./invoices";
import paymentLinksRouter from "./paymentLinks";
import paymentRequestsRouter from "./paymentRequests";
import recurringPaymentsRouter from "./recurringPayments";
import splitsRouter from "./splits";
import transactionsRouter from "./transactions";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactsRouter);
router.use(invoicesRouter);
router.use(paymentLinksRouter);
router.use(paymentRequestsRouter);
router.use(recurringPaymentsRouter);
router.use(splitsRouter);
router.use(transactionsRouter);
router.use(dashboardRouter);

export default router;
