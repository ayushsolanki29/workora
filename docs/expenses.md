# Expenses — Feature Documentation

**Route:** `/dashboard/expenses`

**Access:** Authenticated users only. Data is scoped to the organization.

---

## Overview

The Expenses module tracks all outgoing costs for the organization — software subscriptions, contractor fees, hardware, travel, etc. Each expense can optionally be linked to a client, project, and/or invoice, making it easy to see the cost associated with specific work. Like invoices, expenses support **multi-currency with live exchange rate conversion**, so every cost is tracked accurately against your master currency.

There is no separate detail page — all expense actions happen directly on the list page through a slide-over form and a receipt preview dialog.

---

## Where Expenses Appear Across the App

Before covering the page itself, here is every place expenses surface in the app:

| Location | What shows | How to get there |
|---|---|---|
| Expenses page (`/dashboard/expenses`) | Full list of all org expenses | Sidebar → Expenses |
| Client detail page (`/dashboard/clients/[id]`) | All expenses linked to that client, in a card at the bottom | Click any client → scroll to Expenses section |
| Invoice detail → Transactions tab (`/dashboard/invoices/[id]?tab=payments`) | All expenses linked to that invoice | Click any invoice → "Transactions" tab → "Linked Expenses" table |
| Dashboard — Profit stat card | Total expenses are subtracted from total revenue to compute profit | Main dashboard KPI cards |
| Dashboard — Revenue Overview chart | Monthly expenses plotted against monthly revenue | Main dashboard chart |
| Linked via URL (`/dashboard/expenses?receipt=[id]`) | Opens the receipt dialog for a specific expense | Used by the expenses table rows on client and project detail pages — clicking a row there navigates here with `?receipt=[expenseId]` |

---

## Page — Expenses List

**Route:** `/dashboard/expenses`  
**Component type:** Client component

On load, two parallel calls:
- `GET /expenses` — all org expenses ordered by date descending, each including nested `client`, `project`, `invoice`
- `GET /organization` — for `masterCurrency` and org details used in the receipt preview

---

### Deep Link: `?receipt=[expenseId]`

The expenses page supports a URL query param that auto-opens the receipt dialog for a specific expense. When the page loads and `?receipt=[id]` is present in the URL:

1. It waits for the expenses list to load
2. Finds the matching expense by ID
3. Automatically opens the `ExpenseReceiptDialog` for that expense

**This is how expense rows on the Client detail page and Project detail page work** — clicking a row in those tables navigates to `/dashboard/expenses?receipt=[expenseId]`, landing you directly on the receipt for that expense.

When the receipt dialog is closed via this deep link, the URL is cleaned up (`router.replace('/dashboard/expenses')`) so the `?receipt=` param is removed.

---

### Header

- **Title:** "Expenses"
- **Subtitle:** "Manage and view all outgoing expenses."
- **"Record Expense" button**: Opens the Record Expense slide-over in create mode

---

### Expenses Table

7 columns, no pagination (all expenses in one request), skeleton loader (5 rows × 7 cols) while fetching.

| Column | Content | Notes |
|---|---|---|
| Date | Formatted expense date | — |
| Description | `DynamicAvatar` (expense type, 32px) + description text | Avatar seeded by description |
| Category | Category string | e.g. Software, Contractor, Hardware, Travel, or a custom value |
| Linked Client | Client avatar (28px) + client name | Shows `—` if no client linked. Plain text, not a link. |
| Linked Invoice | Invoice avatar (28px) + clickable invoice number | Links to `/dashboard/invoices/[invoiceId]`. Shows `—` if no invoice linked. |
| Amount | `-[amount]` in the expense's currency, right-aligned | Red (`text-destructive`), prefixed with `−`. Currency resolved in this order: `expense.currency` → `expense.invoice.currency` → `organization.masterCurrency` → `"USD"` |
| Actions | Three icon buttons (eye, edit, trash) | See below |

**Empty state:** Centered `ReceiptIcon` (large, faded) + "No expenses found."

#### Row Action Buttons

Three ghost icon buttons on the right of every row:

| Button | Icon | Behavior |
|---|---|---|
| View Receipt | `EyeIcon` | Opens the `ExpenseReceiptDialog` for this expense |
| Edit | `EditIcon` | Opens the Record Expense slide-over in edit mode, pre-filled with this expense's data |
| Delete | `Trash2Icon` | Confirms via `window.confirm`, sends `DELETE /expenses/[id]`, refreshes list on success |

Delete is **hard delete** — the expense record is permanently removed.

---

## Record / Edit Expense Slide-over

A right-side slide-over sheet (`Sheet`). Used for both creating new expenses and editing existing ones.

**Triggered by:**
- "Record Expense" button (header) → create mode
- Edit icon button on any row → edit mode, pre-filled

**Title / description:**
- Create: "Record Expense" / "Record a new outgoing expense."
- Edit: "Edit Expense" / "Update this outgoing expense."

---

### Form Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Description | Text | Yes | e.g. "Domain purchase", "Subcontractor fee" |
| Currency | Dropdown | No | USD, EUR, GBP, JPY, CAD, AUD, INR. Defaults to org `masterCurrency` on create. **Changing this triggers a live exchange rate fetch** — same system as invoices. |
| Amount | Number (min 0.01, step 0.01) | Yes | In the selected currency |
| Date | Date picker | Yes | Defaults to today |
| Category | Dropdown + optional custom input | No | Predefined: Software, Contractor, Hardware, Travel, Other. Selecting "Other" reveals a free-text "Specify custom category..." input. |
| Link to Client | Dropdown | No | All org clients. "None" option clears the link. |
| Link to Invoice | Dropdown | No | All org invoices (not filtered by client in the backend, though the form's `items` array in the source does filter by `clientId` for the dropdown display). "None" clears the link. |

**Exchange rate display** (below Currency field, when expense currency ≠ master currency):
> `Exchange Rate: 1 USD = 83.4200 INR`
> Shows `"Fetching rate..."` animated text in the label area while loading.

**In edit mode:** If the currency hasn't changed from the saved value, the stored exchange rate is used without re-fetching.

---

### Submit Behavior

- Create: `POST /expenses` → toast "Expense recorded successfully!" → closes sheet → refreshes list
- Edit: `PATCH /expenses/[id]` → toast "Expense updated successfully!" → closes sheet → refreshes list
- On error: toast "Failed to record expense"
- While submitting: buttons disabled, submit shows "Saving..."
- Cancel button: closes sheet without saving

---

## Expense Receipt Dialog

A printable A4-style receipt rendered in HTML, viewable in a large modal (max-width 4xl, 90vh).

**Triggered by:**
- Eye icon button on any expense row (from the list page)
- Deep link URL: `/dashboard/expenses?receipt=[expenseId]` (used by client and project detail pages)

**Canvas sections:**

| Section | Content |
|---|---|
| Header | "EXPENSE VOUCHER" + date + Ref: `EXP-[first 6 chars of ID]` (left), org name + address (right) |
| Details row | Description + category (left), linked client name + email (right — only shown if client is linked) |
| Line item table | Description column + Amount column |
| Total | "TOTAL PAID" in bold with the formatted amount |
| Confirmation block | Green left-border panel: "✓ This expense has been fully recorded." |
| Footer | `organization.invoiceFooterNote` or "Thank you!" |

The currency used for the receipt amount is resolved as: `expense.invoice.currency` → `organization.masterCurrency` → `"USD"`.

**"Share via Email" button:** Present but not yet implemented — shows an alert placeholder.

---

## Multi-Currency on Expenses

Expenses follow the same exchange rate pattern as invoices:

- Each expense stores its own `currency` and `exchangeRate` (rate from expense currency to master currency)
- When the currency dropdown changes in the form, a live rate is fetched from `https://open.er-api.com/v6/latest/[currency]`
- The `exchangeRate` is stored on the expense at save time as a snapshot
- The dashboard uses `expense.amount` (without exchange rate) for the monthly expense chart — **note:** the Revenue Overview chart plots raw `expense.amount` grouped by month without applying `exchangeRate`, so multi-currency expenses may show slightly different values than the master-currency-converted totals on the dashboard stat cards

---

## Data Model — Expense Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Shown in receipt as `EXP-[first 6 chars]` |
| `description` | String | Required |
| `amount` | Float | Must be > 0 |
| `date` | DateTime | Defaults to now |
| `category` | String | Predefined or custom. Defaults to `"Other"` if not provided |
| `currency` | String (nullable) | ISO currency code |
| `exchangeRate` | Float (nullable) | Stored at save time, rate to master currency |
| `clientId` | UUID (nullable) | Optional link to a client |
| `projectId` | UUID (nullable) | Optional link to a project |
| `invoiceId` | UUID (nullable) | Optional link to an invoice |
| `organizationId` | UUID | Auto-set from session |

---

## API Endpoints

| Action | Method | Endpoint |
|---|---|---|
| List all expenses | GET | `/expenses` |
| Create expense | POST | `/expenses` |
| Update expense | PATCH | `/expenses/[id]` |
| Delete expense | DELETE | `/expenses/[id]` |
| Load clients (for form) | GET | `/clients` |
| Load invoices (for form) | GET | `/invoices` |
| Load org (for masterCurrency + receipt) | GET | `/organization` |
| Live exchange rate | GET | `https://open.er-api.com/v6/latest/[currency]` (external) |

No GET by ID endpoint exists — the full expense object is already available from the list, so the dialogs work with the data already in state.

---

## Navigation & Deep Links

| Element | Destination |
|---|---|
| Sidebar → Expenses | `/dashboard/expenses` |
| Linked Invoice cell in table | `/dashboard/invoices/[invoiceId]` |
| Expense row on Client detail page | `/dashboard/expenses?receipt=[expenseId]` |
| Expense row on Project detail page | `/dashboard/expenses?receipt=[expenseId]` |
| `?receipt=[id]` on page load | Auto-opens the receipt dialog for that expense |
| Close receipt dialog (from deep link) | Cleans URL → `/dashboard/expenses` |

---

## Related Documentation

- [clients.md](./clients.md) — Expenses section on client detail page; row click navigates here via `?receipt=` deep link
- [projects.md](./projects.md) — Expenses section on project detail page; same deep link behavior
- [invoices.md](./invoices.md) — Linked Expenses table in the Transactions tab; exchange rate system shared with expenses
- [dashboard.md](./dashboard.md) — Expenses feed the Profit stat card and Revenue Overview chart
