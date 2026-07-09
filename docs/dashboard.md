# Dashboard — Feature Documentation

**Route:** `/dashboard`  
**Access:** Authenticated users only. Unauthenticated users are redirected to `/login`.

---

## Overview

The dashboard is the main landing page after login. It gives the user a real-time snapshot of their entire workspace — revenue, projects, invoices, clients, payments, and questionnaires — in a single view. It is the hub from which all other modules are reachable.

The page is a **React Server Component** (`Dashboard`) that fetches data server-side via `GET /dashboard/data`. Three client-side sub-components (`DashboardStats`, `RevenueOverviewChart`, `InvoiceStatusChart`) load their own data independently with skeleton loaders so the page feels fast.

---

## Sections

### 1. Welcome Banner

A full-width hero image (`/banner.jpeg`) with a dark gradient overlay and personalized text overlay at the bottom-left.

**What it shows:**
- A time-aware greeting: "Good morning / Good afternoon / Good evening, [FirstName]"
- Workspace context subtitle with three live counters:
  - Number of **active projects**
  - Number of **pending invoices**
  - Number of **active questionnaires**
- If the organization name matches the user's own name (common for freelancers), the subtitle reads "Here is your workspace summary for today" instead of mentioning the org name to avoid repetition.

**Data source:** `GET /dashboard/data` → `counts`, `organization`, `user`

---

### 2. KPI Stat Cards

A row of 8 metric cards rendered by `DashboardStats`. Each card shows:
- A **label**
- A **primary value** (number or currency)
- A **delta badge** (% change with a colored arrow, green = good, red = bad) — some cards omit the delta
- A **footnote** explaining the comparison period

**Data source:** `GET /dashboard/stats`

| Card | Value | Delta | Footnote |
|---|---|---|---|
| Total Revenue | Sum of all payment amounts ever received | % change: last 30 days vs prior 30 days | "vs last 30 days" |
| Outstanding Payments | Sum of unpaid balances on non-Draft, non-Cancelled, non-Paid invoices | None | "currently unpaid" |
| Active Projects | Count of projects with status `Active` or `In Progress` | % change: new projects last 30 days vs prior 30 days | "new vs last 30 days" |
| Total Clients | Count of non-Inactive clients | % change: new clients last 30 days vs prior 30 days | "new vs last 30 days" |
| Overdue Invoices | Count of overdue invoices (past due date and unpaid) | % change: overdue created last 30 days vs prior 30 days | "new vs last 30 days" |
| Payments Last 30 Days | Total payment amount received in the last 30 days | % change vs prior 30 days | "vs previous 30 days" |
| Profit | Total Revenue minus Total Expenses (all time) | % change: last 30 days profit vs prior 30 days | "vs last 30 days" |
| Latest Form: [title] | Response count of the most recently created Active questionnaire | None | "responses collected" |

**Currency formatting:** All currency values use the organization's `masterCurrency` setting.

**Delta direction:** "Lower is better" flag controls whether red = up or red = down. For example, Overdue Invoices uses `lowerIsBetter: true`, so an increase in overdue invoices shows red.

**Loading state:** While fetching, each card renders a skeleton placeholder (animated gray blocks).

---

### 3. Revenue Overview Chart

A line chart spanning 3 of 4 columns.

**What it shows:**
- **Two lines** plotted month by month for the current calendar year:
  - **Revenue** (total payment amounts received per month)
  - **Expenses** (total expense amounts recorded per month)
- **X-axis:** Month abbreviations (Jan–Dec)
- **Y-axis:** Values formatted as `₹Xk` (using INR symbol by default in the chart display)
- **Header badge:** Month-over-month revenue growth percentage shown as a Delta badge next to the title
- **Tooltip:** Hovering a data point shows exact revenue and expenses values for that month

**Data source:** `GET /dashboard/charts` → `revenueOverview`, `growthPctNum`

**Loading state:** Full card skeleton with an aspect-ratio placeholder for the chart area.

---

### 4. Invoice Status Chart

A donut/pie chart showing the distribution of all invoices by status.

**What it shows:**
- **Segments:**
  - **Paid** — invoices with status `Paid`
  - **Pending** — invoices awaiting payment, not yet past due
  - **Overdue** — invoices past due date with remaining balance
  - **Draft** — invoices not yet sent
  - (Cancelled invoices are excluded from the chart)
- Each segment displays its percentage share as a label inside the slice
- A **legend** below the chart labels each segment by status name
- **Empty state:** If there are no invoices, shows "No invoices found."

**Data source:** `GET /dashboard/charts` → `invoiceStatus`

**Loading state:** Circular skeleton in place of the donut chart.

---

### 5. Active Projects Table

A data table showing up to 5 of the most recently created active/in-progress/planning projects.

**Columns:**
- **Project Name** — avatar icon + clickable project name → `/dashboard/projects/[id]` + small ID badge (`PRJ-xxxxx`)
- **Client** — clickable client name → `/dashboard/clients/[clientId]`
- **Due Date** — `estimatedEndDate` formatted as readable date, or `—` if not set
- **Status** — color-coded badge:
  - Green: `Active`, `In Progress`
  - Amber: `Planning`, `Review`
  - Red: `Overdue` (auto-computed if `estimatedEndDate` is in the past), `Cancelled`
  - Gray: `Draft`, others

**Footer action:** "View all projects" → `/dashboard/projects`

**Data source:** `GET /dashboard/data` → `recentProjects`

---

### 6. Recent Invoices Table

A data table showing up to 5 of the most recently created invoices (any status).

**Columns:**
- **Invoice** — avatar icon + clickable invoice number → `/dashboard/invoices/[id]`
- **Client** — clickable client name → `/dashboard/clients/[clientId]`
- **Amount** — `totalAmount` formatted in the invoice's currency
- **Due Date** — formatted date
- **Status** — color-coded badge:
  - Green: `Paid`
  - Amber: `Pending`
  - Red: `Overdue` (auto-computed if past due and not fully paid), `Cancelled`
  - Gray: `Draft`

**Footer action:** "View all invoices" → `/dashboard/invoices`

**Data source:** `GET /dashboard/data` → `recentInvoices`

---

### 7. Activity Timeline

A list widget showing up to 5 of the most recent events across the workspace, sorted by date (newest first).

**Event types included:**
- **Invoice generated** — "Invoice generated for [Client]" + invoice number + formatted amount
- **Project created** — "Project created" + project title
- **Payment received** — "Payment received from [Client]" + invoice number + amount
- **Questionnaire created** — "Questionnaire created" + questionnaire title

Each item has a `DynamicAvatar` icon (auto-generated color avatar seeded by the item name), a title, subtitle, and a formatted date.

**Data source:** `GET /dashboard/data` — merged from `recentInvoices`, `recentProjects`, `recentPayments`, `recentQuestionnaires`, sorted and sliced to top 5.

---

### 8. Upcoming Deadlines

A list widget showing up to 5 of the most urgent upcoming (or overdue) deadlines, sorted by closest date first.

**Items included:**
- **Project deadlines** — active/in-progress projects with an `estimatedEndDate` (up to 3 from API)
  - Format: "[Project Title] Deadline" + client name + due date
- **Invoice due dates** — pending/overdue invoices (up to 3 from API)
  - Format: "[Client Name] Invoice Due" + invoice number + due date

**Overdue handling:** If the deadline is in the past, the date is replaced with a red badge reading `"Overdue (Xd)"`, `"Overdue (Xmo)"`, or `"Overdue (Xy)"` depending on how long ago it passed. The icon also turns red (`text-destructive`).

**Data source:** `GET /dashboard/data` → `upcomingProjects`, `upcomingInvoices`

---

### 9. Recent Clients Table

A data table showing up to 5 of the most recently added clients.

**Columns:**
- **Company** — avatar icon + clickable company name → `/dashboard/clients/[id]` + ID badge (`CLI-xxxxx`)
- **Contact Email** — plain text email address
- **Status** — color-coded badge:
  - Green: `Active`
  - Gray: anything else (e.g., `Inactive`)

**Footer action:** "View all clients" → `/dashboard/clients`

**Data source:** `GET /dashboard/data` → `recentClients`

---

### 10. Recent Payments Table

A data table showing up to 5 of the most recently recorded payments.

**Columns:**
- **Client** — avatar icon + clickable client name → `/dashboard/clients/[clientId]`
- **Invoice** — clickable invoice number → `/dashboard/invoices/[invoiceId]?tab=payments` (opens directly on the Payments tab of the invoice)
- **Amount** — formatted in the invoice's currency
- **Method** — payment method string (e.g., Bank Transfer, Cash, etc.)
- **Received On** — formatted date the payment was recorded

**Footer action:** "View all payments" → `/dashboard/payments`

**Data source:** `GET /dashboard/data` → `recentPayments`

---

### 11. Recent Questionnaires Table

A full-width data table (spans all 4 columns) showing up to 5 of the most recently created questionnaires.

**Columns:**
- **Title** — avatar icon + clickable title → `/dashboard/questionnaires/[id]` + ID badge (`QST-xxxxx`)
- **Client** — clickable client name → `/dashboard/clients/[clientId]`, or `—` if not linked to a client
- **Responses** — response count, shown as `X` or `X / maxResponses` if a response cap is set
- **Created** — formatted creation date
- **Status** — color-coded badge:
  - Green: `Active`
  - Amber: `Paused`
  - Gray: others (e.g., `Draft`, `Closed`)

**Footer action:** "View all questionnaires" → `/dashboard/questionnaires`

**Data source:** `GET /dashboard/data` → `recentQuestionnaires`

---

### 12. Hover Quick Actions Panel

A fixed overlay panel anchored to the right edge of the screen, vertically centered. It sits on top of all other content (`z-50`).

**Collapsed state (default):**
- Shows a thin vertical strip with the label "Quick Actions" rotated 90°
- Hovering over the strip expands the panel

**Expanded state (on hover):**
- Slides open to show 5 action links, each with an icon and label:

| Action | Icon | Redirect |
|---|---|---|
| Add Client | UserPlus | `/dashboard/clients` |
| Create Project | Briefcase | `/dashboard/projects` |
| Generate Invoice | FileText | `/dashboard/invoices` |
| Record Payment | CreditCard | `/dashboard/payments` |
| Create Form | ClipboardList | `/dashboard/questionnaires/new` |

- Clicking any action navigates to the corresponding module page
- Panel collapses when the mouse leaves

---

## API Endpoints Used

| Endpoint | Method | When Called | Returns |
|---|---|---|---|
| `GET /dashboard/data` | GET | Server-side on page load | Projects, invoices, clients, payments, questionnaires, user, org, deadlines, counts |
| `GET /dashboard/stats` | GET | Client-side on mount (DashboardStats) | 8 KPI stat cards |
| `GET /dashboard/charts` | GET | Client-side on mount (both chart components) | Revenue line chart data + invoice status pie data |
| `GET /dashboard/search` | GET | Client-side on search input | Global search results (see `global-search.md`) |

All endpoints require an authenticated session. Data is always scoped to `req.user.organizationId` — users only ever see their own organization's data.

---

## Navigation From Dashboard

| Element | Destination |
|---|---|
| Sidebar → Dashboard | `/dashboard` (current page) |
| Sidebar → Clients | `/dashboard/clients` |
| Sidebar → Projects | `/dashboard/projects` |
| Sidebar → Questionnaires | `/dashboard/questionnaires` |
| Sidebar → Invoices | `/dashboard/invoices` |
| Sidebar → Payments | `/dashboard/payments` |
| Sidebar → Expenses | `/dashboard/expenses` |
| Sidebar → General Settings | `/dashboard/workspace/settings` |
| Sidebar → Manage Profile | `/dashboard/profile` |
| Sidebar → Support Tickets | `/dashboard/support` |
| Sidebar → Data Migration | `/dashboard/migration` |
| Sidebar Footer → Help Center | `/dashboard/support` |
| Sidebar Footer → What's new | `#/whats-new` |
| Active Projects table row | `/dashboard/projects/[id]` |
| Active Projects → client link | `/dashboard/clients/[clientId]` |
| Active Projects → "View all" | `/dashboard/projects` |
| Recent Invoices table row | `/dashboard/invoices/[id]` |
| Recent Invoices → client link | `/dashboard/clients/[clientId]` |
| Recent Invoices → "View all" | `/dashboard/invoices` |
| Recent Clients table row | `/dashboard/clients/[id]` |
| Recent Clients → "View all" | `/dashboard/clients` |
| Recent Payments → client link | `/dashboard/clients/[clientId]` |
| Recent Payments → invoice link | `/dashboard/invoices/[invoiceId]?tab=payments` |
| Recent Payments → "View all" | `/dashboard/payments` |
| Recent Questionnaires table row | `/dashboard/questionnaires/[id]` |
| Recent Questionnaires → client link | `/dashboard/clients/[clientId]` |
| Recent Questionnaires → "View all" | `/dashboard/questionnaires` |
| Quick Actions → Add Client | `/dashboard/clients` |
| Quick Actions → Create Project | `/dashboard/projects` |
| Quick Actions → Generate Invoice | `/dashboard/invoices` |
| Quick Actions → Record Payment | `/dashboard/payments` |
| Quick Actions → Create Form | `/dashboard/questionnaires/new` |

---

## Layout Grid

The dashboard uses a responsive CSS grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) with a `gap-4`.

| Section | Grid Span |
|---|---|
| Welcome Banner | Full width (col-span-4) |
| Stat Cards (8 cards) | 1 column each |
| Revenue Overview Chart | 3 columns (`lg:col-span-3`) |
| Invoice Status Chart | 1 column |
| Active Projects Table | 2 columns |
| Recent Invoices Table | 2 columns |
| Activity Timeline | 2 columns |
| Upcoming Deadlines | 2 columns |
| Recent Clients Table | 2 columns |
| Recent Payments Table | 2 columns |
| Recent Questionnaires Table | Full width (col-span-4) |

---

## Related Documentation

- [global.md](./global.md) — Global Search and DynamicAvatar system (used extensively on this page)
