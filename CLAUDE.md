# Ember

A multilingual Catholic prayer app (English + Brazilian Portuguese) built with Expo (web + iOS + Android), and a platform for preserving and distributing the Catholic literary tradition in open formats. Three pillars: **Fidelity** (plan of life), **Devotion** (saints, liturgical milestones — collectibles that teach, not trophies), **Wisdom** (library, formation, study tools).

Personal/solo project: the user is the only user. Do NOT add database migrations for schema changes unless explicitly asked.

## Layout

pnpm workspaces + turborepo:
- `apps/app/` — Expo app · `apps/backend/` — Mass-times API (Cloudflare Workers) · `apps/hearth/` — GitHub Pages landing page · `apps/workshop/` — content preview
- `packages/` — shared libraries (content-engine, divinum-officium, liturgical, mass, mass-propers, …)
- `content/` — source of truth for the corpus: flat dirs per kind (`practices/`, `books/`, `chapters/`, `collections/`, `of/` and `do/` propers, `bible/`)
- `research/` — long-running investigations (method + dataset, not app code); see `research/README.md`. Deliberately unstructured — don't impose scaffolding on a project there
- `docs/` — reference only (architecture, conventions, authoring guides, licensing). `docs/plans/` holds designs for unbuilt features; read one only when working on that feature.

## Content architecture

- All content ships as a **content-addressed corpus**. Every prayer, practice, chapter, book, collection and Mass proper is a catalog item with a stable kind-prefixed id (`practice/rosary`, `book/morrow-my-catholic-faith`, `collection/carmelite`). Refs are global ids — no library scoping. A short prayer is just a practice with an inline flow; there is no `prayer` kind.
- **Practices are pure JSON**: a `manifest.json` + `flow.json`, no app code. The flow DSL (`select`, `repeat`, `cycle`, `proper`, `fragment`) is described in `docs/features/features-overview.md`; the engine is `packages/content-engine/` and must stay practice-agnostic.
- **Renderer pipeline:** engine output → `apps/app/src/content/preprocessFlow.ts` (async; resolves every `reading`/`psalmody`/`include` through the ContentSource registry) → `PrimitiveBlock` (synchronous switch over the primitives in `apps/app/src/content/primitives.ts`). Block components never fetch.
- Author structured content as flow DSL in the data, never as text-parsing heuristics in a renderer.
- **Never put third-party copyrighted text (CCC from vatican.va, Escrivá, Lírio Católico, …) into `content/`, the corpus, or any CI-built artifact.** It is fetched at runtime by a source in `apps/app/src/sources/` and cached on-device only. Licensing per source: `docs/content/content-sources.md`.
- Build the corpus with `pnpm build:corpus`; `.github/workflows/deploy.yml` publishes it.

## Commands

```bash
pnpm setup:agent            # fresh container only: python dep, better-sqlite3 addon, corpus build
pnpm start / start:web      # expo dev server
pnpm ios / android          # build & run on simulator / device
pnpm test                   # all workspace tests (from apps/app/: app tests only)
pnpm build:corpus           # content/ → _site/hearth/v2 (app tests need this)
pnpm hearth                 # build + serve the corpus on :4100 for the dev app
pnpm validate-flows         # validate practice flow JSON
pnpm biome check --write .  # format + lint
```

In a fresh container run `pnpm setup:agent` before concluding anything from a red test suite.

To see local content changes in the running app, keep `pnpm hearth` serving. A dev build that can't reach it silently falls back to the production corpus after 3s, so an unserved change looks like it did nothing.

## Code style

Full guide: `docs/CONVENTIONS.md`. The rules that differ from defaults:
- Functional style — no classes, pure functions, composition
- `function` for top-level exports, arrow for inline callbacks; named exports only, barrel `index.ts` for folder public APIs
- Path aliases: `@/components`, `@/features`, `@/stores`, `@/db`, `@/lib`, `@/config`
- Inline destructured props (no separate Props types)
- Early returns for guards, loading, and error states
- `undefined` over `null` — one exception: a TanStack `queryFn` returns `(await load(id)) ?? null`, because Query v5 rejects `undefined` data at runtime and tsc won't catch it
- Single-level ternaries only; IIFE for multi-branch
- Constants: camelCase (never SCREAMING_SNAKE_CASE), inline unless reused
- Colocate types, helpers, and small components with the code that uses them; tests go in `__tests__/` beside the source
- Strategic comments only — explain 'why', not 'what'
- Biome formats and lints (single quotes); TypeScript strict

## Patterns

- Zustand stores use immer middleware (mutate drafts)
- TanStack Query for all DB/async reads, even local SQLite
- DB access goes through `apps/app/src/db/repositories/`; types in `apps/app/src/db/schema.ts`

## UI/UX

- When the user describes a UI/UX change, ask about the exact visual/interaction model BEFORE writing code. Do not assume overlay/modal patterns — the user often prefers sliding/gesture-driven layouts.
- Every new Expo Router screen needs an entry point (home row, shortcut, or settings).

## Docs and lessons

- There is no docs-first workflow. Don't write a spec before coding, and don't append to a shared doc on every PR.
- Debugging narrative and "what I learned" go in the PR description. A durable lesson goes in a code comment at the site it concerns; if it spans an area, in the matching `.claude/rules/` file. Add a line only when its absence has caused a mistake twice.
- If a change makes a reference doc in `docs/` wrong, fix that doc in the same PR. Otherwise leave docs alone.

## Git and issues

- Never add Claude as co-author on commits or issues unless explicitly asked
- Commit ONLY files directly related to the current task; never unrelated or pre-staged files
- When working on a GitHub issue, use auto-closing text in the commit (`Fixes #123`)
- Work is organized into independent tracks, one umbrella issue each (`gh issue list`); no milestones, no custom labels. Board: https://github.com/users/gustavo-depaula/projects/2
