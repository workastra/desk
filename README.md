# Workastra Desk

The web frontend for the Workastra platform. A Next.js 16 App Router application with OIDC-based authentication (PKCE), a REST API, and a layered internal architecture.

## Prerequisites

- Node.js 22+
- pnpm 10+
- An OIDC-compatible Identity Provider (e.g., Keycloak) reachable at `IAM_EXTERNAL_ISSUER_URL`

## Setup

1. Copy the environment template and fill in values:

```bash
cp .env.template .env
```

Key variables:

| Variable                  | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_VERSION` | Application version string (required at build time)             |
| `APP_URL`                 | Public base URL of this application                             |
| `IAM_EXTERNAL_ISSUER_URL` | OIDC issuer URL reachable by browsers                           |
| `IAM_INTERNAL_ISSUER_URL` | OIDC issuer URL for server-to-server calls (k8s DNS)            |
| `IAM_OAUTH_CLIENT_ID`     | OAuth2 client ID registered with the IdP                        |
| `IAM_TLS_SKIP_VERIFY`     | Skip TLS verification for IAM (dev only)                        |
| `LOCK_MODE`               | `in-memory` (single instance) or `distributed` (Redis/Postgres) |

Secrets are loaded from files under `secrets/` (not `.env`):

| File                           | Description                                               |
| ------------------------------ | --------------------------------------------------------- |
| `secrets/app_key`              | Session encryption key                                    |
| `secrets/previous_keys`        | Previous encryption keys for rotation (newline-separated) |
| `secrets/oauth2_client_secret` | OAuth2 client secret                                      |

## Development

```bash
pnpm run dev              # Start dev server on http://localhost:3000
pnpm run typecheck        # TypeScript type check
pnpm run lint             # ESLint
pnpm run fmt --check      # Prettier format
pnpm run test             # Vitest unit tests
pnpm run doctor           # Lint code, detect dead-code
```

## Production Build

```bash
NEXT_PUBLIC_APP_VERSION=1.0.0 pnpm build
pnpm start
```

The build output is `standalone` (suitable for Docker/Kubernetes).

```bash
docker build -t workastra-desk .
```

## Project Structure

```
src/
├── proxy.ts                        — Next.js middleware: session guard + redirect logic
├── app/                            — Next.js App Router (pages, API routes, layout)
│   ├── layout.tsx                  — Root HTML shell, fonts, metadata
│   ├── projects/page.tsx           — Protected projects page
│   ├── openapi/route.ts            — Serves OpenAPI spec
│   └── api/
│       ├── oidc/login/             — Initiates OIDC login (PKCE)
│       ├── oidc/callback/          — Handles OIDC callback, stores session
│       └── v1/
│           ├── health/live/        — Liveness probe
│           ├── health/ready/       — Readiness probe
│           └── profile/            — Authenticated user profile
└── internal/
    ├── base/                       — Technical primitives (config, cookie, crypto, session, date, url)
    └── core/                       — Application features (authentication, AppShell)
        └── features/
            └── authentication/     — OIDC flow, token exchange, session management
```

See module-level READMEs for detailed contracts:

- [src/app/README.md](src/app/README.md)
- [src/internal/base/README.md](src/internal/base/README.md)
- [src/internal/core/README.md](src/internal/core/README.md)

## API

OpenAPI spec: [`public/openapi/v1.yaml`](public/openapi/v1.yaml)
Interactive docs available at `/openapi` when the server is running.

## Tech Stack

| Layer           | Technology                               |
| --------------- | ---------------------------------------- |
| Framework       | Next.js 16, React 19                     |
| Auth            | OIDC / OAuth 2.0 PKCE via `oauth4webapi` |
| Session         | `iron-session` (encrypted cookie)        |
| UI              | HeroUI, Tailwind CSS 4, Lucide icons     |
| Validation      | Zod 4                                    |
| Testing         | Vitest, Testing Library, happy-dom       |
| Package manager | pnpm                                     |
