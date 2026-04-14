# Technical Stack — ADR Vault

> Last updated: 2026-04-07

## Runtime & Package Management

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 22 LTS | Pinned via `.nvmrc` |
| pnpm | 10.33.0 | Corepack-managed with SHA hash in `packageManager` field |
| Turborepo | 2.x | Monorepo orchestration — `turbo.json` defines `build`, `dev`, `lint`, `format`, `typecheck`, `test` pipelines |

## Monorepo Structure

```
apps/
  web/          → @adr-vault/web   (Next.js frontend)
  api/          → @adr-vault/api   (Fastify REST API)
packages/
  core/         → @adr-vault/core  (shared types, enums, constants)
supabase/       → migrations & local dev config
```

## Frontend (`apps/web`)

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.2.2 | App Router, React framework |
| React | 19.x | UI library |
| Tailwind CSS | 4.x | Utility-first CSS (via `@tailwindcss/postcss`) |
| shadcn | 4.x (Base UI) | Component primitives — uses `@base-ui/react` under the hood |
| class-variance-authority | 0.7.x | Component variant management |
| clsx + tailwind-merge | latest | Conditional className composition |
| lucide-react | 1.x | Icon library |
| tw-animate-css | 1.x | Tailwind animation utilities |
| @supabase/supabase-js | 2.x | Supabase Auth client ([ADR-001](./adrs/adr-001-authentication-authorisation-flow.md)) |
| @supabase/ssr | latest | SSR cookie helpers for Supabase Auth |
| react-hook-form | 7.x | Form state management |
| @hookform/resolvers | 5.x | Validation resolver adapters (Zod) |
| zod | 4.x | Schema validation |
| @tanstack/react-query | 5.x | Server state management |

**Planned (not yet installed):**
- Tiptap — WYSIWYG editor for ADR content (Phase 2)

## Backend (`apps/api`)

| Library | Version | Purpose |
|---------|---------|---------|
| Fastify | 5.8.x | HTTP framework |
| @fastify/cors | 11.x | Cross-origin resource sharing |
| @fastify/sensible | 6.x | Sensible defaults & error utilities |
| @fastify/env | 6.x | Environment variable validation |
| @fastify/jwt | 10.x | JWT authentication |
| fastify-plugin | 5.x | Plugin encapsulation helper |
| @supabase/supabase-js | 2.x | Supabase client (database, auth) |
| tsx | 4.x | Dev-mode TypeScript execution (`tsx watch`) |

**Planned (not yet installed):**
- OpenAI Node.js SDK — AI drafting, summarization, embeddings (Phase 3–4)

## Shared Package (`packages/core`)

Pure TypeScript package exporting shared types, enums, and constants. No runtime dependencies — consumed via `workspace:*` by both `web` and `api`.

## Database & Infrastructure

| Service | Details |
|---------|---------|
| Supabase | PostgreSQL, Auth, Row Level Security (RLS) |
| pgvector | Vector extension for semantic search (planned, Phase 4) |
| Supabase CLI | Local dev via `supabase/config.toml`, project ID: `adr-vault` |

**Migrations** (in `supabase/migrations/`):
1. `00001_create_enums.sql` — Postgres enum types
2. `00002_create_profiles.sql` — User profiles (extends `auth.users`)
3. `00003_create_adrs.sql` — ADR documents (JSONB content)
4. `00004_create_adr_links.sql` — ADR relationship links
5. `00005_create_user_ai_usage.sql` — Daily AI usage tracking
6. `00006_create_updated_at_trigger.sql` — Auto-managed `updated_at`
7. `00007_create_rls_policies.sql` — Row Level Security policies

## Developer Tooling

| Tool | Version | Config |
|------|---------|--------|
| TypeScript | 5.9.x | Strict mode, shared `tsconfig.base.json` (ES2022 target, bundler module resolution) |
| Biome | 2.4.x | Linter + formatter (replaces ESLint + Prettier). Config: `biome.json` — tabs, 100 line width, single quotes, semicolons, trailing commas |

## AI Integration (Planned)

| Component | Technology | Phase |
|-----------|-----------|-------|
| AI Drafting | OpenAI API (Node.js SDK) | Phase 3 |
| Embeddings & Semantic Search | OpenAI Embeddings + pgvector | Phase 4 |
| Content Moderation | OpenAI Moderation API | Phase 4 |
| RAG Q&A | OpenAI Chat + pgvector retrieval | Phase 4 |
