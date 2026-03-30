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
/                       -> Home (greeting, time-block practice checklist, green wall, navigation medallions)
/plan/                  -> Plan of Life (green wall overview + stats + practice checklist)
/plan/[practiceId]      -> Individual practice detail with its own green wall + stats
/plan/settings          -> Customize practices (add/edit/delete, tier grouping)
/pray/[practiceId]      -> Prayer Flow (shared practice player)
/pray/[practiceId]?hour=... -> Prayer Flow for specific hour (office)
/practices/             -> Practice catalog (browse all available practices)
/practices/[manifestId] -> Practice catalog detail
/bible/                 -> Bible reader
/catechism/             -> Catechism reader
/mass                   -> Ordo Missae (static reference, OF/EF toggle, bilingual prayers)
/calendar               -> Liturgical calendar
/settings/              -> Settings (reading config, translation picker, theme toggle)
```

**Stack navigation** with home-as-hub: NavigationMedallion buttons on home screen, BackToHome on sub-screens

---

## Data Model (V2 — 4-table schema)

All data in SQLite. No AsyncStorage.

### `user_practices` — user's plan-of-life configuration

```sql
CREATE TABLE user_practices (
  practice_id  TEXT PRIMARY KEY,
  enabled      INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL,
  tier         TEXT NOT NULL DEFAULT 'essential',   -- essential | ideal | extra
  time_block   TEXT NOT NULL DEFAULT 'flexible',    -- morning | daytime | evening | flexible
  schedule     TEXT NOT NULL DEFAULT '{"type":"daily"}',  -- JSON Schedule
  variant      TEXT,
  custom_name  TEXT,    -- only for user-created practices
  custom_icon  TEXT,
  custom_desc  TEXT
);
```

Content metadata (name, icon, description) comes from `src/content/practices/*/manifest.json` at runtime. Only user-created practices use the `custom_*` columns.

### `completions` — event log

```sql
CREATE TABLE completions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  practice_id  TEXT NOT NULL,
  sub_id       TEXT,           -- 'morning'/'evening'/'compline' for multi-hour; null for simple
  date         TEXT NOT NULL,
  completed_at INTEGER NOT NULL
);
```

### `cursors` — reading position bookmarks

```sql
CREATE TABLE cursors (
  id         TEXT PRIMARY KEY,     -- 'divine-office/ot-readings', 'bible/position', etc.
  position   TEXT NOT NULL,        -- JSON: shape defined by consumer
  started_at TEXT NOT NULL
);
```

### `preferences` — all user settings (KV store)

```sql
CREATE TABLE preferences (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### `cached_translations` — Bible translation cache (unchanged)

### Schedule Model

Single JSON field in `user_practices.schedule`. Discriminated union:

```typescript
type Schedule = ScheduleRule & {
  seasons?: LiturgicalSeason[]
  notify?: Notification[]
}

type ScheduleRule =
  | { type: 'daily' }
  | { type: 'days-of-week', days: number[] }
  | { type: 'day-of-month', days: number[] }
  | { type: 'nth-weekday', n: number, day: number }
  | { type: 'times-per', count: number, period: 'week' | 'month' }
  | { type: 'fixed-program', totalDays: number, startDate: string }
```

See `docs/features/data-model-v2.md` for the complete spec.

---

## Storage Strategy

### expo-sqlite (all persistent data)
- `user_practices` — plan-of-life configuration
- `completions` — practice completion event log
- `cursors` — reading positions (Divine Office tracks, Bible position, Catechism position)
- `preferences` — all user settings (theme, translation, font config, etc.)
- `cached_translations` — offline cache for online Bible translations

### Bundled Assets (read-only)
- `src/assets/bible/drb/` — Douay-Rheims JSON files (one per book, 73 files)
- `src/assets/catechism/ccc.json` — Full CCC structured by paragraphs
- `src/assets/psalter/30-day.json` — 30-day psalter cycle mapping
- `src/assets/hymns/` — Hymn texts parsed from Divinum Officium
- `src/assets/prayers/` — Fixed prayer texts (Our Father, canticles, Marian antiphons, etc.)
- `assets/textures/` — Image-based ornament PNGs
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

## Stores

### `preferencesStore` — all user preferences
Hydrated from `preferences` SQLite table. Includes: translation, language, liturgicalCalendar, theme, fontFamily, fontSize, lineHeight, margin, textAlign, formPreferences.

### `navigationStore` — ephemeral UI state
Not persisted. Contains: selectedDate (shared across screens).

### Thin wrappers (backward compat)
- `themeStore` — reads/writes `theme` preference
- `bibleStore` — reads/writes `bible-book`/`bible-chapter` preferences
- `catechismStore` — reads/writes `catechism-paragraph` preference
- `readingConfigStore` — re-export of `preferencesStore`

---

## Folder Structure

```
src/
  app/                    (Expo Router routes — Stack navigation)
    _layout.tsx           (Root layout: fonts, DB init, TamaguiProvider, QueryClient)
    index.tsx             (Home screen)
    plan/
      _layout.tsx
      index.tsx           (Plan of Life)
      [practiceId].tsx    (Practice detail)
      settings.tsx        (Customize practices)
    pray/
      [practiceId].tsx    (Prayer flow player)
    practices/
      index.tsx           (Practice catalog)
      [manifestId].tsx    (Catalog detail)
    bible/
      _layout.tsx
      index.tsx           (Bible reader)
    catechism/
      _layout.tsx
      index.tsx           (Catechism reader)
    settings/
      _layout.tsx
      index.tsx           (Settings hub)
  features/
    plan-of-life/
      components/
        PracticeChecklist.tsx
        PracticeEditSheet.tsx
        SchedulePicker.tsx
        TierBadge.tsx
        DayCarousel.tsx
        index.ts
      hooks.ts
      utils.ts
      schedule.ts           (Schedule types, isApplicableOn, isFaithful)
      timeBlocks.ts         (morning/daytime/evening block logic)
      getPracticeName.ts
      index.ts
    divine-office/
      hooks.ts              (cursor management, psalm/bible/ccc loading)
      psalter.ts
      index.ts
    practices/
      components/
        PracticeFlow.tsx    (shared prayer flow player)
        TrackPicker.tsx     (reading track position picker)
        VariantSelector.tsx
        PracticeTeachingContent.tsx
        index.ts
    home/
      components/
        LiturgicalHeader.tsx
        SeasonalContext.tsx
        CelebrationOfDay.tsx
        TimeBlockSection.tsx
        AppShortcuts.tsx
        index.ts
      index.ts
  components/             (shared UI components)
    AnimatedCheckbox.tsx
    GreenWall.tsx
    ManuscriptFrame.tsx
    ScreenLayout.tsx
    SectionDivider.tsx
    ReadingConfigModal.tsx
    ...
    index.ts
  stores/
    preferencesStore.ts     (consolidated: all preferences from SQLite)
    navigationStore.ts      (ephemeral UI state)
    bibleStore.ts           (thin wrapper)
    catechismStore.ts       (thin wrapper)
    themeStore.ts           (thin wrapper)
    readingConfigStore.ts   (re-export)
  db/
    schema.ts               (TypeScript types: UserPractice, Completion, Cursor, Preference)
    client.ts               (async DB init, migration runner, getDb())
    seed.ts                 (manifest-driven practice seeding)
    migrations/
      0001_initial.sql ... 0008_data_model_v2.sql
    repositories/
      practices.ts          (user_practices + completions queries)
      cursors.ts            (cursor CRUD + index advancement)
      preferences.ts        (KV store for preferences table)
      index.ts
  content/                  (practice content system)
    engine.ts               (flow resolution engine)
    types.ts                (manifest, flow section, rendered section types)
    practices/              (one folder per practice)
      divine-office/
        manifest.json       (includes defaults section)
        flows/morning.json, evening.json, compline.json
      rosary/
        manifest.json
        flow.json
        variants/traditional.json, scriptural.json
      ...
      index.ts              (registry, loaders, search)
  lib/
    bolls.ts
    content.ts
    notifications.ts        (schedule-aware reminder scheduling)
    liturgical/
      psalter.ts, hymns.ts, antiphons.ts, season.ts, readings.ts, index.ts
    i18n/
  config/
    tamagui.config.ts
    tokens.ts
    themes.ts
    fonts.ts
```

See [CONVENTIONS.md](CONVENTIONS.md) for code style, naming, and patterns.
