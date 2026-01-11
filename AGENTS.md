# Coding Agent Instructions

## Goal
Produce code that ALWAYS passes lint and formatting using the existing project scripts:

lint: eslint
fmt: prettier .

No exceptions. Code that fails `npm run lint` or `npm run fmt` is considered broken.

---

## Hard Rules (Non-Negotiable)

1. Run ESLint rules mentally before finalizing code.
   - No unused variables
   - No implicit any
   - No console.log in production code
   - Respect React / Next.js rules of hooks

2. Prettier is the source of truth for style
   - Do NOT hand-format
   - Assume default Prettier config unless explicitly overridden
   - Let Prettier decide quotes, trailing commas, line width, etc.

3. TypeScript discipline
   - Prefer unknown over any
   - Narrow types explicitly
   - No unsafe type assertions unless unavoidable (and comment why)

4. Next.js constraints
   - Server vs client boundaries must be explicit ('use client' when needed)
   - No browser-only APIs in server components
   - No Node-only APIs in client components

---

## Before You Output Code (Mandatory Checklist)

The agent MUST verify:

- No ESLint rule violations
- No formatting conflicts with Prettier
- Imports are sorted and minimal
- Dead code removed
- File respects existing project conventions

If unsure, refactor until certainty.

---

## Formatting Expectations

- One export per file when reasonable
- Prefer named exports over default exports
- Keep functions small and single-purpose
- Avoid deeply nested conditionals

---

## Error Handling

- Never swallow errors silently
- Throw typed errors or return explicit error objects
- No empty catch blocks

---

## Tests & Safety

If modifying logic:
- Assume vitest is used
- Write deterministic, environment-safe code
- Do not depend on real network, time, or randomness without mocks

---

## When in Conflict

If there is a conflict between:

1. Speed vs lint correctness → choose lint correctness
2. Cleverness vs readability → choose readability
3. Brevity vs explicitness → choose explicitness

---

## Final Principle

If the code would make ESLint or Prettier unhappy, rewrite it.

No shortcuts.
