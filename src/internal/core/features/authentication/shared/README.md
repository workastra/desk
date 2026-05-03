# internal/core/features/authentication/shared

## Purpose

Constants, Zod schemas, and cookie definitions shared between client and server environments within the authentication feature. Does **not** own OIDC server logic, session management, or client UI components.

## Public API

```ts
export const ErrorCodes: { InvalidRequest: 'AU000' };

export const AuthenticationSessionSchema: z.ZodObject<{
  idToken: z.ZodObject<{ raw: z.ZodString; claims: z.ZodObject<{ sub: z.ZodString }> }>;
  accessToken: z.ZodString;
  refreshToken: z.ZodString;
}>;

export function OAuthPkceStateCookie(): CookieController<PkceState>;
```

## Boundaries

- `OAuthPkceStateCookie` is server-only (imports `server-only` transitively); must not be called from Client Components.
- Must not contain OIDC orchestration or session management logic.

## Rules

- ✅ Allowed:
  - Importing `ErrorCodes` and `AuthenticationSessionSchema` from both server and client code
  - Calling `OAuthPkceStateCookie()` only from server-side code (route handlers, server actions)
- ❌ Forbidden:
  - Importing `OAuthPkceStateCookie` in client components — it imports `server-only` transitively
  - Persisting PKCE credentials anywhere other than via `OAuthPkceStateCookie`
  - Adding feature-specific business logic here — this module is for shared contracts only

<!-- module-readme-sync@1.7 -->
