# Tasks

Implementation tasks for Ember MVP, ordered by dependency. Each phase builds on the previous one.

---

## Phase 0: Project Setup ✅

- [x] Initialize Expo project (SDK 55, TypeScript, Expo Router)
- [x] Install core dependencies (zustand, immer, tamagui, @tamagui/core, @tamagui/config, react-native-reanimated, moti, expo-sqlite, @tanstack/react-query, expo-font, date-fns, @react-native-async-storage/async-storage, lucide-react-native, react-native-svg, react-native-web, react-dom)
- [x] Install dev dependencies (@biomejs/biome)
- [x] Configure Biome 2.x (single quotes, spaces)
- [x] Configure path aliases (@/) in tsconfig with strict mode
- [x] Configure Tamagui (createTamagui config with Ember tokens, themes, fonts)
- [x] Load custom fonts (UnifrakturMaguntia, Cinzel, EB Garamond, Pinyon Script) via expo-font
- [x] Set up Expo Router file structure with Stack layout and home-as-hub navigation
- [x] Implement dark/light/system theme switching via Tamagui themes with SQLite persistence (preferencesStore.ts)
- [x] Define Ember design tokens in Tamagui config (colors, typography, spacing, radii)
- [x] Define Tamagui themes (light, dark, liturgical season sub-themes)
- [x] Configure Reanimated + Tamagui babel plugins
- [x] Configure Metro with COOP/COEP headers for expo-sqlite on web
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

## Phase 2: Database Layer (expo-sqlite) ✅

- [x] Set up expo-sqlite async API (`src/db/client.ts`) with inline SQL migrations
- [x] Define TypeScript row types in `src/db/schema.ts` — 5 tables (user_practices, completions, cursors, preferences, cached_translations)
- [x] Seed 8 MVP practices on first launch (`src/db/seed.ts`)
- [x] TanStack Query provider already in root layout (Phase 0), DB init + migration wired into `_layout.tsx`

## Phase 3: State & Data Layer ✅

- [x] `usePreferencesStore` (Zustand + immer) — all user preferences from SQLite preferences table
- [x] `useNavigationStore` (Zustand + immer) — ephemeral UI state (selectedDate)
- [x] `useBibleStore` / `useCatechismStore` — thin wrappers for reading positions
- [x] TanStack Query hooks for completions (query by date range for green wall, streak calc)
- [x] TanStack Query hooks for cursors (reading positions, track advancement)
- [x] TanStack Query hooks for plan-of-life (practices CRUD, reordering, completion toggling)

## Phase 4: Design System Components ✅

- [x] `<TamaguiProvider>` wrapper — wires up Tamagui config, theme selection, font loading
- [x] `<ScreenLayout>` — standard screen wrapper with padding, scroll, safe area
- [x] `<Card>` — surface card with shadow and rounded corners
- [x] `<SectionDivider>` — ornamental divider with cross/fleuron symbol
- [x] `<GreenWall>` — contribution heatmap component (accepts date->value map, renders grid)
- [x] `<PrayerText>` — styled text block for prayers (generous line height, serif font)
- [x] `<RubricLabel>` — small gold label for section titles in office (e.g., "HYMN", "PSALMODY")
- [x] `<ProgressBar>` — reading progress indicator
- [x] `<AppFrame>` — top-level decorative frame with corner textures
- [x] `<BackToHome>` — navigation component for returning to home screen
- [x] `<ManuscriptFrame>` — book-like decorative frame for prayer content
- [x] `<RibbonBookmarks>` — decorative ribbon bookmarks
- [x] `<Ornament>` — ornamental dividers (OrnamentalRule, HeaderFlourish, CornerFlourish, VineBar, PageBreakOrnament)
- [x] SVG ornaments (FloralCorner, FloralVineBorder, WatercolorIcon)

## Phase 5: Plan of Life Feature ✅

- [x] `/plan/` screen — overview green wall (all practices combined) + today's practice checklist
- [x] Practice checklist — list of 8 practices with toggle checkboxes for today
- [x] Toggle logic — tap to mark complete (writes to SQLite, updates store, animates)
- [x] Overview green wall — renders past days colored by completion ratio (0-8 practices)
- [x] Summary stats — current streak, completion rate this week/month
- [x] `/plan/[practiceId]` screen — individual practice detail with its own green wall
- [x] Individual green wall — binary (done/not done) per day for one practice
- [x] Practice stats — current streak, longest streak, total days, completion rate
- [x] Day tap interaction — tap a cell to see tooltip of what was done/missed that day

## Phase 6: Divine Office Feature ✅

- [x] Lectio continua engine — calculate today's OT reading, NT reading, and CCC portion based on progress
- [x] Psalter engine — given day of month, return morning and evening psalm ranges from 30-day cycle
- [x] Compline psalm rotation — return correct psalm(s) based on day of week
- [x] Marian antiphon selector — return correct antiphon based on liturgical season/date
- [x] Hymn selector — return appropriate hymn for hour and season
- [x] `/office/` screen — hub with 3 cards (Morning, Evening, Compline) showing status and today's references
- [x] `/office/[hour]` screen — dynamic prayer flow route for morning/evening/compline (opening verse -> hymn -> psalmody -> reading -> canticle -> closing)
- [x] "Mark as Complete" button — records completion in SQLite, advances reading progress to next portion
- [x] Prayer flow styling — ornamental dividers, rubric labels, generous spacing

## Phase 7: Progress & Settings ✅

- [x] `/settings/` screen — reading progress (OT %, NT %, CCC % with estimated completion), translation picker (DRB bundled + Bolls.life online options)
- [x] `/settings/books` screen — mark books as already read
- [x] `/settings/position` screen — change reading position
- [x] Mark books as already read — checklist of all 73 Bible books, updates reading progress starting point
- [x] Theme toggle (light / dark / system)
- [x] Attribution/credits screen (Bible, CCC, Divinum Officium sources)

## Phase 8: Home Screen ✅

- [x] `/` (Home) screen — today's date with greeting
- [x] Today's practices checklist (same component as plan screen, compact)
- [x] Next office hour card — shows which hour is next (based on time of day), with tap to open
- [x] Office completion status for today (icons showing which hours are done)
- [x] Quick reading progress summary

## Phase 9a: Ordo Missae ✅

- [x] Bundle Extraordinary Form (TLM 1962) ordinary prayers as JSON in `src/assets/mass/`
- [x] Bundle Ordinary Form (Novus Ordo, 2011 translation) ordinary prayers as JSON
- [x] Content model with heading, prayer, rubric, proper (slot), options types
- [x] `src/features/mass/` — content loader, MassScreen, MassSection components
- [x] `/mass` route with form toggle (OF/EF), persisted via preferencesStore
- [x] Bilingual rendering (English primary, Latin italic secondary)
- [x] People's responses styled distinctly (bold, `R.` indicator)
- [x] Proper slots as dashed-border placeholders for future lectionary integration
- [x] Options selector for Eucharistic Prayers, Penitential Act forms, etc.
- [x] Home screen NavigationMedallion entry ("Holy Mass" / "Santa Missa")
- [x] i18n keys for en + pt-BR
- [x] Feature doc at `docs/features/mass.md`

## Phase 9: Polish

- [ ] Animations (Moti) — fade transitions between screens, subtle checkbox toggle animation, green wall cell fade-in with staggered delay
- [ ] Empty states — first launch with no data (encouraging message, not blank)
- [ ] Error states — offline fallback notice when API translation unavailable
- [ ] Responsive layout — tablet/web wider layout vs phone compact
- [ ] App icon and splash screen (Ember-themed, gold on dark)
- [ ] Test on web, iOS simulator, Android emulator
- [ ] Verify data persistence across app kills and restarts
