# Questionnaires — Feature Documentation

**Routes:**
- List: `/dashboard/questionnaires`
- Create: `/dashboard/questionnaires/new`
- Edit Builder: `/dashboard/questionnaires/[id]`
- Responses: `/dashboard/questionnaires/[id]/responses`
- AI Import: `/dashboard/questionnaires/import`
- **Public Form (no auth):** `/q/[slug]`

**Access:** All dashboard routes require authentication. The public form at `/q/[slug]` is open to anyone with the link — no login required.

---

## Overview

Questionnaires are shareable forms that can be sent to clients or the public to collect structured responses. Each questionnaire has a unique public URL (`/q/[slug]`), a configurable field list, an optional response cap, and a status that controls whether it accepts submissions. Responses are stored and viewable in a paginated table, exportable as CSV.

---

## Page 1 — Questionnaires List

**Route:** `/dashboard/questionnaires`

---

### Header

- **Title:** "Questionnaires"
- **Subtitle:** "Manage your forms, surveys, and question banks."
- **"Import with AI" button** (outline, primary-tinted): Navigates to `/dashboard/questionnaires/import`
- **"Create New" button**: Navigates to `/dashboard/questionnaires/new`

---

### Search & Filter Bar

#### Search Input
- Searches by questionnaire **title** and **description** (case-insensitive, contains match)
- **Debounced** — 300ms wait after typing stops
- Resets pagination to page 1 when query changes

#### Status Filter (dropdown)

| Option | Shows |
|---|---|
| All Statuses *(default)* | All questionnaires |
| Active | Only `Active` |
| Paused | Only `Paused` |
| Closed | Only `Closed` |

---

### Questionnaires Table

5 columns, skeleton loader (5 rows × 5 cols) while fetching.

| Column | Content | Notes |
|---|---|---|
| Title | `DynamicAvatar` (questionnaire type) + clickable title | Links to `/dashboard/questionnaires/[id]/responses` |
| Status | Badge | `Active` → default (solid), `Paused` → secondary (muted), anything else → destructive (red) |
| Responses | `responseCount` or `responseCount / maxResponses` | If `maxResponses` is set, shows the cap |
| Created On | Formatted creation date, right-aligned, muted | — |
| Actions | `⋯` dropdown | See below |

**Empty state:** "No questionnaires found."

#### Row Actions Dropdown (`⋯` menu)

| Action | Icon | Behavior |
|---|---|---|
| Edit Builder | EditIcon | Navigates to `/dashboard/questionnaires/[id]` (the builder editor) |
| View Responses | LinkIcon | Navigates to `/dashboard/questionnaires/[id]/responses` |
| Copy Public Link | CopyIcon | Copies `[origin]/q/[slug]` to clipboard, shows toast "Link copied to clipboard!" |
| Delete | TrashIcon / Loader2Icon | Confirms via `window.confirm` ("All responses will be lost."), sends `DELETE /questionnaires/[id]`. **Hard delete — all fields and responses are permanently removed.** While deleting: spinner icon replaces trash icon, label shows "Deleting..." |

---

### Pagination

- Page size: 10 per page
- Shows "Showing X of Y results"
- Previous / Next buttons, disabled at boundaries or while loading

---

---

## Page 2 — Create Questionnaire (Builder)

**Route:** `/dashboard/questionnaires/new`

Uses the `QuestionnaireBuilder` component with no `initialData` (create mode).

**Header:**
- Title: "Create Questionnaire"
- Subtitle includes a link: "Have raw data? Import with AI" → `/dashboard/questionnaires/import`

See [QuestionnaireBuilder section](#questionnaire-builder) below for the full builder UI.

---

## Page 3 — Edit Questionnaire (Builder)

**Route:** `/dashboard/questionnaires/[id]`

On load: `GET /questionnaires/[id]` — returns questionnaire with all fields, linked client, and linked project.

Uses the same `QuestionnaireBuilder` component pre-filled with `initialData`.

**Header:**
- `DynamicAvatar` (type: `questionnaire`, size: 48px)
- Title: "Edit Questionnaire"
- Subtitle: "Modify the fields and settings for **[title]**."

**Loading state:** Full skeleton via `SkeletonHelper`.  
**Not found state:** "Questionnaire not found." centered message.

---

## Questionnaire Builder

Shared component (`QuestionnaireBuilder`) used on both the New and Edit pages.

### General Information Card

| Field | Type | Required | Notes |
|---|---|---|---|
| Form Title | Text input | Yes | Cannot be empty on save |
| Description | Textarea | No | Context text shown to respondents on the public form |
| Max Responses Limit | Number input | No | Leave empty for unlimited. When reached, the form rejects new submissions. |

### Form Fields Section

A list of field cards. Each field can be reordered, edited, and removed.

**Add Field button** (top-right of section): Adds a new blank field of type `TEXT` at the bottom.

**Empty state:** Dashed border placeholder "No fields added yet. Click 'Add Field' to start building your form."

#### Per-field Card

Each field card has:

| Control | Description |
|---|---|
| Up / Down arrows | Appear on hover (left side of card). Move field up or down in order. Disabled at first/last position. |
| Question/Label input | The question text shown to the respondent. Required on save. |
| Help text input | Optional sub-label shown below the question on the public form |
| Field Type dropdown | Selects the input type (see types below) |
| "Required field" toggle | Switch — if on, the public form enforces the field before submission |
| Remove button | Removes the field from the list (no confirmation) |

#### Field Types

| Type value | Display name | Input rendered on public form |
|---|---|---|
| `TEXT` | Short Text | Single-line text input |
| `TEXTAREA` | Long Text | Multi-line resizable textarea |
| `SELECT` | Dropdown (Select) | Dropdown with predefined options |
| `RADIO` | Multiple Choice | Radio button group |
| `CHECKBOX` | Checkboxes | Checkbox list (allows multiple selections, stored as array) |

For `SELECT`, `RADIO`, and `CHECKBOX` — an **Options section** appears below the field, with:
- Each existing option as an editable input
- A trash button to remove individual options
- "Add Option" button to append new ones (auto-named "Option N")

#### Save behavior

Fixed bottom bar (above the sidebar) with Cancel and Save buttons.

- **Validation:** Title must not be empty. Every field must have a label. Invalid options silently stay (no per-option validation).
- **Create mode** (`POST /questionnaires`): toast "Questionnaire created!" → redirects to `/dashboard/questionnaires`
- **Edit mode** (`PATCH /questionnaires/[id]`): Fields are **fully replaced** in a transaction (all existing fields deleted, new ones created) — there is no partial field update. toast "Questionnaire updated!" → redirects to `/dashboard/questionnaires/[id]/responses`
- On error: toast "Failed to save questionnaire"
- While saving: button shows "Saving...", disabled

---

## Page 4 — Responses

**Route:** `/dashboard/questionnaires/[id]/responses`

---

### Header

- **Back button** (`←`): Navigates to `/dashboard/questionnaires`
- `DynamicAvatar` (type: `questionnaire`, size: 48px)
- Questionnaire title as `h1`
- ID badge: `QST-xxxxx`, monospace, dashed outline
- Subtitle: "Viewing all submitted responses."

**Action controls (top-right):**

#### Status Dropdown (inline, color-coded)

Allows changing the questionnaire's live status directly from the responses page without going to the builder. Updates are **optimistic** — the UI changes immediately and rolls back on error.

| Status | Trigger color |
|---|---|
| Active | Green text, green border, green background |
| Paused | Yellow text, yellow border, yellow background |
| Closed | Red text, red border, red background |

On change: `PATCH /questionnaires/[id]` `{ status: newStatus }` → toast on success or rollback + error toast on failure.

#### Columns Toggle

Dropdown with a checklist of all field labels. Controls which field columns are visible in the responses table. By default, the first 5 fields are shown.

#### Copy Link button

Copies `[origin]/q/[questionnaire.id]` to clipboard. Shows toast "Link copied to clipboard!"

> Note: uses `questionnaire.id` (UUID), not `questionnaire.slug`. The public route resolves both.

#### Export CSV button

Downloads all currently loaded responses as a `.csv` file named `[questionnaire.title]_responses.csv`.

- **Columns:** "Submitted At" + one column per field (using field label as header)
- **Multi-select answers:** joined with `"; "`
- **Quoting:** all values are double-quoted, internal quotes escaped
- **Disabled** when there are no responses

---

### Responses Table

A horizontally scrollable table. The Actions column is **sticky** to the right edge.

| Column | Content |
|---|---|
| Submitted At | Formatted submission date, non-wrapping |
| [Field columns] | One column per visible field. Multi-select answers shown as muted tag pills. Long text truncated with `line-clamp-2` and full text on hover via `title` attribute. Single-value answers shown as plain text; `—` if empty. |
| Actions (sticky) | "View" button (eye icon) → opens Response Detail slide-over |

**Empty state:** "No responses yet."  
**Loading state:** "Loading responses..." centered text (while paginating).

#### Response Detail Slide-over (View button)

Opens a `Sheet` panel from the right (400px / 540px wide).

- **Header:** "Response Details" + "Submitted on [full date/time]"
- **Body:** Every field shown as a question/answer pair, divided by horizontal rules
  - Multi-select answers: bulleted list with primary-colored dots
  - All other answers: `whitespace-pre-wrap` text, `—` if empty

---

### Pagination

- Page size: 50 per page
- Shows "Showing responses X to Y of Z results"
- Previous / Next disabled at boundaries or while loading

---

### API Calls (Responses Page)

| Action | Method | Endpoint |
|---|---|---|
| Load responses | GET | `/questionnaires/[id]/responses?page=&limit=50` |
| Update status | PATCH | `/questionnaires/[id]` |

---

---

## Page 5 — AI Import

**Route:** `/dashboard/questionnaires/import`

A two-step workflow to generate a questionnaire from raw data using an external AI tool.

**Header:** Back button → `/dashboard/questionnaires`, title "Import with AI", subtitle.

### Step 1 card — Copy the Prompt

- Shows a server-fetched AI system prompt (`GET /questionnaires/prompt`) in a read-only monospaced textarea
- **Loading state:** spinner with "We are cooking, just a moment..."
- **"Copy Prompt to Clipboard" button** at the bottom of the card
- User pastes this prompt + their own raw data into ChatGPT, Claude, or any AI tool

### Step 2 card — Paste Generated JSON

- A monospaced textarea where the user pastes the AI's JSON output
- **"Import Questionnaire" button** at the bottom

**Import validation (client-side):**
1. Input must not be empty
2. Must be valid JSON
3. Parsed object must have a `title` string and a `fields` array

If valid: `POST /questionnaires` with the parsed JSON → toast "Questionnaire successfully generated!" → redirects to `/dashboard/questionnaires/[newId]` (the builder editor for the new questionnaire).

On error: toast with server or parse error message.

---

---

## Public Form (No Auth Required)

**Route:** `/q/[slug]`  
**Access:** Open to anyone — no login required.

This is the form respondents see when they receive the public link. It is a completely separate, unauthenticated page outside the dashboard layout.

### Public Link Format

```
https://[your-domain]/q/[slug]
```

The `slug` is a UUID generated when the questionnaire is created (`crypto.randomUUID()`). It never changes. The "Copy Public Link" actions in the list page and responses page both copy this URL to clipboard.

### Page States

#### Loading
Full-page skeleton while the form data is fetched.

#### Error / Unavailable
Shown when:
- Questionnaire does not exist (404)
- Questionnaire status is not `Active` (403) — "This questionnaire is currently inactive."
- Response cap reached (403) — "This questionnaire has reached its maximum number of responses."

Displays a centered card with a `LockIcon`, "Form Unavailable" heading, and the error message. "Powered by Soseki" footer link.

#### Active Form

**Page layout:**
- Subtle radial gradient background from primary color
- Organization avatar (`DynamicAvatar` type: `organization`, size: 72px, seeded by org name) + org name in small caps
- Form title as large heading (`text-4xl sm:text-5xl`)
- Description text (if set) in large muted text
- Each question in its own section, numbered

**Field rendering on public form:**

| Type | Renders as |
|---|---|
| `TEXT` | Single-line input, max-w-md |
| `TEXTAREA` | Multi-line textarea, resizable |
| `SELECT` | Dropdown select |
| `RADIO` | Radio button group, one option per row |
| `CHECKBOX` | Checkbox list, allows multiple selections |

Required fields show a red `*` after the label. Help text shown below the label in muted style.

**Submit button:** Full-width on mobile, auto-width on desktop. Rounded-full pill style. Shows spinner + "Submitting..." while in progress.

**Footer:** "Powered by Soseki" logo link + Privacy Policy / Terms of Service / Report Abuse links.

#### Success State

After successful submission, the form is replaced by a thank-you card:
- `CheckCircle2Icon` in a primary-colored circle
- "Thank you!" heading
- "Your response has been successfully submitted to [Organization Name]."

### Submission Rules (enforced server-side)

1. Questionnaire must exist and status must be `Active` → 403 if not
2. `maxResponses` cap must not be reached → 403 if exceeded
3. All fields marked `required` must have a non-empty answer → 400 with field label in error message
4. On success: response is saved + `responseCount` incremented atomically in a Prisma transaction

---

## Data Model — Questionnaire Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Displayed as `QST-xxxxx` |
| `title` | String | Required, trimmed on save |
| `description` | String (nullable) | Optional, shown on public form |
| `slug` | UUID | Auto-generated on create, never changes, used in public URL |
| `status` | Enum | `Draft`, `Active`, `Inactive`, `Archived` (UI shows `Active`, `Paused`, `Closed`) |
| `maxResponses` | Int (nullable) | Optional cap on submissions |
| `responseCount` | Int | Counter incremented atomically on each submission |
| `clientId` | UUID (nullable) | Optional client link |
| `projectId` | UUID (nullable) | Optional project link |
| `organizationId` | UUID | Auto-set from session |

### QuestionnaireField

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Used as key in `answers` object |
| `type` | Enum | `TEXT`, `TEXTAREA`, `SELECT`, `RADIO`, `CHECKBOX` (builder also uses `ShortText`, `LongText`, `Email`, `Date`, `MultiSelect` via validation — builder UI exposes TEXT/TEXTAREA/SELECT/RADIO/CHECKBOX) |
| `label` | String | Question text |
| `description` | String (nullable) | Help text |
| `required` | Boolean | Default false |
| `order` | Int | Determines display order, set by field position in builder |
| `options` | JSON array (nullable) | Only for SELECT, RADIO, CHECKBOX |

---

## Questionnaire Avatar

- **Type:** `questionnaire`
- **DiceBear style:** `disco` — fetched from DiceBear HTTP API (requires network)
- **Shape:** Rounded square (`rounded-md`)
- **Seed:** `questionnaire.title`
- **Sizes:** `32px` in list table, `48px` in edit/responses page headers

---

## Status Behavior

| Status | Public form accessible? | Notes |
|---|---|---|
| `Active` | Yes | Accepts new submissions |
| `Paused` / `Inactive` | No | Returns 403 "currently inactive" |
| `Closed` | No | Returns 403 "currently inactive" |
| `Draft` | No | Returns 403 "currently inactive" |
| `Archived` | No | Returns 403 "currently inactive" |

Only `Active` questionnaires accept responses. The status can be changed from the Responses page header dropdown without entering the builder.

---

## API Endpoints Summary

| Action | Method | Endpoint | Auth |
|---|---|---|---|
| List questionnaires | GET | `/questionnaires` | Required |
| Create questionnaire | POST | `/questionnaires` | Required |
| Get by ID | GET | `/questionnaires/[id]` | Required |
| Update questionnaire | PATCH | `/questionnaires/[id]` | Required |
| Delete questionnaire | DELETE | `/questionnaires/[id]` | Required |
| Get responses | GET | `/questionnaires/[id]/responses` | Required |
| Get AI prompt | GET | `/questionnaires/prompt` | Required |
| Get public form | GET | `/questionnaires/public/[slug]` | **None** |
| Submit response | POST | `/questionnaires/public/[slug]` | **None** |

---

## Navigation

| Element | Destination |
|---|---|
| Row click / title (list) | `/dashboard/questionnaires/[id]/responses` |
| "Edit Builder" in menu (list) | `/dashboard/questionnaires/[id]` |
| "View Responses" in menu (list) | `/dashboard/questionnaires/[id]/responses` |
| "Copy Public Link" in menu | Copies `/q/[slug]` to clipboard |
| "Import with AI" button | `/dashboard/questionnaires/import` |
| "Create New" button | `/dashboard/questionnaires/new` |
| Back button (responses page) | `/dashboard/questionnaires` |
| Back button (import page) | `/dashboard/questionnaires` |
| "Have raw data?" link (new page) | `/dashboard/questionnaires/import` |
| After create (builder) | `/dashboard/questionnaires` |
| After edit (builder) | `/dashboard/questionnaires/[id]/responses` |
| After AI import | `/dashboard/questionnaires/[newId]` (builder) |
| After delete (list) | Refreshes list |

---

## Related Documentation

- [dashboard.md](./dashboard.md) — Recent Questionnaires table on main dashboard; Latest Form stat card
- [global.md](./global.md) — Questionnaires are searchable by title (`FRM-` prefix for ID lookup)
- [clients.md](./clients.md) — Questionnaires can be linked to a client via `clientId`
- [projects.md](./projects.md) — Questionnaires can be linked to a project via `projectId`
