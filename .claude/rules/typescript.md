# TypeScript Conventions

- No `any` type — use `unknown` with type guards or define a proper type/interface
- All functions must have explicit return types
- Prefer `type` over `interface` unless extension/declaration merging is needed
- No non-null assertion (`!`) — handle nullability explicitly
- Use `import type` for type-only imports
- Index files (`index.ts`) are re-export entrypoints only — no logic
