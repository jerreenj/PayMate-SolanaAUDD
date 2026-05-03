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

PayMate is a production-grade AUDD finance application for Australian freelancers, merchants, and teams. It covers the full payment lifecycle — invoices, payment links with Solana Pay QR codes, recurring payouts, expense splitting, contact management, real on-chain AUDD transfers, and a live transaction ledger — all settled in Australian dollars on Solana.

**This is a working product, not a prototype.** Connect a wallet, send AUDD on mainnet, and scan a Solana Pay QR in under 30 seconds.

---

## Live Demo

**[paymate-solana.vercel.app](https://paymate-solana.vercel.app)**

The app auto-populates with realistic demo data on first load — invoices, contacts, payment links, recurring payments, and transactions — so you can explore every feature immediately without any setup.

---

## Why This Exists

Australian businesses and freelancers moving money on-chain face a fragmented toolset. Crypto wallets handle transfers but not invoicing. Accounting software handles invoicing but not on-chain settlement. Stablecoins like AUDD solve the currency risk problem but leave the product layer completely empty.

PayMate fills that gap. It is purpose-built for AUDD on Solana: a single application that handles every workflow a freelancer, merchant, or small team needs to use stablecoin payments day-to-day.

The goal is not to build another generic crypto wallet. The goal is to make AUDD as usable and familiar as a bank transfer, with the programmability and settlement speed of Solana underneath.

---

## What's Built and Working

### On-Chain AUDD Send

The SEND button on the dashboard triggers a real SPL token transfer on Solana mainnet. Your connected wallet (Phantom or Solflare) signs the transaction, it is confirmed on-chain, and the record is written to the ledger automatically. A Solscan link is provided on every confirmed transfer.

- Recipient ATA is created automatically if it does not exist
- Confirmation awaited before recording the transaction
- Works with any AUDD balance on mainnet

### On-Chain AUDD Receive

The RECEIVE button shows your wallet address with a one-click copy and a scannable Solana Pay QR code. Any Phantom or Solflare user can scan and send AUDD directly to your address in one tap.

### Wallet Connection

Connect Phantom or Solflare directly from the dashboard header. Live AUDD balance is read from Solana mainnet RPC in real time. No custodial accounts, no seed phrase entry.

**AUDD Mint:** `AuDDuMCindiXzSrBgUvXL5uJkr5kXRpEhMJPBiSTGzj`

### Invoices

Create professional invoices payable in AUDD and send them to a client wallet address or email. Tracks the full lifecycle: draft → sent → paid. Overdue invoices surface automatically.

### Payment Links with Solana Pay QR

Generate a shareable payment link for any AUDD amount. Each link card shows:

- An inline Solana Pay QR preview
- A full-screen QR modal for scanning with any Solana Pay wallet
- Total received, payment count, and a copyable link URL

Any Phantom, Solflare, or Solana Pay compatible app can scan and pay in one tap.

### Recurring Payments

Schedule weekly or monthly AUDD payments to any wallet address. Track next run date, total paid, and payment count. Toggle any schedule on or off without deleting it.

### Split and Settle

Create a shared expense, add participants, and assign AUDD shares. Track who has settled and who still owes. Splits close automatically when all participants have paid.

### Contacts

Save wallet addresses with display names and notes. Reuse them across invoices, payment links, recurring payments, and payment requests without re-entering addresses.

### Transaction History

A complete ledger of every AUDD movement with type indicators, counterparty names, and dates. Export any subset to CSV for accounting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Solana Mainnet · AUDD SPL Token |
| Wallet | Phantom · Solflare via `@solana/wallet-adapter` |
| On-Chain | `@solana/web3.js` · `@solana/spl-token` |
| Payment QR | Solana Pay URL protocol · `api.qrserver.com` |
| Frontend | React 19 · Vite 6 · TypeScript 5 |
| Styling | Tailwind CSS v4 · Space Mono · shadcn/ui |
| Backend | Node.js · Express |
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
cd PayMate-SolanaAUDD
npm install --legacy-peer-deps
npm run build
```

The frontend builds as a fully static Vite output — no server required for the UI. The API server connects to a PostgreSQL database and auto-seeds demo data on first boot.

---

## Roadmap

| Status | Milestone |
|---|---|
| ✅ Complete | Phantom + Solflare wallet connection, live AUDD balance from Solana mainnet |
| ✅ Complete | Real on-chain AUDD SPL token send — wallet signs and confirms on mainnet |
| ✅ Complete | Receive modal with wallet address, one-click copy, and Solana Pay QR |
| ✅ Complete | Solana Pay QR codes on every payment link card and full-screen modal |
| ✅ Complete | Invoices, Payment Links, Recurring, Splits, Contacts, Transaction History |
| ✅ Complete | Demo seed data — all pages pre-populated on first boot, no setup needed |
| ✅ Complete | Mobile responsive — tested on iPhone Safari and Android Chrome |
| ✅ Complete | Deployed and live on Vercel with SPA routing |
| 🔜 Next | On-chain invoice settlement via Solana Pay request protocol |
| 🔜 Next | Recurring payment on-chain execution with cron and on-chain verification |
| 🔜 Next | Split and Settle on-chain partial settlement tracking |
| 🔜 Next | Production domain, security audit, and public launch |

---

## Grant Application

Applying for the **[SolAUDD Superteam Earn Grant Program](https://earn.superteam.fun/)**.

**Amount requested:** AUDD 10,000

**What is already live and working:**
- Real on-chain AUDD send from any connected wallet — signed and confirmed on mainnet
- Solana Pay QR receive on the dashboard and every payment link
- All seven feature modules fully implemented with demo data
- Clean TypeScript codebase with zero type errors
- Deployed on Vercel: [paymate-solana.vercel.app](https://paymate-solana.vercel.app)

**What the grant funds:**
- On-chain invoice settlement using the Solana Pay request protocol
- Recurring payment execution layer with on-chain verification per payout
- Split and Settle contract settlement with partial payment tracking
- 12 months of production infrastructure and domain
- Security review prior to public launch

PayMate is the only application built specifically to make AUDD usable as an everyday business payment tool for Australian users. The core infrastructure is complete and live. The grant funds the final on-chain automation layer.

---

## License

MIT. See [LICENSE](LICENSE) for details.

---

<div align="center">

<sub>Built for the SolAUDD Superteam Earn Grant Program · <a href="https://paymate-solana.vercel.app">paymate-solana.vercel.app</a></sub>

</div>
