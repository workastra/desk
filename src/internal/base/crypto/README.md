# internal/base/crypto

## Purpose

Provides shared string encryption/decryption helpers for infrastructure concerns (for example secure cookie serialization). This module does **not** own token/session workflow decisions or authorization logic.

## Boundaries

- Must not be imported by client components (depends on server-only config access).
- Must not be bypassed by direct crypto or direct env-key access in feature modules.

## Public API

```ts
export function encrypt(plainText: string, key?: string): Promise<string>;
export function decrypt(
  encryptedText: string,
  keys?: string | [string, ...string[]],
): Promise<string>;
```

## Rules

- ✅ Allowed:
  - Encrypting/decrypting UTF-8 string payloads through this module only.
  - Relying on key rotation via `APP_KEY` + `APP_PREVIOUS_KEYS` from config.

- ❌ Forbidden:
  - Importing this module in client components (it depends on server config).
  - Reading encryption keys directly from `process.env` in callers.
  - Implementing custom crypto in feature modules instead of reusing this API.

## Notes

- Keep payloads reasonably small (cookie-safe size).

<!-- module-readme-sync@1.7 -->
