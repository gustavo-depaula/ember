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
| Catechism | Bundled JSON | From `nossbigg/catechism-ccc-json` |
| Liturgical texts | Bundled JSON | Parsed from `divinumofficium/divinum-officium` (MIT) |

---

## Screen Map

```
/                                    -> Home (greeting, time-block checklist, green wall, navigation medallions)
/plan/                               -> Plan of Life (green wall overview + stats + practice checklist)
/plan/[practiceId]                   -> Individual practice detail (green wall + stats)
/pray/[practiceId]                   -> Prayer Flow (shared practice player)
/pray/[practiceId]?hour=...          -> Prayer Flow for specific hour (office)
/practices/                          -> Practice catalog (browse all available practices)
/practices/[manifestId]              -> Practice catalog detail
/practices/[manifestId]/program      -> Program detail (day navigation for novenas, etc.)
/bible/                              -> Bible reader
/catechism/                          -> Catechism reader
/calendar/                           -> Liturgical calendar
/saints/                             -> Saints feed (daily saints and commemorations)
/settings/                           -> Settings (reading config, translation picker, theme toggle)
```

**Stack navigation** with home-as-hub: NavigationMedallion buttons on home screen, BackToHome on sub-screens

---

## Data Model (V2 — 4-table schema)

All data in SQLite. No AsyncStorage. Manifests define content, the DB stores only user data.

| Table | Purpose |
|-------|---------|
| `user_practices` | Plan-of-life configuration (tier, time block, schedule as JSON, variant) |
| `completions` | Event log with `sub_id` for multi-hour/multi-day detail |
| `cursors` | Schemaless JSON reading positions (Divine Office tracks, Bible, programs) |
| `preferences` | KV store for all user settings |
| `cached_translations` | Offline cache for online Bible translations |

Schedule is a discriminated union JSON field supporting 6 types: `daily`, `days-of-week`, `day-of-month`, `nth-weekday`, `times-per`, `fixed-program`. Any schedule can be season-gated.

See [features-overview.md](features/features-overview.md#data-model-v2) for full schema, design rationale, and schedule types.

---

## Storage Strategy

### expo-sqlite (all persistent data)
- `user_practices` — plan-of-life configuration
- `completions` — practice completion event log
- `cursors` — reading positions (Divine Office tracks, Bible position, Catechism position)
- `preferences` — all user settings (theme, translation, font config, etc.)
- `cached_translations` — offline cache for online Bible translations

### Hearth Content (fetched on demand, cached in SQLite)
- `content/bible/drb/` — Douay-Rheims JSON files (one per book, 73 files)
- `content/catechism/ccc.json` — Full CCC structured by paragraphs
- `content/propers/` — EF Mass propers (tempora + sancti, 634 files)
- `content/saints/` — Saint PNG images (14 files, served as WebP)

The app fetches these from Hearth (`https://ember.dpgu.me/hearth/v1/`) on demand via `apps/app/src/lib/hearth.ts` and caches them in the SQLite `cache` table. First access requires network.

### Bundled Assets (read-only, app-only)
- `apps/app/src/assets/prayers/` — Fixed prayer texts (Our Father, canticles, Marian antiphons, etc.)
- `apps/app/assets/textures/` — Image-based ornament PNGs
- `apps/app/assets/fonts/` — UnifrakturMaguntia bundled TTF

---

## Hearth — Static Content Platform

Hearth is a GitHub Pages-hosted static file server that serves bundled content assets at stable URLs. The hearth sustains the ember — it's the content source that feeds the app.

**Base URL:** `https://ember.dpgu.me/hearth/`

### What Hearth serves

| Asset | Path | Size | Files |
|-------|------|------|-------|
| Bible (DRB) | `hearth/v1/bible/drb/` | 4.7MB | 74 JSON (one per book + index) |
| EF Mass propers | `hearth/v1/propers/tempora/`, `hearth/v1/propers/sancti/` | 6.2MB | 634 JSON |
| Catechism (CCC) | `hearth/v1/catechism/ccc.json` | 1.8MB | 1 JSON |
| Saints images | `hearth/v1/saints/` | ~50MB PNG, ~5MB WebP | 14 PNG + 14 WebP (generated) |

A `manifest.json` at `hearth/manifest.json` provides a file inventory with SHA-256 hashes for cache validation.

The `v1/` prefix allows future breaking schema changes without breaking old app versions.

### How it works

- `.github/workflows/deploy.yml` copies assets from their source locations in the app, converts saint PNGs to WebP, generates the manifest, and deploys to GitHub Pages
- Triggers on push to `main` when asset paths change, or via manual `workflow_dispatch`
- No npm install or build step — just file copies and `cwebp`. Runs in under a minute.

### Source directories (copied to Hearth at deploy time)

- `content/bible/drb/` → `hearth/v1/bible/drb/`
- `content/propers/` → `hearth/v1/propers/`
- `content/catechism/` → `hearth/v1/catechism/`
- `content/saints/` → `hearth/v1/saints/` (+ WebP conversion)

### App integration

The app fetches from Hearth on demand via `apps/app/src/lib/hearth.ts` — a thin wrapper around `fetch()` + SQLite cache (`cache` table). First access requires network; subsequent reads serve from cache.

---

## Content Fetching Strategy

```
User selects translation in settings
  |
  ├── DRB (Douay-Rheims) -> Fetch from Hearth, cache in SQLite
  |
  └── NABRE / RSV -> Fetch from Bolls.life API
                                  |
                                  ├── Online -> Fetch, cache in SQLite, display
                                  └── Offline -> Show cached version, or fallback to DRB with notice
```

All content (Bible, Catechism, Mass propers, saints images) is fetched on demand from Hearth and cached in SQLite. Bolls.life API is used for non-DRB Bible translations. Cache aggressively — once fetched, store locally so it works offline on subsequent reads.

---

## Stores

### `preferencesStore` — all user preferences
Hydrated from `preferences` SQLite table. Includes: translation, language, liturgicalCalendar, theme, fontFamily, fontSize, lineHeight, margin, textAlign, formPreferences.

### `navigationStore` — ephemeral UI state
Not persisted. Contains: selectedDate (shared across screens).

### Thin wrappers
- `bibleStore` — reads/writes `bible-book`/`bible-chapter` preferences
- `catechismStore` — reads/writes `catechism-paragraph` preference

---

## Folder Structure

This is a pnpm workspaces + turborepo monorepo.

```
ember/
  apps/
    app/                          (Expo app — iOS/Android/web)
      src/
        app/                      (Expo Router routes — Stack navigation)
        features/                 (feature-specific logic)
          plan-of-life/           (schedule, checklist, stats)
          divine-office/          (cursor management, psalm loading)
          practices/              (PracticeFlow player, catalog)
          home/                   (LiturgicalHeader, SeasonalContext)
          calendar/               (liturgical calendar views)
          saints/                 (saints cards + data)
          bible/                  (Bible reader)
          catechism/              (Catechism reader)
        components/               (shared UI components)
        stores/                   (Zustand stores)
        db/                       (SQLite schema, migrations, repositories)
        content/                  (practice manifests, engineContext wiring)
          practices/              (one folder per practice — manifests + flows)
          engineContext.ts        (wires app deps into EngineContext)
          manifest-types.ts       (PracticeManifest, SlotDefault — app-specific)
        lib/                      (app-specific utilities)
          liturgical/             (re-exports @ember/liturgical + useObligations hook)
          mass-propers/           (re-exports @ember/mass-propers + hook + propers-data)
          i18n/
          hearth.ts                 (Hearth fetch + SQLite cache client)
          bolls.ts, content.ts, catechism.ts, lectio.ts
        config/                   (tamagui, tokens, themes, fonts)
      assets/                     (textures, fonts)
  content/                        (source files for Hearth — deployed to GitHub Pages)
    bible/drb/                    (Douay-Rheims JSON, 73 books + index)
    propers/                      (EF Mass propers — tempora + sancti)
    catechism/                    (CCC JSON)
    saints/                       (saint PNG images)
  packages/
    liturgical/                   (pure TS — calendar, seasons, psalter, obligations)
    mass-propers/                 (pure TS — propers resolution engine)
    content-engine/               (pure TS — flow rendering engine + types)
  hearth/
    index.html                    (landing page for GitHub Pages)
  docs/
  turbo.json
  pnpm-workspace.yaml
```

### Package boundaries

- **`@ember/liturgical`** — Depends only on `date-fns`. Zero React/Expo deps.
- **`@ember/mass-propers`** — Depends on `@ember/liturgical` + `date-fns`. Accepts data via `PropersDataSource` interface.
- **`@ember/content-engine`** — Depends on `@ember/liturgical` + `date-fns`. Accepts deps via `EngineContext` (prayers, localizer, parsers).

The app's `src/lib/liturgical/` and `src/lib/mass-propers/` directories re-export from the packages and add React hooks.

See [CONVENTIONS.md](CONVENTIONS.md) for code style, naming, and patterns.
