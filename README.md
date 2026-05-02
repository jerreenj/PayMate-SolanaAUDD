# PayMate — Your AUD on Solana

PayMate is a production-ready, all-in-one finance tool for freelancers, small teams, and merchants using **AUDD** (Australian dollar stablecoin) on Solana.

Built for the [SolAUDD Grant Program](https://earn.superteam.fun/) — a real working application, not a demo.

## Features

- **Dashboard** — AUDD balance with live AUD, USD, and SOL conversions. Summary stats, recent transactions feed.
- **Invoices** — Create and send professional invoices payable in AUDD. Track draft / sent / paid / overdue status.
- **Payment Links** — Generate shareable Solana Pay-compatible links. Track total received and payment count per link.
- **Payment Requests** — Send a payment request to any wallet address. Track pending and paid requests.
- **Recurring Payments** — Set up weekly or monthly AUDD payments to any wallet. Toggle active/inactive.
- **Split & Settle** — Group expense splitting. Create a split, assign shares, mark each participant settled.
- **Contacts** — Save wallet addresses with names for quick reuse across all features.
- **Transactions** — Full history with type icons. Export to CSV for accounting.

## Tech Stack

| Layer | Tech |
|---|---|
| Blockchain | Solana + AUDD stablecoin |
| Frontend | React + Vite + TypeScript |
| UI | shadcn/ui + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express |
| Database | PostgreSQL + Drizzle ORM |
| API | OpenAPI 3.1 + Orval codegen |
| Monorepo | pnpm workspaces |

## Project Structure

```
artifacts/
  solaudd-proposal/   # React + Vite frontend (PayMate app)
  api-server/         # Express REST API
lib/
  db/                 # Drizzle ORM schema + migrations
  api-spec/           # OpenAPI spec (source of truth)
  api-client-react/   # Generated React Query hooks
  api-zod/            # Generated Zod validators
```

## Getting Started

```bash
pnpm install
pnpm --filter @workspace/db run push   # apply DB schema
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/solaudd-proposal run dev
```

## Why AUDD on Solana

Australian businesses moving money on-chain face fragmented tools, high FX costs, and no programmable AUD. AUDD fixes the asset layer. PayMate fixes the product layer — giving merchants and freelancers the invoicing, treasury, and payment tools they need to actually use AUDD day-to-day.

## Grant

Applying for the [SolAUDD Grant Program](https://earn.superteam.fun/) — AUDD 5,000 requested across a 10-week build to ship PayMate as a publicly available production app.

---

Built with [Replit](https://replit.com)
