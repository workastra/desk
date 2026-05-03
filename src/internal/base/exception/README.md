# internal/base/exception

## Purpose

Shared error class definitions for infrastructure-level boundary failures. Does **not** own domain-specific error codes, HTTP error handling, or feature-level exceptions.

## Public API

None.

## Boundaries

- No external dependencies; must remain pure JS with no infrastructure imports.
- Must not own domain-specific error semantics or HTTP status codes.

## Rules

- ✅ Allowed:
  - Throwing `UnauthenticationError` when a session is absent or fails schema validation
  - Throwing `UnimplementedError` as a placeholder in feature stubs
- ❌ Forbidden:
  - Adding domain-specific error codes or HTTP status logic here
  - Catching these errors silently — they are meant to propagate to error boundaries or middleware
  - Creating new error classes here for feature-level concerns (put them in the relevant feature module)

<!-- module-readme-sync@1.7 -->
