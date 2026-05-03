# internal/core/features/authentication

## Purpose

OIDC Authorization Code + PKCE login flow, token exchange, user profile fetching, and React auth context. Does **not** own session storage primitives or cookie serialization (those live in `@internal/base`).

## Public API

None.

## Boundaries

- `server/` is server-only; must not be imported in Client Components.
- Must not implement raw session storage or cookie serialization — those belong in `@internal/base`.

## Child Modules (Detailed Docs)

- `server/README.md`
- `client/README.md`
- `shared/README.md`

## Login Flow

```
1. GET /api/oidc/login
   → prepareOIDCLoginRedirect()          — generates PKCE + state
   → OAuthPkceStateCookie.push()         — persists to signed, encrypted cookie
   → redirect to IAM (external issuer)

2. GET /api/oidc/callback?code=...&state=...
   → OAuthPkceStateCookie.consume()      — reads + deletes cookie
   → exchangeAuthorizationCodeForTokens()
   → sessionManager.replace()            — writes session
   → redirect to returnTo
```

## Rules

- ✅ Allowed:
  - Wrapping protected pages in `<ProtectedPage>` to enforce authentication
  - Using `useAuth()` anywhere inside the `AuthProvider` tree
  - Calling `fetchUserProfile()` in Server Components to get the current user

- ❌ Forbidden:
  - Importing `server/` in Client Components — guarded by `server-only`
  - Calling `useAuth()` outside an `AuthProvider` — throws at runtime
  - Manually reading/writing `OAuthPkceStateCookie` raw — always use `.push()` / `.consume()`
  - Trusting `returnTo` without `resolveSafeReturnTo()` — open redirect risk

<!-- module-readme-sync@1.7 -->
