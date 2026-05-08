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

## Content & The Corpus

Content in Ember is a **content-addressed corpus** — every prayer, practice, book chapter, Mass proper, and image is a separate sha256-hashed blob served from `https://ember.dpgu.me/hearth/v2/`. Libraries are not bundles; they're *collections* — small JSON manifests listing references to corpus items by stable id.

The app ships with no bundled content. The boot sequence shows a loading screen while it fetches `catalog.json` (~500KB) and warms the critical prayer/practice manifests; everything else streams in on first use and is cached forever (immutable URLs). Pinning marks an item, book, or whole collection for full prefetch; pinned content survives offline.

### Item Kinds

| Kind | Stable id form | What it is |
|---|---|---|
| `prayer` | `prayer/our-father` | Reusable prayer asset, multilingual JSON |
| `practice` | `practice/rosary` | Schedulable prayer flow (manifest + flow + fragments + data + tracks + per-day flows + images) |
| `chapter` | `chapter/lectio-divina` | Native-rendered formation content |
| `book` | `book/catechism-of-trent` | WebView-rendered long-form, per-language markdown chapters |
| `mass` | `mass/of/tempore/holy-week/easter-vigil` | OF Mass proper, split per-language |
| `of-ordinary` / `of-preface` / `of-eucharistic-prayer` | `of/ordinary/roman-canon` | Mass-of building blocks, per-language |
| `of-data` | `of-data/calendar/sanctorale/_index` | Calendar / saints catalog / IGMR / sacerdotale |
| `collection` | `collection/carmelite` | Curated reading list — refs to other corpus items |
| `checkup` | `checkup/archetypes` | Spiritual-checkup decision-tree data |

### Source Layout

```
content/
├── prayers/                              # JSON, multilingual
│   └── our-father.json
├── practices/                            # Per-practice dir
│   └── rosary/
│       ├── manifest.json                 # PracticeManifest (metadata, schedule defaults)
│       ├── flow.json                     # FlowDefinition (the prayer DSL)
│       ├── fragments/                    # Reusable flow snippets
│       ├── data/                         # Cycle data (mysteries, days, etc.)
│       ├── tracks/                       # Lectio tracks
│       ├── programs/days/                # Per-day flows for programs
│       └── images/
├── chapters/                             # Per-chapter dir; prose in sections/<file>.<lang>.md
├── books/                                # Per-book dir; per-language chapter dirs
│   └── catechism-of-trent/
│       ├── book.json                     # BookManifest with TOC
│       ├── en-US/                        # Markdown / HTML chapters
│       ├── pt-BR/
│       └── images/
├── masses/of/                            # OF Mass propers (multilingual JSON, split at build)
├── of-library/                           # Mass-of building blocks
│   └── {ordinary,preface,eucharistic-prayer}/
├── of-data/                              # Calendar, saints, IGMR, sacerdotale
├── collections/                          # Per-collection JSON
├── checkup/                              # Spiritual-checkup data
└── _archive/                             # Auxiliary / preservation files (NOT shipped)
```

A collection is a thin JSON manifest:

```json
{
  "id": "collection/carmelite",
  "name": { "en-US": "Carmelite tradition" },
  "items": [
    { "ref": "book/intimita-divina" },
    { "ref": "practice/carmelite-night-prayer" },
    { "ref": "prayer/teresa-of-avila-bookmark" }
  ]
}
```

Each `library.json` from v1 became a `content/collections/<id>.json` during the migration.

### Build Pipeline

`scripts/build-corpus.py` is the single build step. For each source item it:

1. Splits per-language where it pays — every OF Mass proper becomes one *shape* blob (language-independent metadata) plus one blob per language. A pt-BR-only user fetches ~9KB instead of ~73KB per Mass.
2. Canonicalizes the JSON (`sort_keys=True, separators=(",", ":")`, ensure_ascii=False, UTF-8) so blob hashes are deterministic across machines.
3. Hashes with sha256 and writes immutable blobs to `_site/hearth/v2/blobs/{hash[:2]}/{hash[2:4]}/{full-hash}` (skipping if the file already exists — idempotent re-runs).
4. Builds per-item manifests and a single `catalog.json` at the root, listing every item with its current manifest hash.

The pipeline is idempotent: a typo fix in one prayer rewrites one blob and bumps the catalog. Updates to the app are diff-of-hashes — clients fetch only what changed.

### Hearth Layout

```
https://ember.dpgu.me/hearth/v2/
├── catalog.json                          # ~500KB, every item with its manifest hash
├── blobs/{ab}/{cd}/{full-sha256}         # Immutable content-addressed blobs
├── bible/drb/                            # Douay-Rheims (74 JSON files, served as-is)
├── catechism/ccc.json                    # CCC (fetched at build time)
├── propers/                              # EF Mass propers (DivOff source data)
└── saints/                               # Saint images (PNG + WebP)
```

GitHub Pages doesn't allow custom `Cache-Control`, but every fetched URL is content-addressed, so its bytes never change. A 10-minute default `max-age` only floors update propagation through `catalog.json`. (A future Cloudflare front-end can set `immutable` on `/blobs/*`.)

### Client Architecture

| Module | Role |
|---|---|
| `apps/app/src/content/store.ts` | Content-addressed blob cache. Native: filesystem `documentDirectory/blobs/{ab}/{cd}/{hash}`. Web: IndexedDB key `blob:{hash}`. In-flight dedup so concurrent `getBlob(h)` calls share one fetch. |
| `apps/app/src/content/contentIndex.ts` | In-memory id→hash map, built from `catalog.json`. `getCollectionsForItem(id)` reverse-indexes membership. A `catalogVersion` counter bumps on changes; React subscribes via `useCatalogVersion()` to re-render when deferred manifests warm. |
| `apps/app/src/content/resolver.ts` | Public surface for the rest of the app. Sync APIs (`resolvePrayer`, `getManifest`, `getBookEntry`) read from the always-resident manifest set. Async APIs (`loadFlow`, `loadChapterContent`, `loadMassProper`) fetch on demand and merge per-language Mass-proper blobs back into the multilingual shape callers expect. `canonicalize(id, hintKind)` is a hard filter when `hintKind` is set — no fallthrough across kinds. |
| `apps/app/src/features/pinning/` | Pinning manager + `usePinToggle` hook + `PinToggle` pill. Walks an item recursively (per-kind `COLLECTORS` table) and prefetches every blob it references. Pinned-items list lives in `preferences['pinned-items']` (a JSON array; no new SQLite tables). Practices added to plan-of-life auto-pin. |
| `apps/app/src/features/libraries/libraryManager.ts` | v1→v2 compat shim. The legacy `library/` UI keeps rendering by mapping the old install/remove API onto pin/unpin and reconstructing a v1 `Library` shape from the v2 collection manifest. |

**Boot sequence** (`apps/app/src/app/_layout.tsx`):

1. Show `BootLoadingScreen` while the corpus warms; native splash is hidden as soon as fonts/db/prefs are ready.
2. Fetch `catalog.json` (cached in `cache` table; network-first; local-dev fast-fails at 3s and silently falls back to the remote).
3. Rehydrate pinned-items list from `preferences`.
4. `warmCriticalManifests()` — eagerly load prayer + practice manifests so the engine's prayer/canticle/prose Proxies have their bodies before first paint. Fires `warmDeferredManifests()` (chapters, books, collections) in parallel without blocking.
5. Seed practices, render home.

Subsequent boots are reads-only against the local cache; the catalog refetch in `runAfterInteractions` only touches the network if the catalog hash differs.

### Updates

A typo fix in `prayer/our-father` produces one new content blob (~2KB), one new prayer item-manifest blob (~2KB), and a new `catalog.json` (~500KB but mostly unchanged). On the next catalog fetch the client diffs hashes, fetches only the changed blobs, and the prayer's renderer instantly sees the new body via the resident-manifests map.

Compare to v1, which forced a 70MB `.pray` re-download for any change.

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
| `cache` | Generic key-value cache for API responses + Hearth blobs (catalog, manifests) |

Schedule is a discriminated union JSON field on `user_practice_slots` supporting 6 types: `daily`, `days-of-week`, `day-of-month`, `nth-weekday`, `times-per`, `fixed-program`. Any schedule can be season-gated.

See `apps/app/src/db/migrations/0001_initial.sql` for the full schema.

---

## Storage Strategy

### expo-sqlite (all persistent data)
- `user_practices` + `user_practice_slots` — plan-of-life configuration
- `completions` — practice completion event log
- `cursors` — reading positions (Divine Office tracks, Bible, Catechism, programs)
- `preferences` — all user settings (theme, translation, font config, etc.); `pinned-items` here is a JSON array of pinned corpus item ids
- `cached_translations` — offline cache for online Bible translations
- `cache` — generic kv cache: catalog, manifest blobs, API responses

### Content blobs (expo-file-system / IndexedDB)
- Native: `documentDirectory/blobs/{ab}/{cd}/{full-sha256}` (mirrors the server layout)
- Web: IndexedDB key `blob:{full-sha256}`
- Hash-addressed → immutable; once fetched, cached forever (subject to LRU eviction with pinned items skipped)

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
    prayers/                          (~99 multilingual prayer assets)
      our-father.json
      hail-mary.json
      ...
    practices/                        (~99 practices — manifest + flow + fragments + data + tracks + images)
      morning-offering/
        manifest.json
        flow.json
      rosary/
        manifest.json
        flow.json
        fragments/
        data/
        tracks/
        images/
      ...
    chapters/                         (~40 native-rendered formation chapters)
    books/                            (~25 long-form spiritual works — per-language markdown chapters)
      catechism-of-trent/
        book.json
        en-US/
        pt-BR/
        images/
    masses/of/                        (972 OF Mass propers — split per-language at build)
    of-library/                       (Mass-of building blocks: ordinary, preface, eucharistic-prayer)
    of-data/                          (calendar, saints, IGMR, sacerdotale)
    collections/                      (curated reading lists — 14 collection JSONs)
    checkup/                          (spiritual-checkup decision-tree data)
    book.css                          (base stylesheet for all book rendering)
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
