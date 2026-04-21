@.claude/rules/typescript.md

## Technical Stack

@docs/tech-stack.md

## Architectural Decisions

- [ADR-001: Authentication and Authorisation Flow](docs/adrs/adr-001-authentication-authorisation-flow.md) — Next.js owns authentication (direct Supabase Auth); Fastify owns authorisation (JWT verification for data operations)
- [ADR-002: Next.js Route Groups for Authentication Boundary](docs/adrs/adr-002-route-groups.md) — Two route groups, `(auth)` and `(app)`, each with a dedicated layout; root layout stays minimal; access policy lives in Middleware, not layouts
- [ADR-003: End-to-End Testing Strategy with Playwright](docs/adrs/adr-003-end-to-end-testing-strategy.md) — Playwright in `apps/web/e2e/`, Chromium only, seeded test user via `storageState`; CI integration recorded as follow-up

## Key Documentation

- [PRD](docs/prd.md) — Product requirements, phased plan, NFRs
- [User Stories](docs/user-stories.md) — `US-[DOMAIN]-[number]` format
- ADRs live in `docs/adrs/` — named `adr-NNN-<slug>.md`
- Planning docs in `.ai/dev/` — implementation plans, schema decisions

## Development

- `pnpm dev` — starts all workspaces (web :3000, api :3001)
- `pnpm typecheck` — run after any cross-package changes
- Supabase local dev: `supabase start` / `supabase status` (from repo root, requires Docker)
- Auth validation constants are shared via `packages/core/src/constants/auth.ts` — keep in sync with `supabase/config.toml` `minimum_password_length`
