# internal/core/features/authentication/server

## Purpose

Server-side orchestration for OIDC login, callback exchange, and authenticated profile retrieval. This module does not own client UI state or low-level session/cookie primitives.

## Public API

```ts
export function resolveOIDCClientConfiguration(): OIDCClientConfiguration;
export function createOIDCClient(config: OIDCClientConfiguration): IOIDCClient;
export function prepareOIDCLoginRedirect(client: IOIDCClient): Promise<OIDCLoginRedirectResult>;
export function exchangeAuthorizationCodeForTokens(
  client: IOIDCClient,
  oidcCallbackURL: URL,
  callbackVerificationChecks: OIDCCallbackVerificationChecks,
): Promise<TokenResult>;
export function rewriteAuthorizationURLToExternalIssuerOrigin(internalAuthorizationURL: URL): URL;
export function fetchUserProfile(client: IOIDCClient): Promise<UserInfoResponse>;
export function resolveSafeReturnTo(
  raw: string | null,
  options?: { fallback?: string; blockedPaths?: string[] },
): string;
```

## Boundaries

- Server-only module; must never be imported in Client Components.
- Must not re-implement raw session/cookie primitives — always delegate to `@internal/base`.

## Rules

- ✅ Allowed:
  - Calling this API only from route handlers, server components, or other server-side modules.
  - Using `resolveSafeReturnTo` for any user-controlled return target.
  - Using `prepareOIDCLoginRedirect` and `exchangeAuthorizationCodeForTokens` as a pair in the OIDC flow.

- ❌ Forbidden:
  - Importing this folder from client components.
  - Re-implementing OIDC steps directly in route files.
  - Trusting unvalidated callback state or nonce values.

<!-- module-readme-sync@1.7 -->
