# internal/base/session

## Purpose

Encrypted, schema-validated HTTP session management backed by `iron-session`. Owns session read/write/destroy and automatic key rotation. Does **not** own cookie definitions for features or authentication business logic.

## Public API

```ts
export const getSessionManager: <TSchema extends z.ZodObject>(
  schema: TSchema,
) => SessionManager<TSchema>;

// SessionManager<T> methods:
// get(): Promise<Readonly<z.infer<T>> | undefined>
// replace(value: z.infer<T>): Promise<void>
// destroy(): Promise<void>
// exists(): Promise<boolean>
```

## Boundaries

- Server-only module; must never be imported in client components.
- Must not bypass the `SessionManager` API to directly read/write the `__Secure_Session` cookie.

## Rules

- ✅ Allowed:
  - Calling `getSessionManager` with any `z.ZodObject` schema — the schema is the type contract for session shape
  - Multiple calls to `getSessionManager` with the same schema in a single request — results are `cache()`-d

- ❌ Forbidden:
  - Importing `session` in client components — it imports `server-only`
  - Manually managing the `__Secure_Session` cookie — always go through `SessionManager`
  - Partially updating the session — `replace()` is the only mutation method and replaces the full object
  - Hardcoding encryption keys — keys are loaded from environment variables

## Notes

- Key rotation is supported: `APP_PREVIOUS_KEYS` (comma/newline-separated) decrypt existing sessions; `APP_KEY` signs new ones.
- The session cookie is named `__Secure_Session`.

<!-- module-readme-sync@1.7 -->
