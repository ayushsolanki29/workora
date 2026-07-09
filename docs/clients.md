# Clients — Feature Documentation

**Routes:**
- List: `/dashboard/clients`
- Detail: `/dashboard/clients/[id]`

**Access:** Authenticated users only. All data is scoped to the user's organization.

---

## Overview

The Clients module is where all client and lead records are managed. A client can be in one of three lifecycle states — `Lead` (prospect), `Active` (working relationship), or `Inactive` (soft-deleted/archived). The module has two pages: a paginated list view with search/filter, and a detail view that shows the client's full history across projects, invoices, and expenses.

---

## Page 1 — Clients List

**Route:** `/dashboard/clients`  
**Component type:** Client component (all data fetched client-side)

---

### Header

- **Title:** "Clients"
- **Subtitle:** "Manage your clients and organizations here."
- **"New Client" button** (top-right): Opens the Add Client slide-over sheet.

---

### Search & Filter Bar

Two controls side by side (stacked on mobile):

#### Search Input
- Text field with a search icon, placeholder: "Search clients..."
- Searches by client **name** or **email** (case-insensitive, contains match)
- **Debounced** — waits 300ms after the user stops typing before firing the API call
- Resets pagination to page 1 when the query changes

#### Status Filter (dropdown)
| Option | Behavior |
|---|---|
| Active & Lead *(default)* | Shows all clients where status is not `Inactive` |
| All Statuses | Shows every client regardless of status |
| Active Only | Shows only `Active` clients |
| Lead Only | Shows only `Lead` clients |
| Inactive Only | Shows only `Inactive` clients |

Changing the filter resets pagination to page 1.

---

### Clients Table

A standard data table with 6 columns. Shows a skeleton loader (5 rows × 6 columns) while fetching.

| Column | Content | Notes |
|---|---|---|
| Name | DynamicAvatar + clickable name link | Links to `/dashboard/clients/[id]` — hovering underlines the name |
| Email | Plain text email address | — |
| Phone | Phone number or `—` if not set | — |
| Status | Colored badge | `Active` → default (solid), `Lead` → secondary (muted), `Inactive` → outline (faint) |
| Added On | Formatted creation date, right-aligned, muted | — |
| Actions | `⋯` dropdown menu | See below |

**Empty state:** "No clients found." centered in the table body.

#### Row Actions Dropdown (`⋯` menu)

Each row has a three-dot menu in the last column:

| Action | Behavior |
|---|---|
| View details | Navigates to `/dashboard/clients/[id]` |
| Edit client | Opens the Edit Client slide-over sheet pre-filled with this client's data |
| Delete client | Confirms via `window.confirm`, then sends `PATCH /clients/[id]` with `{ status: "Inactive" }` — this is a **soft delete**, not permanent. Shows toast on success/failure. |

---

### Pagination

Shown below the table:

- **Left:** "Showing X of Y results" (current page count vs total)
- **Center:** "Page X of Y"
- **Right:** Previous / Next buttons

| Control | Behavior |
|---|---|
| Previous | Decrements page, disabled on page 1 or while loading |
| Next | Increments page, disabled on last page or while loading |
| Page size | Fixed at 10 results per page |

---

### Add / Edit Client Slide-over Sheet

A slide-over panel (`Sheet`) from the right side of the screen.

**Triggered by:**
- "New Client" button in the header → opens in **create** mode
- "Edit client" in any row's `⋯` menu → opens in **edit** mode pre-filled

**Title/description:**
- Create mode: "Add New Client" / "Create a new client profile for your organization."
- Edit mode: "Edit Client" / "Update client details and status."

**Form fields:**

| Field | Type | Required | Validation |
|---|---|---|---|
| Name | Text input | Yes | Cannot be empty |
| Email | Email input | Yes | Must be a valid email format. Must be unique within the organization — duplicate emails are rejected with a 400 error from the API. Email is stored lowercase. |
| Phone | Tel input | No | Optional, can be blank |
| Status | Segmented button toggle (3 options) | — | `Lead` (orange), `Active` (green), `Inactive` (red) |

**Status defaults:**
- Create mode: defaults to `Active`
- Edit mode: pre-populated from the existing client's status

**Submit behavior:**
- Create mode: sends `POST /clients` — on success, shows toast "Client created successfully!", closes sheet, refreshes list
- Edit mode: sends `PATCH /clients/[id]` — on success, shows toast "Client updated successfully!", closes sheet, refreshes list
- On API error: shows toast with the error message from the server
- While submitting: all fields and buttons are disabled, button label shows "Saving..."

**Cancel button:** Closes the sheet without saving.

---

### API Calls (List Page)

| Action | Method | Endpoint | Params |
|---|---|---|---|
| Load clients | GET | `/clients` | `query`, `status`, `page`, `limit=10` |
| Create client | POST | `/clients` | body: `name`, `email`, `phone`, `status` |
| Edit client | PATCH | `/clients/[id]` | body: any subset of `name`, `email`, `phone`, `status` |
| Soft delete | PATCH | `/clients/[id]` | body: `{ status: "Inactive" }` |

---

---

## Page 2 — Client Detail

**Route:** `/dashboard/clients/[id]`  
**Component type:** Client component

On load, two parallel API calls are made:
1. `GET /clients/[id]` — full client record including related projects, invoices (with payments), and expenses
2. `GET /organization` — to get `masterCurrency` for currency conversion display

If the client is not found or the request fails, the user is redirected back to `/dashboard/clients` with an error toast.

---

### Header / Client Identity Bar

A horizontal bar at the top of the page.

**Back button** (arrow icon, left): Navigates to `/dashboard/clients`.

**Client identity block:**
- Large `DynamicAvatar` (56px, seeded by client name)
- Client name as `h1`
- Status badge (color varies):
  - `Active` → default (solid)
  - `Lead` → secondary (muted)
  - `Inactive` → destructive (red)
- ID badge in monospace font: formatted as `CLI-xxxxx`, dashed border outline style

**Contact info row** (below name):
- Email with `MailIcon`
- Phone with `PhoneIcon` — only shown if the client has a phone number

**Action buttons (top-right):**

| Button | Condition | Behavior |
|---|---|---|
| Edit Client (outline) | Always visible | Opens the Edit Client slide-over sheet |
| Delete (destructive/red) | Only shown when status is NOT `Inactive` | Confirms via `window.confirm`, sends `PATCH /clients/[id]` `{ status: "Inactive" }`, shows success toast, redirects to `/dashboard/clients` |

---

### Loading State

While data is loading, the entire page renders a skeleton layout that mirrors the final layout: a skeleton header bar with avatar, name, badges, and two action buttons, followed by three skeleton card sections with full-width skeleton tables inside them.

---

### Section 1 — Projects

A card with a `BriefcaseIcon` in the header titled "Projects".

Displays all projects linked to this client using the shared `ProjectsTable` component.

**Table columns:**

| Column | Content |
|---|---|
| Project Title | Clickable text — clicking anywhere on the row navigates to `/dashboard/projects/[id]` |
| Start Date | Formatted start date |
| Est. End Date | Formatted estimated end date, or `—` if not set |
| Status | Badge: `Planning` → outline, `Active` → default, `Completed` → secondary, `On Hold` → destructive |

**Empty state:** "No projects found."

**Data source:** `client.projects` from `GET /clients/[id]`, ordered by `createdAt` descending.

---

### Section 2 — Invoices & Payments

A card with a `FileTextIcon` in the header titled "Invoices & Payments".

Displays all invoices linked to this client using the shared `InvoicesTable` component.

**Table columns:**

| Column | Content | Notes |
|---|---|---|
| Invoice # | Invoice number text | Clicking the row navigates to `/dashboard/invoices/[id]` |
| Issue Date | Formatted issue date | — |
| Due Date | Formatted due date | — |
| Total Amount | Formatted currency in invoice's own currency | If invoice currency differs from org `masterCurrency`, a secondary row shows the converted amount |
| Paid Amount | Sum of all linked payments in invoice currency | Same multi-currency display as Total Amount |
| Status | Badge | `Paid` → default, `Draft` → outline, `Sent` → secondary, `Overdue` → destructive, `Partially Paid` → outline |

**Empty state:** "No invoices found."

**Multi-currency note:** The "Paid Amount" is computed client-side by summing all `invoice.payments[].amount`. The `exchangeRate` stored on the invoice is used to convert to `masterCurrency` when they differ.

**Data source:** `client.invoices` from `GET /clients/[id]`, each with nested `payments[]`, ordered by `issueDate` descending.

---

### Section 3 — Expenses

A card with a `DollarSignIcon` in the header titled "Expenses".

Displays all expenses linked to this client using the shared `ExpensesTable` component.

**Table columns:**

| Column | Content | Notes |
|---|---|---|
| Date | Formatted expense date | — |
| Category | Category name, or `—` if uncategorized | — |
| Description | Truncated to 200px max-width | — |
| Amount | Formatted currency in expense's currency | If expense currency differs from `masterCurrency`, a secondary row shows the converted amount |
| Status | Badge | `Pending` → outline, `Approved` → default, `Rejected` → destructive, `Paid` → secondary |

**Row click behavior:** Navigates to `/dashboard/expenses?receipt=[expenseId]` — this opens the expenses page with the receipt/detail for that specific expense pre-opened.

**Empty state:** "No expenses found."

**Data source:** `client.expenses` from `GET /clients/[id]`, ordered by `date` descending.

---

### Edit Client Sheet (on Detail Page)

Identical to the Edit sheet on the list page (same `ClientForm` component). Triggered by the "Edit Client" button in the header.

On successful save:
- Closes the sheet
- Re-fetches the client data to refresh the page (`fetchClient()`)
- Shows toast "Client updated successfully!"

---

### API Calls (Detail Page)

| Action | Method | Endpoint | Returns |
|---|---|---|---|
| Load client + relations | GET | `/clients/[id]` | Client with `projects`, `invoices` (with `payments`), `expenses` |
| Load org currency | GET | `/organization` | `organization.masterCurrency` |
| Edit client | PATCH | `/clients/[id]` | Updated client object |
| Soft delete client | PATCH | `/clients/[id]` | `{ status: "Inactive" }` |

---

## Data Model — Client Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Displayed as `CLI-xxxxx` (formatted) |
| `name` | String | Trimmed on save |
| `email` | String | Stored lowercase, unique per organization |
| `phone` | String (nullable) | Optional |
| `status` | Enum | `Active`, `Lead`, `Inactive` |
| `organizationId` | UUID | Auto-set from session |
| `createdAt` | DateTime | Used for "Added On" and sorting |

---

## Status Lifecycle

```
Lead  ──►  Active  ──►  Inactive
 ▲             │
 └─────────────┘  (can be toggled freely via Edit)
```

- "Delete" in the UI always sets status to `Inactive` — no record is ever permanently removed
- An `Inactive` client does not show the "Delete" button on the detail page (already archived)
- The default list filter hides `Inactive` clients — they must be viewed using "All Statuses" or "Inactive Only"

---

## Navigation From Clients

| Element | Destination |
|---|---|
| Row click (list) | `/dashboard/clients/[id]` |
| "View details" in `⋯` menu | `/dashboard/clients/[id]` |
| Back button (detail page) | `/dashboard/clients` |
| Projects table row (detail) | `/dashboard/projects/[id]` |
| Invoices table row (detail) | `/dashboard/invoices/[id]` |
| Expenses table row (detail) | `/dashboard/expenses?receipt=[expenseId]` |
| After soft-delete (detail) | `/dashboard/clients` |

---

## Client Avatar

Every client gets an auto-generated avatar via the `DynamicAvatar` component. No image is stored — the avatar is generated on the fly from the client's name and is always the same for the same name.

- **Type:** `client`
- **DiceBear style:** `thumbs` — friendly illustrated character
- **Shape:** Circle (`rounded-full`)
- **Seed:** `client.name`
- **Size:** varies by usage — `32px` in list table rows, `56px` in the detail page header

If no name is available (no seed), a gradient placeholder `div` is shown using the app's primary color instead.

The avatar is purely cosmetic. Renaming a client changes its avatar since the seed changes.

---

## Related Documentation

- [dashboard.md](./dashboard.md) — Recent Clients table on the main dashboard
- [global.md](./global.md) — Global Search (clients searchable by name, email, `CLI-` prefix) and full DynamicAvatar system reference
