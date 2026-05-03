---
name: module-readme-sync
description: "Analyze a folder or module and create/update/sync its README.md to reflect the current code. Use when: a README is missing, code was added/changed/deleted and docs are stale, a new module was created, exports changed, rules need updating, or you need a contract doc for a feature/layer. Triggers on: 'update README', 'sync docs', 'document this module', 'README is out of date', 'analyze folder', 'create README for'."
argument-hint: "Folder or module path to analyze (e.g. src/internal/base/config)"
metadata:
  version: "1.7"
---

# Module README Sync

## When to Use

- A `README.md` is **missing** from a folder that has public exports
- Code was added, renamed, or deleted and the existing README is **stale**
- A new sub-module or feature was created with no documentation
- Public API shape changed (new exports, removed exports, schema changes)
- A module has established anti-patterns with no written enforcement

## Output

A `README.md` for the target folder following the [contract template](#readme-template). If a README already exists, produce a **diff-first analysis** before updating.

For large folders, produce an **overview-only README** at the top level and keep detailed API/contracts in child-folder READMEs (one level down).

Mandatory freshness policy:
- Always assume existing `README.md` may be out of date.
- Never skip freshness verification, even for small or seemingly unchanged modules.
- Only conclude "No change needed" after explicit checks in [Step 6](#step-6-compare-with-existing-readme-if-any).

---

## Procedure

### Step 0 - Determine scope (diff-first by default)

Default behavior is **diff-only**:

1. Resolve default branch dynamically (prefer remote HEAD):
  - `git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'`
  - Fallback: `main`, then `master` if previous command fails.
  - If no usable default branch exists, skip three-dot diff and use staged + unstaged sets only.
2. Build changed-file set as the **union** of:
  - `git diff --name-only <defaultBranch>...HEAD` (committed delta)
  - `git diff --cached --name-only HEAD` (staged)
  - `git diff --name-only HEAD` (unstaged)
3. Limit analysis to folders/modules touched by those changed files.
4. If a path filter argument is provided by user, intersect changed-file set with that path.
5. Ignore files outside requested/source scope when deciding module candidates.
6. If no relevant module changes are found, return "No module README sync needed from diff scope."

Override behavior:
- If the user explicitly asks to **"re-sync all"**, skip diff scoping and analyze all requested folders (or full target tree) as before.
- Treat close variants the same (for example: "resync all", "sync all", "check all READMEs", "đồng bộ tất cả", "sync toàn bộ").

### Step 1 — Discover module boundaries

1. List the folder contents.
2. Identify the **barrel entry point**:
  - If both exist, always prefer `index.ts`.
  - If only one exists, use that one.
  - Never merge two barrels in the same run.
3. Note whether sub-folders have their own `index.ts` (independent sub-modules).

If no barrel exists, mark the module as **barrel-less**. Skip Step 5. In Step 7, set `Public API` to `None.`.

Barrel-less module detection is mandatory:
- Treat folder as a module if it owns contracts or runtime primitives even without `index.ts` (e.g. `contracts.ts`, `*.types.ts`, `*.schema.ts`, `server.ts`, `browser.ts`).
- Require at least one non-test export from marker files before classifying as a module.
- If both `server.ts` and `browser.ts` exist without barrel, treat as one barrel-less module and document environment split in `Purpose`/`Boundaries`.
- Never exclude a folder from sync only because it has no barrel file.

### Step 2 — Read key files in parallel

Read these files (whichever exist):
- `index.ts` / `index.tsx` — public surface
- All directly exported files (1 level deep from the barrel)
- `*.schema.ts`, `*.types.ts`, `contracts.ts` — type contracts
- Any existing `README.md` — to detect what changed

For barrel-less modules, skip barrel-specific reads and inspect representative module files (`server.ts`, `browser.ts`, `core.ts`, contracts/types/schema files).

If a barrel export is re-exported through intermediate files, follow the chain with safety limits:
- Max traversal depth: 3 hops from barrel.
- Detect cycles using visited file paths; stop traversal on cycle and mark evidence as incomplete.
- Use barrel-level export signature as canonical when origin signature cannot be resolved safely.
- For unresolved symbols after depth/cycle guard:
  - If barrel-level signatures are complete and README Public API already matches them, do not mark `stale` for this reason alone.
  - Otherwise mark module `stale` and regenerate conservatively.

`README.md` check is mandatory. If missing, mark status as `missing` and create one.

> For large modules, read only the export list and type signatures, not full implementations.

### Step 3 — Detect responsibilities

From naming, exports, and import paths, answer:
- What **one thing** does this module own?
- What does it explicitly **not** own?
- Is this `server-only`, `client-only`, or universal?

Deterministic summary rule:
- Determine ownership from exported symbol intent first.
- Break ties using import graph concentration.
- If still tied, use folder name and existing README `Purpose` as tiebreaker.
- If conflict remains, mark evidence incomplete and prefer `stale`.

### Step 4 — Detect dependency constraints

Scan import paths to classify:
- **Internal** (`@internal/*`, relative paths) → list affected layers
- **External** (npm packages) → list direct runtime imports only (skip dev-only imports and polyfills)
- **Layer violations**: e.g., a primitive module importing a feature module

Use Step 4 output to drive `Boundaries` and `Rules` sections.

External dependency filter rules:
- Include direct runtime imports only.
- Exclude `@types/*`, known polyfills (`core-js`, `regenerator-runtime`), and bundler/runtime internals.

Layer violation rules:
- If `CONTEXT.md` exists, follow its layer hierarchy.
- If `CONTEXT.md` is missing or ambiguous:
  - Still list observable imports and likely constraints from code.
  - Add this line under `Rules`: `⚠️ Layer violations not fully verified (missing hierarchy context).`

### Step 5 — Extract the public API

Precondition: run this step only for modules with a barrel file (`index.ts` / `index.tsx`).

For barrel-less modules, `Public API` must be `None.` (plain text, no code block).

A symbol is **public** if and only if **all** of the following conditions hold:
1. It appears as a direct or re-exported symbol in the barrel file (`index.ts` / `index.tsx`) — i.e. `grep` of the barrel source includes this export name.
2. Neither barrel export site nor resolved declaration site is tagged `@internal`.
3. It is NOT only accessible by importing sub-files directly (e.g. `./utils`, `./helpers`) — sub-file symbols not re-exported by the barrel are private implementation detail.

Negative examples (must NOT appear in Public API):
- A function defined in `./helpers.ts` that is not re-exported by `index.ts`.
- A type only referenced internally between sub-files.
- Symbols that require importing from `<module>/subpath` directly.

`@internal` detection rules:
- Recognize JSDoc `@internal` immediately above declaration/export.
- Recognize inline `/** @internal */` comments attached to exported symbol.
- If parsing/tag location is ambiguous, treat symbol as non-public (conservative).

Everything else is non-public and must be excluded — including internal helpers, test utilities, and auto-generated files (`*.generated.ts`, `*.gen.ts`, `**/generated/**`, `*.openapi.*`).

Output format rules:
- Show declaration/signature only: `export function …`, `export type …`, `export interface …`
- Do **not** include `import …` statements or usage examples.
- Group by sub-path if the module has multiple entry points.

### Step 6 — Compare with existing README (if any)

Run this freshness gate before deciding output:

1. Check the `<!-- module-readme-sync@X.Y -->` comment at the bottom of the README. If the version does not match the current skill version (`1.7`), immediately mark as **stale** and proceed to Step 7 — no further freshness checks required.
2. Build current API snapshot from barrel exports (after `@internal` filtering).
  - For barrel-less modules, snapshot is empty by definition.
3. Compare snapshot against README `Public API` section.
4. Compare README `Purpose`, `Boundaries`, and `Rules` against current module boundaries/usages.
  - Compare by **substance**, not formatting.
  - Ignore whitespace and list marker style only.
  - Treat wording changes as semantic when responsibility/scope/layer meaning changes.
  - Use this semantic gate:
    - `Purpose`: owner concern + explicit non-ownership still match current code.
    - `Boundaries`: forbidden dependencies/layers still match import graph.
    - `Rules`: at least one current allowed pattern and one forbidden anti-pattern still valid.
  - Semantic mismatch triggers (must mark `stale`):
    - Any new/removed public symbol, or changed signature shape.
    - Ownership changed (module now owns/does-not-own different concern).
    - New layer/dependency violation not reflected in README.
  - Non-triggers (must not mark `stale` by themselves):
    - Whitespace/list-marker reformatting.
    - Wording simplification that preserves same owner/non-owner and same constraints.
5. Mark result as one of: `missing`, `stale`, `accurate`.
6. Only `accurate` allows "No change needed".

If evidence is incomplete, default to `stale` and update the README.

When status is `accurate`, final report must include `Checked items` with at least 3 explicit checks chosen from:
- `Public API matches barrel exports`
- `No @internal symbol leaked in Public API`
- `Purpose still matches module responsibility`
- `Boundaries match current imports/layers`
- `Rules still cover current forbidden patterns`

Enforcement:
- If `Checked items` section is missing or has fewer than 3 explicit checks, status must be `stale`.

| Condition | Status | Action |
|-----------|--------|--------|
| README file does not exist | `missing` | Create from scratch |
| Skill version comment absent or mismatched | `stale` | Update fully |
| Any required section missing or mismatched | `stale` | Update affected sections |
| Evidence incomplete | `stale` | Update fully |
| All sections match current snapshot | `accurate` | No change needed |

### Step 7 — Write the README

Follow the [README Template](#readme-template) below. Maximum ~200 lines.

### Step 8 — Apply depth policy

- If the target folder has many submodules (large surface), the top-level README must stay high-level:
- Define "many submodules" as: **6 or more direct child folders** that contain `index.ts`/`index.tsx` or barrel-less module markers.
  - Purpose
  - When code belongs in this folder
  - High-level boundaries/rules
  - Pointers to child READMEs
- Move detailed contracts/API to child folder READMEs (`<child>/README.md`).
- Avoid deep nesting: detail only one level down by default.

---

## README Template

````md
# <Module Name>

## Purpose
<1–2 sentences: what this module owns and what it does NOT own.
Call out server-only / client-only constraints here if applicable.>

## Boundaries

- <what this module must not depend on>
- <layer constraints>

## Public API
<If barrel exists, use a `ts` code block with signatures of symbols **directly exported from the barrel file** and not tagged @internal.
Only include symbols whose names appear in `index.ts` / `index.tsx` — sub-file internals not re-exported by the barrel must be omitted entirely.
Show declarations only — no import statements, no usage examples.
If no barrel exists, write exactly: `None.`>

## Rules

* ✅ Allowed:
  * <correct usage patterns>
* ❌ Forbidden:
  * <anti-patterns — especially security, layer violations, misuse>

## Notes *(optional)*

<Only if genuinely necessary. E.g., caching behaviour, key rotation, env file sources.>

<!-- module-readme-sync@1.7 -->
````

---

## Quality Checklist

Before saving the README, verify:

- [ ] `Purpose` is ≤ 2 sentences and mentions what the module does NOT own
- [ ] `server-only` / `client-only` constraints are surfaced in `Purpose` if applicable
- [ ] If module has barrel: `Public API` contains only symbols that are (a) directly exported from the barrel `index.ts`/`index.tsx` and (b) not `@internal` — sub-file symbols not re-exported by the barrel must not appear
- [ ] If module has barrel: `Public API` contains signatures/declarations only — no `import …` lines, no usage examples
- [ ] If module is barrel-less, `Public API` text is exactly: `None.`
- [ ] Auto-generated files (`*.generated.ts`, `*.gen.ts`, `**/generated/**`, `*.openapi.*`) are excluded from `Public API`
- [ ] `Rules` has at least one ❌ Forbidden entry relevant to the module
- [ ] No standalone "Dependencies" section was added
- [ ] `Notes` section is absent or genuinely necessary (not used for implementation details)
- [ ] `<!-- module-readme-sync@1.7 -->` comment is present at the bottom
- [ ] Total length ≤ 200 lines
- [ ] If status is `accurate`, report includes `Checked items` with at least 3 explicit checks
- [ ] Barrel-less module folders were evaluated (not filtered out due to missing `index.ts`)

---

## Multi-Module Batch Mode

When analyzing a full `src/internal/` tree or multiple sibling folders:

1. Build module candidate list:
  - Folders with `index.ts`/`index.tsx`.
  - Folders with existing `README.md`.
  - Barrel-less folders with `contracts.ts`, `*.types.ts`, `*.schema.ts`, `server.ts`, or `browser.ts`.
2. Apply scope filter:
  - Default: keep only candidates touched by Step 0 changed-file union (committed + staged + unstaged) against resolved default branch.
  - Override: if user asked "re-sync all", keep all candidates.
3. Read files for selected modules in parallel and return raw content.
4. Process each module independently following Steps 1–7. Step 8 depth policy applies to each module individually.
  - Always run freshness gate per module; never apply a single batch-level freshness decision.
5. Create/update READMEs in parallel where there are no dependencies between them.
6. Produce a summary table of what was created / updated / skipped, including count of barrel-less modules checked.
