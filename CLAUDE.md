@.claude/rules/typescript.md

## Technical Stack

@docs/tech-stack.md

## Architectural Decisions

- [ADR-001: Authentication and Authorisation Flow](docs/adrs/adr-001-authentication-authorisation-flow.md) — Next.js owns authentication (direct Supabase Auth); Fastify owns authorisation (JWT verification for data operations)

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
