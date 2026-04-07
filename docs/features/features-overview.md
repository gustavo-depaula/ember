# Features Overview

Domain knowledge, design rationale, and capability reference for Ember's features. For code style see `CONVENTIONS.md`, for architecture see `ARCHITECTURE.md`.

---

## Practice Content Architecture

**Why:** Adding a practice should mean writing content files, not code. Content (manifest) is strictly separated from user data (DB).

### Core Concept

Every practice has two layers:
1. **Manifest** — metadata and teaching content (what the practice is, its history, how to pray it)
2. **Flow** — the prayer itself as a sequence of sections (rendered by `SectionBlock`)

A resolution engine transforms the declarative flow + runtime context (date, variant, reading progress) into a flat array of renderable sections.

### File Structure

```
apps/app/src/content/practices/
  morning-offering/
    manifest.json
    flow.json
  rosary/
    manifest.json
    flow.json             # shared skeleton (repeat section for mysteries)
    variants/
      traditional.json
      scriptural.json
      montfort.json
  divine-office/
    manifest.json
    flows/
      lauds.json
      vespers.json
      compline.json
```

Shared prayer texts in `apps/app/src/assets/prayers/` — referenced by ID from flows.

### Manifest Schema

```typescript
type LocalizedText = { en: string; 'pt-BR'?: string }

type FlowEntry = {
  id: string
  name: LocalizedText
  file: string                   // relative path to flow file
  timeBlock?: string
}

type SlotDefault = {
  flowId: string
  schedule: Schedule             // daily, days-of-week, etc.
  tier?: 'essential' | 'ideal' | 'extra'
  time?: string
  enabled?: boolean
}

type PracticeManifest = {
  id: string
  name: LocalizedText
  categories: string[]
  estimatedMinutes: number
  image?: string
  thumbnail?: string
  description: LocalizedText
  history: LocalizedText
  howToPray: LocalizedText
  flowMode: 'scroll' | 'step'
  completion: 'flow-end' | 'manual'
  theme?: 'office'               // ornamental office-style rendering
  flows: FlowEntry[]             // unified list of schedulable prayer sequences
  variants?: {
    id: string
    name: LocalizedText
    description: LocalizedText
    file: string
  }[]
  pack?: string                  // undefined = base catalog
  tags: string[]
  program?: ProgramConfig        // see Programs section
  defaults?: {
    sortOrder: number
    slots: SlotDefault[]
  }
}
```

Content fields (name, icon, description) come from the manifest at runtime. The DB stores only user personalization (tier, time block, schedule, variant choice).

### Flow Section Types

A flow is a JSON `{ sections: Section[] }`. Section types:

**Leaf:** `rubric` (red instructional text), `divider`, `heading`, `image`

**Text content:**
- `prayer` — `{ ref: "our-father" }` or `{ inline: LocalizedContent }`
- `hymn`, `canticle` — same ref/inline pattern
- `meditation` — reflective text
- `response` — versicle/response pairs: `{ verses: [{ v, r }] }`

**Structural:**
- `repeat` — expand template N times with optional variant data per iteration

**Dynamic sources (resolved at runtime):**
- `cycle` — indexed data lookup by `day-of-month`, `day-of-week`, `fixed`, or `program-day`. Output modes: named type (`psalmody`, `hymn`) or `template` (substitutes `{{vars}}` into child sections)
- `psalter` — psalms from a cycle (e.g., 30-day DWDO)
- `lectio` — reading from current progress (testament: `ot` | `nt` | `catechism`)
- `seasonal` — content varying by liturgical season (hymns, Marian antiphons)

### Variant System

Variants provide interchangeable content for the same prayer structure. The data keys match flow IDs:

```typescript
type Variant = {
  id: string
  name: LocalizedText
  data: Record<string, VariantEntry[]>  // flow ID → entries per repeat iteration
}
```

**Runtime:** User selects variant → engine receives active flow ID as `setKeyOverride` → picks `variant.data[flowId]` → injects into repeat sections via `{{placeholder}}` substitution.

### Resolution Engine

```typescript
function resolveFlow(flow: Flow, context: FlowContext): RenderedSection[]

type FlowContext = {
  date: Date
  variant?: string
  variantData?: Variant
  setKeyOverride?: string
  liturgicalCalendar?: 'of' | 'ef'
  readingProgress?: ReadingProgress
  psalterNumbering?: 'mt' | 'lxx'
  programDay?: number
}
```

Steps: walk sections → resolve refs from asset dirs → expand repeats with variant data → resolve dynamic sources (psalter, lectio, seasonal, cycle) → flatten to `RenderedSection[]`.

### Example: Rosary Manifest

```json
{
  "id": "rosary",
  "flows": [
    { "id": "joyful",    "name": { "en": "Joyful Mysteries" },    "file": "flow.json" },
    { "id": "sorrowful", "name": { "en": "Sorrowful Mysteries" }, "file": "flow.json" },
    { "id": "glorious",  "name": { "en": "Glorious Mysteries" },  "file": "flow.json" },
    { "id": "luminous",  "name": { "en": "Luminous Mysteries" },  "file": "flow.json" }
  ],
  "variants": [
    { "id": "traditional", "name": { "en": "Traditional Meditations" }, "file": "variants/traditional.json" }
  ],
  "defaults": {
    "sortOrder": 4,
    "slots": [
      { "flowId": "joyful",    "schedule": { "type": "days-of-week", "days": [1, 6] }, "tier": "essential" },
      { "flowId": "sorrowful", "schedule": { "type": "days-of-week", "days": [2, 5] }, "tier": "essential" },
      { "flowId": "glorious",  "schedule": { "type": "days-of-week", "days": [0, 3] }, "tier": "essential" },
      { "flowId": "luminous",  "schedule": { "type": "days-of-week", "days": [4]    }, "tier": "essential" }
    ]
  }
}
```

Key: `flow.json` is the prayer skeleton (fixed structure with repeat section for mysteries). `variants/*.json` provide interchangeable meditation content keyed by flow ID. Day-of-week scheduling lives in `defaults.slots[]`, not in the variant.

### Current Capabilities

Static prayers, repeat/variant patterns, dynamic sources (psalter, lectio, seasonal, cycle), multi-flow practices (Rosary, Divine Office), office theme with ornamental rendering.

### Future

Seasonal/thematic practice packs, catalog search/filtering, more chaplets and devotions.

---

## Divine Office

**Why:** A simplified office using lectio continua to read the entire Bible and CCC in approximately one year, rather than the standard lectionary. Accessible to laypeople without requiring a breviary.

### Hour Structure

| Hour | Elements |
|------|----------|
| Morning (Lauds) | Opening verse → Hymn (seasonal) → Psalmody (30-day cycle) → OT Reading (lectio continua) → Benedictus → Our Father |
| Evening (Vespers) | Opening verse → Hymn → Psalmody → NT Reading (lectio continua) → Magnificat → Our Father |
| Night (Compline) | Opening verse → Hymn → Psalmody (weekly rotation) → CCC Reading (lectio continua) → Nunc Dimittis → Glory Be → Marian Antiphon (seasonal) |

### Lectio Continua

| Hour | Content | ~Daily Portion | Completes In |
|------|---------|---------------|--------------|
| Morning | Old Testament | ~3 chapters | ~365 days |
| Evening | New Testament | ~1 chapter | ~365 days |
| Compline | Catechism (CCC) | ~8 paragraphs | ~365 days |

Psalms are handled separately via the psalter cycle. Users can mark books as already read to customize their starting point.

### 30-Day Psalter Cycle (DWDO)

All 150 psalms in 30 days (MT/Hebrew numbering shown):

| Day | Morning     | Evening     |
| --- | ----------- | ----------- |
| 1   | 1-5         | 6-8         |
| 2   | 9-11        | 12-14       |
| 3   | 15-17       | 18          |
| 4   | 19-21       | 22-23       |
| 5   | 24-26       | 27-29       |
| 6   | 30-31       | 32-34       |
| 7   | 35-36       | 37          |
| 8   | 38-40       | 41-43       |
| 9   | 44-46       | 47-49       |
| 10  | 50-52       | 53-55       |
| 11  | 56-58       | 59-61       |
| 12  | 62-64       | 65-67       |
| 13  | 68          | 69-70       |
| 14  | 71-72       | 73-74       |
| 15  | 75-77       | 78          |
| 16  | 79-81       | 82-85       |
| 17  | 86-88       | 89          |
| 18  | 90-92       | 93-94       |
| 19  | 95-97       | 98-101      |
| 20  | 102-103     | 104         |
| 21  | 105         | 106         |
| 22  | 107         | 108-109     |
| 23  | 110-113     | 114-115     |
| 24  | 116-118     | 119:1-32    |
| 25  | 119:33-72   | 119:73-104  |
| 26  | 119:105-144 | 119:145-176 |
| 27  | 120-125     | 126-131     |
| 28  | 132-135     | 136-138     |
| 29  | 139-141     | 142-143     |
| 30  | 144-146     | 147-150     |

Day determined by `day_of_month` (1-30). Day 31 repeats day 30. Both MT and LXX numbering stored in `apps/app/src/assets/psalter/30-day.json`.

**Compline psalms** (weekly rotation, MT numbering):

| Day | Psalm(s) |
|-----|----------|
| Sun, Wed | 4 |
| Mon, Thu | 91 |
| Tue, Fri | 134 |
| Sat | 4 + 134 |

### Marian Antiphon Rotation

| Antiphon | Start | End |
|----------|-------|-----|
| Alma Redemptoris Mater | 1st Sunday of Advent | February 1 |
| Ave Regina Caelorum | February 2 | Wednesday of Holy Week |
| Regina Caeli | Easter Sunday | Saturday after Pentecost |
| Salve Regina | Trinity Sunday | Saturday before 1st Sunday of Advent |

Note: this follows its own traditional date ranges, **not** derived from the liturgical season calculation.

### Current Capabilities

3 hours with dynamic psalter, lectio continua with auto-advance on completion, seasonal hymns, Marian antiphons, reading progress tracking with customizable starting point.

### Future

Little Office of BVM (manifest exists), Holy Week special hours, seasonal hymn selection from liturgical data.

---

## Liturgical Seasons

**Why:** OF and EF calendars diverge significantly — EF has Epiphanytide and Septuagesimatide (neither exists in OF), uses "Time after Pentecost" where OF has "Ordinary Time," and Christmas ends on different dates. A single system supports both via user preference.

### Season Type

```typescript
type LiturgicalSeason =
  | 'advent'           // both
  | 'christmas'        // both (different end dates)
  | 'epiphany'         // EF only
  | 'septuagesima'     // EF only
  | 'lent'             // both
  | 'easter'           // both
  | 'ordinary'         // OF only
  | 'post-pentecost'   // EF only

type LiturgicalCalendarForm = 'of' | 'ef'
```

### OF Season Boundaries

| Season | Start | End |
|--------|-------|-----|
| Advent | 1st Sunday of Advent | Dec 24 |
| Christmas | Dec 25 | Baptism of the Lord (Sunday after Jan 6) |
| Ordinary I | Day after Baptism of the Lord | Day before Ash Wednesday |
| Lent | Ash Wednesday (Easter - 46) | Holy Saturday |
| Easter | Easter Sunday | Pentecost (Easter + 49) |
| Ordinary II | Day after Pentecost | Saturday before 1st Sunday of Advent |

### EF Season Boundaries

| Season | Start | End |
|--------|-------|-----|
| Advent | 1st Sunday of Advent | Dec 24 |
| Christmas | Dec 25 | Jan 13 (Octave of Epiphany) |
| Epiphany | Jan 14 | Saturday before Septuagesima Sunday |
| Septuagesima | Septuagesima Sunday (Easter - 63) | Shrove Tuesday |
| Lent | Ash Wednesday (Easter - 46) | Holy Saturday |
| Easter | Easter Sunday | Saturday after Pentecost (Easter + 55) |
| Post-Pentecost | Trinity Sunday (Easter + 56) | Saturday before 1st Sunday of Advent |

### Liturgical Color Mapping

| Season | Color |
|--------|-------|
| Advent | violet |
| Christmas | white |
| Epiphany | green |
| Septuagesima | violet |
| Lent | violet |
| Easter | white |
| Ordinary | green |
| Post-Pentecost | green |

### Core Architecture

| Module | Path | Purpose |
|--------|------|---------|
| Season calculator | `packages/liturgical/src/season.ts` | `getLiturgicalSeason(date, form?)`, `computeEaster()`, boundary functions |
| Antiphon selector | `packages/liturgical/src/antiphons.ts` | `getMarianAntiphon(date)` — own date logic, not derived from season |
| Calendar data | `packages/liturgical/src/calendar-data.ts` | 347-entry sanctoral cycle (auto-generated from JSONL) |
| Date resolver | `packages/liturgical/src/resolve-date.ts` | Resolves any `LiturgicalDate` to a concrete Date for a year |
| Precedence | `packages/liturgical/src/precedence.ts` | OF/EF rank comparison, Sunday suppression rules |
| Calendar builder | `packages/liturgical/src/calendar-builder.ts` | `buildYearCalendar()` — resolves all entries, applies jurisdiction + precedence |

### Date Resolution Types (Sanctoral Cycle)

1. **Fixed** — month + day (e.g., Dec 25)
2. **Easter-relative** — offset from Easter (e.g., -46 = Ash Wednesday)
3. **Anchor-relative** — relative to liturgical anchor (e.g., Sacred Heart = Friday after 2nd Sunday after Pentecost)
4. **Nth weekday of month** — e.g., last Sunday of October
5. **Relative to fixed** — e.g., Sunday after Jan 6

### Current Capabilities

Full temporal cycle for both forms, 347-entry sanctoral cycle with jurisdiction overrides (Brazil, US), Gaudete/Laetare rose days, seasonal theme auto-switching via Tamagui sub-themes.

### Future

Holy Week / Easter Triduum as distinct sub-periods, seasonal hymn selection from calendar data.

---

## Data Model V2

**Why:** V1 accumulated 7 migrations, 3 generations of reading progress tracking, dual storage (SQLite + AsyncStorage), and a practices table conflating content definitions with user configuration. V2 collapses to 4 SQLite tables (no AsyncStorage), a JSON schedule field replacing frequency, and clean separation: manifests define content, the DB stores only user data.

### Principles

1. **The manifest IS the practice definition.** The DB stores only what the user chose and did.
2. **One persistence layer.** SQLite only.
3. **Schemaless where it matters.** Cursors and schedules store JSON — no migrations for new shapes.
4. **Adding a practice = adding a manifest folder.** No seed edits, no code changes.

### Schema (4 tables + 1 cache)

```sql
-- User's plan-of-life configuration
CREATE TABLE user_practices (
  practice_id  TEXT PRIMARY KEY,
  enabled      INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL,
  tier         TEXT NOT NULL DEFAULT 'essential',
  time_block   TEXT NOT NULL DEFAULT 'flexible',
  schedule     TEXT NOT NULL DEFAULT '{"type":"daily"}',
  variant      TEXT,
  custom_name  TEXT,
  custom_icon  TEXT,
  custom_desc  TEXT
);

-- Event log of what the user did
CREATE TABLE completions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  practice_id  TEXT NOT NULL,
  sub_id       TEXT,        -- 'morning'/'evening'/'compline', 'joyful'/'sorrowful', 'day-3', etc.
  date         TEXT NOT NULL,
  completed_at INTEGER NOT NULL
);

-- Schemaless reading position bookmarks
CREATE TABLE cursors (
  id         TEXT PRIMARY KEY,   -- 'divine-office/ot-readings', 'bible/position', 'program/novena-sacred-heart'
  position   TEXT NOT NULL,      -- JSON: shape defined by consumer
  started_at TEXT NOT NULL
);

-- Key-value store for all user settings
CREATE TABLE preferences (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### Schedule Model

Single JSON field in `user_practices.schedule`. Discriminated union — extensible without migrations.

```typescript
type Schedule = ScheduleRule & {
  seasons?: LiturgicalSeason[]   // gate on liturgical seasons
  notify?: { at: string; days?: number[] }[]
}

type ScheduleRule =
  | { type: 'daily' }
  | { type: 'days-of-week'; days: number[] }
  | { type: 'day-of-month'; days: number[] }
  | { type: 'nth-weekday'; n: number; day: number }
  | { type: 'times-per'; count: number; period: 'week' | 'month' }
  | { type: 'fixed-program'; totalDays: number; startDate: string }
```

| Practice | Schedule Example |
|----------|----------|
| Morning Offering | `{"type":"daily","notify":[{"at":"06:30"}]}` |
| Stations (Lent Fridays) | `{"type":"days-of-week","days":[5],"seasons":["lent"]}` |
| First Friday | `{"type":"nth-weekday","n":1,"day":5}` |
| Rosary 3x/week | `{"type":"times-per","count":3,"period":"week"}` |
| 54-Day Novena | `{"type":"fixed-program","totalDays":54,"startDate":"2026-03-01"}` |

### Evaluation

| Check | Logic |
|-------|-------|
| `isApplicableOn(schedule, date, season)` | Gates on `seasons` first, then: `daily` → true; `days-of-week` → day in set; `nth-weekday` → Nth occurrence of weekday in month; `times-per` → always shows; `fixed-program` → within window |
| `isFaithful(schedule, completionsOnDate, completionsInPeriod)` | Most types: `completionsOnDate > 0`. `times-per`: `completionsInPeriod >= count` |
| Streaks | Respect schedule: non-applicable days don't break streaks. `times-per` measures consecutive periods meeting goal |

### Store Consolidation

V1 had 7 stores. V2 has 2:
- **`preferencesStore`** — all user preferences, hydrated from `preferences` table
- **`navigationStore`** — ephemeral UI state (selectedDate)

Everything else (practices, completions, cursors) queried via TanStack Query from SQLite.

### Current Capabilities

All 6 schedule types, season gating, embedded notifications, schemaless cursors.

### Future

Schedule type `periodic-series` for First Fridays (spec in Programs section).

---

## Programs

**Why:** Catholic devotional life includes time-bounded practices — novenas (9 days), consecrations (33 days), First Fridays (9 consecutive months) — that need day-by-day progression, distinct from repeating practices.

### Core Concept

A **program** is a practice with a finite duration and sequential content. Two types:

| Type | Examples | Characteristics |
|------|----------|----------------|
| **Sequential** | Novenas (9 days), consecrations (33 days), octaves (8 days) | Fixed total days, day-specific content, linear progression |
| **Periodic** | First Fridays (9 months), First Saturdays (5 months) | Fixed total occurrences, calendar-tied, same content each time |

### Content Model

Most programs share the same prayer structure daily with day-specific meditations. This maps to the existing `cycle` mechanism:

```json
{
  "type": "cycle", "data": "novena-days", "as": "template",
  "sections": [
    { "type": "heading", "text": { "en": "{{dayTitle}}" } },
    { "type": "meditation", "text": { "en": "{{meditation}}" } }
  ]
}
```

The `cycle` section uses `indexBy: 'program-day'` to look up the current day's data, then substitutes `{{vars}}` into child sections.

For programs where the structure genuinely differs each day (e.g., 33-day Marian consecration), per-day flow files (`days/day-01.json` ... `day-33.json`) provide a fallback.

### Manifest Extension

```typescript
type ProgramConfig = {
  totalDays: number
  perDayFlows?: string              // path to directory, absent = use cycle template
  progressPolicy: 'continue' | 'wait' | 'restart'
  completionBehavior: 'auto-disable' | 'offer-restart' | 'keep'
}
```

### Progress Policies

| Policy | When day advances | On missed day | Best for |
|--------|-------------------|---------------|----------|
| `continue` | Each calendar day, regardless of completion | Gap in progress | Novenas where user can catch up |
| `wait` | Only on completion of current day | Program pauses | Self-paced programs (33-day consecration) |
| `restart` | Calendar-based (like continue) | Prompts restart from Day 1 | First Fridays, strict novenas |

### Day Tracking

Uses existing `cursors` table:
```
id:       "program/novena-sacred-heart"
position: '{"day": 4, "status": "active"}'
```

Completions logged with `sub_id: "day-3"` for per-day checkmarks on the program detail screen.

### Periodic Series

```typescript
type PeriodicSeriesSchedule = {
  type: 'periodic-series'
  rule: ScheduleRule              // e.g., nth-weekday for First Fridays
  totalOccurrences: number
  startDate: string
}
```

The slot appears only on applicable dates (first Fridays). Missing an occurrence triggers a restart prompt.

### Current Capabilities

Sequential programs with cycle template, program detail screen with day navigation (`/practices/[manifestId]/program`), continue and wait policies.

### Future

Periodic series (First Fridays, First Saturdays) with `periodic-series` schedule type, restart policy with missed-day prompts, more novena content.

---

## Plan of Life

**Why:** The Plan of Life is a traditional Catholic concept — a structured daily schedule of prayer and devotion. The app makes it trackable with a multi-hue fidelity wall that reflects both consistency and depth of practice.

### Practice Tiers

| Tier | Purpose | Wall Color | Examples |
|------|---------|------------|----------|
| **Essential** | Core daily commitments | Green | Morning Offering, Mental Prayer, Rosary, Night Prayer |
| **Ideal** | Recommended devotions | Blue/Teal | Angelus, Spiritual Reading, Confession |
| **Extra** | Additional enrichment | Gold/Amber | Divine Mercy Chaplet, Lectio Divina, Memorare |

### Built-in Practices

#### Essential (enabled by default)
| Practice | Manifest ID | Schedule | Time Block |
|----------|------------|----------|------------|
| Morning Offering | `morning-offering` | Daily | Morning |
| Mental Prayer | `mental-prayer` | Daily | Morning |
| Holy Mass | `mass` | Days-of-week [Sun] | Morning |
| Rosary | `rosary` | Daily | Daytime |
| Examination of Conscience | `examination-of-conscience` | Daily | Evening |
| Night Prayer | `night-prayer` | Daily | Evening |

#### Ideal
| Practice | Manifest ID | Schedule | Time Block | Default |
|----------|------------|----------|------------|---------|
| Angelus | `angelus` | Daily | Daytime | Enabled |
| Preces (Opus Dei) | `preces-opus-dei` | Daily | Morning | Enabled |
| Spiritual Reading | `spiritual-reading` | Daily | Flexible | Enabled |
| Confession | `confession` | Times-per 1x/month | Flexible | Disabled |
| Visit to Blessed Sacrament | `visit-blessed-sacrament` | Daily | Flexible | Disabled |

#### Extra (disabled by default)
| Practice | Manifest ID | Schedule | Time Block |
|----------|------------|----------|------------|
| Divine Mercy Chaplet | `divine-mercy` | Daily | Daytime |
| Stations of the Cross | `stations-cross` | Days-of-week [Fri] | Flexible |
| Lectio Divina | `lectio-divina` | Daily | Flexible |
| Guardian Angel Prayer | `guardian-angel` | Daily | Morning |
| Memorare | `memorare` | Daily | Flexible |
| Three O'Clock Prayer | `three-oclock-prayer` | Daily @ 15:00 | Daytime |
| Divine Office | `divine-office` | Daily | Morning/Evening |
| Little Office of the BVM | `little-office-bvm` | Daily | Flexible |

### Time Blocks

| Block | Time Range | Display Logic |
|-------|-----------|---------------|
| Morning | 5:00-11:59 | Expanded when current or incomplete |
| Daytime | 12:00-16:59 | Expanded when current or incomplete |
| Evening | 17:00-4:59 | Expanded when current or incomplete |
| Flexible | Any time | Always expanded unless all done |

Time block is a *display grouping* concern, not a scheduling concern.

### Multi-Hue Fidelity Wall

| Value | Color Family | Meaning |
|-------|-------------|---------|
| 0 | Warm gray | Nothing done |
| 1-2 | Gold/Amber | Only extra practices done |
| 3-4 | Blue/Teal | Ideal practices done, essentials incomplete |
| 5-6 | Green | All essentials done |
| 7 | Burgundy/Deep Rose | ALL applicable practices done — full fidelity |

Individual practice detail uses a simple binary green wall (done/not done).

### Current Capabilities

19 built-in + custom practices, schedule-aware streaks, tier-based wall coloring, time block display, expo-notifications with schedule-aware reminders.

### Future

Practice recommendations by vocation/state of life, guided onboarding for beginners, spiritual progress insights and milestones.

---

## Other Features

**Bible Reader** — Two-drawer navigation (books left, chapters right). Bundled Douay-Rheims is the only public-domain English Catholic Bible (73 books). Online translations via Bolls.life API cached in SQLite. Future: bookmarks, highlights, search, sharing, study Bible features. See `apps/app/src/features/bible/`.

**Catechism Reader** — Three-panel sliding drawer adapted for the CCC's 5-level hierarchy (~368 segments, ~2,865 paragraphs). Segment is the natural reading unit (median 5 paragraphs). Future: cross-references, search. See `apps/app/src/features/catechism/`.

**Mass (Ordo Missae)** — Static ordinary prayers with OF/EF toggle, bilingual Latin/English. EF proper slots now filled with daily-changing texts (Introit, Collect, Epistle, Gradual/Tract, Gospel, Offertory, Secret, Preface, Communion, Postcommunion) parsed from Divinum Officium in Latin, English, and Portuguese. OF proper slots remain placeholders — readings via Evangelizo are planned; collects/antiphons blocked by ICEL copyright (see `content-sources.md`). Three view modes per form: **Full** (complete ordo), **Propers** (all variable parts only), **Readings** (scripture portions only) — switchable via segmented control inside the pray screen. Sub-flows use the `group` field on `FlowEntry` to associate with their parent flow. See `packages/mass-propers/` for the resolution module and `apps/app/scripts/parse-do-propers.ts` for the parser.

**Reading Config** — Shared reading styles across all reading surfaces. 7 curated serif fonts, 5-step sizing scales, margins, alignment. See `apps/app/src/features/reading-config/`.

**i18n** — react-i18next with English + Brazilian Portuguese, ~150 keys, synchronous init. See `apps/app/src/lib/i18n/`.
