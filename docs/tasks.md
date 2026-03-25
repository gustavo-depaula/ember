# Tasks

Implementation tasks for Ember MVP, ordered by dependency. Each phase builds on the previous one.

---

## Phase 0: Project Setup ✅

- [x] Initialize Expo project (SDK 55, TypeScript, Expo Router)
- [x] Install core dependencies (zustand, immer, tamagui, @tamagui/core, @tamagui/config, react-native-reanimated, moti, expo-sqlite, drizzle-orm, @tanstack/react-query, expo-font, date-fns, @react-native-async-storage/async-storage, lucide-react-native, react-native-svg, react-native-web, react-dom)
- [x] Install dev dependencies (drizzle-kit, @biomejs/biome)
- [x] Configure Biome 2.x (no semicolons, single quotes, tabs)
- [x] Configure path aliases (@/) in tsconfig with strict mode
- [x] Configure Tamagui (createTamagui config with Ember tokens, themes, fonts)
- [x] Load custom fonts (Cormorant Garamond, Source Serif 4) via expo-font
- [x] Set up Expo Router file structure with tab layout (Home, Office, Plan, Settings)
- [x] Implement dark/light/system theme switching via Tamagui themes with AsyncStorage persistence (themeStore.ts)
- [x] Define Ember design tokens in Tamagui config (colors, typography, spacing, radii)
- [x] Define Tamagui themes (light, dark, liturgical season sub-themes)
- [x] Configure Reanimated + Tamagui babel plugins
- [x] Configure Metro with .sql extension for Drizzle migrations
- [x] Package manager: pnpm

## Phase 1: Content Pipeline ✅

- [x] Download and bundle Douay-Rheims Bible (73 books) from `xxruyle/Bible-DouayRheims` into `src/assets/bible/drb/` with index manifest
- [x] Download and flatten CCC (2,865 paragraphs with section breadcrumbs) from `nossbigg/catechism-ccc-json` into `src/assets/catechism/ccc.json`
- [x] Bundle MVP hymn texts (Te Lucis, Iam Lucis, O Lux Beata) into `src/assets/hymns/`
- [x] Create `src/assets/psalter/30-day.json` — DWDO psalter cycle (30 days + compline weekly rotation)
- [x] Create `src/assets/prayers/` — 9 prayer files (Opening Verse, Our Father, Hail Mary, Glory Be, Benedictus, Magnificat, Nunc Dimittis, Sign of Cross, Marian Antiphons)
- [x] Build Bolls.life API client (`src/lib/bolls.ts`) — fetchBooks, fetchChapter (NABRE, RSV confirmed)
- [x] Build content provider (`src/lib/content.ts`) — getBooks, getChapter with bundled DRB path + API fallback
- [x] Download scripts: `scripts/download-drb.ts`, `scripts/download-ccc.ts`

## Phase 2: Database Layer (Drizzle ORM) ✅

- [x] Set up Drizzle with expo-sqlite driver (`src/db/client.ts`) with migration runner
- [x] Define schema in `src/db/schema.ts` — 6 tables (practices, practice_logs, reading_progress, daily_office, office_preferences, cached_translations)
- [x] Generate initial migration with `drizzle-kit generate` (output in `drizzle/`)
- [x] Seed 8 MVP practices on first launch (`src/db/seed.ts`)
- [x] TanStack Query provider already in root layout (Phase 0), DB init + migration wired into `_layout.tsx`

## Phase 3: State & Data Layer ✅

- [x] `usePracticeStore` (Zustand + immer) — client state for practice date selection
- [x] `useOfficeStore` (Zustand + immer) — daily office date selection state
- [x] `usePreferencesStore` (Zustand + immer) — translation, psalter cycle (bridges AsyncStorage)
- [x] TanStack Query hooks for practice logs (query by date range for green wall, streak calc)
- [x] TanStack Query hooks for reading progress (current position, advance chapter, mark books read)
- [x] TanStack Query hooks for daily office (completion status per hour per day)

## Phase 4: Design System Components

- [ ] `<TamaguiProvider>` wrapper — wires up Tamagui config, theme selection, font loading
- [ ] `<ScreenLayout>` — standard screen wrapper with padding, scroll, safe area
- [ ] `<Card>` — surface card with shadow and rounded corners
- [ ] `<SectionDivider>` — ornamental divider with cross/fleuron symbol
- [ ] `<DropCap>` — decorative first letter for readings/psalms (gold, 3-4 lines tall)
- [ ] `<GreenWall>` — contribution heatmap component (accepts date->value map, renders grid)
- [ ] `<PrayerText>` — styled text block for prayers (generous line height, serif font)
- [ ] `<RubricLabel>` — small gold label for section titles in office (e.g., "HYMN", "PSALMODY")
- [ ] `<ProgressBar>` — reading progress indicator
- [ ] `<TabBar>` — bottom tab navigation with calligraphic icons, gold active state

## Phase 5: Plan of Life Feature

- [ ] `/plan/` screen — overview green wall (all practices combined) + today's practice checklist
- [ ] Practice checklist — list of 8 practices with toggle checkboxes for today
- [ ] Toggle logic — tap to mark complete (writes to SQLite, updates store, animates)
- [ ] Overview green wall — renders past days colored by completion ratio (0-8 practices)
- [ ] Summary stats — current streak, completion rate this week/month
- [ ] `/plan/[practiceId]` screen — individual practice detail with its own green wall
- [ ] Individual green wall — binary (done/not done) per day for one practice
- [ ] Practice stats — current streak, longest streak, total days, completion rate
- [ ] Day tap interaction — tap a cell to see tooltip of what was done/missed that day

## Phase 6: Divine Office Feature

- [ ] Lectio continua engine — calculate today's OT reading, NT reading, and CCC portion based on progress
- [ ] Psalter engine — given day of month, return morning and evening psalm ranges from 30-day cycle
- [ ] Compline psalm rotation — return correct psalm(s) based on day of week
- [ ] Marian antiphon selector — return correct antiphon based on liturgical season/date
- [ ] Hymn selector — return appropriate hymn for hour and season
- [ ] `/office/` screen — hub with 3 cards (Morning, Evening, Compline) showing status and today's references
- [ ] `/office/morning` screen — full scrollable prayer flow (opening verse -> hymn -> psalmody -> OT reading -> Benedictus -> intercessions -> Our Father -> closing)
- [ ] `/office/evening` screen — same flow with evening psalms, NT reading, Magnificat
- [ ] `/office/compline` screen — same flow with Compline psalms, CCC reading, Nunc Dimittis, Marian antiphon
- [ ] "Mark as Complete" button — records completion in SQLite, advances reading progress to next portion
- [ ] Prayer flow styling — drop caps, ornamental dividers, rubric labels, generous spacing

## Phase 7: Progress & Settings

- [ ] `/progress/` screen — three progress bars (OT %, NT %, CCC %) with estimated completion dates
- [ ] Completed books list and current position display
- [ ] `/settings/` screen — translation picker (DRB bundled + Bolls.life online options)
- [ ] Mark books as already read — checklist of all 73 Bible books, updates reading progress starting point
- [ ] Theme toggle (light / dark / system)
- [ ] Attribution/credits screen (Bible, CCC, Divinum Officium sources)

## Phase 8: Home Screen

- [ ] `/` (Home) screen — today's date with greeting
- [ ] Today's practices checklist (same component as plan screen, compact)
- [ ] Next office hour card — shows which hour is next (based on time of day), with tap to open
- [ ] Office completion status for today (icons showing which hours are done)
- [ ] Quick reading progress summary

## Phase 9: Polish

- [ ] Animations (Moti) — fade transitions between screens, subtle checkbox toggle animation, green wall cell fade-in with staggered delay
- [ ] Empty states — first launch with no data (encouraging message, not blank)
- [ ] Error states — offline fallback notice when API translation unavailable
- [ ] Responsive layout — tablet/web wider layout vs phone compact
- [ ] App icon and splash screen (Ember-themed, gold on dark)
- [ ] Test on web, iOS simulator, Android emulator
- [ ] Verify data persistence across app kills and restarts
