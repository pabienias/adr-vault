# ADR-001: Authentication and Authorisation Flow

- **Status:** Accepted
- **Date:** 2026-04-08
- **Contributors:** Piotr Bienias

## Context

ADR Vault uses a monorepo with two application workspaces — a Next.js 16 frontend (`apps/web`) and a Fastify 5 REST API (`apps/api`) — backed by Supabase (PostgreSQL, Auth, Row Level Security). The original architectural intent, captured during PRD planning, was:

> "All data traffic and business logic must route strictly through the Fastify REST API. The Next.js frontend will not communicate directly with Supabase."

This rule was designed to keep the API as the single source of truth for business logic. However, when planning the authentication implementation (Phase 1b — user registration, login, logout, session persistence), we had to decide whether this rule should extend to **authentication operations** (signup, signin, signout, token refresh) or only to **data/business operations** (ADR CRUD, AI features, usage tracking).

Supabase Auth (GoTrue) provides a full authentication service with its own endpoints, JWT issuance, refresh token rotation, and session management. The `@supabase/ssr` package offers cookie-based session handling specifically designed for SSR frameworks like Next.js. This raised the question: should we proxy authentication through Fastify, or let the frontend communicate with Supabase Auth directly?

### Key Constraints

- Supabase Auth already handles password hashing (bcrypt), rate limiting (30 sign-ups per 5 minutes), refresh token rotation, and JWT issuance.
- The `profiles` table is auto-populated via a PostgreSQL trigger (`handle_new_user()`) on `auth.users` INSERT — no API call needed.
- `@supabase/ssr` provides `createBrowserClient` (auto cookie management via `document.cookie`) and `createServerClient` (explicit cookie callbacks for Server Components and Middleware).
- Next.js Middleware can intercept requests to refresh tokens and protect routes before they reach React.
- Row Level Security (RLS) policies on all tables enforce access control at the database level using `auth.uid()`.

## Decision

**Split responsibility: Next.js owns authentication; Fastify owns authorisation.**

### Authentication (Next.js ↔ Supabase Auth)

The Next.js frontend communicates **directly** with Supabase Auth for all authentication operations:

| Operation | Client | Method |
|-----------|--------|--------|
| Registration | Browser client (`createBrowserClient`) | `supabase.auth.signUp()` |
| Login | Browser client | `supabase.auth.signInWithPassword()` |
| Logout | Browser client | `supabase.auth.signOut()` |
| Token refresh | Server client in Next.js Middleware (`createServerClient`) | `supabase.auth.getUser()` — triggers automatic refresh |
| Session read (SSR) | Server client in Server Components | `supabase.auth.getUser()` |

Session tokens (access + refresh) are stored in **browser cookies** managed by `@supabase/ssr`. The browser client sets them automatically; the server client reads/updates them via explicit `getAll`/`setAll` cookie callbacks.

### Authorisation (Fastify)

The Fastify API is **not involved** in authentication flows. It receives the Supabase access token (JWT) in the `Authorization` header from the frontend and:

1. **Verifies** the JWT signature and expiry using `@fastify/jwt` (configured with Supabase's `JWT_SECRET`).
2. **Extracts** the user identity (`sub` claim → `user_id`) and attaches it to the request.
3. **Delegates** row-level enforcement to PostgreSQL RLS policies, which use `auth.uid()` from the JWT to scope queries.

The API never calls `supabase.auth.signUp()`, `signIn()`, or any Auth endpoints. It uses the **service role key** only for operations that require elevated access (e.g., admin actions or writing to `user_ai_usage`).

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser                                                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Next.js (Client Components)                                  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │ Registration│  │    Login     │  │      Logout         │  │  │
│  │  │    Form     │  │    Form     │  │      Button         │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │  │
│  │         │                │                     │             │  │
│  │         ▼                ▼                     ▼             │  │
│  │  ┌─────────────────────────────────────────────────────────┐│  │
│  │  │         Supabase Browser Client (@supabase/ssr)         ││  │
│  │  │     signUp() · signInWithPassword() · signOut()         ││  │
│  │  └───────────────────────┬─────────────────────────────────┘│  │
│  └──────────────────────────┼──────────────────────────────────┘  │
│                             │ Cookies (auto-managed)               │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Supabase Auth    │
                    │  (GoTrue)         │
                    │                   │
                    │  • JWT issuance   │
                    │  • Token refresh  │
                    │  • Rate limiting  │
                    └─────────┬─────────┘
                              │ INSERT auth.users
                              ▼
                    ┌───────────────────┐
                    │  PostgreSQL       │
                    │  • profiles       │─── trigger: handle_new_user()
                    │  • RLS policies   │
                    └───────────────────┘
                              ▲
                              │ Queries with JWT context
┌─────────────────────────────┼──────────────────────────────────────┐
│  Next.js (Server)           │                                      │
│  ┌──────────────────────────┴──────────────────────────────────┐  │
│  │  Middleware (token refresh via server client)                │  │
│  │  Server Components (session read via server client)         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│                    Data requests (with JWT in Authorization header) │
│                              │                                     │
└──────────────────────────────┼─────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Fastify API        │
                    │                     │
                    │  • JWT verification │
                    │    (@fastify/jwt)   │
                    │  • Business logic   │
                    │  • ADR CRUD         │
                    │  • AI orchestration │
                    └──────────┬──────────┘
                               │ Service role queries
                               ▼
                    ┌───────────────────┐
                    │  PostgreSQL       │
                    │  (via Supabase)   │
                    └───────────────────┘
```

### Clarification on NFR-2.1

The PRD states (NFR-2.1):

> "The frontend must not communicate directly with the database. All data fetching, mutations, and business logic must route through the central REST API."

This decision **does not violate** NFR-2.1. The frontend communicates with **Supabase Auth** (a dedicated authentication service), not with the database directly. All **data operations** (ADR CRUD, AI features, usage tracking) still route through Fastify. The distinction is:

- **Authentication** = identity operations (who are you?) → Supabase Auth
- **Data/Business** = domain operations (create ADR, generate draft) → Fastify API

## Consequences

### Positive

- **No authentication proxy layer.** Eliminates the need to build and maintain Fastify endpoints that simply forward calls to Supabase Auth (`POST /api/auth/register`, `POST /api/auth/login`, etc.). This removes an entire surface area of code with no added value.
- **Native cookie-based sessions.** `@supabase/ssr` handles token storage in cookies automatically. The browser client sets them; Next.js Middleware refreshes them. No custom token management needed.
- **Reduced latency.** Authentication calls go directly from the browser to Supabase Auth instead of browser → Fastify → Supabase Auth → Fastify → browser.
- **Better alignment with Supabase ecosystem.** `@supabase/ssr` is designed for this exact pattern — direct auth from the frontend with server-side session reading. Fighting this pattern would mean reimplementing what the library already provides.
- **Middleware-based token refresh.** Next.js Middleware can silently refresh expired tokens on every server request, ensuring the user never encounters an expired session during normal browsing.
- **Separation of concerns.** Authentication (identity) and authorisation (access control) are cleanly separated between two systems, each handling what it does best.

### Negative

- **Two Supabase connection points.** Both `apps/web` (auth) and `apps/api` (data, service role) communicate with Supabase. This is a deviation from the original "API as single gateway" intent and requires developers to understand which client is used where.
- **Frontend has a Supabase dependency.** `apps/web` now depends on `@supabase/supabase-js` and `@supabase/ssr`. If Supabase is ever replaced, auth code in the frontend needs migration in addition to the backend.
- **Cookie management complexity.** The server client requires explicit cookie callbacks (`getAll`/`setAll`) in Server Components and Middleware. This is well-documented but adds boilerplate that wouldn't exist in a proxy pattern.
- **Split mental model.** Developers must understand that auth requests go to Supabase directly, while data requests go to Fastify. This split is logical but needs to be clearly documented (this ADR serves that purpose).

### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Supabase Auth rate limits may be too restrictive | Supabase config allows tuning (`rate_limit` in `config.toml`); current limits (30 sign-ups/5min) are sufficient for expected usage |
| JWT secret rotation | Both Fastify (`JWT_SECRET` env var) and Supabase share the same secret; rotation requires updating both |
| Cookie size limits (4KB per cookie) | Supabase access tokens are typically under 1KB; refresh tokens are stored in a separate cookie — unlikely to exceed limits |

## Alternative Solutions Considered

### Alternative A: Full API Proxy (Rejected)

All authentication operations route through Fastify:

```
Browser → Fastify POST /api/auth/register → supabase.auth.signUp() → Response → Browser
```

**Why rejected:**
- Adds a passthrough layer with no business logic — Fastify would simply forward requests to Supabase Auth and relay responses.
- Requires manual session token management: Fastify receives the session from Supabase, must set cookies on the response, and must handle refresh logic.
- Loses the benefits of `@supabase/ssr` cookie management, which is specifically designed for direct frontend-to-Auth communication.
- Doubles the latency for every auth operation.
- Increases the API surface area and maintenance burden for zero added security (RLS enforces access regardless of which client makes the call).

### Alternative B: Hybrid with API Registration (Rejected)

Registration routes through Fastify (for server-side validation and potential business logic), while login/logout go directly to Supabase Auth.

**Why rejected:**
- The `handle_new_user()` trigger already creates the `profiles` row — no business logic needed in the API for registration.
- Creates an inconsistent pattern where some auth operations go through the API and others don't, making the architecture harder to reason about.
- If server-side validation beyond Supabase's built-in checks is ever needed, it can be added to Next.js Server Actions or API Route Handlers without involving Fastify.
