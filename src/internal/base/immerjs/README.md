# internal/base/immerjs

## Purpose

One-time Immer plugin initialization (array methods, Map/Set support, patches). This is a side-effect-only module — it has no public exports and is not imported directly by callers. Does **not** expose any Immer API.

## Public API

None.

## Boundaries

- Must only depend on `immer`.
- Must not be imported directly — side effects run via `@internal/base`.

## Rules

- ✅ Allowed:
  - Importing `@internal/base` to ensure initialization has run before using Immer
- ❌ Forbidden:
  - Importing this module directly (`@internal/base/immerjs/init`) — always go through `@internal/base`
  - Adding additional Immer configuration or re-exports here
  - Calling `enableArrayMethods` / `enableMapSet` / `enablePatches` anywhere else in the codebase

<!-- module-readme-sync@1.7 -->
