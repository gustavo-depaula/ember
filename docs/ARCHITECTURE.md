# Architecture

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Expo (SDK 52+) | Single codebase for web + iOS + Android |
| Navigation | Expo Router | File-based routing, deep linking, web-friendly |
| Storage | expo-sqlite (async API) | Direct SQL queries, no ORM overhead, works reliably on web |
| KV Storage | AsyncStorage | Simple preferences: theme, translation choice, onboarding state |
| State | Zustand + immer | Lightweight state with draft mutations for immutable updates |
| Async/Data | TanStack Query | Caching, loading states, error handling — even for SQLite reads |
| Styling/Components | Tamagui | Design system framework with compiler, theming, cross-platform primitives |
| Animations | react-native-reanimated + Moti | Reanimated for performance, Moti for declarative API |
| Formatting/Linting | Biome | Single Rust-based tool replacing Prettier + ESLint |
| Fonts | expo-font | Custom serif typefaces (Cormorant Garamond, Source Serif Pro) |
| Dates | date-fns | Lightweight, tree-shakeable, no Moment.js bloat |
| Bible text | Bundled JSON + Bolls.life API | Douay-Rheims offline, RSV2CE/NABRE online with caching |
| Catechism | Bundled JSON | From `nossbigg/catechism-ccc-json` |
| Liturgical texts | Bundled JSON | Parsed from `divinumofficium/divinum-officium` (MIT) |

---

## Screen Map

```
/                       -> Home (today's overview: practices checklist + next office hour)
/office/                -> Office hub (morning, evening, compline cards with status)
/office/morning         -> Morning Prayer (scrollable prayer flow)
/office/evening         -> Evening Prayer
/office/compline        -> Compline
/plan/                  -> Plan of Life (green wall overview + practice list)
/plan/[practiceId]      -> Individual practice detail + its green wall
/progress/              -> Bible/Catechism reading progress dashboard
/settings/              -> Settings (translation, psalter, mark-read books, theme)
```

**Tab navigation (bottom bar):** Home | Office | Plan of Life | Settings

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

interface PracticeLog {
  date: string        // YYYY-MM-DD
  practiceId: string
  completed: boolean
  completedAt?: number // timestamp
}
```

### Divine Office

```typescript
interface ReadingProgress {
  type: 'ot' | 'nt' | 'catechism' | 'psalter'
  currentBook: string
  currentChapter: number
  currentVerse: number
  completedBooks: string[]
  startDate: string
}

interface OfficePreferences {
  psalterCycle: '30-day' | 'custom'
  translation: string   // 'DRB' (bundled), 'RSV2CE', 'NABRE', etc.
  completedReadings: { book: string; chapters: number[] }[]
}

interface DailyOffice {
  date: string
  morning: { completed: boolean; completedAt?: number }
  evening: { completed: boolean; completedAt?: number }
  compline: { completed: boolean; completedAt?: number }
}
```

---

## Storage Strategy

### expo-sqlite (structured data)
- `practices` table — fixed set for MVP, extensible for custom practices later
- `practice_logs` table — one row per practice per day, indexed by date
- `reading_progress` table — tracks position in OT, NT, CCC, and psalter
- `daily_office` table — completion status per hour per day
- `office_preferences` table — translation, psalter cycle, completed readings

### AsyncStorage (simple KV)
- `theme` — 'light' | 'dark' | 'system'
- `onboarding_complete` — boolean
- `cached_translations` — cached API responses from Bolls.life

### Bundled Assets (read-only)
- `assets/bible/drb/` — Douay-Rheims JSON files (one per book, 73 files)
- `assets/catechism/ccc.json` — Full CCC structured by paragraphs
- `assets/psalter/30-day.json` — 30-day psalter cycle mapping
- `assets/hymns/` — Hymn texts parsed from Divinum Officium
- `assets/prayers/` — Fixed prayer texts (Our Father, canticles, Marian antiphons, etc.)

---

## Content Fetching Strategy

```
User selects translation in settings
  |
  ├── DRB (Douay-Rheims) -> Read from bundled JSON (always available offline)
  |
  └── RSV2CE / NABRE / etc. -> Fetch from Bolls.life API
                                  |
                                  ├── Online -> Fetch, cache in SQLite, display
                                  └── Offline -> Show cached version, or fallback to DRB with notice
```

Bolls.life API is free, no auth required. Cache aggressively — once a chapter is fetched, store it locally in SQLite so it works offline on subsequent reads.

---

## Folder Structure

```
src/
  app/                  (Expo Router routes)
    (tabs)/
      index.tsx         (Home)
      office/
        index.tsx       (Office hub)
        morning.tsx
        evening.tsx
        compline.tsx
      plan/
        index.tsx       (Plan of Life)
        [practiceId].tsx
      settings.tsx
    _layout.tsx
  features/
    plan-of-life/
      hooks.ts
      utils.ts
      index.ts
    divine-office/
      hooks.ts
      engine.ts
      psalter.ts
      index.ts
  components/           (shared UI components)
    GreenWall.tsx
    DropCap.tsx
    SectionDivider.tsx
    PrayerText.tsx
    RubricLabel.tsx
    ProgressBar.tsx
    Card.tsx
    index.ts
  stores/               (zustand + immer stores)
    practiceStore.ts
    officeStore.ts
    readingStore.ts
    preferencesStore.ts
  db/                   (sqlite schema, types, client)
    schema.ts           (TypeScript types for DB rows)
    client.ts           (async DB init, migrations, getDb())
    seed.ts
  lib/                  (API clients, helpers)
    bolls.ts
    content.ts
  config/               (tamagui config, tokens, themes)
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
