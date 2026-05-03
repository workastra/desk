# internal/base/url

## Purpose

URL utility helpers for safe relative-path normalization. Does **not** own routing logic, redirect decisions, or pattern matching.

## Public API

```ts
export function toRelativePath(url: URL): string;
```

## Boundaries

- No external dependencies; must remain a pure JS utility.
- Must not implement redirect blocking or route matching — that belongs in `resolveSafeReturnTo`.

## Rules

- ✅ Allowed:
  - Passing a valid `URL` object to extract a safe relative path
- ❌ Forbidden:
  - Passing raw strings — always construct a `URL` object before calling `toRelativePath`
  - Adding redirect logic, route matching, or pattern-based path blocking here (those belong in `resolveSafeReturnTo`)

<!-- module-readme-sync@1.7 -->
