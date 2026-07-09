# Invoices — Feature Documentation

**Routes:**
- List: `/dashboard/invoices`
- Create: `/dashboard/invoices/new`
- Edit: `/dashboard/invoices/[id]/edit`
- Detail: `/dashboard/invoices/[id]`
- Detail (Payments tab): `/dashboard/invoices/[id]?tab=payments`
- Detail (Activity tab): `/dashboard/invoices/[id]?tab=activity`

**Access:** Authenticated users only. All data is scoped to the organization.

---

## Overview

The Invoices module handles the full lifecycle of a client invoice — from creation with line items, tax, and discount, through delivery, partial payments, and final settlement. Every invoice is tied to a client and optionally to a project.

The module's standout feature is **built-in multi-currency support with live exchange rate conversion**, described in detail in its own section below.

---

## ★ Multi-Currency & Exchange Rate System

> This is a core differentiator of Soseki. Most invoicing tools either lock you to one currency or require manual rate entry. Soseki automatically fetches live exchange rates and stores them at invoice creation time, so your reporting is always accurate in your home currency — no matter what currency your client pays in.

### How it works

Every organization sets a **Master Currency** in workspace settings (e.g. INR, USD). This is the currency used for all reporting, dashboards, and KPI calculations.

When you create an invoice, you can choose **any invoice currency** (USD, EUR, GBP, INR, CAD, AUD) regardless of your master currency. The moment you select a currency different from your master currency, the system:

1. Calls the live exchange rate API (`https://open.er-api.com/v6/latest/[invoiceCurrency]`)
2. Fetches the conversion rate to your master currency in real time
3. Shows the rate inline: *"Exchange Rate: 1 USD = 83.4200 INR"*
4. Stores the `exchangeRate` value on the invoice permanently at save time

The stored exchange rate is a snapshot — it captures the rate at the time the invoice was created, not recalculated later. This is intentional: it gives you a stable, auditable reference amount that matches what you agreed on.

### Where the conversion appears

**Invoice list page — Amount column:**
- Primary line: invoice total converted to master currency (e.g. `₹83,420`)
- Secondary line: original amount in invoice currency (e.g. `$1,000.00`)

**Invoice detail page — Amount Due summary card:**
- Primary: balance due in the invoice's own currency
- Secondary (muted): balance due converted to master currency using stored exchange rate

**Invoice detail page — Overview tab totals panel:**
- "Grand Total (USD)" — the actual invoice total in invoice currency
- "Reference Amount (INR)" — the converted total in master currency (only shown when currencies differ)
- "Amount Paid" — payments received so far in invoice currency

**PDF Preview — Summary section:**
- Full exchange rate block shown when currencies differ:
  - "Reference Amount (INR)" — total converted
  - "Exchange Rate: 1 USD = INR 83.42"
- **Payment Summary block** (blue left-border panel):
  - Total Invoice Amount in invoice currency
  - Reference in master currency (if different)
  - Total Paid so far (green)
  - Balance Due Amount (red)

**KPI cards on the list page:**
All four summary cards (Total Invoiced, Outstanding Amount, Paid Total) are computed in master currency — every invoice's amount is multiplied by its stored `exchangeRate` before summing. This means your dashboard always reflects your real financial position in your home currency, even when invoices were issued in different currencies.

```
totalInvoiced    = Σ (invoice.totalAmount × invoice.exchangeRate)
totalPaid        = Σ (invoice.paidAmount  × invoice.exchangeRate)
totalOutstanding = totalInvoiced − totalPaid
```

### Currency options available in the invoice form

USD, EUR, GBP, INR, CAD, AUD

### Rate fetch behavior

- Rate is fetched **when the currency dropdown changes** in the form
- If invoice currency equals master currency → exchange rate is set to `1.0` without a network call
- If the form is opened in **edit mode** and the currency hasn't changed from the saved value, the stored exchange rate is used (no re-fetch) — preserving the original snapshot
- While fetching: the rate display shows `"..."` instead of the number
- If the API fails, the rate stays at whatever it was previously (no crash)

---

## Page 1 — Invoices List

**Route:** `/dashboard/invoices`

---

### Header

- **Title:** "Invoices"
- **Subtitle:** "Create, manage, and track invoices for your clients."
- **Export button** (outline): UI present, functionality not yet implemented
- **New Invoice button**: Navigates to `/dashboard/invoices/new`

On load, two parallel API calls are made:
- `GET /invoices` (with optional status filter)
- `GET /organization` — to load `masterCurrency` and org details for the PDF preview

---

### KPI Summary Cards

Four cards displayed in a 2×2 (mobile) / 4-column (desktop) grid, **all values in master currency**:

| Card | Value | How calculated |
|---|---|---|
| Total Invoiced | Sum of all invoice totals | `Σ totalAmount × exchangeRate` |
| Outstanding Amount | Total invoiced minus total paid | `totalInvoiced − totalPaid` |
| Paid Total | Sum of all paid amounts | `Σ paidAmount × exchangeRate` |
| Overdue Invoices | Count | Simple count of `status === 'Overdue'` invoices |

These cards update in real time when the status filter changes (because the invoice list changes).

---

### Search & Filter

**Search input** — UI present but the filter is **not wired** to the API currently (the `query` param is sent as a URL input field but is not connected to the `fetchInvoices` call).

**Status filter dropdown:**

| Option | Filters to |
|---|---|
| All Statuses | All invoices |
| Draft | Draft only |
| Sent | Sent only |
| Partially Paid | Partially Paid only |
| Paid | Paid only |
| Overdue | Overdue only |
| Cancelled | Cancelled only |

Changing the filter re-fetches immediately (no debounce).

---

### Invoices Table

7 columns. Entire row is clickable → navigates to `/dashboard/invoices/[id]`.

| Column | Content | Notes |
|---|---|---|
| Invoice # | `DynamicAvatar` + invoice number | — |
| Client | Client name | `—` if not linked |
| Invoice Date | Formatted issue date | — |
| Due Date | Formatted due date | — |
| Amount | **Two-line display** | Primary: total in master currency. Secondary (muted): original amount in invoice currency — only shown when they differ |
| Status | Colored badge | See status table below |
| Actions | `⋯` dropdown (click stops row propagation) | See below |

**Amount column detail** — this is where the multi-currency conversion is visible at a glance:
```
₹83,420.00         ← master currency (always shown)
($1,000.00)        ← invoice currency (only when different from master)
```

**Status badges:**

| Status | Badge style |
|---|---|
| Draft | Outline (faint border) |
| Sent | Secondary (muted) |
| Partially Paid | Default (solid) |
| Paid | Default (solid) |
| Overdue | Destructive (red) |
| Cancelled | Secondary (muted) |

**Empty state:** Full-height centered panel with `FileTextIcon`, "No invoices yet", description, and a "Create Invoice" button.

#### Row Actions Dropdown (`⋯` menu)

| Action | Behavior |
|---|---|
| View | Navigates to `/dashboard/invoices/[id]` |
| Edit | Navigates to `/dashboard/invoices/[id]/edit` |
| Download PDF | Opens `InvoicePreviewDialog` modal with A4 preview |
| Record Payment | Opens `RecordPaymentDialog` modal |
| Delete | Opens a confirmation dialog modal (see below) |

**Delete confirmation dialog:** "Are you sure you want to delete invoice [number]? This action cannot be undone and will remove all associated payment records." — Cancel / Delete Invoice (hard delete via `DELETE /invoices/[id]`).

---

---

## Page 2 — Create / Edit Invoice (Invoice Form)

**Routes:**
- Create: `/dashboard/invoices/new`
- Edit: `/dashboard/invoices/[id]/edit`

The same `InvoiceForm` component is used for both. In edit mode it receives `initialData` from the parent.

On mount, four parallel API calls:
- `GET /clients` — to populate client dropdown
- `GET /projects` — to populate project dropdown
- `GET /organization` — to get `masterCurrency`
- `GET /quick-items` — to populate the Quick Add Services panel

**Loading state:** Full skeleton grid while these load.

---

### Section 1 — General Details

A 2-column card with the following fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Client | Dropdown | Yes | Lists all org clients. Inline "Add new" link → opens `CreateClientDialog`, auto-selects the new client |
| Project | Dropdown | No | Filtered to projects belonging to the selected client. Selecting a project auto-fills `clientId`. "Add new" link → `CreateProjectDialog`. "None" option clears the project link. |
| Invoice Number | Text | Yes | Auto-generated as `INV-[random 4-digit]` on create. Editable. |
| Currency | Dropdown | No | USD, EUR, GBP, INR, CAD, AUD. Defaults to org's master currency. **Changing this triggers a live exchange rate fetch.** |
| Issue Date | Date | No | Defaults to today |
| Due Date | Date | Yes | Required |

**Exchange rate display** (appears below the Currency field when invoice currency ≠ master currency):
> `Exchange Rate: 1 USD = 83.4200 INR`
> Shows `"..."` while fetching, updates when currency changes.

---

### Section 2 — Line Items

A table of invoice items. At least one item is always present (remove is disabled when only one remains).

| Column | Input | Behavior |
|---|---|---|
| Item Description | Text input | Free text, e.g. "Web Design" |
| Quantity | Number input (min: 1) | — |
| Price | Number input (min: 0, step: 0.01) | Unit price in invoice currency |
| Total | Computed, read-only | `quantity × unitPrice`, updates live |
| (remove) | Trash icon button | Removes the row. Disabled when only 1 item remains |

**Add Item button:** Appends a blank row.

#### Quick Add Services (★ power feature)

A "Quick Add Services" button opens a popover panel. This lets you save reusable service templates and add them to any invoice in one click.

**Panel sections:**

**Saved Services list** — your previously saved services, each showing name + default price in master currency. Clicking one instantly adds it as a line item. If the current item list is a single empty row, it replaces it rather than appending.

**Create New form** (bottom of panel):
- Service name input
- Default price input
- "Save" button → `POST /quick-items` → saves the service AND adds it to the current invoice immediately

---

### Section 3 — Totals & Notes

Two side-by-side panels:

**Left panel — Text fields:**
- **Invoice Notice** — highlighted at the top of the PDF in an amber/yellow block. For urgent notes like "Rush job, 24h turnaround."
- **Notes** — additional notes for the client (shown in PDF and invoice detail view)
- **Terms & Conditions** — payment terms, bank details, etc.

**Right panel — Summary:**

| Line | Value |
|---|---|
| Subtotal | Auto-computed: `Σ (quantity × unitPrice)` across all items |
| Discount | Editable number input (inline in summary) |
| Tax | Editable flat-amount number input (inline in summary) |
| Grand Total | `subtotal − discount + tax`, shown in invoice currency |
| Balance Due | Same as Grand Total (on create; after payments recorded, this shows the difference) |

---

### Submit Buttons

Two buttons at the bottom:
- **Save as Draft** — saves with `status: "Draft"`
- **Create & Send Invoice** — saves with `status: "Sent"`

Both buttons are disabled while submitting. On success: toast + redirect to `/dashboard/invoices`.

---

---

## Page 3 — Invoice Detail

**Route:** `/dashboard/invoices/[id]`

On load, two parallel calls: `GET /invoices/[id]` (includes items, payments, activities, expenses, client, project) and `GET /organization`.

---

### Header Bar

- Back button → `/dashboard/invoices`
- `DynamicAvatar` (type: `invoice`, size: 56px, seeded by `invoiceNumber`)
- Invoice number as `h1`
- Status badge
- ID badge: `INV-xxxxx`, monospace, dashed outline

**Action buttons:**

| Button | Behavior |
|---|---|
| Edit | Navigates to `/dashboard/invoices/[id]/edit` |
| PDF | Opens `InvoicePreviewDialog` |
| Record Payment | Opens `RecordPaymentDialog` |
| Delete | Opens confirmation dialog. Hard delete + redirect to `/dashboard/invoices`. |

---

### Summary Cards Row

Four info cards in a 2×2 / 4-column grid:

| Card | Content |
|---|---|
| Client | Client name with `BuildingIcon` |
| Issue Date | Formatted issue date |
| Due Date | Formatted due date |
| Amount Due | Balance in invoice currency (primary, bold, primary color) + converted balance in master currency (secondary, muted) — **only shown when currencies differ** |

---

### Tab Navigation

Three tabs, stored as URL query param (`?tab=`):

| Tab | URL | Label |
|---|---|---|
| Overview (default) | `?tab=overview` | "Overview" |
| Transactions | `?tab=payments` | "Transactions" |
| Activity | `?tab=activity` | "Activity" |

Tab state is stored in the URL (via `router.replace`) so it survives page refresh and can be linked directly (e.g. `/dashboard/invoices/[id]?tab=payments`).

---

### Overview Tab

**Line Items table:**

| Column | Content |
|---|---|
| Description | Item description text |
| Qty | Quantity |
| Price | Unit price (hardcoded `$` symbol — uses raw `toLocaleString` instead of `formatCurrency`) |
| Tax | Tax rate percentage |
| Total | Item total |

**Bottom panel** (left + right):

Left side: Notes and Terms & Conditions (each shown only if set, with `whitespace-pre-wrap`).

Right side — Totals breakdown:
- Subtotal (invoice currency)
- Discount (invoice currency)
- Tax (invoice currency)
- **Grand Total ([currency])** — invoice total in invoice currency
- **Reference Amount ([masterCurrency])** — converted total — **only shown when currencies differ**
- Amount Paid (green)

---

### Transactions Tab (`?tab=payments`)

**Payment History table:**

| Column | Content |
|---|---|
| Date | Formatted payment date |
| Method | Payment method string |
| Reference | Transaction ID / check number, or `—` |
| Amount | `+[amount]` in invoice currency, green text |

Empty state: "No payments have been recorded for this invoice yet."

**Linked Expenses table:**

| Column | Content |
|---|---|
| Date | Formatted expense date |
| Description | Expense description |
| Category | Category name |
| Amount | `-[amount]` in invoice currency, red text |

Empty state: "No expenses have been linked to this invoice."

---

### Activity Tab (`?tab=activity`)

A vertical timeline with a left border and primary-colored dot markers. Each entry shows:
- Event description (e.g. "Invoice created", "Status changed to Sent")
- Full timestamp (`toLocaleString`)

Events are auto-created by the backend on creation (`CREATED`) and on every update (`UPDATED` with description of what changed).

Empty state: "No activity recorded."

---

---

## Record Payment Dialog

Accessible from: row `⋯` menu on list page, "Record Payment" button on detail page.

**Pre-fills:** Amount = remaining balance (`totalAmount − paidAmount`). Date = today.

**Fields:**

| Field | Type | Notes |
|---|---|---|
| Payment Amount | Number (step 0.01) | Max capped at remaining balance. Validated: must be > 0 and ≤ remaining |
| Payment Date | Date | Defaults to today |
| Payment Method | Dropdown | Bank Transfer (default), Credit Card, Cash, Check, Other |
| Reference | Text | Optional — transaction ID, check number, etc. |

On submit: `POST /invoices/[id]/payments` → toast "Payment recorded successfully!" → closes dialog → refreshes invoice data. The invoice `paidAmount` and status are updated server-side.

Submit button is **disabled** when remaining balance is 0 (already fully paid).

---

## PDF Preview Dialog

Opens as a large modal (max-width 5xl, 90vh tall). Contains a scrollable A4-sized canvas (210mm wide, min 297mm tall) rendered as HTML/CSS — not a real PDF yet (download shows an alert).

**A4 canvas sections:**

| Section | Content |
|---|---|
| Header | "INVOICE" + invoice number (left), org name + address (right) |
| Notice block | Amber/yellow highlighted box — only shown if `invoice.notice` is set |
| Meta row | "Billed To" (client name + email) on left, Issue Date + Due Date on right |
| Line items table | Description, Qty, Price, Total |
| Summary panel | Subtotal, Tax, Discount, **Grand Total ([currency])** |
| Exchange rate block | **Only shown when invoice currency ≠ master currency:** "Reference Amount ([master])" and "Exchange Rate: 1 [invoice] = [master] [rate]" |
| Payment Summary block | Blue left-border panel: Total Invoice Amount (in invoice currency), Reference in master currency (if different), Total Paid so far (green), Balance Due Amount (red) |
| Notes / Terms | Below the items table |
| Footer | `organization.invoiceFooterNote` or "Thank you for your business!" |

---

## Data Model — Invoice Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Displayed as `INV-xxxxx` |
| `invoiceNumber` | String | User-editable, e.g. "INV-1234" |
| `clientId` | UUID | Required |
| `projectId` | UUID (nullable) | Optional |
| `status` | Enum | `Draft`, `Sent`, `Paid`, `Overdue`, `Cancelled` |
| `issueDate` | DateTime | Defaults to now |
| `dueDate` | DateTime | Required |
| `currency` | String | ISO code, e.g. `"USD"`, `"INR"` |
| `subtotal` | Float | Sum of line item totals |
| `taxAmount` | Float | Flat tax amount |
| `discountAmount` | Float | Flat discount amount |
| `totalAmount` | Float | `subtotal − discount + tax` |
| `paidAmount` | Float | Updated by payment records |
| `exchangeRate` | Float | **Stored at save time.** Rate from invoice currency to master currency. `1.0` when same currency. |
| `notice` | String (nullable) | Highlighted notice shown at top of PDF |
| `notes` | String (nullable) | Client-facing notes |
| `terms` | String (nullable) | Payment terms / bank details |
| `organizationId` | UUID | Auto-set from session |

### InvoiceItem Fields

| Field | Type |
|---|---|
| `description` | String |
| `quantity` | Int |
| `unitPrice` | Float |
| `taxRate` | Float (%) |
| `total` | Float (`quantity × unitPrice`) |

### InvoiceActivity

Auto-created events logged to the Activity tab:
- `CREATED` — on invoice creation
- `UPDATED` — on every `PATCH` call, with description of what changed

---

## Status Lifecycle

```
Draft  ──►  Sent  ──►  Partially Paid  ──►  Paid
  │           │                │
  └───────────┴────────────────┴──►  Overdue
                                     │
                                     └──►  Cancelled
```

Status can be freely updated via Edit. `paidAmount` is updated automatically when payments are recorded — the transition from `Sent` → `Partially Paid` → `Paid` is currently driven by manual status changes (not auto-computed from payment sum).

---

## Invoice Avatar

- **Type:** `invoice`
- **DiceBear style:** `identicon` — unique geometric/symmetric pattern
- **Shape:** Rounded square (`rounded-md`, `radius: 10`)
- **Seed:** `invoice.invoiceNumber`
- **Sizes:** `32px` in list table, `56px` in detail page header

---

## API Endpoints

| Action | Method | Endpoint |
|---|---|---|
| List invoices | GET | `/invoices?status=&clientId=&projectId=` |
| Create invoice | POST | `/invoices` |
| Get invoice | GET | `/invoices/[id]` |
| Update invoice | PATCH | `/invoices/[id]` |
| Delete invoice | DELETE | `/invoices/[id]` |
| Record payment | POST | `/invoices/[id]/payments` |
| Get org (for masterCurrency) | GET | `/organization` |
| Get quick items | GET | `/quick-items` |
| Create quick item | POST | `/quick-items` |
| Live exchange rate | GET | `https://open.er-api.com/v6/latest/[currency]` (external) |

---

## Navigation

| Element | Destination |
|---|---|
| Row click (list) | `/dashboard/invoices/[id]` |
| "View" in menu (list) | `/dashboard/invoices/[id]` |
| "Edit" in menu (list) | `/dashboard/invoices/[id]/edit` |
| "New Invoice" button | `/dashboard/invoices/new` |
| Back button (new/detail) | `/dashboard/invoices` |
| Edit button (detail) | `/dashboard/invoices/[id]/edit` |
| After save (form) | `/dashboard/invoices` |
| After delete | `/dashboard/invoices` |
| Payment tab link (from elsewhere) | `/dashboard/invoices/[id]?tab=payments` |

---

## Related Documentation

- [clients.md](./clients.md) — Invoices shown in client detail page
- [projects.md](./projects.md) — Invoices linked to projects via `projectId`
- [dashboard.md](./dashboard.md) — Recent Invoices table and Invoice Status pie chart
- [global.md](./global.md) — Invoices searchable by `invoiceNumber` and `notice` (`INV-` prefix for ID lookup)
