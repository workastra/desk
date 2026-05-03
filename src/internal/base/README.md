# internal/base

## Purpose

Foundation layer for reusable technical primitives shared across features. This folder does **not** own product/business logic, page-level flow, or UI feature behaviour.

## When To Put Code Here

- Put code here when it is cross-feature infrastructure used by multiple modules.
- Put code here when the concern is technical and generic (config, cookie/session primitives, crypto/date/url, base response shapes).
- Do **not** put code here if it is tied to one feature, route, or domain workflow.

## Public API

```ts
// Top-level barrel
export { dayjs } from './date';
```

> See child folder READMEs for the public APIs of each sub-module.

## Boundaries

- Must not import from `@internal/core` or any feature module — `base` is the lowest infrastructure layer.
- Must not contain product feature logic.

## Child Modules (Detailed Docs)

- `config/README.md`
- `cookie/README.md`
- `session/README.md`
- `crypto/README.md`
- `date/README.md`
- `exception/README.md`
- `immerjs/README.md`
- `url/README.md`

## Rules

- ✅ Allowed:
  - Keeping this level as a thin overview and delegating details to child module READMEs.
  - Adding only cross-cutting primitives that can be reused by multiple features.

- ❌ Forbidden:
  - Documenting deep implementation/API detail directly at this top folder level.
  - Putting feature/domain business logic in `@internal/base`.

<!-- module-readme-sync@1.7 -->
