# src/app

## Purpose

Next.js App Router entry point. Owns page routes, API route handlers, and global layout. Composes `@internal/core` features — does **not** implement business logic directly.

## Route Map

```
app/
├── layout.tsx                      — Root HTML shell, global fonts, metadata (version)
├── globals.css                     — Tailwind base styles
├── workspace/layout.tsx            — Protected workspace shell layout
├── workspace/page.tsx              — Workspace landing page
├── openapi/route.ts                — Serves the OpenAPI spec (public/openapi/v1.yaml)
└── api/
    ├── oidc/
    │   ├── login/route.ts          — Initiates OIDC login redirect (PKCE)
    │   └── callback/route.ts       — Handles OIDC callback, exchanges code for tokens
    └── v1/
        ├── health/live/route.ts    — Liveness probe
        ├── health/ready/route.ts   — Readiness probe
        └── profile/route.ts        — Returns current user profile (authenticated)
```

## Middleware (`src/proxy.ts`)

Runs on all non-API, non-static routes. Enforces:

- Unauthenticated users on protected routes → redirect to `/api/oidc/login`
- Authenticated users on auth routes (`/login`, `/signup`) → redirect to `/`
- Destroys stale/invalid sessions to prevent redirect loops

Protected routes: `/workspace`
Auth routes: `/login`, `/signup`

## Public API

None.

## Boundaries

- Must not implement business logic directly — compose `@internal/core` and `@internal/base` instead.
- Must not bypass the proxy middleware for protected route enforcement.

## Rules

- ✅ Allowed:
  - Wrapping protected pages with `<ProtectedPage>` from `@internal/core/features/authentication/server/ProtectedPage`
  - Adding new protected routes to `protectedRoutes` in `proxy.ts`
  - Returning canonical response shapes (`ErrorResponse`, `SuccessResponse`) from API routes

- ❌ Forbidden:
  - Placing authentication business logic in route handlers — use `@internal/core/features/authentication/server`
  - Bypassing the proxy for protected routes by not listing them in `protectedRoutes`
  - Trusting `returnTo` query parameters without `resolveSafeReturnTo()` — open redirect risk
  - Using `process.env` directly in routes — use `getServerEnvironment` / `getClientEnvironment`

<!-- module-readme-sync@1.6 -->
