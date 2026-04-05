# Fastify API Conventions

- Use the plugin pattern (`fastify-plugin`) for shared functionality
- Register plugins via `registerPlugins` in `src/plugins/register-plugins.ts`
- Use the app factory pattern (`buildApp` in `src/app.ts`) for testability
- Access config via `fastify.config` (typed by `@fastify/env`)
- Use `.js` extensions in import paths (ESM resolution)
