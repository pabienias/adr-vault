# ADR Vault

ADR Vault is a specialized tool designed to help engineering teams create, manage, and query Architectural Decision Records (ADRs). By leveraging AI and providing a clean, distraction-free WYSIWYG editing experience, ADR Vault reduces the friction of documenting architectural decisions, ensuring that critical technical context is preserved, easily accessible, and consistently formatted.

## Monorepo Structure

```
adr-vault/
├── apps/
│   ├── web/          # Next.js 16 (App Router) — frontend
│   └── api/          # Fastify — REST API
├── packages/
│   └── core/         # Shared types, enums, constants
└── docs/
    └── prd.md        # Product Requirements Document
```

## Prerequisites

- Node.js 22+
- pnpm 9+
- Docker Desktop (for future Supabase local dev)

## Getting Started

```bash
pnpm install
pnpm dev
```

The dev server starts:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all workspaces (Biome) |
| `pnpm format` | Format all workspaces (Biome) |
| `pnpm typecheck` | Type-check all workspaces (TypeScript) |
| `pnpm test` | Run tests across all workspaces |

## Workspaces

| Workspace | Package Name | Description |
|---|---|---|
| `apps/web` | `@adr-vault/web` | Next.js frontend with shadcn/ui and Tailwind CSS |
| `apps/api` | `@adr-vault/api` | Fastify REST API |
| `packages/core` | `@adr-vault/core` | Shared types, enums, and constants |
