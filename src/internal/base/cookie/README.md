# internal/base/cookie

## Purpose

Typed, schema-validated cookie management with pluggable storage backends and serializers. Owns the abstraction layer over raw `document.cookie` and Next.js server cookies. Does **not** own session management (see `../session`) or cookie definitions for specific features.

## Public API

None.

## Boundaries

- `server.ts` and `serializers/encrypted.serializer.ts` are server-only; must not be imported in client components.
- Storage adapters (`DocumentStorage`, `NextServerStorage`, `UniversalStorage`) are internal — use `defineBrowserCookie` / `defineServerCookie` instead.
- Must not depend on `@internal/core` or any feature module.

## Rules

- ✅ Allowed:
  - Using `defineServerCookie` for `httpOnly` cookies (auth state, PKCE, etc.)
  - Using `defineBrowserCookie` for cookies that must be readable by client-side JS
  - Providing custom `serialize`/`deserialize` in `CookieConfig` (e.g., encrypted cookies)
  - Using `asSignal()` for one-time-read patterns (flash messages, PKCE state)

- ❌ Forbidden:
  - Importing storage adapters (`DocumentStorage`, `NextServerStorage`) directly in features — use the factory functions
  - Setting `httpOnly: true` on a `defineBrowserCookie` — it is hardcoded to `false`
  - Bypassing Zod schema validation on read — always provide a `schema` in `CookieConfig`
  - Using `SignalCookieHandle.consume()` more than once per request — subsequent calls always return `undefined`

<!-- module-readme-sync@1.7 -->
