# ADR Vault — Design Specifications

> Companion document to [`mvp_design.pdf`](./mvp_design.pdf). The PDF is the canonical visual reference; this file captures the design tokens, layout rules, and component anatomy derived from the Claude Design handoff bundle (React/HTML/CSS prototype) so the Next.js + shadcn implementation can match it pixel-for-pixel.
>
> **Aesthetic direction:** *Editorial & calm — soft neutrals, generous whitespace, one muted accent.* Dense but breathable information design, light mode only for MVP.

---

## 1. Design foundations

### 1.1 Color accent — **Slate**

Slate is the chosen muted accent. It replaces the prototype's default indigo across every `--accent*` usage (primary buttons, focus rings, logo mark gradient, AI summary gradient, active link underlines, citation chips).

| Token               | Hex       | Tailwind equiv. | Usage                                                       |
| ------------------- | --------- | --------------- | ----------------------------------------------------------- |
| `--accent`          | `#475569` | `slate-600`     | Primary button bg, focus border, progress bar fill          |
| `--accent-strong`   | `#1e293b` | `slate-800`     | Primary button hover, link hover, logo gradient end         |
| `--accent-soft`     | `#f1f5f9` | `slate-100`     | AI badge bg, AI summary card bg, citation chip bg           |
| `--accent-border`   | `#cbd5e1` | `slate-300`     | AI badge border, AI summary card border                     |
| `--accent-contrast` | `#ffffff` | `white`         | Text on primary buttons                                     |

**shadcn mapping.** In `apps/web/src/app/globals.css` under `:root`, map `--primary` to slate-600 (oklch: `oklch(0.446 0.043 257.28)`) and `--primary-foreground` to white. The logo mark uses `linear-gradient(135deg, var(--accent), var(--accent-strong))` — keep this as a literal gradient, not a flat fill.

### 1.2 Neutral palette (independent of accent)

Warm off-white, not pure grey. This is what gives the UI its "editorial calm" feel — do not replace with cooler neutrals when swapping in shadcn defaults.

| Token             | Hex       | Usage                                                           |
| ----------------- | --------- | --------------------------------------------------------------- |
| `--bg`            | `#faf9f7` | Page background (main + auth layout)                            |
| `--surface`       | `#ffffff` | Cards, sidebar, inputs, page header                             |
| `--surface-2`     | `#f5f3ef` | Hover states, table header bg, filter chip track, code bg       |
| `--surface-3`     | `#efece7` | Avatar default bg, shimmer mid-tone                             |
| `--border`        | `#e7e3dc` | Default 1px borders on cards, inputs, table rows                |
| `--border-strong` | `#d9d4cb` | Button hover border, dashed empty-state border, ask input idle  |
| `--text`          | `#1c1b18` | Body text, titles                                               |
| `--text-muted`    | `#6b6861` | Page subtitles, metadata, inactive nav items                    |
| `--text-faint`    | `#9a978e` | Column headers, counts, helper text, reset timestamps           |

### 1.3 Semantic colors

| Token             | Hex       | Usage                              |
| ----------------- | --------- | ---------------------------------- |
| `--ok` / `--ok-soft`         | `#15803d` / `#f0fdf4` | Success toast, stage-done mark |
| `--warn` / `--warn-soft`     | `#a16207` / `#fefce8` | Usage meter ≥ 80%, over-soft limit counter |
| `--danger` / `--danger-soft` | `#b91c1c` / `#fef2f2` | Field errors, over-hard limit counter, destructive buttons |

### 1.4 Status color triplets (ADR status pill)

Each status defines three color stops — background, foreground text, and border — so pills feel quiet rather than alarming.

| Status      | `--s-*-bg` | `--s-*-fg` | `--s-*-bd` |
| ----------- | ---------- | ---------- | ---------- |
| Draft       | `#f3f2ef`  | `#57544d`  | `#e3dfd7`  |
| Proposed    | `#eef2ff`  | `#3730a3`  | `#dfe3ff`  |
| Accepted    | `#f0fdf4`  | `#166534`  | `#dcfce7`  |
| Deprecated  | `#fff7ed`  | `#9a3412`  | `#fed7aa`  |
| Superseded  | `#fdf2f8`  | `#9d174d`  | `#fbcfe8`  |

> **Why not re-derive from the accent.** Proposed intentionally stays indigo-tinted even when the accent is Slate, because its meaning ("under consideration") reads more clearly with a cooler hue than Slate. Keep these triplets literal.

### 1.5 Typography

| Family              | Weights       | Role                                            |
| ------------------- | ------------- | ----------------------------------------------- |
| **Inter Tight**     | 400, 500, 600, 700 | Body, UI, headings. Letter-spacing -0.01em to -0.02em on titles. |
| **JetBrains Mono**  | 400, 500, 600 | `ADR-###` keys, token counters, usage %, code.  |

Font features: `"cv11", "ss01"` on body; `"zero"` on mono (dotted-zero disambiguation).

Load via Google Fonts with `preconnect`. Replace the existing `--font-sans` (Geist) in `globals.css` with Inter Tight, and add Inter Tight + JetBrains Mono via `next/font/google` in `layout.tsx`.

**Type scale.**

| Role              | Size        | Weight | Tracking  |
| ----------------- | ----------- | ------ | --------- |
| Body              | 14px        | 400    | —         |
| Page title (h1)   | 22px        | 600    | -0.015em  |
| Page subtitle     | 13.5px      | 400    | —         |
| Prose h1          | 28px        | 700    | -0.02em   |
| Prose h2          | 19px        | 600    | -0.01em   |
| Prose h3          | 15.5px      | 600    | —         |
| Prose body        | 15px / 1.7  | 400    | —         |
| Uppercase label   | 10.5–12px   | 500–600 | 0.06–0.08em |
| Status pill       | 11.5px      | 500    | 0.01em    |
| Mono (ADR-###)    | 13–14px     | 400    | —         |

### 1.6 Radius, shadow, spacing

| Token        | Value                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| `--radius-sm`| 6px — buttons, inputs, pills on buttons                                |
| `--radius`   | 10px — cards, tables, meter tracks                                     |
| `--radius-lg`| 14px — auth card, AI summary card, brain-dump stage cards              |
| `--shadow-sm`| `0 1px 2px rgba(28,27,24,0.04)` — buttons, cards                       |
| `--shadow-md`| `0 1px 2px rgba(28,27,24,0.04), 0 4px 12px rgba(28,27,24,0.04)` — auth |
| `--shadow-lg`| `0 2px 4px …, 0 12px 32px rgba(28,27,24,0.08)` — popovers, toasts      |

**Density** (root attribute `data-density="comfortable|compact"`):

| Token          | Comfortable | Compact |
| -------------- | ----------- | ------- |
| `--row-pad-y`  | 14px        | 10px    |
| `--row-pad-x`  | 20px        | 16px    |
| `--card-pad`   | 24px        | 18px    |

MVP ships **comfortable** as the default.

---

## 2. Auth layout — Login & Register

Reference: PDF pages 1–2.

### 2.1 Container

- Full-viewport (`min-h-screen`), centered via `display: grid; place-items: center`.
- Background: `var(--bg)` plus two soft radial gradients of `color-mix(in oklch, var(--accent) 6%, transparent)` at `15% 0%` and `100% 100%`. With Slate as the accent these read as barely-there slate wash — keep them; do not replace with a flat bg.
- Page padding: `40px 20px`.

### 2.2 Card

- `max-width: 400px`, `width: 100%`, `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: var(--radius-lg)` (14px), `padding: 36px 32px`, `box-shadow: var(--shadow-md)`.

### 2.3 Logo row (inside card, centered, `margin-bottom: 28px`)

- `AV` mark: `32px × 32px`, `border-radius: 8px`, gradient `linear-gradient(135deg, var(--accent), var(--accent-strong))`, mono font, white weight-700 text.
- Wordmark next to it: `ADR Vault`, 16px, weight 600, `-0.01em` tracking.

### 2.4 Heading block

- `h1` (e.g. "Sign in to your vault" / "Create your account"): 22px, weight 600, `-0.015em`, centered, `margin: 0 0 6px`.
- Sub paragraph: 13.5px, `var(--text-muted)`, centered, `margin: 0 0 24px`.

### 2.5 Fields

Each field is a block with `margin-bottom: 14px`:

- Label: 12.5px, weight 500, `margin-bottom: 6px`, color `var(--text)`.
- **Password label is a flex row**: the word "Password" on the left, a small `Forgot?` link on the right at 11.5px, `var(--text-faint)`, no underline. (Login only.)
- Input: full width, `padding: 9px 12px`, `border: 1px solid var(--border)`, `border-radius: 6px`. Focus = `border-color: var(--accent)` + 3px box-shadow ring at `color-mix(in oklch, var(--accent) 15%, transparent)`.
- Hint (e.g. "Minimum 8 characters."): 11.5px, `var(--text-faint)`, `margin-top: 4px`.
- Error: 12px, `var(--danger)`, replaces hint slot when present.

### 2.6 Submit button

- Full-width primary, `padding: 10px 14px`, `margin-top: 6px`, text centered, `justify-content: center`.
- Busy state swaps label to "Signing in…" / "Creating account…" and disables.

### 2.7 Footer link

- Centered, 13px, `var(--text-muted)`, `margin-top: 18px`.
- Anchor: `var(--accent-strong)` (slate-800), weight 500, no underline by default, underline on hover.

### 2.8 Register-specific fields (in order)

1. **Display name** — text input, autocomplete `name`. Min 2 chars.
2. **Work email** — email input, autocomplete `email`.
3. **Password** — password input, autocomplete `new-password`, with the "Minimum 8 characters." hint. Min 8 chars.

(Password min length must stay aligned with `packages/core/src/constants/auth.ts` and Supabase `minimum_password_length`.)

---

## 3. App shell — Sidebar

Reference: PDF pages 3–7. Layout: CSS grid, `grid-template-columns: 240px 1fr`. Sidebar is `position: sticky; top: 0; height: 100vh`, background `var(--surface)`, `border-right: 1px solid var(--border)`, `padding: 16px 12px`, flex column.

### 3.1 Top section — Logo + workspace label

- Row with `gap: 10px`, `padding: 6px 10px 18px`.
- `AV` mark: `26px × 26px`, `border-radius: 7px`, same slate gradient as auth, mono weight-700 13px.
- Workspace block: two stacked lines.
  - Line 1: `ADR Vault` — 15px, weight 600, `-0.01em`.
  - Line 2: `Acme · Platform` — 11px, `var(--text-faint)`, 1px above baseline.

### 3.2 Grouped navigation

Two groups. Each group is `display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px`.

**Group header** (`.nav-group-title`): 10.5px, uppercase, `letter-spacing: 0.08em`, `var(--text-faint)`, `padding: 6px 10px 4px`.

| Group       | Items                                                                 |
| ----------- | --------------------------------------------------------------------- |
| WORKSPACE   | `All ADRs` (with badge count e.g. `15`), `Search & Ask`               |
| CREATE      | `New ADR`, `AI Brain Dump`                                            |

**Nav item** (`.nav-item`):

- Row with `gap: 10px`, `padding: 7px 10px`, `border-radius: 6px`, no border, transparent bg.
- Icon: 16px, `opacity: 0.85`. Icons used: `docs` (All ADRs), `ask`/chat bubble (Search & Ask), `plus` (New ADR), `wand`/sparkles (AI Brain Dump).
- Label: 13.5px, weight 500. Default color `var(--text-muted)`; hover + active raise to `var(--text)` with `var(--surface-2)` bg.
- Optional trailing count: `margin-left: auto`, 11.5px, mono, `var(--text-faint)`.
- **Active state has no accent highlight** — the prototype uses the same surface-2 swap as hover. Keep it subtle; the current-page marker comes from the page header, not the nav.

### 3.3 Sidebar footer (pinned to bottom)

`margin-top: auto; padding: 12px 10px; border-top: 1px solid var(--border)`.

**Usage meter** (`.usage-meter`):

- Container: `padding: 10px`, `var(--surface-2)`, `border-radius: 6px`.
- Header row: "Daily AI usage" (11px, `var(--text-muted)`) left, percentage right (mono, `var(--text)`).
- Bar track: 4px tall, `var(--border)`, rounded full. Fill: `var(--accent)` (slate). Turns `var(--warn)` (amber) at ≥80%, `var(--danger)` at 100%.
- Reset line: "`41,550 tokens left · resets 00:00 UTC`" — 10.5px, `var(--text-faint)`.

**User chip** (`.user-chip`, `padding: 8px 10px 0`):

- Avatar (28px, `surface-3` bg, initials, weight 600 11px).
- Two stacked lines: name (13px, weight 500, truncate), email (11px, `var(--text-faint)`).
- Trailing ghost icon button: `logout` icon, 14px, opens sign-out.

### 3.4 Nav variants (via `data-nav` root attr — tweak, not MVP default)

- `sidebar` (default, 240px)
- `collapsed` (64px — text hidden, icons centered, footer collapses to avatar only)
- `top` (horizontal header instead of sidebar)

MVP ships sidebar variant; build the others only if/when the tweak surface is needed.

---

## 4. Main layout top section — Page header

Reference: PDF pages 3–5, 7. All pages share the same header chrome.

### 4.1 Container

- `padding: 22px 32px 18px`, `border-bottom: 1px solid var(--border)`, `background: var(--surface)`, `position: sticky; top: 0; z-index: 20`.
- Inner row: flex, `align-items: flex-start`, `gap: 16px`.

### 4.2 Left block (title + description)

- `flex: 1`.
- `h1.page-title`: 22px, weight 600, `-0.015em`, `margin: 0`.
- `.page-sub`: 13.5px, `var(--text-muted)`, `margin-top: 3px`.

Example on list page:

> **All ADRs**
> Every architectural decision captured by your team.

### 4.3 Right block (quick actions)

- Flex row, `gap: 8px`, never wraps.
- **Secondary**: `AI Brain Dump` — ghost/default button with `wand` icon (14px) + label, routes to `/new/ai`.
- **Primary**: `New ADR` — `btn-primary` (slate bg, white text) with `plus` icon (14px) + label, routes to `/new/manual`.

The same two buttons appear on every empty/full list state. On the detail page the right block changes — see §6.

### 4.4 Body container

Directly below the header: `.page-body { padding: 24px 32px 48px; max-width: 1280px; width: 100% }`.

---

## 5. ADR list layout

Reference: PDF page 3.

### 5.1 Filter bar

Single row, `display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 16px`.

**Status chips** (`.chips`):

- Segmented pill container: `var(--surface-2)` bg, 3px padding, `border-radius: 7px`, `border: 1px solid var(--border)`.
- Order: `All`, then the five statuses in ADR-lifecycle order — **Draft, Proposed, Accepted, Deprecated, Superseded**.
- Each chip: `padding: 5px 11px`, 12.5px, weight 500, `border-radius: 5px`, transparent by default.
- Count pill appended inside: mono 11px, `var(--text-faint)`, e.g. `Accepted 12`.
- Active chip: `background: var(--surface)`, `color: var(--text)`, `box-shadow: var(--shadow-sm)`. The active chip does **not** gain accent color — the emphasis is white surface on surface-2 track.

**Search input** (`.search-wrap`):

- `flex: 1; max-width: 380px; min-width: 200px`.
- Leading search icon at 10px/50% (14px, `var(--text-faint)`), input `padding-left: 32px`.
- Placeholder: `Search title, summary, or ADR-###`.
- Matches against title, summary, and zero-padded number.

**Sort control** (pushed to far right via `margin-left: auto`):

- `Sort` label (12px, `var(--text-faint)`) + `<select>` (160px wide).
- Options in order: `Last updated` (default), `Date created`, `ADR number`, `Title A–Z`.

### 5.2 Empty state

When filters produce zero rows, render `.empty`:

- `text-align: center; padding: 60px 20px; border: 1px dashed var(--border-strong); border-radius: 14px; background: var(--surface)`.
- Title: "No ADRs match those filters" (15px, weight 600).
- Body: "Try clearing the search or switching status." (13.5px, muted).
- CTA: `Reset filters` — default button that clears both `status` and `q`.

### 5.3 Table (`.adr-table`)

Wrapped in a card (`border: 1px solid var(--border); border-radius: 10px; overflow: hidden`). The table fills it (no internal borders besides row dividers).

**Columns** (fixed widths where noted):

| Col      | Width | Header       | Cell content                                                                |
| -------- | ----- | ------------ | --------------------------------------------------------------------------- |
| ADR      | 90px  | `ADR`        | `ADR-001` (mono, `var(--text-muted)`, zero-padded to 3 digits)              |
| Title    | auto  | `TITLE`      | Title (14px, weight 500) + single-line truncated summary below (12.5px muted, `-webkit-line-clamp: 1`, first 130 chars of stripped summary + `…`) |
| Status   | 130px | `STATUS`     | Status pill (see §7.1)                                                      |
| Creation | 140px | `CREATION`   | Method badge (see §7.2)                                                     |
| Author   | 160px | `AUTHOR`     | Avatar (22px) + first name only                                             |
| Updated  | 130px | `UPDATED`    | Relative date: `Today`, `Yesterday`, `Nd ago`, `Nw ago`, or `Mon D, YYYY` beyond 30 days |

**Header cells**: 11px, uppercase, `letter-spacing: 0.07em`, weight 500, `color: var(--text-faint)`, `padding: 10px var(--row-pad-x)`, `background: var(--surface-2)`, bottom border. First/last header cells get `border-top-*-radius: 10px`.

**Body cells**: `padding: var(--row-pad-y) var(--row-pad-x)`, 14px, `vertical-align: middle`, bottom-bordered.

**Row interaction**: entire `<tr>` is clickable (`cursor: pointer`), hover = `background: var(--surface-2)` (`transition: background 80ms`), navigates to `/adrs/:num`.

### 5.4 Sorting behavior

Client-side in MVP (list is small). Comparators:

- `updated` → `b.updated.localeCompare(a.updated)` (ISO timestamps, descending).
- `created` → same, on `created`.
- `number` → `b.num - a.num` (newest ADR number first).
- `title` → `a.title.localeCompare(b.title)` (A→Z).

---

## 6. Single ADR view

Reference: PDF page 4.

### 6.1 Detail page header

The standard sticky page header is reused, but its contents are laid out differently.

**Left block:**

1. **Back button (ghost-sm)** on its own line: `margin-bottom: 8px; margin-left: -8px` so the chevron visually aligns with the title below. Copy: `← All ADRs` (`arrow_left` icon 13px + label).
2. **Key row** — flex row, `gap: 10px`, `margin-bottom: 4px`:
   - `ADR-001` — mono, 13px, weight 500, `var(--text-muted)`.
   - Status pill (§7.1) reflecting the **current** status (respects optimistic updates).
   - Method badge (§7.2).
3. **Title** — `h1.page-title` (22px / 600 / -0.015em) with `margin-top: 2px`.

**Right block** (flex row, `gap: 8px`, `flex-shrink: 0`):

- **Status dropdown trigger** — default button, label "Status" + `chev_down` icon. Disabled for non-authors. On click opens a card-popover (`position: absolute; right: 0; top: 38px; z-index: 30; padding: 4px; min-width: 160px; shadow-lg`) listing all five statuses. Each row is a ghost-sm button showing the status pill; the currently selected status gets a trailing `check` icon. Selecting fires a toast (`Status updated to {status}.`) and optimistically updates both the key-row pill and the meta block.
- **Edit link** — default button (`edit` icon + "Edit"), visible only when the viewer is the author. Opens the Tiptap editor route.

> **Author guard:** both Status change and Edit live behind `adr.author.id === currentUser.id`. Non-authors still see the Status trigger but disabled (keeps layout stable).

### 6.2 Body grid

`display: grid; grid-template-columns: 1fr 300px; gap: 40px; align-items: start`. Collapses to single column below `1100px` viewport.

### 6.3 Main column

**AI summary card** — prominent, first element.

- `background: linear-gradient(180deg, var(--accent-soft), var(--surface))` (slate-100 fading to white).
- `border: 1px solid var(--accent-border)` (slate-300), `border-radius: 14px`, `padding: 20px 22px`, `margin-bottom: 28px`.
- Header row (space-between, `margin-bottom: 8px`):
  - Left: `h3` — 12px, uppercase, `letter-spacing: 0.08em`, weight 600, `color: var(--accent-strong)` (slate-800), preceded by `spark` icon 12px. Copy: `AI Summary`.
  - Right: **Regenerate** ghost-sm button (`wand` icon 12px + label), author-only. Disabled and spinner-replaced while regenerating; toast on completion.
- Body: `<p>` 14.5px, 1.6 line-height, plain text (the AI summary is a string, not rich).

**Prose body** — the ADR content itself. Use the `.prose` rules in §1.5:

- Sections from the schema: `Context`, `Decision`, `Consequences`, `Alternative solutions`.
- `h2` headings are 19px / 600 / -0.01em with `margin: 28px 0 10px`.
- Inline code and `pre` blocks use `var(--surface-2)` bg with `radius-sm` corners and JetBrains Mono.
- Blockquotes (used for the "Alternative solutions" callout in the PDF) get a left border (`3px solid var(--border-strong)`), `surface-2` bg, `color: var(--text-muted)`, rounded right.
- Max measure: `72ch` for readability — do not stretch prose to the full column width.

### 6.4 Side column

**Metadata card** (`.card`, `padding: 18px`):

- `meta-list` = flex column, `gap: 14px`.
- Each row has two stacked lines, `gap: 4px`:
  - Key: 11px, uppercase, `letter-spacing: 0.06em`, weight 500, `var(--text-faint)`.
  - Value: 13.5px, `var(--text)`.
- Rows in order: **Author** (avatar 22px + name), **Created** (relative date), **Last updated** (relative date), **Creation method** (method badge).

**Linked ADRs block** (below the meta card, `margin-top: 18px`):

- Section header row — flex, space-between, `padding: 0 4px 8px`:
  - Label: `Linked ADRs` — 11px uppercase, `letter-spacing: 0.06em`, `var(--text-faint)`, weight 500.
  - **Link** button (author-only): ghost-sm with `plus` icon (12px) + label. Opens the link-picker dialog.
- Empty state: dashed-border panel (`1px dashed var(--border)`), `padding: 12px 14px`, 12.5px, `var(--text-faint)`, center: `No links yet.`
- Populated state: a stack of `.link-item` cards, each:
  - `display: flex; gap: 10px; align-items: center`, `padding: 10px 12px`, `border: 1px solid var(--border)`, `border-radius: 6px`, `background: var(--surface)`, 13px, `margin-bottom: 6px`.
  - Hover: `border-color: var(--border-strong)` only — no bg swap.
  - Layout: `link-kind` badge (10.5px, uppercase, weight 600, `letter-spacing: 0.06em`, `var(--text-muted)`, `min-width: 84px`) — one of `DEPENDS ON`, `INFORMS`, `RELATED TO`, `SUPERSEDED BY`, `SUPERSEDES` — then a two-line block with the linked ADR's title (13px weight 500, truncated) and `ADR-NNN · {status}` (mono, 12px, muted) underneath, then a trailing `chev_right` icon.
  - Clicking navigates to the linked ADR.

---

## 7. Shared component anatomy

### 7.1 Status pill (`StatusPill`)

```
<span class="pill status-{lowercase}">
  <span class="dot" />
  {Label}
</span>
```

- `display: inline-flex; align-items: center; gap: 6px`.
- `padding: 3px 9px; border-radius: 999px`.
- `font-size: 11.5px; font-weight: 500; letter-spacing: 0.01em; white-space: nowrap`.
- `border: 1px solid` — uses the status triplet from §1.4.
- `.dot` is `6px × 6px`, `currentColor`, 0.9 opacity.

Five variants: `status-draft`, `status-proposed`, `status-accepted`, `status-deprecated`, `status-superseded`.

### 7.2 Method / creation badge (`MethodBadge`)

```
<span class="badge [ai]">
  {spark icon when ai}
  {short label}
</span>
```

- `padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 500`.
- Manual variant: `background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border)`. Label: `Manual`.
- AI variants: `background: var(--accent-soft); color: var(--accent-strong); border: 1px solid var(--accent-border)` (slate-100 / slate-800 / slate-300 under the Slate accent). Prefixed with `spark` icon 11px. Labels: `✨ AI` (generated from brain-dump, unmodified), or `✨ AI · Edited` (generated then hand-edited).

### 7.3 Avatar

- Circle, default 28px (22px in dense rows, 32px for the auth-card logo-parallel).
- `background: var(--surface-3)`, `color: var(--text)`, weight 600.
- Font size scales: 9.5px for ≤22px avatars, 11px for 28px.
- Content: two-letter initials (`Mira Chen` → `MC`). No photo support in MVP.

### 7.4 Buttons

- `.btn` — 13px / weight 500, `padding: 8px 14px`, `border-radius: 6px`, `border: 1px solid var(--border)`, `background: var(--surface)`, shadow-sm. Hover raises border to `--border-strong` and bg to `--surface-2`.
- `.btn-primary` — `var(--accent)` (slate-600) bg/border, white text; hover → `var(--accent-strong)` (slate-800).
- `.btn-ghost` — transparent bg and border, no shadow; hover bg `--surface-2`.
- `.btn-danger` — text `var(--danger)`; hover bg `var(--danger-soft)`, border `#fecaca`.
- `.btn-sm` — `padding: 5px 10px`, 12px, `border-radius: 5px`.
- Disabled: `opacity: 0.5; cursor: not-allowed`.

### 7.5 Toast (global feedback)

- Host: `position: fixed; bottom: 20px; right: 20px; z-index: 9999`, stack with `gap: 8px`.
- Toast: 10px/14px padding, `radius-sm`, shadow-lg, 13px, min 220px / max 360px, 180ms slide+fade in animation, auto-dismiss after ~3.2s.
- `ok` variant: `background: #0f172a` (slate-900), white text.
- `err` variant: `background: #7f1d1d` (red-900).
- Leading icon: `check` for ok, `warn` for err, 0.8 opacity.

---

## 8. Implementation notes for the current stack

- **Base ring system.** `globals.css` already defines shadcn tokens in oklch. Keep those for `--background`, `--foreground`, `--card`, `--border`, `--ring`, etc., but override the specific values to the hex equivalents in §1.1–§1.4 (either by converting to oklch or by adding a second token layer with `--accent`, `--accent-strong`, `--accent-soft` as direct CSS custom properties alongside `--primary`).
- **Primary = Slate.** Set `--primary: oklch(0.446 0.043 257.28)` (slate-600) and `--primary-foreground: white`. The Button component's default variant will then render correctly without prop changes.
- **Font swap.** Replace the Geist imports in `layout.tsx` with `Inter_Tight` and `JetBrains_Mono` from `next/font/google`, then update `--font-sans` / `--font-mono` in `globals.css`. Apply the `font-feature-settings` from §1.5 on `body` / `.mono`.
- **Status triplets & badge variants.** Extend `apps/web/src/components/ui/badge.tsx` with `draft | proposed | accepted | deprecated | superseded` variants via `class-variance-authority`, using the §1.4 triplets. Keep `ai` as a separate badge variant for the method badge.
- **Table.** Install the shadcn `table` primitive (not yet in the repo per `apps/web/src/components/ui/`). Wrap it in a card as per §5.3 — the table itself should have no outer border; the card provides it.
- **Sticky header + sidebar.** Next.js route groups (`(auth)` vs `(app)` — ADR-002) give the two shells. The auth layout is center-grid with no chrome. The app layout puts the 240px sidebar + main column grid at the root; `page-header` is owned by each leaf page so the title/actions can vary.
- **Route persistence.** The prototype uses `localStorage` to restore the last route on refresh — ignore this for Next.js, the router handles it.
- **Relative dates.** Implement `fmtDate` per §5.3: `Today`, `Yesterday`, `Nd ago` (<7), `Nw ago` (<30), else `Mon D, YYYY`. Use the current date, not the frozen `2026-04-21` from the prototype.

---

## 9. Out of scope for MVP visual pass

Mentioned in the bundle but explicitly deferred:

- Dark mode (light only per the design brief).
- Collapsed / top-nav shell variants (tweak only).
- Accent swatches other than Slate.
- Edit-mode Tiptap shell (covered separately when the editor is wired up).
- Password reset flow (`Forgot?` toasts "deferred post-MVP" in the prototype).

---

### References

- [`mvp_design.pdf`](./mvp_design.pdf) — six-page visual spec (login, register, list, detail, AI brain dump, search & ask).
- [ADR-002 — Route groups](../adrs/adr-002-route-groups.md) — splits `(auth)` and `(app)` layouts.
- [`docs/tech-stack.md`](../tech-stack.md) — Next.js 16, Tailwind 4, shadcn (Base UI), react-hook-form, zod.
