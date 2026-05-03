# internal/core

## Purpose

Application-level features and shared UI shells built on top of `@internal/base`. Owns authentication, the app shell layout, and the route protection proxy. Does **not** own raw primitives, HTTP utilities, or domain-specific business logic beyond auth.

## Structure

| Path                       | Responsibility                                                    |
| -------------------------- | ----------------------------------------------------------------- |
| `features/authentication/` | OIDC login flow, token exchange, session management, user profile |
| `layout/workspace/`        | App shell layout grid, collapsible sidebar, header                |

## Public API

None.

## Boundaries

- Must not depend on `@internal/core` from within itself — sub-modules compose `@internal/base` only.
- `features/authentication/server` is server-only; must not be imported in Client Components.

## Rules

- ✅ Allowed:
  - Importing `@internal/core/features/authentication/server` in Server Components and Route Handlers
  - Importing `@internal/core/features/authentication/client` in Client Components
  - Using `@internal/core/features/authentication/shared` in both environments

- ❌ Forbidden:
  - Importing `server/` sub-paths in Client Components
  - Adding features that bypass `@internal/base` primitives (e.g., directly calling `iron-session`)
  - Placing app-page-level logic (route handling) inside `internal/core`

<!-- module-readme-sync@1.7 -->
