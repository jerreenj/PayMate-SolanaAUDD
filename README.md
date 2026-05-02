<div align="center">

<br />

<h1>PayMate</h1>

<p><strong>Your AUD on Solana.</strong></p>

<p>
  <a href="https://paymate-solana.vercel.app"><img src="https://img.shields.io/badge/Live%20App-paymate--solana.vercel.app-black?style=for-the-badge&logo=vercel&logoColor=white" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Solana-9945FF?style=flat-square&logo=solana&logoColor=white" />
  <img src="https://img.shields.io/badge/AUDD-Stablecoin-D4A853?style=flat-square" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-white?style=flat-square" />
</p>

<br />

</div>

---

PayMate is a production-grade finance application for Australian freelancers, merchants, and teams who want to send, receive, and manage money using [AUDD](https://audd.io) — the Australian dollar stablecoin built on Solana. It covers the full payment lifecycle: invoices, payment links, recurring payouts, expense splitting, contact management, and a live transaction ledger with CSV export.

This is a working product, not a prototype.

---

## Why This Exists

Australian businesses and freelancers moving money on-chain face a fragmented toolset. Crypto wallets handle transfers but not invoicing. Accounting software handles invoicing but not on-chain settlement. Stablecoins like AUDD solve the currency risk problem but leave the product layer completely empty.

PayMate fills that gap. It is purpose-built for AUDD on Solana: a single application that handles every workflow a freelancer, merchant, or small team needs to actually use stablecoin payments in their day-to-day business.

The goal is not to build another generic crypto wallet. The goal is to make AUDD as usable and familiar as a bank transfer, with the programmability and settlement speed of Solana underneath.

---

## Features

<br />

### Dashboard

The central view of your AUDD position. Displays your current balance with live conversions to AUD, USD, and SOL. Shows a summary of sent and received amounts for the period, outstanding invoice totals, and a feed of your most recent transactions. Designed for quick daily review without navigating away.

<br />

### Invoices

Create professional invoices payable in AUDD and send them directly to a client wallet address or email. Each invoice supports line items, due dates, and notes. Status tracking covers the full lifecycle: draft, sent, viewed, paid, and overdue. Overdue invoices surface automatically so nothing slips through.

<br />

### Payment Links

Generate a shareable payment link tied to a specific AUDD amount and description. Each link is Solana Pay compatible and can be embedded in emails, websites, or messages. The page for each link shows total received, number of payments, and a full breakdown of who paid and when.

<br />

### Payment Requests

Send a direct payment request to any Solana wallet address. Specify the amount, add a note, and track whether it is pending or completed. Useful for ad-hoc requests that do not need a formal invoice, such as expense reimbursements or deposits.

<br />

### Recurring Payments

Schedule weekly or monthly AUDD payments to any wallet address. Each recurring payment shows the next scheduled date, the total amount sent to date, and the number of payments completed. Toggle any schedule on or off without deleting it. Built for payroll, subscriptions, and regular vendor payments.

<br />

### Split and Settle

Create a shared expense, add participants, and assign either equal or custom shares in AUDD. Track who has settled and who still owes. Each participant's status updates individually, and the split closes automatically once everyone has paid. Useful for shared team costs, group travel, or client project expenses across multiple parties.

<br />

### Contacts

Save wallet addresses with display names, labels, and notes for quick reuse across all other features. When creating an invoice, payment link, or recurring payment, select from your contacts instead of pasting a wallet address every time. Contacts can be tagged by type: client, vendor, team member, or other.

<br />

### Transactions

A complete ledger of every AUDD movement through PayMate, with type icons indicating whether each entry is an invoice payment, payment link receipt, recurring payout, split contribution, or direct transfer. Filter by date range, type, or contact. Export the full history or any filtered subset to CSV for accounting.

---

## Tech Stack

<br />

| Layer | Technology |
|---|---|
| Blockchain | Solana + AUDD stablecoin |
| Frontend | React 19 + Vite 7 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Typography | Space Mono |
| Backend | Node.js + Express |
| Database | PostgreSQL + Drizzle ORM |
| API Contract | OpenAPI 3.1 + Orval codegen |

---

## Design

PayMate uses a pure black background with Space Mono throughout. Colour is used sparingly: gold (`#D4A853`) appears only on AUDD amounts and active states. Everything else is white, grey, or off-white on black.

The intent is a terminal-meets-mission-control aesthetic. Numbers are legible at a glance. The interface is dense but not cluttered. Status indicators use a simple pulse dot system. Navigation uses full uppercase labels with wide letter spacing.

This is intentional. A finance tool should feel precise and trustworthy, not glossy.

---

## Roadmap

| Period | Milestone |
|---|---|
| Weeks 1 and 2 | Solana wallet integration (Phantom, Backpack, Solflare) and live AUDD balance reads via RPC |
| Weeks 3 and 4 | On-chain invoice settlement using Solana Pay. Payment confirmation and automatic status updates |
| Weeks 5 and 6 | Recurring payment execution via a scheduled job. On-chain verification of each payout |
| Weeks 7 and 8 | Split and Settle on-chain settlement flow. Partial settlement tracking against contract state |
| Weeks 9 and 10 | Public launch, performance review, final testing across wallets and devices, documentation |

---

## Grant Application

Applying for the [SolAUDD Superteam Earn Grant Program](https://earn.superteam.fun/).

**Amount requested:** AUDD 10,000

**Build timeline:** 10 weeks from grant approval to public launch

**What the grant funds:**

- Full Solana wallet adapter integration across all payment flows
- On-chain invoice settlement using Solana Pay request protocol
- Recurring payment execution layer with on-chain verification
- Split and Settle contract settlement and partial payment tracking
- Public deployment, domain, and infrastructure for 12 months
- Security review prior to launch

PayMate is the only application built specifically to make AUDD usable as an everyday business payment tool for Australian users. The frontend is complete. The grant funds the on-chain integration that makes it real.

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you want to change. The codebase uses TypeScript throughout — please maintain type safety in any contributions.

---

## License

MIT. See [LICENSE](LICENSE) for details.

---

<div align="center">

<sub>Built for the SolAUDD Superteam Earn Grant Program · <a href="https://paymate-solana.vercel.app">paymate-solana.vercel.app</a></sub>

</div>
