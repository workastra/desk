# internal/core/layout/workspace

## Purpose

Client-side application shell: layout grid, collapsible left sidebar, and the top header with user avatar. Owns sidebar open/close state and layout context. Does **not** own page content, routing, or authentication logic.

## Public API

```ts
export { Layout };
export { Header };
export { LeftSidebar };
export { Content };
```

## Boundaries

- Client-only module (`client-only` imported in context).
- Must not own page content, routing decisions, or authentication logic.

## Rules

- ✅ Allowed:
  - Using `<Layout>` in Server Components as a wrapper — it is a Client Component boundary
  - Using `useWorkspaceLayoutState()` / `useWorkspaceLayoutActions()` in any Client Component rendered inside `<Layout>`

- ❌ Forbidden:
  - Using `useWorkspaceLayoutState()` / `useWorkspaceLayoutActions()` outside a `<Layout>` tree — throws at runtime
  - Importing `@internal/core/layout/workspace/context` in Server Components — it imports `client-only`
  - Embedding route-level business logic in `Header` or `Layout`

<!-- module-readme-sync@1.7 -->
