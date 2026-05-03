# internal/base/config

## Purpose

Environment variable loading and validation. Owns the single source of truth for both public (client-safe) and private (server-only) runtime configuration. Does **not** own secrets storage or feature flags.

## Public API

None.

## Boundaries

- `config/server` is server-only; must never be imported in client components or browser bundles.
- Must not import from `@internal/core` or any feature module.

## Rules

- ✅ Allowed:
  - Reading `getClientEnvironment(...)` anywhere (including client components)
  - Reading `getServerEnvironment(...)` in Server Components, Route Handlers, and server actions

- ❌ Forbidden:
  - Importing `config/server` in client components — it imports `server-only` and will throw
  - Reading `process.env` directly for private variables — use `getServerEnvironment(...)`
  - Hardcoding secret values in source code

## Notes

- Values are validated via `@t3-oss/env-nextjs` and exposed as typed objects.
- Private environment is loaded once at module initialization time.

<!-- module-readme-sync@1.7 -->
