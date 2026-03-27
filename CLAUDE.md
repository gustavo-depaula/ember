# Ember — Catholic Prayer App

## Project Overview

Catholic prayer app built with Expo (web + iOS + Android). Plan of Life tracker with green contribution walls + Custom Divine Office with lectio continua through Bible and Catechism in a year. Local storage only, no backend.

## Documentation

All specs live in `docs/` — read them before making changes:
- `docs/README.md` — project overview + MVP scope
- `docs/ARCHITECTURE.md` — tech stack, data models, folder structure, storage strategy
- `docs/CONVENTIONS.md` — code style guide (READ THIS FIRST)
- `docs/features/plan-of-life.md` — Plan of Life feature spec
- `docs/features/divine-office.md` — Divine Office feature spec
- `docs/design/design-system.md` — colors, typography, layout, Tamagui config
- `docs/content/content-sources.md` — Bible APIs, CCC, hymn sources, licensing
- `docs/tasks.md` — implementation phases and task checklist

**After completing any feature or significant change, update the relevant docs in `docs/` to reflect the new state.** Keep specs, architecture, and task lists in sync with the code.

## Code Style (Quick Reference)

- Functional style — no classes, pure functions, composition
- `function` for top-level exports, arrow for inline callbacks
- Named exports only, barrel `index.ts` for folder public APIs
- Path aliases: `@/components`, `@/features`, `@/stores`, `@/db`, `@/lib`, `@/config`
- Inline destructured props (no separate Props types)
- Early returns for guards, loading, and error states
- `undefined` over `null`
- Single-level ternaries only; IIFE for multi-branch
- Constants: camelCase (never SCREAMING_SNAKE_CASE), inline unless reused, config objects for related values
- Colocate types, helpers, and small components with the code that uses them
- Strategic comments only — explain 'why', not 'what'

## Tech Stack

- Expo SDK 55+ with Expo Router (file-based routing)
- Tamagui (design system, theming, components)
- Zustand + immer (client state)
- TanStack Query (async/DB reads)
- expo-sqlite (database, async API)
- react-native-reanimated + Moti (animations)
- Biome (formatting + linting — single quotes)
- TypeScript strict mode

## Commands

```bash
pnpm expo start          # dev server
pnpm expo start --web    # web dev
pnpm biome check --write .  # format + lint
```

## Key Patterns

- Zustand stores use immer middleware (mutate drafts)
- TanStack Query for all DB/async reads (even local SQLite)
- DB types defined in `src/db/schema.ts`, migrations in `src/db/migrations/*.sql`, applied via `src/db/client.ts`
- DB queries encapsulated in `src/db/repositories/` (office.ts, practices.ts)
- Bible text: bundled Douay-Rheims JSON for offline, Bolls.life API for other translations (cached in SQLite)
- 30-day DWDO psalter cycle (see `docs/features/divine-office.md` for the full table)
