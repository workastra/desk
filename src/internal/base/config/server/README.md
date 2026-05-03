# internal/base/config/server

## Purpose

This module owns validated access to private server runtime configuration, including derived environment flags and typed URL parsing. It does not own client-safe NEXT*PUBLIC*\* configuration.

## Boundaries

- Server-only module; must never be imported into client components.
- Must be the single access point for private process environment values used by internal layers.

## Public API

```ts
export function getServerEnvironments(): {
  readonly IS_PRODUCTION: boolean;
  readonly IS_DEVELOPMENT: boolean;
  readonly IS_TEST: boolean;
  readonly APP_URL: URL;
  readonly APP_KEY: string;
  readonly APP_PREVIOUS_KEYS: readonly string[];
  readonly IAM_EXTERNAL_ISSUER_URL: URL;
  readonly IAM_INTERNAL_ISSUER_URL: URL;
  readonly IAM_TLS_SKIP_VERIFY: boolean;
  readonly IAM_OAUTH_CLIENT_ID: string;
  readonly IAM_OAUTH_CLIENT_SECRET: string;
  readonly LOCK_MODE: 'in-memory' | 'distributed';
};

export function getServerEnvironment<
  TName extends
    | 'IS_PRODUCTION'
    | 'IS_DEVELOPMENT'
    | 'IS_TEST'
    | 'APP_URL'
    | 'APP_KEY'
    | 'APP_PREVIOUS_KEYS'
    | 'IAM_EXTERNAL_ISSUER_URL'
    | 'IAM_INTERNAL_ISSUER_URL'
    | 'IAM_TLS_SKIP_VERIFY'
    | 'IAM_OAUTH_CLIENT_ID'
    | 'IAM_OAUTH_CLIENT_SECRET'
    | 'LOCK_MODE',
>(
  name: TName,
): {
  readonly IS_PRODUCTION: boolean;
  readonly IS_DEVELOPMENT: boolean;
  readonly IS_TEST: boolean;
  readonly APP_URL: URL;
  readonly APP_KEY: string;
  readonly APP_PREVIOUS_KEYS: readonly string[];
  readonly IAM_EXTERNAL_ISSUER_URL: URL;
  readonly IAM_INTERNAL_ISSUER_URL: URL;
  readonly IAM_TLS_SKIP_VERIFY: boolean;
  readonly IAM_OAUTH_CLIENT_ID: string;
  readonly IAM_OAUTH_CLIENT_SECRET: string;
  readonly LOCK_MODE: 'in-memory' | 'distributed';
}[TName];
```

## Rules

- ✅ Allowed:
  - Read private runtime values via getServerEnvironment(...).
  - Use derived environment flags from this module instead of recalculating them.
- ❌ Forbidden:
  - Importing this module from client components.
  - Reading private process.env values directly in feature modules when this accessor is available.

<!-- module-readme-sync@1.7 -->
