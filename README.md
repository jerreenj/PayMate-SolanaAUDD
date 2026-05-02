# PayMate

**Your AUD on Solana.**

PayMate is a production-grade finance application for Australian freelancers, merchants, and teams who want to send, receive, and manage money using [AUDD](https://audd.io), the Australian dollar stablecoin built on Solana. It covers the full payment lifecycle: invoices, payment links, recurring payouts, expense splitting, contact management, and a live transaction ledger with CSV export.

This is a working product, not a prototype.

---

## Why This Exists

Australian businesses and freelancers moving money on-chain face a fragmented toolset. Crypto wallets handle transfers but not invoicing. Accounting software handles invoicing but not on-chain settlement. Stablecoins like AUDD solve the currency risk problem but leave the product layer completely empty.

PayMate fills that gap. It is purpose-built for AUDD on Solana: a single application that handles every workflow a freelancer, merchant, or small team needs to actually use stablecoin payments in their day-to-day business.

The goal is not to build another generic crypto wallet. The goal is to make AUDD as usable and familiar as a bank transfer, with the programmability and settlement speed of Solana underneath.

---

## Features

### Dashboard

The central view of your AUDD position. Displays your current balance with live conversions to AUD, USD, and SOL. Shows a summary of sent and received amounts for the period, outstanding invoice totals, and a feed of your most recent transactions. Designed for quick daily review without navigating away.

### Invoices

Create professional invoices payable in AUDD and send them directly to a client wallet address or email. Each invoice supports line items, due dates, and notes. Status tracking covers the full lifecycle: draft, sent, viewed, paid, and overdue. Overdue invoices surface automatically so nothing slips through.

### Payment Links

Generate a shareable payment link tied to a specific AUDD amount and description. Each link is Solana Pay compatible and can be embedded in emails, websites, or messages. The dashboard for each link shows total received, number of payments, and a full breakdown of who paid and when.

### Payment Requests

Send a direct payment request to any Solana wallet address. Specify the amount, add a note, and track whether it is pending or completed. Useful for ad-hoc requests that do not need a formal invoice, such as expense reimbursements or deposits.

### Recurring Payments

Schedule weekly or monthly AUDD payments to any wallet address. Each recurring payment shows the next scheduled date, the total amount sent to date, and the number of payments completed. Toggle any schedule on or off without deleting it. Designed for payroll, subscriptions, or regular vendor payments.

### Split and Settle

Create a shared expense, add participants, and assign either equal or custom shares in AUDD. Track who has settled and who still owes. Each participant's status updates individually, and the split closes automatically once everyone has paid. Useful for shared team costs, group travel, or client project expenses split across multiple parties.

### Contacts

Save wallet addresses with display names, labels, and notes for quick reuse across all other features. When creating an invoice, payment link, or recurring payment, select from your contacts list instead of pasting a wallet address every time. Contacts can be tagged by type: client, vendor, team member, or other.

### Transactions

A complete ledger of every AUDD movement through PayMate, with type icons indicating whether each entry is an invoice payment, payment link receipt, recurring payout, split contribution, or direct transfer. Filter by date range, type, or contact. Export the full history or any filtered subset to CSV for use in accounting software.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Blockchain | Solana + AUDD | Fast finality, low fees, AUD-denominated stablecoin |
| Frontend | React 19 + Vite 7 | Fast builds, modern React features, HMR in dev |
| Language | TypeScript | End-to-end type safety across frontend and backend |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first with accessible, composable components |
| Typography | Space Mono | Terminal aesthetic, readable at small sizes |
| Backend | Node.js + Express | Lightweight, easy to deploy, familiar ecosystem |
| Database | PostgreSQL + Drizzle ORM | Typed queries, migrations, works well on any host |
| API Contract | OpenAPI 3.1 + Orval codegen | Auto-generated React Query hooks and Zod validators |
| Deployment | Vercel (frontend) | Zero-config, works with the included vercel.json |

---

## Project Structure

```
paymate/
├── src/                    # React frontend source
│   ├── pages/              # One file per route (Dashboard, Invoices, etc.)
│   ├── components/         # Shared UI components and layout
│   └── lib/                # Utilities, formatters, mock data
├── server/                 # Express REST API
│   └── src/
│       ├── routes/         # One router per feature
│       └── middleware/     # Auth, validation, logging
├── public/                 # Static assets (favicon, OG image)
├── index.html              # Vite entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
└── vercel.json             # Vercel deployment config
```

---

## Getting Started

**Prerequisites:** Node.js 20+, pnpm 9+, a PostgreSQL database.

```bash
# Clone the repo
git clone https://github.com/jerreenj/paymate-audd.git
cd paymate-audd

# Install dependencies
npm install

# Start the frontend (dev mode)
npm run dev
```

The app runs on `http://localhost:5173` by default.

To run the full stack including the Express API and PostgreSQL backend, see the `server/` directory for its own setup instructions.

---

## Deploy to Vercel

The repo is Vercel-ready. The `vercel.json` at the root handles SPA routing so page refreshes work correctly.

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `jerreenj/paymate-audd`
3. Leave all settings at default
4. Click **Deploy**

Vercel auto-detects Vite, runs `npm run build`, and serves the `dist/` folder. No extra configuration needed.

---

## Design Direction

PayMate uses a pure black background with Space Mono throughout. Colour is used sparingly: gold (`#D4A853`) appears only on AUDD amounts and active states. Everything else is white, grey, or off-white on black.

The intent is a terminal-meets-mission-control aesthetic. Numbers are legible at a glance. The interface is dense but not cluttered. Status indicators use a simple pulse dot system. Navigation uses full uppercase labels with wide letter spacing.

This is intentional. A finance tool should feel precise and trustworthy, not glossy.

---

## Roadmap

The current build covers the full frontend application with a working Express backend and PostgreSQL schema. Below is the planned delivery schedule under the grant.

**Weeks 1 and 2:** Solana wallet integration (Phantom, Backpack, Solflare) and live AUDD balance reads via RPC.

**Weeks 3 and 4:** On-chain invoice settlement using Solana Pay. Payment confirmation polling and automatic status updates.

**Weeks 5 and 6:** Recurring payment execution via a scheduled job. On-chain verification of each payout.

**Weeks 7 and 8:** Split and Settle on-chain settlement flow. Partial settlement tracking against the contract state.

**Weeks 9 and 10:** Public launch, performance review, final testing across wallets and devices, documentation.

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
- Public deployment, domain, and infrastructure costs for 12 months
- Security review prior to launch

PayMate is the only application being built specifically to make AUDD usable as an everyday business payment tool for Australian users. The frontend is complete. The grant funds the on-chain integration that makes it real.

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you want to change. The codebase uses TypeScript throughout, so please maintain type safety in any contributions.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: description of your change"
git push origin feature/your-feature-name
# Open a pull request
```

---

## License

MIT. See [LICENSE](LICENSE) for details.
