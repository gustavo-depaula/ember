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

- Expo SDK 52+ with Expo Router (file-based routing)
- Tamagui (design system, theming, components)
- Zustand + immer (client state)
- TanStack Query (async/DB reads)
- Drizzle ORM + expo-sqlite (database)
- react-native-reanimated + Moti (animations)
- Biome (formatting + linting — no semicolons, single quotes)
- TypeScript strict mode

## Commands

```bash
npx expo start          # dev server
npx expo start --web    # web dev
npx drizzle-kit generate # generate DB migrations
npx @biomejs/biome check --write .  # format + lint
```

## Key Patterns

- Zustand stores use immer middleware (mutate drafts)
- TanStack Query for all DB/async reads (even local SQLite)
- Drizzle schema is the single source of truth for DB types
- Bible text: bundled Douay-Rheims JSON for offline, Bolls.life API for other translations (cached in SQLite)
- 30-day DWDO psalter cycle (see `docs/features/divine-office.md` for the full table)
