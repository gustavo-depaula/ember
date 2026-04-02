# Dev Journal

Accumulated learnings, discoveries, and decisions from Ember development. Things that aren't obvious from the code or docs — API quirks, licensing traps, UX lessons, technical gotchas.

**Agents: read this before starting work. Add entries when you learn something non-obvious.**

---

## Content & Licensing

- **DRB is the only viable bundled English Catholic Bible.** The Douay-Rheims (1749–1750) is fully public domain. Every other major Catholic English translation (NABRE, RSV-CE, NJB, etc.) is under active copyright. Source: `xxruyle/Bible-DouayRheims` on GitHub, MIT license.

- **Bolls.life DRB is incomplete — do NOT use it.** The Bolls.life API's Douay-Rheims translation only has 66 books — all 7 deuterocanonical books are missing. For Catholic use, always use the bundled version from xxruyle. Non-Catholic translations (66 books) work fine but need fallback to bundled DRB for deuterocanonical content.

- **ICEL copyright blocks free OF collects and antiphons.** The Ordinary Form's Collect, Entrance/Communion Antiphons, and other variable prayers are copyrighted by the International Commission on English in the Liturgy. No free API provides them in structured format. This is a hard blocker for complete OF daily Mass propers. The EF has no such problem — everything is available via Missale Meum/Divinum Officium.

- **CCC usage requires Vatican attribution.** The Catechism JSON comes from scraping vatican.va. Attribution required: "Catechism of the Catholic Church, copyright Libreria Editrice Vaticana." Vatican generally permits non-commercial educational use.

- **Divinum Officium hymns use a custom bracket format.** The source files aren't JSON — they use `[SectionName]` brackets. Needs a one-time parse step to convert to JSON. Already done for MVP hymns.

## APIs & Integrations

- **Bolls.life API: free, no auth, generous rate limits.** Base URL: `https://bolls.life`. No documented rate limits, but don't abuse it. Responses cached indefinitely in SQLite since Bible text never changes.

- **EF propers bundled from Divinum Officium, not Missale Meum API.** Missale Meum wraps DO data but only supports English + Polish. We need Portuguese too, so we parse the raw DO files directly. The bracket-based format (`[Introitus]`, `[Oratio]`, etc.) is parsed at build time by `scripts/parse-do-propers.ts` into JSON. Portuguese coverage is partial (207 vs 480 Tempora files) — the app falls back to English via `localizeContent`. Cross-references (`@Tempora/...`, `@Commune/...`) point to `missa/` or `horas/` Commune directories. Prayer macros (`$Per Dominum`) expand from `Ordo/Prayers.txt`. The Commune files for Mass sections live in `horas/{lang}/Commune/` (same files serve both Office and Mass).

- **Evangelizo: OF reading text but with quirks.** `https://feed.evangelizo.org/v2/reader.php?date={YYYYMMDD}&lang={LANG}&type=all` provides full daily reading text. Limitations: response may contain HTML that needs stripping, date range limited to ~30 days from current date, no CORS headers (may need proxy for web), and does NOT provide collects/antiphons.

- **Catholic Readings API: OF calendar + references only.** GitHub Pages hosted (free, MIT). Provides Scripture references (not full text) and liturgical day metadata. The `psalm` field sometimes references non-psalm books (e.g., Jeremiah). Cross-chapter ranges use em-dash (—). Coverage: 2025–2026 data available.

- **Universalis JSONP: potentially has OF propers but unreliable.** Claims to provide full Mass propers via JSONP. Documentation is vague and incomplete. Legacy JavaScript callback pattern doesn't fit React Native well. Worth investigating further but don't count on it.

- **Bible Gateway and API.Bible are not viable.** Bible Gateway discontinued its API and prohibits scraping. API.Bible has FUMS tracking requirements implying online-only usage, unclear Catholic translation availability.

## Technical

- **The original `getLiturgicalSeason()` was an antiphon scheduler, not a season calculator.** Its boundaries mapped to the Marian antiphon switching dates (Advent→Feb 1, Feb 2→Holy Wednesday, etc.), which don't correspond to actual liturgical seasons. The antiphon schedule is a separate traditional system with its own date ranges — decoupled from seasons in the rewrite.

- **OF and EF seasons share Easter and Advent but diverge everywhere else.** Key differences: EF has Epiphanytide (Jan 14 to Septuagesima) and Septuagesimatide (3 pre-Lent Sundays using violet), neither of which exist in OF. EF has "Time after Pentecost" where OF has "Ordinary Time." Christmas ends at Baptism of the Lord (OF, ~Jan 11) vs Octave of Epiphany (EF, Jan 13). A single `LiturgicalSeason` union with 8 values covers both forms cleanly — each form uses a subset.

- **Year-boundary edge case in season calculation.** Dec 25 is after the start of Advent, so a naive "if date >= Advent start, return advent" incorrectly classifies Christmas Day. The fix: check Christmas (Dec 25+) before checking Advent. Similarly, Jan 1 is still Christmastide in both forms.

- **Divine Office migrated to practice content format.** The custom engine (`divine-office/engine.ts`) and `PrayerFlow` component were replaced by JSON flow files + the shared content engine. Three key infrastructure changes accompanied this: (1) `practice_completions` event log replaces `practice_logs` — supports multiple completions per day and per-hour detail tracking; (2) `reading_tracks` replaces `reading_progress` — named cursors with `id` PK instead of `type` PK, enabling future track sharing between practices; (3) reading tracks are auto-advanced on practice completion whenever `tracks` are defined in the manifest. The `daily_office` and `practice_logs` tables still exist but are deprecated.

- **Unified hours/forms/flow into a single `flows` model.** Three previously separate manifest fields (`flow`, `hours`, `forms`) were replaced by a single `flows: FlowEntry[]` array. Each flow is a named, schedulable prayer sequence. Scheduling (tier, day-of-week) moved from the `Variant` type into `defaults.slots[]` in the manifest — each `SlotDefault` maps a `flowId` to a schedule. The `Variant` type was simplified: `selector`, `schedule`, and `setNames` fields were removed; the engine now receives the active flow ID as `setKeyOverride` in `FlowContext` and picks `variant.data[flowId]` directly (falls back to the first key). This made the Rosary manifest explicit: 4 flows (joyful/sorrowful/glorious/luminous) with day-of-week slots, instead of an opaque `selector: "day-of-week"` schedule inside the variant. Simple practices get a single flow with `id: "default"`.

- **Tamagui sub-theme nesting for liturgical seasons.** Wrapping the app in `<Theme name={season}>` inside `<TamaguiProvider defaultTheme={resolvedTheme}>` causes Tamagui to resolve `light` + `advent` to the registered `light_advent` theme automatically. This means any component reading `$accent` gets the seasonal color with zero changes to those components. Important: `useThemeName()` now returns the sub-theme name (e.g., `'dark_lent'`), not just `'dark'` — any code checking theme name equality must use `.startsWith('dark')` instead of `=== 'dark'`.

- **Backward-compatible wrappers for reading tracks.** `getReadingProgressByType('ot')` maps to `getReadingTrack('default-ot')` so existing consumers (settings screens, reading progress hooks) work without changes. The `ReadingTrack` type is a superset of `ReadingProgress` (adds `id` and `label`).

- **Rubrics restyled from section headers to Missal-style italic.** The `RubricLabel` component was originally uppercase, letter-spaced Cinzel text — functioning as a section header. Real Missal rubrics are italic, sentence case, in red (hence "rubric" from Latin *rubrica*). The component was restyled to italic body font with accent color. All 40+ flows that used rubrics as section labels ("Opening Verse", "Hymn", "Psalmody") were migrated to `subheading` type instead. Mass flows received comprehensive rubrics at every major gesture (genuflections, bows, signs of the cross, hand positions) following the 1962 Missale Romanum (EF) and GIRM (OF).

- **Mass view modes use grouped flows, not engine filtering.** We considered two approaches for Propers/Readings views: (1) a single flow with engine-level section filtering by `viewMode` in `FlowContext`, or (2) separate flow JSON files with a `group` field on `FlowEntry` linking sub-flows to their parent. We chose (2) because it's zero engine complexity — just JSON content + a `group` field. The `ViewModeSelector` component renders a segmented control inside the pray screen; switching modes swaps the loaded flow via `useState` without navigation. The `FlowButtons` component on the detail screen filters out grouped flows so only primary flows appear as entry points.

- **EF Mass propers: Tempora/Sancti precedence must use the liturgical calendar.** A naive merge (Sancti overlays Tempora) is wrong — on Holy Thursday 2026, St. Francis of Paola (Sancti `04-02`, III class) was overriding the Triduum epistle with an empty `Lectio`. The fix: use `DayCalendar.principal` from `buildYearCalendar()` to determine which source provides the Mass. If the principal's `category` is temporal (`solemnity_temporal`, `feast_of_the_lord`, `liturgical_season`) → use Tempora propers. If it's a saint category → use Sancti propers. Never merge both. Fallback without a calendar: Tempora-only (safe default — missing a saint is less wrong than overriding the Triduum). Future: commemorated saints should contribute only their Collect (Oratio) to the Mass of the day.
