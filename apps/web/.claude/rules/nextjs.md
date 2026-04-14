# Next.js / App Router Conventions

- Use the App Router (`src/app/`) for all routing
- Default to Server Components; add `'use client'` only when needed
- Use the `@/` path alias for imports within the app
- Colocate page-specific components alongside their route
- Use PascalCase for custom component filenames (e.g. `FormField.tsx`, `RegistrationForm.tsx`); leave `components/ui/` files in kebab-case as they are managed by the shadcn CLI
