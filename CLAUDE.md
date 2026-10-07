# Ember

A multilingual Catholic prayer app (English + Brazilian Portuguese) built with Expo (web + iOS + Android), and a platform for preserving and distributing the Catholic literary tradition in open formats. Three pillars: **Fidelity** (plan of life), **Devotion** (saints, liturgical milestones — collectibles that teach, not trophies), **Wisdom** (library, formation, study tools).

Personal project with a single user, so schema changes are made in place: add a database migration only when asked.

## Layout

pnpm workspaces + turborepo:
- `apps/app/` — Expo app · `apps/site/` — public read-only website (Astro, static) · `apps/backend/` — Mass-times API (Cloudflare Workers) · `apps/hearth/` — GitHub Pages landing page · `apps/workshop/` — content preview
- `packages/` — shared libraries; `content/` — source of truth for the corpus, one flat dir per kind
- `research/` — long-running investigations (method + dataset, not app code). Deliberately unstructured: let structure emerge from the work there
- `docs/` — a few references (content authoring, content sources, design)

## Content architecture

- All content ships as a **content-addressed corpus**. Every practice, chapter, book, collection and Mass proper is a catalog item with a stable kind-prefixed id (`practice/rosary`, `book/morrow-my-catholic-faith`). Refs are global ids. A short prayer is a practice with an inline flow; there is no `prayer` kind.
- **Practices are pure JSON** (`manifest.json` + `flow.json`, no app code). The flow DSL's reference is its types in `packages/content-engine/src/types.ts`; the engine stays practice-agnostic.
- **Renderer pipeline:** engine output → `apps/app/src/content/preprocessFlow.ts` (async; resolves every `reading`/`psalmody`/`include` through the ContentSource registry) → `PrimitiveBlock` (synchronous switch over `apps/app/src/content/primitives.ts`). Block components never fetch.
- Author structured content as flow DSL in the data; renderers stay free of text-parsing heuristics, because cues like `Cantors:`/`Refrão:` differ per language.
- Each liturgical form has one calendar authority driving both its Mass and every display surface: `resolveOfDay` (`@ember/missal`) for the OF, the Divinum Officium engine's `resolveDay` for the EF. Build new calendar features on those, so the Mass and the calendar can never disagree.
- **Text read from its publisher (CCC from vatican.va, Escrivá, Lírio Católico, …) never enters `content/`, the corpus, or any CI-built artifact.** It is fetched at runtime by a source in `apps/app/src/sources/` and cached on-device only.
- **The website is another platform target of the content layer.** `apps/site` imports the app's own resolver, preprocessor, sources and feature logic from `apps/app/src`, and swaps the device-bound modules (blob store, Hearth fetch, SQLite, i18n detection, the source registry) for Node ones listed in `apps/site/seam.mjs`. Logic the site should share lives in a plain `.ts` module beside the hook or component that uses it; a new React Native or Expo import in such a module breaks the site build.
- `content/do/` is the Divinum Officium repo as a git submodule — read-only. A new clone or worktree needs `git submodule update --init --depth 1 content/do` before `build:corpus`.

## Commands

```bash
pnpm setup:agent            # fresh container only: python dep, better-sqlite3 addon, DO submodule, corpus build
pnpm start / ios / android  # expo dev server / build & run
pnpm test                   # all workspace tests (from apps/app/: app tests only)
pnpm build:corpus           # content/ → _site/hearth/v2 (app tests need this)
pnpm hearth                 # build + serve the corpus on :4100 for the dev app
pnpm validate-flows         # validate practice flow JSON
pnpm --filter @ember/site dev    # website on :4321 (needs build:corpus); `build` + `preview` for the static site
pnpm biome check --write .  # format + lint
```

In a fresh container run `pnpm setup:agent` before concluding anything from a red test suite.

To see local content changes in the running app, keep `pnpm hearth` serving. A dev build that can't reach it silently falls back to the production corpus after 3s, so an unserved change looks like it did nothing.

## Code style

The rules that differ from defaults (Biome enforces formatting):
- Functional style — pure functions and composition, no classes
- `function` for top-level exports, arrow for inline callbacks; named exports only, barrel `index.ts` for folder public APIs
- Path aliases: `@/components`, `@/features`, `@/stores`, `@/db`, `@/lib`, `@/config`
- Inline destructured props (no separate Props types)
- Early returns for guards, loading, and error states
- `undefined` over `null` — one exception: a TanStack `queryFn` returns `(await load(id)) ?? null`, because Query v5 rejects `undefined` data at runtime and tsc won't catch it
- Single-level ternaries; an IIFE for multi-branch logic
- Constants in camelCase, inline unless reused
- Colocate types, helpers, and small components with the code that uses them
- Errors reach the user (toast, inline message, error boundary) or propagate. A `catch` that only logs hides the bug: there is no console in a production build
- Comments explain *why* — a constraint, a platform trap, an upstream quirk — and describe the code as it is now, not its history

## Patterns

- Zustand stores use immer middleware (mutate drafts)
- TanStack Query for all DB/async reads, even local SQLite
- DB access goes through `apps/app/src/db/repositories/`; types in `apps/app/src/db/schema.ts`
- Content state lives in the corpus blob store and the `cache`/`preferences` tables, not new SQLite tables

## Tests

A test earns its place by catching a regression a user would hit. Write one for logic with real edge cases — calendar and date arithmetic, the flow engine, parsers of external data, Divinum Officium parity — or to reproduce a bug before fixing it. Assert observable behaviour through the public function or the rendered screen, with real data where the harness allows (real SQLite, the built corpus). UI changes are verified by running the app, not by render tests. Tests live in `__tests__/` beside the source.

## UI/UX

- When the user describes a UI/UX change, ask about the exact visual/interaction model before writing code. The user often prefers sliding/gesture-driven layouts to overlays and modals.
- Every new Expo Router screen needs an entry point (home row, shortcut, or settings).

## Docs and lessons

- Code is the documentation. Write no specs before coding and no per-PR entries in shared docs.
- Debugging narrative goes in the PR description. A durable lesson goes in a code comment at the site it concerns; if it spans an area, in the matching `.claude/rules/` file. Add a line only when its absence has caused a mistake twice.
- If a change makes a doc in `docs/` wrong, fix or delete it in the same PR.

## Git and issues

- Commit only files directly related to the current task — never unrelated or pre-staged files — with no co-author trailer
- When working on a GitHub issue, use auto-closing text in the commit (`Fixes #123`)
- Work is organized into independent tracks, one umbrella issue each (`gh issue list`); no milestones, no custom labels. Board: https://github.com/users/gustavo-depaula/projects/2
