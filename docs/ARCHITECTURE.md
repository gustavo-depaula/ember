# Architecture

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Expo (SDK 55) | Single codebase for web + iOS + Android |
| Navigation | Expo Router | File-based routing, deep linking, web-friendly |
| Storage | expo-sqlite (async API) | Direct SQL queries, no ORM overhead, works reliably on web |
| KV Storage | AsyncStorage | Simple preferences: theme, translation choice, onboarding state |
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
/                       -> Home (greeting, time-block practice checklist, green wall, navigation medallions)
/office/                -> Office hub (morning, evening, compline cards with status)
/pray/divine-office?hour=... -> Prayer Flow (shared practice player with office theme)
/plan/                  -> Plan of Life (green wall overview + stats + practice checklist)
/plan/[practiceId]      -> Individual practice detail with its own green wall + stats
/mass                   -> Ordo Missae (static reference, OF/EF toggle, bilingual prayers)
/settings/              -> Settings (reading progress, translation picker, theme toggle)
/settings/books         -> Mark books as already read (checklist of 73 books)
/settings/position      -> Change reading position (query param: type=ot|nt|catechism)
```

**Stack navigation** with home-as-hub: NavigationMedallion buttons on home screen, BackToHome on sub-screens

---

## Data Models

### Practice (Plan of Life)

```typescript
interface Practice {
  id: string
  name: string
  icon: string
  frequency: 'daily' | 'weekly' | 'custom'
  enabled: boolean
  order: number
}

// Event log — each completion is a separate row (supports multiple per day)
interface PracticeCompletion {
  id: number
  practiceId: string
  detail?: string      // office hour, mystery set, etc.
  date: string         // YYYY-MM-DD
  completedAt: number  // timestamp
}
```

### Reading Tracks

```typescript
// Named reading tracks — shareable between practices
interface ReadingTrack {
  id: string                   // 'default-ot', 'default-nt', 'default-catechism'
  type: 'ot' | 'nt' | 'catechism'
  label: string | null         // user-facing name (null for defaults)
  currentBook: string
  currentChapter: number
  currentVerse: number
  completedBooks: string       // JSON array string
  completedChapters: string    // JSON object string
  startDate: string
}
```

---

## Storage Strategy

### expo-sqlite (structured data)
- `practices` table — built-in + custom practices, with `manifest_id` linking to content system
- `practice_completions` table — event log, one row per completion (supports multiple per day, per-hour tracking via `detail` column)
- `reading_tracks` table — named reading cursors (default-ot, default-nt, default-catechism), shareable between practices
- `cached_translations` table — offline cache for online Bible translations

### AsyncStorage (simple KV, via Zustand persist)
- `theme` — 'light' | 'dark' | 'system' (themeStore)
- `translation` — preferred Bible translation (preferencesStore)
- `psalterCycle` — '30-day' (preferencesStore)
- `reading-font-family`, `reading-font-size`, `reading-line-height`, `reading-margin`, `reading-text-align` — shared reading config (readingConfigStore)

### Bundled Assets (read-only)
- `src/assets/bible/drb/` — Douay-Rheims JSON files (one per book, 73 files)
- `src/assets/catechism/ccc.json` — Full CCC structured by paragraphs
- `src/assets/psalter/30-day.json` — 30-day psalter cycle mapping
- `src/assets/hymns/` — Hymn texts parsed from Divinum Officium
- `src/assets/prayers/` — Fixed prayer texts (Our Father, canticles, Marian antiphons, etc.)
- `assets/textures/` — Image-based ornament PNGs (corner pieces, horizontal markers, frame textures)
- `assets/fonts/` — UnifrakturMaguntia bundled TTF

---

## Content Fetching Strategy

```
User selects translation in settings
  |
  ├── DRB (Douay-Rheims) -> Read from bundled JSON (always available offline)
  |
  └── NABRE / RSV -> Fetch from Bolls.life API
                                  |
                                  ├── Online -> Fetch, cache in SQLite, display
                                  └── Offline -> Show cached version, or fallback to DRB with notice
```

Bolls.life API is free, no auth required. Cache aggressively — once a chapter is fetched, store it locally in SQLite so it works offline on subsequent reads.

---

## Folder Structure

```
src/
  app/                    (Expo Router routes — Stack navigation)
    _layout.tsx           (Root layout: fonts, DB init, TamaguiProvider, QueryClient)
    index.tsx             (Home screen)
    office/
      _layout.tsx
      index.tsx           (Office hub)
      [hour].tsx          (Dynamic prayer flow: morning/evening/compline)
    plan/
      _layout.tsx
      index.tsx           (Plan of Life)
      [practiceId].tsx    (Practice detail)
    settings/
      _layout.tsx
      index.tsx           (Settings hub)
      books.tsx           (Mark books as read)
      position.tsx        (Change reading position)
  features/
    plan-of-life/
      components/
        PracticeChecklist.tsx
        index.ts
      hooks.ts
      utils.ts
      timeBlocks.ts       (morning/daytime/evening block logic)
      index.ts
    divine-office/
      hooks.ts          (reading progress, psalm/bible/ccc loading hooks)
      psalter.ts         (re-exports from lib/liturgical)
      utils.ts           (progress calculations)
      index.ts
    home/
      components/
        HeroCTA.tsx
        NavigationMedallion.tsx
        TimeBlockSection.tsx
        index.ts
      getNextAction.ts
      index.ts
  components/             (shared UI components)
    AppFrame.tsx
    BackToHome.tsx
    Card.tsx
    GreenWall.tsx
    IlluminatedInitial.tsx
    ManuscriptFrame.tsx
    Ornament.tsx          (OrnamentalRule, HeaderFlourish, CornerFlourish, VineBar, PageBreakOrnament)
    PageBorder.tsx
    PrayerText.tsx
    ProgressBar.tsx
    RibbonBookmarks.tsx
    RubricLabel.tsx
    ScreenLayout.tsx
    SectionDivider.tsx
    ornaments/            (SVG-based decorative elements)
      FloralCorner.tsx
      FloralVineBorder.tsx
      WatercolorIcon.tsx
      svgHelpers.ts
      index.ts
    index.ts
  stores/                 (zustand + immer stores)
    practiceStore.ts
    officeStore.ts
    preferencesStore.ts
    readingConfigStore.ts
    themeStore.ts
  db/                     (sqlite schema, types, client)
    schema.ts             (TypeScript types for DB rows)
    client.ts             (async DB init, migration runner, getDb())
    seed.ts
    migrations/
      0001_initial.sql
      0002_completed_chapters.sql
    repositories/         (data access layer)
      office.ts
      practices.ts
      index.ts
  content/                  (practice content system)
    engine.ts               (flow resolution engine)
    types.ts                (manifest, flow section, rendered section types)
    practices/              (one folder per practice)
      divine-office/
        manifest.json
        flows/morning.json, evening.json, compline.json
      little-office-bvm/
        manifest.json
        flows/matins.json ... compline.json
      rosary/
        manifest.json
        flow.json
        variants/traditional.json, scriptural.json
      ...                   (morning-offering, angelus, etc.)
      index.ts              (registry, loaders, search)
  lib/                    (API clients, helpers)
    bolls.ts
    content.ts
    liturgical/             (shared liturgical computation)
      psalter.ts, hymns.ts, antiphons.ts, season.ts, readings.ts, index.ts
  config/                 (tamagui config, tokens, themes)
    tamagui.config.ts
    tokens.ts
    themes.ts
    fonts.ts
  assets/
    bible/drb/
    catechism/
    psalter/
    hymns/
    prayers/
```

See [CONVENTIONS.md](CONVENTIONS.md) for code style, naming, and patterns.
