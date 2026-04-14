@../../.claude/rules/typescript.md
@.claude/rules/nextjs.md

## Auth Pattern

- Frontend communicates directly with Supabase Auth (not via Fastify) — see ADR-001
- Browser client: `@supabase/ssr` `createBrowserClient` (singleton, auto cookie management)
- Server client: `@supabase/ssr` `createServerClient` (per-request, explicit cookie callbacks)
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
