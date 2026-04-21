# ADR-003: End-to-End Testing Strategy with Playwright

- **Status:** Accepted
- **Date:** 2026-04-21
- **Contributors:** Piotr Bienias

## Context

The existing testing setup covers unit and component behaviour only. `apps/web` uses Vitest and React Testing Library — good for component-level assertions (e.g., "the login form calls `useLogin` on submit", "validation errors render inline") — but unable to exercise anything that crosses the boundary between Next.js, the browser, and Supabase Auth.

The app-shell-navigation phase introduces three behaviours that cannot be meaningfully tested with unit-level tools:

1. **Middleware-driven route protection.** Visiting `/` while unauthenticated redirects to `/login`. Visiting `/login` while authenticated redirects to `/`. These redirects depend on cookie state interpreted by Next.js Middleware, not by any React component.
2. **Cookie-based session persistence.** Login sets session cookies via `@supabase/ssr`. Reloading the page must preserve the session. Logout must clear the session. None of this is visible from within a component test — it is the integration of browser, Middleware, and Supabase Auth.
3. **Cross-page navigation flows.** Logging in and landing on the authenticated shell, clicking logout and landing on `/login`, using a nav item and navigating within the shell. These flows span multiple routes and multiple route groups.

A testing tool that drives a real browser against a real running Next.js server and a real (local) Supabase instance is the only way to cover these flows with confidence. Without it, the auth session behaviour — the very thing being designed in the current phase — is untested end-to-end.

### Key Constraints

- The project is a TypeScript monorepo (pnpm + Turborepo). Any tool chosen must play well with workspace scripts and CI orchestration.
- Local development already uses Supabase running in Docker (`supabase start`). End-to-end tests should drive this local stack rather than calling hosted Supabase.
- The team is small. Any tool requiring heavy ceremony (custom test-runner infrastructure, bespoke fixtures) is a poor fit.
- The PRD does not require cross-browser support. The app targets modern browsers generally, but no specific browser matrix is mandated.
- CI is not yet set up for this project. The testing decision should be CI-ready but does not need to deliver a CI workflow as part of this ADR.

## Decision

**Adopt Playwright as the end-to-end testing tool.** Tests live in `apps/web/e2e/`, authenticate via a seeded test user reused through Playwright's `storageState`, target Chromium only, and run locally on demand during this phase. A GitHub Actions workflow to run them on pull requests is recorded as follow-up work and is not scoped into this decision.

### Scope of end-to-end tests

End-to-end tests cover flows that *only* make sense at the browser level:

- Middleware redirects (unauthenticated visitor hitting `/` lands on `/login`; authenticated visitor hitting `/login` lands on `/`).
- Login → authenticated shell → logout → login redirect round-trip.
- Session persistence across page reloads.
- Any future user-journey test that spans more than one page or depends on real cookies.

End-to-end tests do **not** cover:

- Form field validation messages (Vitest + RTL component tests own this).
- Pure presentation / snapshot coverage (tiny value for high maintenance cost).
- API-only behaviour in `apps/api` (unit-tested in that workspace; integration tests are a separate concern).

### Test location

```
apps/web/
├── e2e/
│   ├── auth.spec.ts
│   ├── navigation.spec.ts
│   ├── fixtures/
│   │   └── test-user.ts          # Seeded user credentials + storageState setup
│   └── playwright.config.ts
├── src/
└── package.json
```

Placing tests inside `apps/web/` keeps them close to the app they drive and avoids introducing a new workspace. If in the future additional frontends appear and share end-to-end coverage, the directory can be lifted to a top-level `e2e/` workspace — a cheap move.

### Authenticated session strategy

Tests that require an authenticated user use Playwright's **`storageState` pattern with a seeded test user**:

1. A one-time setup step (in a global setup file) logs in a fixed test user (e.g., `e2e-test@example.local`) through the real login UI and captures the resulting cookies to a `storageState` file.
2. Individual test files that need authentication load this file at the start of their context — the user is "already logged in" without re-running the login flow per test.
3. The seeded test user is created as part of the Supabase local setup (seed SQL or one-time setup script). It is deterministic across runs.

This avoids three pitfalls:
- Logging in through the UI at the start of every test (slow, and a login failure cascades into every test reporting as failed).
- Bypassing the real auth flow entirely by minting tokens directly (misses the exact integration the tests are supposed to prove).
- Using dynamic per-test users (harder to reset state between runs, harder to debug).

Tests that specifically exercise the login flow, the logout flow, or unauthenticated redirects start from an *empty* storage state and use the real UI — the flow being tested is the flow being exercised.

### Browser coverage

**Chromium only for this phase.** The PRD has no cross-browser requirement. Running Firefox and WebKit in addition triples the execution time and the flake surface area for no demonstrable value today. This is a reversible choice: adding another browser is a one-line change to `playwright.config.ts` if the need appears later.

### CI integration

The decision includes the *intent* to run Playwright on pull requests in CI. Delivering the GitHub Actions workflow — including spinning up Supabase in the CI runner, installing Playwright browsers, and uploading traces on failure — is scoped as **follow-up work**, not part of this ADR. Recording the intent now ensures test-writing decisions (e.g., avoiding dependencies on the developer's machine state) are made with CI in mind from day one.

### Local execution model

- Prerequisites: `supabase start` must be running (Docker up, local Supabase reachable at its usual ports) and the seed user must exist.
- Command: a `pnpm test:e2e` script in `apps/web/package.json`, registered as a Turborepo pipeline target so it can be invoked from the repo root.
- Default run: headless Chromium. A `test:e2e:headed` variant for debugging is a nice-to-have.
- Traces and screenshots are captured on failure by default — the payoff for the debugging cost paid once during setup.

## Consequences

### Positive

- **Coverage of flows that unit tests cannot reach.** Middleware redirects, cookie persistence, logout round-trips, and multi-page journeys become testable. Without this, the auth session behaviour is only verifiable by manual clicking.
- **Real-browser fidelity.** Playwright runs Chromium itself, not a simulation. Cookie handling, navigation, and form submission behave the way a user's browser would behave.
- **Stable authentication across tests.** The seeded-user + `storageState` pattern removes per-test login overhead and its associated flake surface.
- **Playwright-native affordances reduce flake.** Auto-waiting on elements, automatic retry on transient failures, and trace/video artefacts on failure make failures diagnosable rather than mysterious.
- **Close to the code it tests.** Placing `e2e/` inside `apps/web/` means contributors touching the frontend see the tests immediately and are more likely to keep them current.
- **CI-ready by design.** The storage-state seed pattern, the Chromium-only target, and the Turborepo pipeline integration are all choices that translate cleanly from local runs to GitHub Actions when the workflow is added.

### Negative

- **New dependency and toolchain surface area.** Playwright adds dev dependencies, browser binaries (hundreds of MB on first install), and its own config file. Contributors onboard to an additional tool.
- **Tests require local Supabase to be running.** Unlike Vitest component tests, `pnpm test:e2e` is not a zero-config command — Docker must be up, Supabase must be started, and the seed user must exist. This is a real contributor-onboarding consequence, not only a CI one.
- **Seed data is now part of the contract.** The seeded test user becomes a load-bearing fixture. If its password or email changes, tests break. This is manageable but requires the seed definition to live in a predictable, reviewed location.
- **Slower feedback than unit tests.** A minute-scale suite (seconds per test, dozens of tests) is significantly slower than the sub-second Vitest suites. This is inherent to end-to-end testing and is the reason the unit tests are not being replaced.
- **Ongoing flake budget.** Even with Playwright's auto-wait, end-to-end tests flake more than unit tests. Budget is small now (few tests) but will need active management as the suite grows.

### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Flaky tests erode trust in the suite | Use Playwright's auto-wait APIs; avoid arbitrary `waitForTimeout` calls; capture traces on failure for fast diagnosis; quarantine and fix — never disable — flaky tests |
| Seeded test user collides with real user accounts in the hosted Supabase instance | Use a clearly non-production email domain (e.g., `@example.local`) and document that the seed user is a *local-only* fixture; never seed it in hosted environments |
| Local Supabase requirement blocks contributors who only want to run unit tests | `pnpm test` (Vitest) remains independent and requires no Supabase; `pnpm test:e2e` is the only command with the Supabase dependency |
| CI cost grows as the E2E suite grows | Chromium-only; parallelism enabled; share a single authenticated `storageState` across most tests; prune or consolidate overlapping tests during review |
| Playwright major-version upgrades introduce breakage | Pin the Playwright version; review changelog before bumping; treat upgrades as small dedicated PRs rather than rolling them into feature work |

## Alternative Solutions Considered

### Alternative A: Cypress (Rejected, briefly)

Cypress is the other mature end-to-end tool in the JavaScript ecosystem. It was not considered in depth — Playwright is the straightforward 2026 default for a new Next.js + TypeScript project, and a lengthy tool comparison here would be bikeshedding. A short summary of why Playwright wins on the relevant axes: native TypeScript without plugins, multi-tab and multi-origin support (relevant as soon as an OAuth redirect is involved), faster execution, and Microsoft's maintenance cadence. Cypress is a fine tool; Playwright is a better fit for this project's stack.

### Alternative B: Expand Vitest + React Testing Library only (Rejected)

Keep the single existing testing layer and lean on heavier integration-style component tests.

**Why rejected:**
- React Testing Library runs in JSDOM. It does not run Next.js Middleware, does not set real cookies, and does not exercise browser navigation. The specific behaviours the end-to-end suite targets are exactly the ones JSDOM cannot reach.
- Mocking Middleware, cookies, and Supabase at the component-test layer produces tests that validate the mocks, not the system. This is precisely the failure mode that drove the house rule to avoid mock-heavy tests elsewhere in the project.

### Alternative C: Skip end-to-end testing for now (Rejected)

Rely on manual verification for the auth/session flows in this phase and revisit end-to-end testing later.

**Why rejected:**
- The flows being shipped in this phase — middleware redirects, session persistence, logout — are exactly the kind of behaviour that regresses silently. A missing redirect rule or a broken cookie path would not be caught until a user reported it.
- Introducing the tool at the same time as the feature it would protect is the cheapest moment to do so. Deferring means the first feature that breaks session behaviour is the one that pays the tool-introduction cost under pressure.
