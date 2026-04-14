@../../.claude/rules/typescript.md
@.claude/rules/api.md

## Auth Pattern

- API handles authorisation only (JWT verification) — never calls Supabase Auth endpoints — see ADR-001
- `@fastify/jwt` verifies tokens using `JWT_SECRET` from Supabase
- Uses service role key (`SUPABASE_SERVICE_ROLE_KEY`) for elevated DB operations only
