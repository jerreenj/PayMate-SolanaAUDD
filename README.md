# PayMate

**Your AUD on Solana.**

PayMate is a production-grade finance application for Australian freelancers, merchants, and teams who want to send, receive, and manage money using [AUDD](https://audd.io), the Australian dollar stablecoin built on Solana.

This is a working product, not a prototype.

## The Problem

Australian businesses and freelancers moving money on-chain face a fragmented toolset. Crypto wallets handle transfers but not invoicing. Accounting software handles invoicing but not on-chain settlement. Stablecoins like AUDD solve the currency risk problem but leave the product layer completely empty.

PayMate fills that gap. It is purpose-built for AUDD on Solana: a single application that handles every workflow a freelancer, merchant, or small team needs to actually use stablecoin payments in their day-to-day business.

The goal is not to build another generic crypto wallet. The goal is to make AUDD as usable and familiar as a bank transfer, with the programmability and settlement speed of Solana underneath.

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
