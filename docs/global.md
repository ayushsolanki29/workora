# Global Features — Documentation

This file covers features and components that are shared across the entire app — not specific to any single page or module.

---

## Global Search

**Trigger:** Search button in the sidebar, or keyboard shortcut `⌘K` (Mac) / `Ctrl+K` (Windows/Linux)  
**Component:** `GlobalSearch`  
**Available on:** All dashboard pages

### What it does

A command-palette-style dialog that lets users instantly find and navigate to any record in their workspace without leaving the current page. It opens as a floating modal overlay and closes automatically after selecting a result or pressing `Escape`.

### How to open

| Method | Action |
|---|---|
| Keyboard shortcut | `⌘K` (Mac) / `Ctrl+K` (Windows/Linux) |
| Sidebar search button | Click the search icon in the top area of the sidebar |

### Search behavior

- **Debounced** — fires 300ms after the user stops typing
- **Live results** — updates in real time as the user types
- **Case-insensitive** — all matches use `mode: "insensitive"`
- **Grouped results** — results are returned in labeled groups, one per entity type
- **Scoped** — users only ever see results from their own organization
- **Empty state** — shows "Searching..." while loading, "No results found." if nothing matches

### What gets searched

| Group | Fields searched | Max results |
|---|---|---|
| Clients | `name`, `email` | 5 |
| Projects | `title` | 5 |
| Invoices | `invoiceNumber`, `notice` | 5 |
| Questionnaires | `title` | 5 |
| Support Tickets | `title` | 5 |

### ID prefix search

Typing a formatted ID prefix (e.g. `INV-abc`, `CLI-123`) triggers a direct ID lookup. The prefix segment must be at least 3 characters.

| Prefix | Searches in |
|---|---|
| `CLI-` | Clients |
| `PRJ-` | Projects |
| `INV-` | Invoices |
| `FRM-` | Questionnaires |
| `SPT-` | Support Tickets |

Results from ID lookup are merged with text results, with duplicates removed by record ID.

### Result display

Each result item shows:
- A type icon (`UserIcon`, `FolderIcon`, `FileTextIcon`, `CheckSquareIcon`, `HelpCircleIcon`)
- The primary label (name, title, or invoice number)
- Formatted ID (e.g. `CLI-xxxxx`) + sub-label (email for clients, status for projects, client name for invoices)

### Navigation on select

Clicking or pressing `Enter` on a result closes the dialog and navigates to:

| Type | Redirect |
|---|---|
| Client | `/dashboard/clients/[id]` |
| Project | `/dashboard/projects/[id]` |
| Invoice | `/dashboard/invoices/[id]` |
| Questionnaire | `/dashboard/questionnaires/[id]/responses` |
| Support Ticket | `/dashboard/support/[id]` |

### Keyboard shortcuts inside the dialog

| Key | Action |
|---|---|
| `↑` / `↓` | Navigate between results |
| `↵` Enter | Open the selected result |
| `Escape` | Close dialog, stay on current page |

### API endpoint

`GET /dashboard/search?q=[term]` — requires auth, scoped to `organizationId`.

---

## DynamicAvatar

**Component:** `DynamicAvatar`  
**File:** `src/components/ui/dynamic-avatar.jsx`  
**Library:** [DiceBear](https://www.dicebear.com/) (`@dicebear/core` + `@dicebear/collection`)

### What it does

Generates a deterministic, auto-colored avatar for any entity — client, project, invoice, user, etc. The same `type + seed` always produces the exact same image. Nothing is stored in the database; avatars are generated on the fly from the entity's name or number.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | string | `'default'` | Entity type — controls the visual style |
| `seed` | string | — | Input string for generation, usually the entity's name or number |
| `size` | number | `40` | Width and height in pixels |
| `className` | string | `""` | Extra CSS classes |
| `options` | object | `{}` | Additional DiceBear options |

### Style and shape per entity type

| Type | DiceBear style | Shape | Generation |
|---|---|---|---|
| `user` | `initials` | Circle | Local |
| `client` | `thumbs` | Circle | Local |
| `project` | `shapes` | Rounded square | Local |
| `invoice` | `identicon` | Rounded square | Local |
| `expense` | `rings` | Circle | Local |
| `organization` | `glass` | Circle | Local |
| `questionnaire` | `disco` | Rounded square | HTTP API |
| `superadmin` | `rings` | Circle | HTTP API |
| `default` | `icons` | Circle | Local |

**Rounded square** applies to `project`, `invoice`, `questionnaire` — these use `rounded-md` CSS and `radius: 10` in DiceBear.  
**Circle** applies to everything else — `rounded-full` and `radius: 50`.

### Generation methods

**Local (most types):** `createAvatar(style, { seed, size, radius })` → produces a Data URI (`data:image/svg+xml;...`) rendered as an `<img>`. No network request, works offline.

**HTTP API fallback (`questionnaire`, `superadmin`):** The style name is a string, so the component requests `https://api.dicebear.com/10.x/[style]/svg?seed=[encoded-seed]` and renders it as a remote `<img>`. Requires network access.

### No-seed fallback

If `seed` is not provided, a plain `<div>` is shown with a `bg-gradient-to-br from-primary to-primary/40` background. Same size and shape rules still apply.

### Determinism

The avatar output is fully deterministic — same `type` + `seed` = same avatar every time, across devices and sessions. Renaming an entity changes its avatar because the seed changes.

### Where it's used

| Module | Type | Seed |
|---|---|---|
| Clients list & detail | `client` | `client.name` |
| Projects list & detail | `project` | `project.title` |
| Invoices list & detail | `invoice` | `invoice.invoiceNumber` |
| Payments table | `client` | `payment.invoice.client.name` |
| Questionnaires list | `questionnaire` | `questionnaire.title` |
| Dashboard — Active Projects table | `project` | `project.title` |
| Dashboard — Recent Invoices table | `invoice` | `invoice.invoiceNumber` |
| Dashboard — Recent Clients table | `client` | `client.name` |
| Dashboard — Activity Timeline | `client` / `project` / `invoice` / `questionnaire` | Entity name/number |
| Sidebar user profile | `user` | `user.name` |
| Organization settings | `organization` | `organization.name` |
