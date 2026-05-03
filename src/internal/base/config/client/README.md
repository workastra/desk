# internal/base/config/client

## Purpose

This module owns validated access to browser-safe public runtime configuration keys. It does not own server-only secrets or private environment loading.

## Boundaries

- Must not depend on server-only modules or private env sources.
- Must only expose NEXT*PUBLIC*\* keys intended for browser usage.

## Public API

```ts
export function getClientEnvironments(): {
  readonly NEXT_PUBLIC_APP_VERSION: string;
};

export function getClientEnvironment<TName extends 'NEXT_PUBLIC_APP_VERSION'>(
  name: TName,
): {
  readonly NEXT_PUBLIC_APP_VERSION: string;
}[TName];
```

## Rules

- ✅ Allowed:
  - Read public configuration through getClientEnvironments() in client or server code.
  - Read a single public key through getClientEnvironment(...).
- ❌ Forbidden:
  - Reading private keys through this module.
  - Importing server-only configuration accessors from client code.

<!-- module-readme-sync@1.7 -->
