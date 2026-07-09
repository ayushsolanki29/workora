# Soseki — Documentation Index

---

## What is Soseki?

Soseki is an open-source business management platform built for freelancers, agencies, and small teams. It replaces the mess of spreadsheets, disconnected invoicing tools, and manual client tracking with a single workspace that covers the full lifecycle of client work — from first contact to final payment.

The name comes from the Japanese novelist Natsume Soseki, known for his precise, uncluttered writing. The product follows the same philosophy: no bloat, no unnecessary complexity, just the tools you actually need to run a service business.

It is self-hostable, open-source, and designed so that no vendor can ever lock you in.

---

## Who it's for

- Freelancers managing multiple clients and projects
- Small agencies billing in different currencies across different countries
- Any service business migrating away from tools like QuickBooks, FreshBooks, Wave, or spreadsheets

---

## ★ Major USPs

### 1. Multi-Currency Invoicing with Live Exchange Rates

Most invoicing tools either lock you to one currency or make you enter exchange rates manually. Soseki automatically fetches live exchange rates when you create an invoice or log an expense in a foreign currency, stores the rate as an auditable snapshot on that record, and converts everything to your master currency for reporting.

Every financial figure on the dashboard — total revenue, outstanding payments, profit — is always shown in your home currency, even when your clients pay in USD, EUR, GBP, or INR. You never have to do mental math to know where your business stands.

See: [invoices.md](./invoices.md), [expenses.md](./expenses.md), [workspace-settings.md](./workspace-settings.md)

---

### 2. AI-Assisted Data Migration — Migrate from Anything

Switching tools is painful because your old data is usually locked in some proprietary format. Soseki solves this with a built-in AI-assisted migration tool that works with any source — PDFs, Excel files, CSVs, QuickBooks exports, messy text dumps, anything.

The workflow: download Soseki's JSON template + a carefully engineered AI prompt → paste them into ChatGPT or Claude along with your old data → the AI produces a structured JSON file → upload it to Soseki → done. Clients, projects, invoices, line items, payments — all imported in one shot, with relationships intact.

The import engine handles missing fields gracefully, remaps AI-generated IDs to real database UUIDs, recomputes invoice totals from line items rather than trusting the AI's math, and skips records with broken relationships instead of failing the whole import.

See: [migration.md](./migration.md)

---

### 3. AI-Assisted Questionnaire Builder

Soseki includes a shareable form builder for collecting structured information from clients — onboarding forms, project briefs, feedback surveys. Each form gets a unique public URL that anyone can fill without logging in. Forms can be capped at a maximum number of responses and toggled on/off instantly.

The builder has two creation modes: a drag-and-drop field builder (Short Text, Long Text, Dropdown, Radio, Checkbox), and an AI import mode — paste raw survey data or questions into ChatGPT using the built-in prompt, get back structured JSON, paste it into Soseki, and the form is built automatically.

See: [questionnaires.md](./questionnaires.md)

---

### 4. Zero Lock-in Architecture

Soseki is open-source and self-hostable. There is no SaaS lock-in, no per-seat pricing surprises, and no API dependency on a third party for core features. The only external call is the free `open.er-api.com` exchange rate API, which degrades gracefully if unavailable. All your data lives in your own PostgreSQL database.

---

## Feature Overview

### Dashboard
The main landing page after login. A real-time snapshot of the entire workspace — 8 KPI stat cards (revenue, outstanding payments, profit, overdue invoices, active projects, etc.), a monthly Revenue vs Expenses line chart, an Invoice Status donut chart, five data tables (active projects, recent invoices, recent clients, recent payments, recent questionnaires), an activity timeline, and an upcoming deadlines widget. All currency values on the dashboard are converted to master currency automatically.

A fixed Hover Quick Actions panel on the right edge lets you jump to Add Client, Create Project, Generate Invoice, Record Payment, or Create Form from anywhere on the page.

→ [dashboard.md](./dashboard.md)

---

### Clients
Full client lifecycle management. Three states: Lead → Active → Inactive (soft delete, never permanently removed). Paginated, searchable, filterable list. Each client has a detail page showing all their linked projects, invoices (with payment breakdowns and multi-currency conversion), and expenses. Editing is done via a right-side slide-over panel.

→ [clients.md](./clients.md)

---

### Projects
Track work engagements linked to clients. Each project has a title, description, start date, optional estimated end date, and a status (Planning, Active, Completed, On Hold). The list is filterable by status. The detail page shows the project's client, timeline, and linked invoices and expenses. Deleting a project is a **hard delete** (permanent), unlike clients.

→ [projects.md](./projects.md)

---

### Invoices
The financial core of Soseki. Create professional invoices with multiple line items, per-item tax rates, flat discounts, and a tax total. Each invoice can have a currency different from your master currency — the exchange rate is fetched live and stored as a snapshot. Invoices support a full status lifecycle (Draft → Sent → Partially Paid → Paid / Overdue / Cancelled), an activity log, and a PDF preview rendered as an A4 HTML canvas.

The invoice form includes a **Quick Add Services** feature — save frequently used service line items and add them to any invoice in one click.

→ [invoices.md](./invoices.md)

---

### Payments
A unified read-only ledger of every payment received across all invoices. Payments are recorded against specific invoices — from the invoice detail page, the invoice list, or the Payments page's Global Record Payment dialog (which includes an invoice picker so you can record without navigating to the invoice first).

→ [payments.md](./payments.md)

---

### Expenses
Track all outgoing costs — software, contractors, hardware, travel, or any custom category. Each expense can be linked to a client, project, and/or invoice for full cost attribution. Like invoices, expenses support multi-currency with live exchange rates. An expense receipt can be previewed as a printable A4 voucher. Expenses surface in the client detail page, project detail page, and the invoice Transactions tab — all linked via a `?receipt=[id]` deep link URL.

→ [expenses.md](./expenses.md)

---

### Questionnaires
Shareable forms for collecting structured data from clients. Each form gets a permanent public URL (`/q/[slug]`) — no login required for respondents. Supports Short Text, Long Text, Dropdown, Radio, and Checkbox field types. Response cap, status toggle (Active/Paused/Closed), and full response viewer with CSV export. Two creation modes: drag-and-drop builder and AI JSON import.

→ [questionnaires.md](./questionnaires.md)

---

### Data Migration
AI-assisted import from any previous tool or data format. Four-step flow: watch tutorial → download JSON template + copy AI prompt → run through ChatGPT/Claude with your old data → upload the generated JSON → one-click import. Supports clients, projects, invoices (with line items), and payments in a single batch. The import engine resolves relationships, handles missing fields, recomputes totals, and updates invoice paid amounts atomically.

→ [migration.md](./migration.md)

---

### Support Tickets
In-app support channel for reporting issues or requesting features directly to the Soseki team. Threaded conversation UI — user messages on the left, Soseki Support replies on the right (primary-colored bubble). Support replies are identified server-side by checking against the `SuperUser` table, never hardcoded. Tickets can have Low / Medium / High priority and Open / Resolved status. Resolved tickets lock the message input.

→ [support.md](./support.md)

---

### Workspace Settings
Two-part setup: a first-time onboarding page (`/setup-organization`) that creates the workspace, sets the user's display name, and picks the master currency — and an ongoing settings page with three independent sections: General (org name, billing address, date format), Financial (invoice and expense PDF footer notes), and Currency Management (master currency, locked once transactions exist).

→ [workspace-settings.md](./workspace-settings.md)

---

## Global Features

### Global Search (`⌘K`)
Available on every dashboard page. Command-palette style dialog. Searches clients (name, email), projects (title), invoices (number, notice), questionnaires (title), and support tickets (title). Also supports ID prefix search: `CLI-`, `PRJ-`, `INV-`, `FRM-`, `SPT-`. Selecting a result navigates directly to the record.

### DynamicAvatar System
Every entity in the app — clients, projects, invoices, expenses, users, organizations, questionnaires — gets a deterministic auto-generated avatar using DiceBear. Same entity name always produces the same avatar. No image storage needed. Each entity type uses a distinct visual style (thumbs for clients, shapes for projects, identicon for invoices, initials for users, etc.).

→ [global.md](./global.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (httpOnly cookie), session table |
| Charts | Recharts |
| Avatars | DiceBear (`@dicebear/core`, `@dicebear/collection`) |
| Exchange rates | open.er-api.com (free, no key required) |
| Email | Queue-based worker with preference management |
| PDF | HTML/CSS A4 canvas (browser-rendered) |

---

## Data Model — Entity Relationships

```
Organization
  ├── Users (many)
  ├── Clients (many)
  │     ├── Projects (many)
  │     ├── Invoices (many)
  │     │     ├── InvoiceItems (many)
  │     │     ├── Payments (many)
  │     │     ├── Activities (many)
  │     │     └── Expenses (many, optional link)
  │     ├── Expenses (many, optional link)
  │     └── Questionnaires (many, optional link)
  ├── Projects (many)
  │     ├── Invoices (many, optional link)
  │     ├── Expenses (many, optional link)
  │     └── Questionnaires (many, optional link)
  ├── Questionnaires (many)
  │     ├── QuestionnaireFields (many)
  │     └── QuestionnaireResponses (many)
  ├── Expenses (many)
  ├── QuickItems (many)
  └── SupportTickets (many)
        └── SupportTicketMessages (many)
```

---

## Documentation Files

| File | Covers |
|---|---|
| [index.md](./index.md) | This file — project overview, USPs, feature list |
| [dashboard.md](./dashboard.md) | Main dashboard page — all widgets, charts, stat cards |
| [clients.md](./clients.md) | Client list, detail page, add/edit form |
| [projects.md](./projects.md) | Project list, detail page, builder form |
| [invoices.md](./invoices.md) | Invoice list, create/edit form, detail page, PDF preview, multi-currency system |
| [payments.md](./payments.md) | Payments ledger, record payment dialog |
| [expenses.md](./expenses.md) | Expenses list, record/edit form, receipt preview, deep link system |
| [questionnaires.md](./questionnaires.md) | Form builder, responses, AI import, public form (`/q/[slug]`) |
| [migration.md](./migration.md) | AI-assisted data migration — full flow, import engine, JSON schema |
| [support.md](./support.md) | Support ticket list, new ticket, threaded chat |
| [workspace-settings.md](./workspace-settings.md) | Organization setup (onboarding) and settings page |
| [global.md](./global.md) | Global Search (`⌘K`) and DynamicAvatar system |
