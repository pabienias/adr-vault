# ADR-002: Next.js Route Groups for Authentication Boundary

- **Status:** Accepted
- **Date:** 2026-04-21
- **Contributors:** Piotr Bienias

## Context

With authentication in place ([ADR-001](./adr-001-authentication-authorisation-flow.md)), the next phase introduces the authenticated application shell — a persistent sidebar with navigation and a logout button — while the unauthenticated pages (login, register) must keep their existing centred-card presentation. The two sets of pages need structurally different layouts, not just different content.

Before this decision, the `apps/web/src/app` tree was flat:

```
app/
├── layout.tsx       # Root layout — global providers, fonts
├── page.tsx         # Home (currently unauthenticated-accessible)
├── login/page.tsx   # Inline <Card> wrapper + form
└── register/page.tsx # Inline <Card> wrapper + form
```

Two problems with keeping this shape as authenticated UI lands:

1. **Layout duplication.** The centred-card wrapper is currently reproduced inline inside each auth page. A third auth page (e.g., password reset) would repeat it again. There is no shared layout for "unauthenticated pages."
2. **No place for the app shell.** The authenticated sidebar-plus-main-content layout has no home. Putting it in the root layout would force the root layout to conditionally render chrome based on route or authentication state — pushing runtime logic into a place that should be pure scaffolding.

Next.js App Router offers **route groups** — directories wrapped in parentheses, e.g., `(auth)`, `(app)` — that allow nesting a `layout.tsx` without appearing in the URL. The decision below commits to this pattern as the project's structural boundary between unauthenticated and authenticated experiences.

### Key Constraints

- Route groups are invisible in URLs. Moving `login/page.tsx` to `(auth)/login/page.tsx` does not change the `/login` URL — no bookmarks, no tests, no existing links break.
- Next.js applies the nearest `layout.tsx` in the ancestor chain automatically. A page inside `(auth)` renders through `app/layout.tsx → (auth)/layout.tsx → page.tsx`.
- Middleware (Phase 1 of the current plan) enforces access policy based on URL, not on filesystem location. Groups are a structural convention; they do not themselves gate access.
- The MVP has no public marketing pages. Every URL is either an auth page or an authenticated page.

## Decision

**Adopt two route groups: `(auth)` for unauthenticated-only pages and `(app)` for authenticated-only pages.** Each group owns a dedicated `layout.tsx`. The root layout is trimmed to HTML scaffolding and global providers only.

### Target file tree

```
apps/web/src/app/
├── layout.tsx                     # Root layout — HTML, fonts, providers
├── globals.css
├── favicon.ico
│
├── (auth)/                        # Unauthenticated-only
│   ├── layout.tsx                 # Centred-card wrapper
│   ├── login/page.tsx
│   └── register/page.tsx
│
└── (app)/                         # Authenticated-only
    ├── layout.tsx                 # Sidebar shell + main content
    └── page.tsx                   # Home
```

### URL mapping

| URL | File |
|---|---|
| `/` | `app/(app)/page.tsx` |
| `/login` | `app/(auth)/login/page.tsx` |
| `/register` | `app/(auth)/register/page.tsx` |

All three URLs are preserved. No existing link, bookmark, test import, or external reference breaks as a result of this reorganisation.

### Layout responsibilities

The three `layout.tsx` files form a strict hierarchy. Each owns one concern; none overlap.

| Layout | Owns | Does not own |
|---|---|---|
| `app/layout.tsx` | `<html>`/`<body>`, fonts, global providers (`QueryProvider`, toast host) | Any reference to authentication state; any visible chrome |
| `app/(auth)/layout.tsx` | Centred-card presentation, narrow max-width, no nav | Any authentication logic — Middleware guarantees only unauthenticated users reach it |
| `app/(app)/layout.tsx` | Sidebar, user identity block, logout button, main content region | Per-page content; authentication redirects (Middleware's job) |

### Structure versus policy

Route groups are a **structural** convention. Access control is a **policy** concern and lives entirely in Next.js Middleware:

| Group | Unauthenticated visitor | Authenticated visitor |
|---|---|---|
| `(auth)` | Allowed — layout renders normally | Redirected to `/` |
| `(app)` | Redirected to `/login` | Allowed — layout renders normally |

This separation means a page can be moved between groups without changing its component code, and the access policy can be adjusted without touching any layout. The layouts themselves never check `isAuthenticated` — they trust that they are only reached by the right kind of visitor.

### Why no `(public)` group

ADR Vault has no public marketing pages in the MVP. Introducing a third group preemptively would be speculative structure. If a landing page is later added, creating `(public)/page.tsx` is a small change — smaller than living with an empty `(public)/` directory from day one.

## Consequences

### Positive

- **No conditional chrome in the root layout.** The root layout has no opinion about whether the visitor is logged in. It is pure HTML scaffolding and providers, which keeps it small, stable, and easy to reason about.
- **Deduplicated auth-page chrome.** The `<Card>` wrapper moves from inline-per-page to a single layout. Adding a future auth page (e.g., password reset) inherits the presentation automatically.
- **Automatic app-shell inheritance.** Every future authenticated page (ADR list, ADR detail, editor, Search & Ask) gets the sidebar shell for free by living inside `(app)`. Without the group, each new feature would re-wire the shell.
- **Clean deletion unit.** If the project ever moves to a hosted-identity provider (e.g., Clerk, Auth0 hosted pages), the entire `(auth)` group disappears in one step. The app group is untouched.
- **URLs are preserved.** The reorganisation is a pure internal refactor — no external contract changes. Bookmarks, tests, and analytics events continue to work unchanged.
- **Structure/policy separation stays clean.** Because redirects live in Middleware and not layouts, moving a page between groups is a pure structural change — the access policy follows the new URL prefix without code edits in the page itself.

### Negative

- **Contributors must understand a Next.js-specific concept.** Parentheses-wrapped directories being URL-invisible is non-obvious to someone new to App Router. The pattern is documented in Next.js's docs and recorded here, but it is still one more thing to learn.
- **Future landing page requires a small restructure.** If a public landing page is added later, the current `(app)/page.tsx` home will need to move — either to `(public)/page.tsx` or behind a different URL such as `/home`. The cost is small (one file move) but non-zero.
- **Accidental group leakage is possible.** A contributor could create `app/new-feature/page.tsx` outside either group. That page would inherit only the root layout and have neither the auth-card wrapper nor the app shell. This is a process concern, not a structural one, and is caught easily in review.

### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| A new authenticated page is created outside `(app)` and silently bypasses the shell | Middleware still protects it based on URL rules; code review catches the structural miss; a single convention doc in `apps/web/README.md` (future) codifies "new authenticated pages live in `(app)`" |
| Teams misread groups as access-control boundaries instead of structural ones | This ADR explicitly separates structure from policy; [ADR-001](./adr-001-authentication-authorisation-flow.md) is the policy reference; the two are linked |
| URL collision between groups (e.g., `(auth)/home/page.tsx` and `(app)/home/page.tsx`) | Next.js build fails loudly on such collisions — caught at build time, not runtime |

## Alternative Solutions Considered

### Alternative A: Single root layout with conditional chrome (Rejected)

Keep a flat `app/` tree and have the root layout branch on pathname or authentication state to render either the auth card wrapper or the app shell.

**Why rejected:**
- Forces the root layout to become stateful and URL-aware — the opposite of what a root layout should be.
- Either requires client-side pathname checks (hydration flicker) or server-side auth lookups inside the layout (redundant with Middleware).
- Fights the App Router's nested-layout model, which is explicitly designed for exactly this scenario.
- Scales poorly: every new "kind" of page (e.g., print-friendly exports, embedded widgets) would add another branch to the conditional.

### Alternative B: One group for auth, authenticated pages under the root (Rejected)

Place only `(auth)` in a group; leave authenticated pages like `/` at the root and let the root layout act as the app shell.

**Why rejected:**
- Asymmetric: one kind of experience is "grouped" and the other is "default." Makes the structure harder to explain.
- Re-couples the root layout to the authenticated shell, defeating the goal of keeping the root layout minimal.
- Blocks the "clean deletion unit" benefit — removing auth UX would touch the root layout.

### Alternative C: Three groups including `(public)` (Rejected)

Preemptively introduce a `(public)` group for a future landing page.

**Why rejected:**
- Speculative structure. The MVP has no public pages, so the group would be empty.
- Adds a layout with no content to own. Empty layouts are a subtle form of tech debt — they look intentional but teach no convention.
- The cost of adding `(public)` later is low (one directory, one layout, one file move) — not a cost worth paying upfront.

### Alternative D: Per-page layout composition (Rejected)

Have each page import and compose its own layout wrapper (e.g., `<AuthCardLayout>` or `<AppShellLayout>`) inside its `page.tsx`.

**Why rejected:**
- Every page must remember to wrap itself correctly — easy to forget, hard to enforce in review.
- Loses streaming and layout-stability benefits of App Router's built-in nested layouts (the layout re-renders on every navigation if it lives inside the page).
- Effectively reimplements what route groups provide natively, with less ergonomic results.
