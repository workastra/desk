# internal/core/features/authentication/client

## Purpose

React client components and hooks for consuming authenticated user state within the browser. Does **not** own OIDC login flow, token exchange, session storage, or any server-side logic.

## Public API

```ts
export function UserProfileButton(): JSX.Element;
```

## Boundaries

- Client-only module; all components are `'use client'`.
- Must not import from `@internal/core/features/authentication/server`.

## Rules

- ✅ Allowed:
  - Reading auth state via `useAuth()` in any `'use client'` component under an `AuthProvider`
  - Rendering `UserProfileButton` in the app shell header
- ❌ Forbidden:
  - Calling `useAuth()` outside an `AuthProvider` tree — it throws at runtime
  - Importing server-only auth utilities (`@internal/core/features/authentication/server`) from this module
  - Re-implementing session reads or calling OIDC endpoints directly from client code

<!-- module-readme-sync@1.7 -->
