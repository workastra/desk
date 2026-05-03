# internal/base/date

## Purpose

Provides the project-standard `dayjs` instance with required plugins pre-enabled. This module does **not** own business date rules (SLA, billing periods, domain calendars).

## Public API

```ts
export { dayjs };
```

Enabled plugins: `duration`, `utc`, `timezone`.

## Boundaries

- Must not import from `@internal/core` or any feature module.
- Must not contain domain-specific date logic.

## Rules

- ✅ Allowed:
  - Using `@internal/base/date` as the default date entry point across the codebase.
  - Adding shared plugin configuration that must apply globally.

- ❌ Forbidden:
  - Importing `dayjs` directly in app/features when shared behaviour is needed.
  - Putting domain-specific date calculations in this module.

<!-- module-readme-sync@1.7 -->
