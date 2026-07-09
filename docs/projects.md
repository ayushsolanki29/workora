# Projects — Feature Documentation

**Routes:**
- List: `/dashboard/projects`
- Detail: `/dashboard/projects/[id]`

**Access:** Authenticated users only. All data is scoped to the user's organization.

---

## Overview

The Projects module tracks work engagements for clients — each project belongs to exactly one client and has a title, description, timeline (start date + optional estimated end date), and a status. Unlike clients, **deleting a project is permanent** (hard delete via `DELETE /projects/[id]`). The list page has no pagination — all projects are returned at once and filtered client-side via a status dropdown.

---

## Page 1 — Projects List

**Route:** `/dashboard/projects`  
**Component type:** Client component

---

### Header

- **Title:** "Projects"
- **Subtitle:** "Manage your projects and their timelines."
- **"New Project" button** (top-right): Opens the Add Project slide-over sheet.

---

### Filter Bar

Only a status filter — no text search on this page (use Global Search `⌘K` for that).

#### Status Filter (dropdown)

| Option | Behavior |
|---|---|
| All Statuses *(default)* | Returns all projects regardless of status |
| Planning | Only `Planning` projects |
| Active | Only `Active` projects |
| Completed | Only `Completed` projects |
| On Hold | Only `On Hold` projects |

Changing the filter immediately re-fetches from the API (no debounce, no pagination reset needed since there's no pagination).

---

### Projects Table

6 columns. Shows a skeleton loader (5 rows × 6 columns) while fetching.

| Column | Content | Notes |
|---|---|---|
| Project Title | `DynamicAvatar` (project type) + clickable title link | Links to `/dashboard/projects/[id]`, underlines on hover |
| Client | Client name (plain text) | `—` if no client linked |
| Start Date | Formatted start date | — |
| Est. End Date | Formatted estimated end date | `—` if not set |
| Status | Color-coded inline badge (see below) | Auto-computes `Overdue` if past end date |
| Actions | Right-aligned `⋯` dropdown | See row actions below |

**Empty state:** "No projects found." centered in the table body.

#### Status Badge Colors

Status is computed at render time — if the stored status is not `Completed`, `Cancelled`, or `Draft` and the `estimatedEndDate` is in the past, the displayed status becomes `Overdue` regardless of the stored value.

| Display Status | Color |
|---|---|
| `Active`, `In Progress` | Green |
| `Planning`, `Review` | Amber |
| `Overdue`, `Cancelled`, `On Hold` | Red |
| `Completed`, `Draft`, others | Muted gray |

#### Right-click context menu

Right-clicking any row (`onContextMenu`) opens the same `⋯` actions dropdown for that row.

#### Row Actions Dropdown (`⋯` menu)

| Action | Behavior |
|---|---|
| View details | Navigates to `/dashboard/projects/[id]` |
| Edit project | Opens the Edit Project slide-over sheet pre-filled |
| Delete project | Confirms via `window.confirm` ("This action cannot be undone."), then sends `DELETE /projects/[id]`. **This is a hard delete — the record is permanently removed.** Shows toast on success/failure. |

---

### Add / Edit Project Slide-over Sheet

A scrollable slide-over panel from the right. Header and footer are fixed; the form scrolls independently.

**Triggered by:**
- "New Project" button → create mode
- "Edit project" in any row's `⋯` menu → edit mode pre-filled

**Title/description:**
- Create: "Add New Project" / "Create a new project for a specific client."
- Edit: "Edit Project" / "Update project details and timeline."

**Form fields:**

| Field | Type | Required | Validation / Notes |
|---|---|---|---|
| Project Title | Text input | Yes | Cannot be empty |
| Client | Native `<select>` dropdown | Yes | Loads all org clients (up to 100) on mount via `GET /clients?limit=100`. Cannot submit without selecting one. |
| Description | Textarea | No | Optional, multi-line, min-height 100px |
| Start Date | Date picker | Yes | Defaults to today in create mode |
| Est. End Date | Date picker | No | Optional. Displayed as "Est. End Date (Optional)" |
| Status | 2×2 segmented button grid | — | Options: `Planning`, `Active`, `Completed`, `On Hold`. Selected option gets a white background with shadow. Defaults to `Planning` in create mode. |

**Inline client creation:** Next to the Client dropdown there is a `+` icon button that opens the `CreateClientDialog`. If a new client is created from there, it is automatically appended to the dropdown list and selected in the form — no page refresh needed.

**Submit behavior:**
- Create: `POST /projects` → toast "Project created successfully!" → closes sheet → refreshes list
- Edit: `PATCH /projects/[id]` → toast "Project updated successfully!" → closes sheet → refreshes list
- On error: toast with server error message
- While submitting: all fields and buttons disabled, button shows "Saving..."

**Cancel:** Closes sheet without saving.

---

### API Calls (List Page)

| Action | Method | Endpoint | Params / Body |
|---|---|---|---|
| Load projects | GET | `/projects` | `status` filter param |
| Load clients (for form) | GET | `/clients` | `limit=100` |
| Create project | POST | `/projects` | `title`, `description`, `startDate`, `estimatedEndDate`, `status`, `clientId` |
| Edit project | PATCH | `/projects/[id]` | Any subset of the above fields |
| Delete project | DELETE | `/projects/[id]` | — |

---

---

## Page 2 — Project Detail

**Route:** `/dashboard/projects/[id]`  
**Component type:** Client component

On load: `GET /projects/[id]` — returns project with nested `client` object.

If the project is not found or fetch fails, redirects to `/dashboard/projects` with an error toast.

---

### Header / Project Identity Bar

**Back button:** Navigates to `/dashboard/projects`.

**Project identity block:**
- `DynamicAvatar` (type: `project`, size: 56px, seeded by `project.title`)
- Project title as `h1`
- Status badge (same variant logic as the list page)
- ID badge: formatted `PRJ-xxxxx`, monospace, dashed outline

**Subtitle:** "Project Details and Timeline" (static)

**Action buttons (top-right):**

| Button | Behavior |
|---|---|
| Edit Project (outline) | Opens the Edit Project slide-over sheet |
| Delete (destructive) | Confirms via `window.confirm`, sends `DELETE /projects/[id]`, redirects to `/dashboard/projects` on success. **Hard delete — permanent.** |

> Note: Unlike Clients, there is no "soft delete" — the Delete button always permanently removes the project.

---

### Loading State

Full skeleton layout mirroring the real page: back button skeleton, header identity block skeleton, a 2/3 + 1/3 grid with a description card skeleton and two sidebar card skeletons (Client Info + Timeline).

---

### Main Content Grid (2 columns on md+)

#### Left column (2/3 width) — Overview Card

- Title: "Overview"
- Body: `project.description` rendered as preformatted text (`whitespace-pre-wrap`, `prose-sm`)
- If no description: "No description provided." (muted)

#### Right column (1/3 width) — two stacked cards

**Client Information card:**
- Shows a clickable row with a `UserIcon` in a rounded primary-tinted background, client name (bold), and client email (muted)
- The entire row is a `<Link>` to `/dashboard/clients/[project.clientId]`
- Hovering the row shows a `bg-muted/50` background

**Timeline card:**
- Start Date row: `CalendarIcon` + label "Start Date" + formatted date
- Estimated End Date row: same structure but wrapped in a `bg-muted/50 p-3 rounded-md` highlight block. Only shown if `estimatedEndDate` is set.

---

### Invoices & Payments Section

A full-width card with `FileTextIcon` in the header, titled "Invoices & Payments".

Uses the shared `InvoicesTable` component.

> **Note:** The backend `GET /projects/[id]` currently only includes `client` in its Prisma query — it does not include `invoices` or `expenses`. The frontend renders these sections using `project.invoices` and `project.expenses`, which will be `undefined` and show as empty tables ("No invoices found." / "No expenses found.") until the backend query is updated to include them.

For the table columns and behavior, see the Invoices & Payments section in [clients.md](./clients.md) — it uses the identical shared `InvoicesTable` component.

---

### Expenses Section

A full-width card with `DollarSignIcon` in the header, titled "Expenses".

Uses the shared `ExpensesTable` component. Same note as above — currently renders empty due to the backend not including expenses in the project detail query.

Row click navigates to `/dashboard/expenses?receipt=[expenseId]`.

For full column details see [clients.md](./clients.md).

---

### Edit Project Sheet (on Detail Page)

Same `ProjectForm` component as the list page. On successful save: closes sheet, re-fetches the project (`fetchProject()`), shows toast.

---

### API Calls (Detail Page)

| Action | Method | Endpoint | Returns |
|---|---|---|---|
| Load project | GET | `/projects/[id]` | Project with nested `client` |
| Edit project | PATCH | `/projects/[id]` | Updated project |
| Delete project | DELETE | `/projects/[id]` | — |

---

## Data Model — Project Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID | — | Displayed as `PRJ-xxxxx` |
| `title` | String | Yes | Min 1 character |
| `description` | String | No | Optional free text |
| `startDate` | DateTime | Yes | ISO date, converted to `Date` on save |
| `estimatedEndDate` | DateTime | No | Optional, can be cleared (set to `null`) |
| `status` | Enum | No | `Planning` (default), `Active`, `Completed`, `OnHold`, `Cancelled` |
| `clientId` | UUID | Yes | Must reference an existing client in the same org |
| `organizationId` | UUID | — | Auto-set from session |

---

## Status Lifecycle

```
Planning  ──►  Active  ──►  Completed
    │              │
    └──────────────┴──►  On Hold
                   │
                   └──►  Cancelled
                   
(Any status + past estimatedEndDate = displayed as Overdue in UI)
```

- Statuses are freely editable — any status can be set at any time via the Edit form
- `Overdue` is **not** a stored status — it is computed in the UI only when `estimatedEndDate < today` and the stored status is not `Completed`, `Cancelled`, or `Draft`
- Deleting a project is permanent (hard delete) — there is no archive/inactive state like clients

---

## Project Avatar

- **Type:** `project`
- **DiceBear style:** `shapes` — abstract colorful geometric shapes
- **Shape:** Rounded square (`rounded-md`, `radius: 10`)
- **Seed:** `project.title`
- **Size:** `32px` in the list table, `56px` in the detail page header

Same determinism rules as all avatars — same title always produces the same avatar. Renaming a project changes its avatar.

---

## Navigation From Projects

| Element | Destination |
|---|---|
| Row click / "View details" (list) | `/dashboard/projects/[id]` |
| Back button (detail) | `/dashboard/projects` |
| Client Information card (detail) | `/dashboard/clients/[clientId]` |
| Invoices table row (detail) | `/dashboard/invoices/[id]` |
| Expenses table row (detail) | `/dashboard/expenses?receipt=[expenseId]` |
| After hard delete (detail) | `/dashboard/projects` |

---

## Related Documentation

- [clients.md](./clients.md) — Projects are shown in the client detail page; shared `InvoicesTable` and `ExpensesTable` components documented there
- [dashboard.md](./dashboard.md) — Active Projects table on the main dashboard
- [global.md](./global.md) — Projects are searchable by title (`PRJ-` prefix for ID lookup)
