# Support Tickets — Feature Documentation

**Routes:**
- List: `/dashboard/support`
- New ticket: `/dashboard/support/new`
- Ticket detail / chat: `/dashboard/support/[id]`

**Access:** Authenticated users only. Data is scoped to the organization.

---

## Overview

The Support module lets users report issues, request features, or ask questions directly to the Soseki support team. Each ticket is a persistent threaded conversation — the user opens it, both sides can exchange messages, and a super admin resolves it when done.

There is a clear two-sided messaging model: **user messages** align left with a `user` avatar, **Soseki Support replies** align right with a primary-colored bubble and a `superadmin` avatar. The distinction is determined server-side by checking whether the message sender's email belongs to a `SuperUser` record — not hardcoded on the frontend.

Support tickets are also searchable via Global Search (`⌘K`) using the `SPT-` ID prefix.

---

## Page 1 — Tickets List

**Route:** `/dashboard/support`

Also accessible from: Sidebar footer → "Help Center"

---

### Header

- **Title:** "Support Tickets"
- **Subtitle:** "Submit and track issues or feature requests with our support team."
- **"New Ticket" button**: Navigates to `/dashboard/support/new`

---

### Tickets Table

7 columns. Loading state shows a single skeleton row while fetching.

| Column | Content | Notes |
|---|---|---|
| Ticket ID | First 8 characters of the UUID, monospace, muted | Short identifier for quick reference |
| Title | Ticket title, truncated at 200px max-width | — |
| Priority | Colored pill badge | `High` → red, `Medium` → yellow, `Low` → green |
| Status | Colored pill badge | `Resolved` → green, anything else (e.g. `Open`) → blue |
| Messages | `MessageSquareIcon` + count | Total reply count (`ticket._count.messages`) |
| Created | Formatted creation date | — |
| Action | "View" ghost button | Links to `/dashboard/support/[id]` |

**Empty state:** "No support tickets found. Create your first ticket!"

**No pagination** — all org tickets returned in a single request, ordered by `createdAt` descending.

---

## Page 2 — New Ticket

**Route:** `/dashboard/support/new`

**Back link:** "← Back to tickets" → `/dashboard/support`

---

### Form

A single centered card (`max-w-[70%] mx-auto`), titled "Ticket Details".

| Field | Type | Required | Notes |
|---|---|---|---|
| Issue Title | Text input | Yes | e.g. "Cannot generate invoice PDF" |
| Priority | Dropdown | No | Low / Medium (default) / High. Labels: "Low - Not urgent", "Medium - Regular issue", "High - Critical blocker" |
| Description | Textarea (min 150px) | Yes | Steps to reproduce, what happened, expected vs actual behavior |

**Submit behavior:**
- Validates: both title and description must be non-empty (client-side)
- `POST /support-tickets` with `{ title, description, priority }`
- On success: toast "Support ticket created!" → redirects to `/dashboard/support/[newId]` (the ticket detail/chat page)
- On error: toast "Failed to submit ticket"
- While submitting: all fields and buttons disabled, submit shows "Submitting..."

**Cancel button:** Navigates back to `/dashboard/support`.

---

## Page 3 — Ticket Detail & Chat

**Route:** `/dashboard/support/[id]`

On load: `GET /support-tickets/[id]` — returns full ticket with all messages, each message including `sender.name`, `sender.email`, and `sender.isSuperAdmin` (computed server-side).

If ticket not found: toast error → redirect to `/dashboard/support`.

**Layout:** Full viewport height (`h-[calc(100vh-120px)]`), max-width 4xl, two-column grid on desktop.

---

### Header

- **Back link:** "← Back to tickets" → `/dashboard/support`
- **Ticket title** as `h1`
- **Ticket ID** shown as `SPT-xxxxx` (formatted)
- **Priority badge** (top-right) — same color coding as list
- **Status badge** (top-right next to priority)

---

### Left Column — Chat Area (2/3 width)

A scrollable message thread with a fixed input area at the bottom. Auto-scrolls to the latest message whenever new messages are added (`messagesEndRef.scrollIntoView`).

#### Initial Description (always first)

The ticket's original `description` is rendered as the first "message" in the thread — not from the messages array, but directly from `ticket.description`. It shows:
- User's `DynamicAvatar` (type: `user`, size: 36px, seeded by `user.name` or `user.email`)
- User's name (bold) + creation date (tiny, muted)
- Description text in a muted bubble with `rounded-tl-none` (left-aligned speech bubble style)

#### Reply Messages

Each reply from `ticket.messages` is rendered differently based on `msg.sender.isSuperAdmin`:

**User message (isSuperAdmin: false) — left side:**
- User avatar left, message bubble right of avatar
- Bubble: `bg-muted/50`, `rounded-tl-none` (notch top-left)
- Name on the left, date on the right

**Support reply (isSuperAdmin: true) — right side:**
- Row reversed (`flex-row-reverse`), support avatar on the far right
- Bubble: `bg-primary text-primary-foreground`, `rounded-tr-none` (notch top-right)
- Date on the left, "Soseki Support" label on the right
- `DynamicAvatar` type: `superadmin` (rings style, via HTTP API)

This visual distinction makes it immediately clear which messages are from the support team.

#### Message Input

A textarea + send button, fixed at the bottom of the chat area.

- Placeholder: "Type your reply here..."
- `POST /support-tickets/[id]/messages` with `{ content }`
- On success: the new message is **appended to local state** (no full re-fetch), textarea clears
- On error: toast "Failed to send message"
- Send button disabled when: textarea is empty or message is sending
- Send button shows a `Loader2` spinner while sending, `SendIcon` otherwise

**When ticket is `Resolved`:** The input is hidden and replaced with:
> "This ticket has been resolved and closed."

No new messages can be sent on a resolved ticket.

---

### Right Column — Ticket Information Sidebar (1/3 width)

A card with three info rows:

| Label | Content |
|---|---|
| Created By | User's `DynamicAvatar` (20px) + name (bold) + email below (muted, indented) |
| Organization | Organization name |
| Date Created | Formatted creation date |

---

### API Calls (Detail Page)

| Action | Method | Endpoint |
|---|---|---|
| Load ticket + messages | GET | `/support-tickets/[id]` |
| Send message | POST | `/support-tickets/[id]/messages` |

---

## Super Admin Identification

The `isSuperAdmin` flag on each message sender is **computed server-side**, not hardcoded. On every `GET /support-tickets/[id]` and `POST /support-tickets/[id]/messages` call, the service:

1. Fetches all `SuperUser` records and builds a `Set` of their emails
2. Checks each message sender's email against that set
3. Adds `isSuperAdmin: true/false` to the sender object before returning

This means if a super admin is added or removed, the flag updates automatically on next load — no code changes needed.

---

## Ticket Data Model

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Displayed as `SPT-xxxxx` (formatted), first 8 chars used as short ID in list |
| `title` | String | Required |
| `description` | String | Required, shown as the first message in the thread |
| `priority` | Enum | `Low`, `Medium` (default), `High` |
| `status` | Enum | `Open` (default), `Resolved` |
| `userId` | UUID | The user who created the ticket |
| `organizationId` | UUID | Auto-set from session |

### TicketMessage

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | — |
| `ticketId` | UUID | Parent ticket |
| `senderId` | UUID | The user who sent the message |
| `content` | String | Required |
| `createdAt` | DateTime | Used for display and auto-scroll |

---

## Status & Priority

**Status** is managed by the super admin side (via `PATCH /support-tickets/[id]`). Users cannot change status themselves — they can only send messages. When a ticket is set to `Resolved`, the input area is locked.

**Priority** is set by the user when creating the ticket and can be updated via `PATCH /support-tickets/[id]`. The update endpoint is not exposed in the user-facing UI beyond creation — it is used by the super admin panel.

---

## Navigation

| Element | Destination |
|---|---|
| Sidebar → Support Tickets | `/dashboard/support` |
| Sidebar footer → Help Center | `/dashboard/support` |
| "New Ticket" button (list) | `/dashboard/support/new` |
| "View" button on list row | `/dashboard/support/[id]` |
| After creating new ticket | `/dashboard/support/[id]` (the new ticket) |
| "← Back to tickets" (new / detail) | `/dashboard/support` |
| Cancel button (new ticket form) | `/dashboard/support` |

---

## Related Documentation

- [global.md](./global.md) — Support tickets are searchable by title (`SPT-` prefix for ID lookup); results redirect to `/dashboard/support/[id]`
- [dashboard.md](./dashboard.md) — Sidebar footer "Help Center" link points to this module
