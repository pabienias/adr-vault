# ADR-004: Server-Side Current User Resolution with `React.cache`

- **Status:** Accepted
- **Date:** 2026-04-23
- **Contributors:** Piotr Bienias

## Context

With the `(app)` route group's layout ([ADR-002](./adr-002-route-groups.md)) becoming an async Server Component that reads the authenticated user, and with multiple future consumers on the horizon — ADR list (author-id checks), ADR detail pages (edit-permission gating), Server Actions, future Server Components across Phases 2–4 — the project needs a single, idiomatic way to resolve the current user on the server.

Three concerns must be balanced:

1. **Reusability.** Multiple Server Components will need identity; inlining `createClient()` + `auth.getUser()` in each caller leads to duplicated fallback logic (display_name null vs empty-string handling, email defaulting).
2. **Performance.** Each call to `supabase.auth.getUser()` is an HTTP round-trip to Supabase Auth. If a layout and its nested page both need the user, a naive implementation doubles the network cost per request.
3. **Testability.** The fallback logic (what counts as a "present" display name, how to handle a missing email) should be unit-testable in isolation without spinning up layouts or the route tree.

## Decision

**Introduce a `getCurrentUser()` helper in `apps/web/src/features/auth/server/get-current-user.ts`, wrapped in `React.cache` to memoize the fetch per request.** The helper returns a normalized `CurrentUser` shape (`{ id, email, displayName }`) and is the only server-side code path through which Server Components read the authenticated user.

```ts
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('getCurrentUser called without an authenticated user');
  // ...normalization...
});
```

### What the helper owns

- Calling Supabase via the Step 1.1 server client (not re-implementing cookie handling).
- Interpreting `user_metadata.display_name`: only non-empty strings are returned; everything else (null, undefined, empty, whitespace-only, non-string) normalizes to `null`.
- Defaulting `email` to `''` when Supabase returns `undefined` (should never happen in practice; defensive narrow).
- Throwing when no user is present, to narrow the return type for callers that rely on Middleware having already guarded the route.

### What the helper does not own

- Access control. Middleware ([ADR-001](./adr-001-authentication-authorisation-flow.md)) decides who may reach a given route. The helper's `throw` is a type-narrowing safety net, not a policy boundary.
- Refresh. Middleware's `updateSession` handles token refresh on every navigation. The helper reads the already-refreshed cookies.
- Identity display rules. Components that render the identity decide how to visually fall back (e.g., primary line = display name or email per `navigation-spec.md`); the helper only normalizes the raw fields.

## Consequences

### Positive

- **One network call per request.** `React.cache` memoizes the async function for the lifetime of a single render. A layout and its nested page can both call `getCurrentUser()` and share one Supabase round-trip.
- **Normalized shape, one source of truth.** The empty-string-vs-null quirk of `display_name` is handled in exactly one place. Components and tests reason about `displayName: string | null`, full stop.
- **Unit-testable in isolation.** Tests mock `createClient` once and exercise all six branches (present, absent, empty, whitespace-only, non-string, throw) against the helper directly — no layout or Next.js context required.
- **Aligned with Next.js + RSC idioms.** `React.cache` is the official mechanism for per-request memoization of server-only data. Consumers write idiomatic `const user = await getCurrentUser()` rather than threading props or context.
- **Works with any future Server Component.** No plumbing needed when Phase 2 adds ADR list author checks or Phase 4 adds Server Actions — they import and call.

### Negative

- **One extra file versus inlining.** A new file in `features/auth/server/` is created for a function that, today, has one caller. This is accepted because the second, third, and fourth callers are already visible on the roadmap.
- **Server-only coupling is implicit.** The helper has no `import 'server-only'` directive. Its transitive import of `next/headers` (via the server Supabase client) means importing it from a Client Component fails at build time — but not as loudly as `server-only` would. Acceptable for now; revisit if accidental client imports become a problem.
- **The `throw` is an unusual contract.** Consumers expect a `CurrentUser`, not `CurrentUser | null`, and rely on Middleware to ensure the throw never fires. A future `useCurrentUser` Client-Component helper (if needed) would need its own contract; this ADR does not cover the client side.

## Alternative Solutions Considered

### Alternative A: Inline fetch in each caller (Rejected)

Each layout / page / Server Action calls `createClient()` and `auth.getUser()` directly, duplicating the fallback normalization.

**Why rejected:** Duplicated normalization drifts. The empty-string `display_name` case becomes a trap: the first author handles it, the second forgets, and bug reports diverge across pages. Also doubles the network cost per request when a layout and its page both need the user.

### Alternative B: Plain reusable helper without `React.cache` (Rejected)

Same file and API as the decision, but without the `cache()` wrapper.

**Why rejected:** Functionally correct but loses per-request memoization. Two consumers in the same render tree cause two Supabase calls. `cache()` adds zero API surface and eliminates the duplication for free.

### Alternative C: Pass the user through middleware-injected request headers (Rejected)

Middleware already calls `auth.getUser()` for route guarding. It could stringify the user into custom headers (`x-user-id`, `x-user-email`) for Server Components to read via `headers()`.

**Why rejected:**
- Headers are `string | null` — complex metadata requires ad-hoc JSON encoding.
- PII surface: any code path that forwards or logs request headers leaks identity data.
- Tightly couples every Server Component to the middleware matcher; a route excluded from the matcher has no headers, producing a different failure mode than Middleware's own redirect.
- Fights the App Router's RSC data-flow model, which is "Server Components fetch their own data." Middleware's role per [ADR-001](./adr-001-authentication-authorisation-flow.md) is *guard and refresh*, not *transport*.

### Alternative D: React Context provider (Rejected)

Fetch the user in the layout, pass it down via a Context Provider for nested consumers to read.

**Why rejected:** React Context only works for Client Components. Server Components cannot consume context. Since the sidebar and its current subtree are Server Components, context adds no value and would force unnecessary `'use client'` boundaries. When Phase 4 introduces client-side logout, a small user-context provider *may* be added for client consumers, but that is an additive decision, not a replacement for this helper.

### Alternative E: Manual JWT decode from cookies (Rejected)

Skip the Supabase SDK entirely; decode the session JWT from the cookie directly.

**Why rejected:** Decoding without validating is a security hole — expired or tampered tokens would be trusted. Re-implementing validation (JWKS lookup, signature check, expiry enforcement) is duplicate engineering of what `auth.getUser()` already does correctly. Violates [ADR-001](./adr-001-authentication-authorisation-flow.md)'s trust-boundary principle.

## Notes on caches and logout safety

`React.cache` is **per-request-scoped** — it lives only for the duration of a single server render and does not persist across HTTP requests. A logged-out user cannot see stale authenticated data via this cache, because the next request receives a fresh cache and re-fetches via Supabase.

The cache that *can* briefly show stale UI after logout is Next.js's client-side **Router Cache**, which is independent of this decision. Step 4.2's logout flow mitigates it by redirecting to `/login` on success — a full navigation that passes through Middleware, which re-validates the session on every request and is the true trust boundary.
