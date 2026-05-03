# internal/base/response/canonical/v1

## Purpose

Canonical response protocol v1 for API success, error, and pagination payloads. This module does not own transport concerns or route-level status-code decisions.

## Public API

None.

## Boundaries

- Must not depend on `@internal/core` or any feature module.
- Must not define transport-level status codes or route-specific error messages.

## Rules

- ✅ Allowed:
  - Using `ErrorResponse` for consistent error envelopes.
  - Using `SuccessResponse` for non-paginated data payloads.
  - Using `PaginatedResponse` only when pagination metadata exists.

- ❌ Forbidden:
  - Mixing canonical v1 classes with ad-hoc payload fields outside schema.
  - Reusing pagination response when endpoint does not return paging semantics.
  - Changing `protocol` formats in feature code.

<!-- module-readme-sync@1.7 -->
