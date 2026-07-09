# Workspace Settings — Feature Documentation

**Routes:**
- Setup (first-time): `/setup-organization`
- Settings (ongoing): `/dashboard/workspace/settings`

---

## Part 1 — Organization Setup (`/setup-organization`)

### What it is

This is the **first page a new user sees after logging in** when they don't have a workspace yet. It is a one-time onboarding flow that creates the organization and sets the user's name and master currency before they can access the dashboard.

### When it appears

The routing is controlled by the JWT token's `hasOrg` flag, enforced in the Next.js middleware (`proxy.js`):

| Scenario | Result |
|---|---|
| Logged in, `hasOrg: false`, visits `/dashboard/*` | Redirected to `/setup-organization` |
| Logged in, `hasOrg: false`, visits `/setup-organization` | Stays on setup page |
| Logged in, `hasOrg: true`, visits `/setup-organization` | Redirected to `/dashboard` |
| Not logged in | Redirected to `/login` |

So it is impossible to reach the dashboard without completing setup, and impossible to reach the setup page again once the workspace exists.

### Page Layout

Two-column layout (desktop):

**Left panel** (hidden on mobile) — branded gradient panel with:
- Soseki logo
- Headline: "Streamline your agency's finances"
- Three feature bullets: Unlimited Projects & Clients, Automated Invoicing workflows, Comprehensive Financial Reports
- Copyright footer

**Right panel** — the setup form:
- "Set up your workspace" heading
- "Sign out" button (top-right) — calls `POST /auth/logout` and redirects to `/login`

---

### Setup Form Fields

#### Your Name

- Text input with a live `DynamicAvatar` (type: `user`) beside it, seeded by whatever the user is typing
- The avatar updates in real time as the name is typed — so the user sees their avatar before confirming
- Placeholder: "What should we call you?"
- Required

#### Workspace Name

- Text input with a live `DynamicAvatar` (type: `organization`) beside it, seeded by the workspace name being typed
- Both avatars update live as the user types, giving immediate visual feedback
- Placeholder: "What's your workspace name?"
- Required

#### Master Currency (2×2 visual grid)

Four large selectable cards, one per currency:

| Currency | Symbol | Flag |
|---|---|---|
| USD | $ | 🇺🇸 |
| EUR | € | 🇪🇺 |
| GBP | £ | 🇬🇧 |
| INR | ₹ | 🇮🇳 |

Each card shows a round flag image (fetched from `https://flagcdn.com/w80/[country].png`), the currency code, and the symbol. The selected card gets a primary-colored border, ring, and a checkmark badge in the top-right corner. Defaults to `USD`.

Helper text: "This will be the default currency for all your projects and invoices."

---

### Submit

Button: "Continue to Dashboard" (full width, large, rounded pill style).

Sends `POST /organization/setup` with `{ name, userName, masterCurrency }`.

**On success:**
1. Server creates the organization and links the user to it
2. Server updates the user's name
3. Server **re-issues a new JWT token** with `hasOrg: true` and the new `organizationId` baked in — this is set as the `accessToken` cookie
4. Client receives success response → toast "Workspace created! Welcome to your new workspace." → redirects to `/dashboard`

**On error:** toast with server error message.

**Validation (client-side):** Both name and userName must be non-empty strings. Currency defaults to USD if not chosen.

**Guard:** If the user already has an `organizationId` on their session, the server returns 400 "You already have an organization setup".

---

---

## Part 2 — Workspace Settings (`/dashboard/workspace/settings`)

**Route:** `/dashboard/workspace/settings`  
**Access:** Authenticated users with an organization.

The ongoing settings page — available anytime from Sidebar → Workspace → General Settings.

On load: `GET /organization` — returns the organization record including `_count.invoices` and `_count.expenses` (used to determine if master currency is locked).

**Loading state:** Three skeleton cards while fetching.

The page has three independent cards, each with its own Save button and its own saving state. Saving one card does not affect the others.

---

### Card 1 — General Information

`PATCH /organization` with `{ name, address, dateFormat }`

| Field | Type | Notes |
|---|---|---|
| Organization Name | Text input | Required. Cannot be empty — client validates before submit. Shown as org name across the app, in PDF headers, in the dashboard welcome banner. |
| Billing Address | Textarea (multi-line) | Optional. Appears on invoice PDFs and expense receipt PDFs in the top-right header block. If left empty, PDFs show "Billing address not configured" in italic. |
| Date Format | Dropdown | Controls how all dates are displayed throughout the app. |

**Date format options:**

| Option | Example |
|---|---|
| `dd-MMM-yy` *(default)* | 05-Jul-26 |
| `MMM dd, yyyy` | Jul 05, 2026 |
| `dd/MM/yyyy` | 05/07/2026 |
| `MM/dd/yyyy` | 07/05/2026 |

The selected format is stored as the `dateFormat` field and used by the `formatDate()` utility function everywhere dates are displayed — tables, detail pages, PDF previews, timeline widgets.

**Save behavior:** `PATCH /organization` → toast "General settings updated!" or error toast. Button shows "Saving..." while in progress.

---

### Card 2 — Financial Settings

`PATCH /organization` with `{ invoiceFooterNote, expenseFooterNote }`

| Field | Type | Where it appears |
|---|---|---|
| Invoice Footer Note | Text input | Shown at the very bottom of every invoice PDF (inside the gray footer strip). Default fallback if empty: "Thank you for your business!" |
| Expense Receipt Footer Note | Text input | Shown at the bottom of every expense receipt PDF. Default fallback: "Thank you!" |

Both are optional. Changing these affects all future PDF previews immediately — no need to regenerate existing invoices.

**Save behavior:** `PATCH /organization` → toast "Financial settings updated!" or error toast.

---

### Card 3 — Currency Management

`PATCH /organization` with `{ masterCurrency }`

| Field | Type | Notes |
|---|---|---|
| Master Currency | Dropdown | USD, EUR, GBP, INR, CAD, AUD, JPY |

**This is the most critical setting in the app.** The master currency is the single currency used for all financial reporting, dashboard KPI calculations, and multi-currency conversions. See [invoices.md](./invoices.md) for a full explanation of how it works.

#### Lock behavior

The currency dropdown and Save button are **disabled** when `hasTransactions` is true — meaning the organization already has at least one invoice or expense recorded.

When locked, a warning shows:
> "Currency is locked because you have existing financial transactions."

This is enforced on both the frontend (disabled controls) and the backend (returns 400 "Cannot change master currency because transactions exist.").

**Why it's locked:** Changing the master currency after transactions exist would make all historical exchange rates (stored as snapshots on each invoice and expense) inconsistent. The stored `exchangeRate` on each record was computed as "invoice currency → old master currency" and can't be retroactively corrected.

**Save behavior (when unlocked):** `PATCH /organization` → toast "Master currency updated!" or error toast. Button shows "Saving..." while in progress.

---

## Where Organization Settings Are Used

Every part of the app that reads from the organization record:

| Setting | Where it's used |
|---|---|
| `name` | Dashboard welcome banner subtitle, invoice PDF header (org name), expense receipt PDF header, setup page live avatar seed |
| `address` | Invoice PDF header (billing address block), expense receipt PDF header |
| `masterCurrency` | Dashboard KPI cards (all currency totals), Revenue Overview chart (Y-axis), Invoice list KPI cards, Invoice form (currency default, exchange rate target), Expense form (currency default, exchange rate target), Invoice detail amount-due card, Invoice PDF "Reference Amount" block, Invoice PDF Payment Summary block, Expense receipt amount display, Client detail invoices table (converted amounts) |
| `invoiceFooterNote` | Invoice PDF footer |
| `expenseFooterNote` | Expense receipt PDF footer |
| `dateFormat` | Every `formatDate()` call across the entire app |
| `_count.invoices` + `_count.expenses` | Determines master currency lock state on settings page |

---

## API Endpoints

| Action | Method | Endpoint | Auth |
|---|---|---|---|
| First-time setup | POST | `/organization/setup` | Required (no org) |
| Get organization | GET | `/organization` | Required |
| Update settings | PATCH | `/organization` | Required |

**Setup endpoint side effects:**
- Creates the organization record
- Links the user to it
- Updates the user's name
- Re-issues the JWT cookie with `hasOrg: true` and `organizationId` — this is what unlocks the dashboard

---

## Navigation

| Element | Destination |
|---|---|
| Setup form submit → success | `/dashboard` |
| Setup page "Sign out" button | `POST /auth/logout` → `/login` |
| Sidebar → Workspace → General Settings | `/dashboard/workspace/settings` |
| Any `/dashboard/*` visit with `hasOrg: false` | Redirected to `/setup-organization` |
| `/setup-organization` visit with `hasOrg: true` | Redirected to `/dashboard` |

---

## Related Documentation

- [invoices.md](./invoices.md) — Master currency is the foundation of the multi-currency exchange rate system
- [expenses.md](./expenses.md) — Same exchange rate system applies to expenses
- [dashboard.md](./dashboard.md) — All KPI card values depend on masterCurrency
