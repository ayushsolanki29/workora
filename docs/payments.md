# Payments — Feature Documentation

**Route:** `/dashboard/payments`

**Access:** Authenticated users only. Data is scoped to the organization.

---

## Overview

The Payments page is a **read-only ledger** of every payment recorded across all invoices in the organization. It gives a single unified view of all money received, sorted by most recent first. Payments are not created or edited here directly — they are recorded against specific invoices (either from the invoice detail page, the invoice list, or the "Record Payment" button on this page itself).

The only action this page owns is opening the **Global Record Payment dialog** — a standalone flow that lets you record a payment without navigating to a specific invoice first.

---

## Page — Payments List

**Route:** `/dashboard/payments`  
**Component type:** Client component

On load: `GET /payments` — returns all payments for the organization, each with nested `invoice` (including `invoiceNumber`, `currency`, `client.name`) ordered by `date` descending.

---

### Header

- **Title:** "Payments"
- **Subtitle:** "Manage and view all payments received."
- **"Record Payment" button** (top-right): Opens the Global Record Payment dialog

---

### Payments Table

6 columns, no pagination (all payments returned in one request), skeleton loader (5 rows × 6 cols) while fetching.

| Column | Content | Notes |
|---|---|---|
| Date | Formatted payment date | — |
| Invoice | Invoice avatar (`DynamicAvatar` type: `invoice`, 28px) + clickable invoice number | Links to `/dashboard/invoices/[invoiceId]?tab=payments` — opens the invoice detail directly on the Transactions tab |
| Client | Client avatar (`DynamicAvatar` type: `client`, 28px) + client name | Plain text, no link |
| Method | Payment method string | e.g. Bank Transfer, Cash, Credit Card |
| Reference | Reference string | `—` if none |
| Amount | `+[amount]` in the invoice's currency, right-aligned | Green (`text-emerald-600`), always prefixed with `+` |

**Amount currency note:** The amount is shown in the **invoice's currency** (not master currency). There is no exchange rate conversion displayed on this page — for converted amounts, see the invoice detail or the dashboard KPI cards.

**Empty state:** Centered `CreditCardIcon` (large, faded) + "No payments found."

---

### Row Behavior

- Rows are **not** clickable as a whole
- Only the Invoice cell is a link (→ `/dashboard/invoices/[invoiceId]?tab=payments`)
- No row actions, no edit, no delete on this page

---

## Global Record Payment Dialog

Opened by the "Record Payment" button on this page. This is a different dialog from the one on the invoice detail page — it adds an **invoice selection step** at the top, making it a self-contained flow that works without knowing which invoice to pay upfront.

**Component:** `GlobalRecordPaymentDialog`

**On open:**
- Loads all non-Paid, non-Cancelled invoices via `GET /invoices`
- Resets all form fields to defaults

---

### Invoice Selection (first field)

A dropdown showing all invoices with status not `Paid` or `Cancelled`. Each option displays:

```
[invoiceNumber] - [clientName] ($[remaining balance] due)
```

- While loading invoices: dropdown shows "Loading..." and is disabled
- If no pending invoices exist: shows "No pending invoices found" (disabled option)
- Selecting an invoice reveals the rest of the form fields and **auto-fills the Amount** with the full remaining balance

The remaining balance is computed client-side as `invoice.totalAmount - invoice.paidAmount`.

---

### Form Fields (shown after invoice is selected)

| Field | Type | Notes |
|---|---|---|
| Payment Amount | Number (step 0.01) | Auto-filled with remaining balance. Max capped at remaining balance. Must be > 0. |
| Payment Date | Date | Defaults to today |
| Payment Method | Dropdown | Bank Transfer (default), Credit Card, Cash, Check, Other |
| Reference | Text | Optional — transaction ID, check number, etc. |

Remaining balance is shown below the amount field as helper text.

---

### Submit behavior

`POST /invoices/[selectedInvoiceId]/payments` with `{ amount, date, method, reference }`

- On success: toast "Payment recorded successfully!" → closes dialog → refreshes the payments list (`fetchPayments()`)
- On error: toast "Failed to record payment"
- Submit button is disabled while submitting, if no invoice is selected, or if remaining balance is 0

---

## How Payments Are Created (Full Picture)

Payments can be recorded from three places in the app. All of them post to the same endpoint:

`POST /invoices/[id]/payments`

| Entry point | When to use |
|---|---|
| Payments page → "Record Payment" button | When you want to log a payment but don't want to navigate to the invoice first. Shows invoice picker. |
| Invoice list → `⋯` menu → "Record Payment" | When you're already looking at the list and want to quickly record against a specific invoice. Pre-filled with that invoice's remaining balance. |
| Invoice detail → "Record Payment" button | When you're already on the invoice and want to record a payment for it. Pre-filled with remaining balance. No invoice picker needed. |

---

## Data Model — Payment Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Internal |
| `invoiceId` | UUID | Links to the parent invoice |
| `amount` | Float | In the invoice's currency |
| `date` | DateTime | User-provided payment date |
| `method` | String | Bank Transfer, Credit Card, Cash, Check, Other |
| `reference` | String (nullable) | Optional transaction reference |

Payments are stored as child records of invoices. The invoice's `paidAmount` field is updated server-side when a payment is recorded (increment transaction). There is no standalone payment creation — payments always belong to an invoice.

---

## API Endpoints

| Action | Method | Endpoint |
|---|---|---|
| List all payments | GET | `/payments` |
| Record a payment | POST | `/invoices/[id]/payments` |
| Load invoices for picker | GET | `/invoices` |

Note: `GET /payments` returns all payments org-wide with no filtering or pagination. `POST /invoices/[id]/payments` is the only write endpoint — it lives under the invoices router, not payments.

---

## Navigation From Payments

| Element | Destination |
|---|---|
| Invoice link in table | `/dashboard/invoices/[invoiceId]?tab=payments` |
| "Record Payment" button | Opens Global Record Payment dialog (stays on page) |

---

## Related Documentation

- [invoices.md](./invoices.md) — Payments are recorded against invoices; the Record Payment dialog (invoice-specific version) and the Transactions tab are documented there
- [dashboard.md](./dashboard.md) — Recent Payments table on the main dashboard
- [clients.md](./clients.md) — Recent Payments table on the client detail page
