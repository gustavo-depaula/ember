# Ember — Catholic Prayer App

## Project Overview

> A beautiful companion for the Catholic life of prayer — helping souls grow in holiness, one day at a time.

Multilingual Catholic prayer app (English + Brazilian Portuguese) built with Expo (web + iOS + Android). Local storage only, no backend. Three pillars:

1. **Fidelity** (Plan of Life) — help users build, keep, and grow their rule of life
2. **Devotion** (Engagement) — saints cards, patron saint companion, liturgical milestones — meaningful collectibles that teach, not trophies
3. **Wisdom** (Content & Tradition) — formation guides, Catholic library, prayer history, study tools

See `docs/README.md` for the full mission, roadmap, and what's built.

## Documentation — Docs-First Workflow

**This project follows strict docs-first development.** All specs live in `docs/`.

### Before starting any feature:
1. Read `docs/README.md` for project direction and pillars
2. Read `docs/journal.md` for accumulated learnings (API quirks, licensing, UX gotchas, technical decisions)
3. Read the relevant feature spec in `docs/features/`. **If no spec exists, write one first and get it reviewed before writing any code.**
4. Read `docs/CONVENTIONS.md` for code style

### After completing work:
1. Update the relevant docs in `docs/` to reflect changes
2. Add entries to `docs/journal.md` for anything non-obvious you discovered
3. Keep specs, architecture, and task lists in sync with the code

### Docs index:
- `docs/README.md` — mission, pillars, roadmap, current state
- `docs/ARCHITECTURE.md` — tech stack, data models, folder structure, storage strategy
- `docs/CONVENTIONS.md` — code style guide (READ THIS FIRST)
- `docs/design/design-system.md` — colors, typography, layout, Tamagui config
- `docs/content/content-sources.md` — Bible APIs, CCC, hymn sources, licensing
- `docs/journal.md` — dev journal (accumulated learnings)
- `docs/features/features-overview.md` — domain knowledge, design rationale, capabilities for all features

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

## Issue Tracking

Work is organized into **independent tracks** on GitHub — each track advances at its own pace.

- **GitHub Project board**: https://github.com/users/gustavo-depaula/projects/2
- **Milestones = Tracks**: each milestone represents one track. Filter issues by milestone to see a track's backlog.
- **No custom labels** — milestones are the primary organization.

### Tracks
| Track | Description |
|-------|-------------|
| App Store | Store pipeline — icon, builds, metadata, review prep |
| Onboarding | Guided setup + progressive disclosure |
| Polish | Animations, empty/error states, i18n, icons, testing, accessibility |
| Programs | Completion UX, missing policies, more program content |
| Daily Readings | Daily Mass propers (OF/EF) integrated into Mass practice |
| Devotion | Saints content, browsing, patron saint, later collectibility |
| Practice Builder | User-created practices, novenas, offices — full authoring tool |
| Responsive Layout | Desktop/tablet as first-class citizens |
| Breviary | Real Liturgy of the Hours — distinct from the personalized office |
| New Practices | Devotionary, more prayers, translation review, Rosary, Lectio Divina, etc. |
| Sacred Art | Browsable gallery + contextual art throughout the app |
| Content Platform / Salty | Catholic library, spiritual classics, Church Fathers, formation guides |

### Workflow
- Pick issues from any track — tracks are independent, not sequential
- Use `gh issue list -m "Track Name"` to see a track's issues
- When starting work on an issue, reference it in commits/PRs
- Salty is the larger vision (Catholic heritage preservation); Ember is its first consumer app

## Git

- Never add `Co-Authored-By` lines to commit messages

## Monorepo Structure

This is a pnpm workspaces + turborepo monorepo:
- `apps/app/` — Expo app (iOS/Android/web)
- `packages/` — shared libraries (liturgical, mass-propers, content-engine)
- Root: workspace config, turbo, biome

## Commands

```bash
# From root:
pnpm start               # expo dev server
pnpm start:web           # expo web dev
pnpm ios                 # build & run on iOS simulator
pnpm android             # build & run on Android
pnpm test                # run all workspace tests
pnpm parse-propers       # parse Divinum Officium propers
pnpm biome check --write .  # format + lint

# From apps/app/:
pnpm test                # run app tests only
pnpm test:watch          # test watch mode
```

## Key Patterns

- Zustand stores use immer middleware (mutate drafts)
- TanStack Query for all DB/async reads (even local SQLite)
- DB types defined in `apps/app/src/db/schema.ts`, migrations in `apps/app/src/db/migrations/*.sql`, applied via `apps/app/src/db/client.ts`
- DB queries encapsulated in `apps/app/src/db/repositories/` (office.ts, practices.ts)
- Bible text: bundled Douay-Rheims JSON for offline, Bolls.life API for other translations (cached in SQLite)
- 30-day DWDO psalter cycle (see `docs/features/features-overview.md` for the full table)
