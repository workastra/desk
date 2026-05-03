# internal/base/response

## Purpose

Base response contract layer for API payload classes. This folder does not own endpoint-specific error codes or feature-level response mapping.

## Public API

None.

## Boundaries

- Must not depend on `@internal/core` or any feature module.
- Subclasses must always provide a Zod schema — no unvalidated payloads.

## Rules

- ✅ Allowed:
  - Extending `Response` to define strongly-typed, schema-validated payload contracts.
  - Keeping this level generic and protocol-agnostic.

- ❌ Forbidden:
  - Putting feature/business response logic at this level.
  - Returning unvalidated payload shapes from subclasses.

## Notes

- Detailed canonical protocol contracts live in `canonical/v1/README.md`.

<!-- module-readme-sync@1.7 -->
