<div align="center">

<br />

<h1>PayMate</h1>

<p><strong>Your AUD on Solana.</strong></p>

<p>
  <a href="https://paymate-solana.vercel.app"><img src="https://img.shields.io/badge/Live%20App-paymate--solana.vercel.app-black?style=for-the-badge&logo=vercel&logoColor=white" /></a>
  <a href="https://github.com/jerreenj/PayMate-SolanaAUDD"><img src="https://img.shields.io/badge/GitHub-PayMate--SolanaAUDD-181717?style=for-the-badge&logo=github&logoColor=white" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Solana-Mainnet-9945FF?style=flat-square&logo=solana&logoColor=white" />
  <img src="https://img.shields.io/badge/AUDD-Stablecoin-D4A853?style=flat-square" />
  <img src="https://img.shields.io/badge/Solana_Pay-Compatible-00C2FF?style=flat-square" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-white?style=flat-square" />
</p>

<br />

</div>

---

PayMate is a production-grade AUDD finance application for Australian freelancers, merchants, and teams. It covers the full payment lifecycle — on-chain invoice settlement, Solana Pay QR codes, automated recurring payouts, expense splitting with per-participant on-chain settlement, payment requests, contact management, and a live transaction ledger with CSV export — all settled in Australian dollars on Solana mainnet.

**This is a working product, not a prototype.** Connect a wallet, pay an invoice on-chain, execute a recurring payment, and settle a split — all confirmed on Solana mainnet with Solscan links, no simulation.

---

## Live Demo

**[paymate-solana.vercel.app](https://paymate-solana.vercel.app)**

The app auto-populates with realistic demo data on first load — invoices, contacts, payment links, recurring payments, splits, and transactions — so you can explore every feature immediately without any setup.

---

## Why This Exists

Australian businesses and freelancers moving money on-chain face a fragmented toolset. Crypto wallets handle transfers but not invoicing. Accounting software handles invoicing but not on-chain settlement. Stablecoins like AUDD solve the currency risk problem but leave the product layer completely empty.

PayMate fills that gap. It is purpose-built for AUDD on Solana: a single application that handles every workflow a freelancer, merchant, or small team needs to use stablecoin payments day-to-day.

The goal is not to build another generic crypto wallet. The goal is to make AUDD as usable and familiar as a bank transfer, with the programmability and settlement speed of Solana underneath.

---

## What's Built and Working

### Wallet Connection

Connect Phantom or Solflare from the top-right header on every page. Live AUDD balance is read from Solana mainnet RPC in real time. No custodial accounts, no seed phrase entry.

**AUDD Mint:** `AuDDuMCindiXzSrBgUvXL5uJkr5kXRpEhMJPBiSTGzj`

### On-Chain AUDD Send

`[SEND]` on the dashboard triggers a real SPL token transfer on Solana mainnet. Your connected wallet signs the transaction, it confirms on-chain, and the record is written to the ledger with a Solscan link. Recipient ATA is created automatically if it does not exist.

### On-Chain AUDD Receive

`[RECEIVE]` shows your wallet address with one-click copy and a Solana Pay QR code. Any Phantom or Solflare user can scan and send AUDD in one tap.

---

### Invoices — On-Chain Settlement

Full invoice lifecycle: draft → sent → paid → overdue.

**`[PAY NOW →]`** executes a live AUDD SPL transfer from your connected wallet to the recipient's wallet:
- Wallet signs on mainnet — no simulation
- Invoice flips to PAID with the on-chain tx signature stored
- Toast notification with direct Solscan link

---

### Recurring Payments — On-Chain Execution

Schedule weekly or monthly AUDD payouts to any wallet. Track next run date, frequency, and active/inactive status.

**`[RUN NOW]`** executes a real AUDD transfer:
- Connected wallet signs and confirms on mainnet
- `nextRunAt` advances by the correct interval automatically
- Transaction recorded in ledger with on-chain signature
- Toast with Solscan confirmation link

---

### Split & Settle — Per-Participant On-Chain Settlement

Create a shared expense, assign AUDD shares per participant, and track who has settled. Three settlement paths per participant:

**`[SETTLE →]`** — Connected wallet sends that participant's AUDD share to the organizer on mainnet. Confirmed on-chain, marked settled, Solscan link shown.

**`[SHOW QR]`** — Full-screen Solana Pay QR for the participant to scan and pay themselves with any Solana Pay wallet.

**`[MARK SETTLED]`** — Manual fallback for off-chain or cash settlements.

Splits close automatically when all participants have settled.

---

### Payment Links with Solana Pay QR

Generate a shareable AUDD payment link. Each card shows an inline Solana Pay QR preview, total received, payment count, and a copyable URL. Any Phantom, Solflare, or Solana Pay-compatible app can scan and pay in one tap.

---

### Payment Requests

Send a formal AUDD payment request to any wallet address. Track status from pending through to paid with a full ledger view and date history.

---

### Contacts

Save wallet addresses with display names, emails, and notes. Reuse them across invoices, payment links, recurring payments, and payment requests.

---

### Transaction History with CSV Export

A complete ledger of every AUDD movement — direction indicators, counterparty names, dates, and Solscan links for every on-chain transaction.

**`[EXPORT CSV]`** downloads a clean, properly formatted CSV file for accounting:

```
"Date","Type","Counterparty","Amount (AUDD)","TX Signature","Note"
"2026-04-26T00:00:00.000Z","receive","Workshop Registration","597","","..."
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Solana Mainnet · AUDD SPL Token |
| Wallet | Phantom · Solflare via `@solana/wallet-adapter` |
| On-Chain Transfers | `@solana/web3.js` · `@solana/spl-token` · shared `useAuddTransfer` hook |
| Payment QR | Solana Pay URL protocol · `api.qrserver.com` |
| Frontend | React 19 · Vite 6 · TypeScript 5 · TanStack Query |
| Styling | Tailwind CSS v4 · Space Mono · shadcn/ui |
| Backend | Node.js · Express 5 · Pino structured logging |
| Database | PostgreSQL · Drizzle ORM |
| Deployment | Vercel (frontend) · Replit (API) |

---

## Design

Pure black (`#000000`) background. Space Mono throughout. Gold (`#D4A853`) appears only on AUDD amounts. Everything else is white on black.

Terminal-meets-mission-control aesthetic. Numbers are legible at a glance. Dense but not cluttered. Full uppercase labels, wide letter spacing, animated pulse status dots, and corner bracket frame accents on every card.

---

## Running Locally

```bash
git clone https://github.com/jerreenj/PayMate-SolanaAUDD.git
cd PayMate-SolanaAUDD/artifacts/solaudd-proposal
npm install --legacy-peer-deps --ignore-scripts
npm run build
```

The frontend builds to a fully static Vite output. The API server (`artifacts/api-server`) connects to PostgreSQL and auto-seeds demo data on first boot.

---

## Roadmap

| Status | Milestone |
|---|---|
| ✅ Complete | Phantom + Solflare wallet connection, live AUDD balance from Solana mainnet |
| ✅ Complete | On-chain AUDD SPL send — wallet signs, confirms on mainnet, Solscan link |
| ✅ Complete | Receive modal with wallet address, one-click copy, Solana Pay QR |
| ✅ Complete | Solana Pay QR on every payment link card and full-screen modal |
| ✅ Complete | `[PAY NOW →]` — Invoice settled on-chain, tx signature stored, Solscan toast |
| ✅ Complete | `[RUN NOW]` — Recurring payment executed on-chain, nextRunAt advanced, ledger recorded |
| ✅ Complete | `[SETTLE →]` — Split settled on-chain per participant + `[SHOW QR]` Solana Pay |
| ✅ Complete | Toast confirmations with Solscan links on every confirmed on-chain action |
| ✅ Complete | `[EXPORT CSV]` — Full transaction history as RFC-4180 CSV with proper escaping |
| ✅ Complete | Payment Requests — create, track, and manage AUDD requests |
| ✅ Complete | All eight feature modules complete with realistic demo seed data |
| ✅ Complete | Mobile responsive — iPhone Safari and Android Chrome |
| ✅ Complete | Deployed and live on Vercel with SPA routing |
| 🔜 Next | AUDD balance auto-refresh after every on-chain transaction |
| 🔜 Next | Production domain + security audit |
| 🔜 Next | Public launch and merchant onboarding flow |

---

## Grant Application

Applying for the **[SolAUDD Superteam Earn Grant Program](https://earn.superteam.fun/)**.

**Amount requested:** AUDD 10,000

**What is already live and working:**

- **On-chain AUDD send** — wallet signs, confirmed on mainnet, Solscan link
- **On-chain invoice settlement** — `[PAY NOW →]` sends AUDD to recipient, marks invoice paid with tx signature
- **On-chain recurring execution** — `[RUN NOW]` sends AUDD, advances schedule, logs transaction on-chain
- **On-chain split settlement** — `[SETTLE →]` sends participant share to organizer on mainnet
- **Solana Pay QR** on dashboard, every payment link card, and every unsettled split participant
- **CSV export** of complete transaction ledger for accounting and bookkeeping
- All eight feature modules fully complete with realistic demo data
- Clean TypeScript codebase — zero type errors, zero placeholder data
- Deployed on Vercel: [paymate-solana.vercel.app](https://paymate-solana.vercel.app)

**What the grant funds:**

- 12 months of production infrastructure, domain, and hosting
- Security review and audit prior to public launch
- AUDD balance real-time polling after every on-chain transaction
- Merchant onboarding flow and public-facing acquisition page
- Mobile point-of-sale payment request and QR flow

PayMate is the only application built specifically to make AUDD usable as an everyday business payment tool for Australian users. Every on-chain feature is complete and live on mainnet. The grant funds production hardening and the go-to-market layer.

---

## License

MIT. See [LICENSE](LICENSE) for details.

---

<div align="center">

<sub>Built for the SolAUDD Superteam Earn Grant Program · <a href="https://paymate-solana.vercel.app">paymate-solana.vercel.app</a></sub>

</div>
