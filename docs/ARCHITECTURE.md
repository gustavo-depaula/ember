# Architecture

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Expo (SDK 55) | Single codebase for web + iOS + Android |
| Navigation | Expo Router | File-based routing, deep linking, web-friendly |
| Storage | expo-sqlite (async API) | Direct SQL queries, no ORM overhead, works reliably on web |
| State | Zustand + immer | Lightweight state with draft mutations for immutable updates |
| Async/Data | TanStack Query | Caching, loading states, error handling — even for SQLite reads |
| Styling/Components | Tamagui | Design system framework with compiler, theming, cross-platform primitives |
| Animations | react-native-reanimated + Moti | Reanimated for performance, Moti for declarative API |
| Formatting/Linting | Biome | Single Rust-based tool replacing Prettier + ESLint |
| Images | expo-image | Optimized cross-platform image component for texture/ornament assets |
| Icons | lucide-react-native | Simple line icons for UI |
| Fonts | expo-font | Custom typefaces (UnifrakturMaguntia, Cinzel, EB Garamond, Pinyon Script) via @expo-google-fonts + bundled TTF |
| Dates | date-fns | Lightweight, tree-shakeable, no Moment.js bloat |
| Bible text | Bundled JSON + Bolls.life API | Douay-Rheims offline, NABRE/RSV online with caching |
| Catechism | Fetched at deploy | From `nossbigg/catechism-ccc-json`, processed during Hearth build |
| Liturgical texts | Bundled JSON | Parsed from `divinumofficium/divinum-officium` (MIT) |
| Content engine | `@ember/content-engine` | Practice-agnostic flow resolution — turns declarative JSON into renderable sections |

---

## Content & Libraries

All content in Ember — prayers, practices, books, chapters — is packaged into **libraries** distributed as `.pray` files. The app ships with no bundled practices; content is downloaded from Hearth on first launch. This is the core content architecture.

### The `.pray` Format

A `.pray` file is a zip archive containing a self-contained library. A library can hold any combination of:

- **Prayers** — reusable prayer text assets (Our Father, Hail Mary, etc.)
- **Practices** — schedulable prayer flows for the plan of life (Rosary, Morning Offering, Divine Office, etc.)
- **Chapters** — read-only content rendered natively (saint bios, devotion history, formation guides)
- **Books** — long-form prose rendered in a WebView with CSS column pagination (spiritual classics, Church documents)

```
montfort-spirituality-1.0.0.pray (zip)
├── library.json                    # Library manifest
├── prayers/
│   └── act-of-consecration.json    # Prayer asset (title + body, multilingual)
├── practices/
│   └── total-consecration/
│       ├── manifest.json           # PracticeManifest (metadata, schedule defaults)
│       └── flow.json               # FlowDefinition (the prayer DSL)
├── chapters/
│   └── about-montfort/
│       ├── chapter.json            # Chapter metadata
│       ├── content.json            # FlowDefinition (same format as practices)
│       ├── intro.en-US.md          # Prose sections per language
│       └── intro.pt-BR.md
└── books/
    └── montfort-true-devotion/
        ├── book.json               # Book metadata + TOC
        ├── en-US/
        │   ├── preface.md          # Chapter files (match TOC node IDs)
        │   ├── part-1-ch-1.md
        │   └── style.css           # Injected by build from book.css
        ├── pt-BR/
        └── fr-FR/
```

### Library Manifest (`library.json`)

```typescript
type Library = {
  id: string                        // Unique ID, kebab-case, matches folder name
  version: string                   // Semver
  name: LocalizedText
  languages: string[]               // e.g. ["en-US", "pt-BR"]
  practices: string[]               // Practice IDs (match dirs in practices/)
  prayers: string[]                 // Prayer asset IDs (match files in prayers/)

  description?: LocalizedText
  author?: LocalizedText
  tags?: string[]
  icon?: string
  image?: string
  chapters?: string[]               // Chapter IDs (match dirs in chapters/)
  books?: string[]                  // Book IDs (match dirs in books/)
  contents?: ContentEntry[]         // Unified display ordering (interleaves all types)
  defaults?: { autoSeed: boolean }  // If true, seed practices into plan on install
}

type ContentEntry = { type: 'chapter' | 'practice' | 'book'; id: string }
```

When `contents` is present, the library detail screen renders a unified table of contents in the specified order. When absent, it falls back to separate sections.

### Book Manifest (`book.json`)

```typescript
type BookManifest = {
  id: string
  name: LocalizedText
  author?: LocalizedText
  description?: LocalizedText
  composed?: number | string        // Year or "c. 1418", "15th century"
  languages: string[]
  sources?: { language: string; url: string; description: string }[]
  toc: TocNode[]                    // Table of contents
}

type TocNode = {
  id: string                        // Matches chapter filename (without extension)
  title: LocalizedText
  children?: TocNode[]              // Present = group node, absent = leaf (chapter file)
}
```

Book chapters are raw `.md` or `.html` files in per-language directories. Markdown is converted at runtime via `marked` + `marked-footnote`. `book.css` is copied to each language dir by the build script.

### Three Library Archetypes

| Archetype | Example | Contains |
|-----------|---------|----------|
| Pure practice | base | prayers + practices (no books) |
| Pure book | alphonsus-liguori | books + 1 practice |
| Mixed | montfort-spirituality | books + chapters + practices + prayers |

### Current Libraries

| Library | Practices | Books | Chapters | Prayers | Languages |
|---------|-----------|-------|----------|---------|-----------|
| base | 33 | — | — | 22 | EN, PT |
| devotions | 21 | — | — | — | EN, PT |
| novenas | 14 | — | — | 1 | EN, PT |
| alphonsus-liguori | 1 | 9 | — | — | PT, IT, FR |
| montfort-spirituality | 1 | 7 | 1 | 1 | FR, EN, PT |
| sacred-heart | 4 | — | 5 | 3 | EN, PT |
| ave-maria-claretiano | 8 | — | 3 | 22 | PT |
| litanies | 9 | — | 2 | — | EN, PT |
| **Total** | **91** | **16** | **11** | **49** | |

### Content Resolution

`ContentRegistry` (`apps/app/src/content/registry.ts`) replaces direct imports. It aggregates all installed libraries into a unified view:

```typescript
import { getManifest, loadFlowForSlot } from '@/content/registry'
```

Each `.pray` package is self-contained. Cross-library prayer refs use qualified IDs (`libraryId:prayerId`) in source flow.json files — e.g., `"ref": "base:sign-of-cross"`. At build time, `scripts/vendor-prayers.py` resolves these: copies the prayer into the package and strips the prefix. Runtime resolution is **library-local** → **global pool** (no dependency chain).

`EngineContext` (`apps/app/src/content/engineContext.ts`) wires app services (prayer loader, localizer, content source) into the content engine for flow resolution.

### Content Distribution (Hearth)

Hearth is a GitHub Pages-hosted static file server that serves all downloadable content.

**Base URL:** `https://ember.dpgu.me/hearth/`

| Asset | Path | Format |
|-------|------|--------|
| Libraries (.pray) | `hearth/v1/libraries/` | .pray (zip) + `registry.json` |
| Bible (DRB) | `hearth/v1/bible/drb/` | 74 JSON files |
| EF Mass propers | `hearth/v1/propers/` | 634 JSON files |
| Catechism (CCC) | `hearth/v1/catechism/ccc.json` | 1 JSON file (fetched at build time) |
| Saints images | `hearth/v1/saints/` | PNG + WebP |

**Build pipeline:** `scripts/build-libraries.sh` zips each `content/libraries/{id}/` into `{id}-{version}.pray`, generates `registry.json` with metadata and content hashes. `scripts/fetch-ccc.ts` fetches and processes the CCC from upstream at build time. `.github/workflows/deploy.yml` copies all assets and deploys to GitHub Pages.

**First launch flow:** Fetch `registry.json` → download `base` → install → seed practices into plan of life → navigate to home. Requires connectivity on first launch.

**Source directories** (committed, copied to Hearth at deploy):

| Source | Hearth destination |
|--------|--------------------|
| `content/libraries/` | `hearth/v1/libraries/` (zipped into .pray) |
| `content/bible/drb/` | `hearth/v1/bible/drb/` |
| `content/propers/` | `hearth/v1/propers/` |
| _(fetched at build time)_ | `hearth/v1/catechism/` |
| `content/saints/` | `hearth/v1/saints/` (+ WebP conversion) |

The `v1/` prefix allows future breaking schema changes without breaking old app versions.

---

## Data Model (8-table schema)

All user data in SQLite. No AsyncStorage. Manifests define content; the DB stores only what the user chose and did.

| Table | Purpose |
|-------|---------|
| `user_practices` | Thin practice definitions — custom name, icon, description, archived flag |
| `user_practice_slots` | Per-slot configuration — enabled, sort order, tier, time block, schedule (JSON), notifications |
| `completions` | Event log with `sub_id` for multi-hour/multi-day detail |
| `cursors` | Schemaless JSON reading positions (Divine Office tracks, Bible, programs) |
| `preferences` | KV store for all user settings |
| `cached_translations` | Offline cache for online Bible translations |
| `cache` | Generic cache for API responses and Hearth content |
| `installed_books` | Installed library packages — version, manifest, content hash |

Schedule is a discriminated union JSON field on `user_practice_slots` supporting 6 types: `daily`, `days-of-week`, `day-of-month`, `nth-weekday`, `times-per`, `fixed-program`. Any schedule can be season-gated.

See `apps/app/src/db/migrations/0001_initial.sql` for the full schema.

---

## Storage Strategy

### expo-sqlite (all persistent data)
- `user_practices` + `user_practice_slots` — plan-of-life configuration
- `completions` — practice completion event log
- `cursors` — reading positions (Divine Office tracks, Bible, Catechism, programs)
- `preferences` — all user settings (theme, translation, font config, etc.)
- `cached_translations` — offline cache for online Bible translations
- `cache` — Hearth content + API responses (propers, images, etc.)
- `installed_books` — installed library tracking

### Library files (expo-file-system)
- `.pray` archives extracted to `documentDirectory/books/{libraryId}/`
- Book chapters (`.md`/`.html`) read from disk at runtime
- Prayer/practice/chapter JSON loaded from extracted library dirs

### Bundled Assets (read-only, app-only)
- `apps/app/assets/textures/` — Image-based ornament PNGs
- `apps/app/assets/fonts/` — UnifrakturMaguntia bundled TTF

---

## Content Fetching & Stores

All content (Bible, Catechism, Mass propers, saints images) is fetched on demand from Hearth and cached in SQLite. Bolls.life API is used for non-DRB Bible translations. Cache aggressively — once fetched, it works offline.

See `apps/app/src/stores/` for Zustand stores and `apps/app/src/lib/hearth.ts` for the Hearth fetch + cache client.

---

## Folder Structure

This is a pnpm workspaces + turborepo monorepo.

```
ember/
  content/                            (source files — deployed to Hearth)
    libraries/                        (THE content source of truth)
      base/                  (core daily prayers — 33 practices, 22 prayers)
        library.json
        practices/
          morning-offering/
            manifest.json
            flow.json
          rosary/
            manifest.json
            flow.json
          ...
        prayers/
          our-father.json
          hail-mary.json
          ...
      montfort-spirituality/          (mixed library — books + practice + chapter)
        library.json
        books/
          montfort-true-devotion/
            book.json
            en-US/
            pt-BR/
            fr-FR/
        practices/
          total-consecration/
        chapters/
          about-montfort/
        prayers/
      novenas/                  (14 novena programs)
      alphonsus-liguori/              (9 books + 1 practice)
      devotions/                    (21 additional practices)
      sacred-heart/                   (4 practices + 5 chapters)
      ave-maria-claretiano/           (Portuguese devocionário)
      litanies/                       (9 litany practices + 2 chapters)
      registry.json                   (generated — library catalog metadata)
      book.css                  (base stylesheet for all book rendering)
      *.pray                          (generated — built .pray archives)
    bible/drb/                        (Douay-Rheims JSON, 73 books + index)
    propers/                          (EF Mass propers — tempora + sancti)
    catechism/                        (CCC JSON — generated at deploy, not committed)
    saints/                           (saint PNG images)
  apps/
    app/                              (Expo app — iOS/Android/web)
      src/
        app/                          (Expo Router routes — file-based)
        features/                     (feature-specific logic)
          plan-of-life/               (schedule, checklist, stats)
          practices/                  (PracticeFlow player, catalog)
          books/                      (book reader, WebView pagination)
          home/                       (LiturgicalHeader, SeasonalContext)
          calendar/                   (liturgical calendar views)
          saints/                     (saints cards + data)
          bible/                      (Bible reader)
          catechism/                  (Catechism reader)
          divine-office/              (cursor management, psalm loading)
        components/                   (shared UI components)
        stores/                       (Zustand stores)
        db/                           (SQLite schema, migrations, repositories)
        content/                      (content resolution layer)
          registry.ts                 (ContentRegistry — aggregates installed libraries)
          engineContext.ts            (wires app deps into EngineContext)
          manifest-types.ts           (PracticeManifest, SlotDefault — app-specific)
          sources/
            filesystem.ts             (loads libraries from disk)
        lib/                          (app-specific utilities)
          liturgical/                 (re-exports @ember/liturgical + useObligations hook)
          mass-propers/               (re-exports @ember/mass-propers + hook + propers-data)
          i18n/
          hearth.ts                   (Hearth fetch + SQLite cache client)
          bolls.ts, content.ts, catechism.ts, lectio.ts
        config/                       (tamagui, tokens, themes, fonts)
      assets/                         (textures, fonts)
  packages/
    content-engine/                   (pure TS — flow resolution engine + types)
    liturgical/                       (pure TS — calendar, seasons, psalter, obligations)
    mass-propers/                     (pure TS — propers resolution engine)
    hearth/
      index.html                      (landing page for GitHub Pages)
  docs/
  turbo.json
  pnpm-workspace.yaml
```

### Package boundaries

- **`@ember/content-engine`** — Practice-agnostic flow resolution. Depends on `@ember/liturgical` + `date-fns`. Accepts deps via `EngineContext` (prayers, localizer, parsers). Turns declarative flow JSON into renderable sections.
- **`@ember/liturgical`** — Depends only on `date-fns`. Zero React/Expo deps. Calendar, seasons, psalter, obligations.
- **`@ember/mass-propers`** — Depends on `@ember/liturgical` + `date-fns`. Accepts data via `PropersDataSource` interface.

The app's `src/lib/liturgical/` and `src/lib/mass-propers/` directories re-export from the packages and add React hooks.

See [CONVENTIONS.md](CONVENTIONS.md) for code style, naming, and patterns.
