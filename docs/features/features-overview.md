# Features Overview

Domain knowledge, design rationale, and capability reference for Ember's features. For code style see `CONVENTIONS.md`, for architecture see `ARCHITECTURE.md`.

---

## Practice Content Architecture

**Why:** Adding a practice should mean writing content files, not code. Content (manifest) is strictly separated from user data (DB). The flow DSL is practice-agnostic — the same primitives describe a simple Guardian Angel prayer, a 9-day novena, the Rosary with day-of-week mystery selection, or the complete Mass with OF/EF propers.

### Core Concept

Every practice has two layers:
1. **Manifest** — metadata and teaching content (what the practice is, its history, how to pray it)
2. **Flow** — the prayer itself as a sequence of sections (rendered by `SectionBlock`)

Practices live inside **libraries** — self-contained `.pray` packages. See `ARCHITECTURE.md` for the library system.

A resolution engine transforms the declarative flow + runtime context (date, reading progress, user overrides) into a flat array of renderable sections.

### File Structure

All practice content lives in `content/libraries/`:

```
content/libraries/
  ember-default/
    library.json
    prayers/                    # Reusable prayer assets (Our Father, Hail Mary, etc.)
      our-father.json
      hail-mary.json
    practices/
      morning-offering/
        manifest.json
        flow.json
      rosary/
        manifest.json
        flow.json               # Single flow with select for mysteries
  ember-novenas/
    library.json
    practices/
      rosary-54-day-novena/
        manifest.json
        flow.json
        data/days.json          # Day-indexed cycle data
  montfort-spirituality/
    library.json
    books/                      # Long-form prose (WebView + CSS columns)
    chapters/                   # Native in-app chapters
    practices/
      total-consecration/
    prayers/
```

### Manifest Schema

Each practice has a `PracticeManifest` with metadata (name, description, history, how to pray), display config (flowMode, completion, theme), scheduling defaults (tier, time block, schedule), and a list of flows. Content fields come from the manifest at runtime — the DB stores only user personalization.

See `apps/app/src/content/manifest-types.ts` for the full type definitions (`PracticeManifest`, `FlowEntry`, `SlotDefault`).

### Flow Section Types

A flow is a JSON `{ sections: Section[] }`. The DSL is designed to be expressive enough that no practice requires custom app code. Section types:

**Leaf:** `rubric` (red instructional text), `divider`, `heading`, `subheading`, `image`

**Text content:**
- `prayer` — `{ ref: "our-father" }` or `{ inline: LocalizedContent }`
- `hymn`, `canticle` — same ref/inline pattern
- `meditation` — reflective text
- `response` — versicle/response pairs: `{ verses: [{ v, r }] }`
- `prose` — external markdown file reference, resolved per-language at runtime

**Structural:**
- `repeat` — expand template N times, optionally iterating over flow-local data with `{{placeholder}}` substitution
- `select` — conditional branching based on context (day of week, time of day, liturgical season, user preference, or manual choice). See `docs/features/unified-flow-system.md` for the full spec.
- `options` — shows ALL alternatives simultaneously (distinct from `select` which picks ONE)
- `fragment` — `{ ref: "name" }` expands a reusable section block defined in the flow's `fragments` map. Fragments can reference other fragments for composition.

**Dynamic sources (resolved at runtime):**
- `cycle` — indexed data lookup by `day-of-month`, `day-of-week`, `fixed`, or `program-day`. Output modes: named type (`psalmody`, `hymn`) or `template` (substitutes `{{vars}}` into child sections)
- `psalter` — psalms from a cycle (e.g., 30-day DWDO)
- `lectio` — reading from current progress (testament: `ot` | `nt` | `catechism`)
- `seasonal` — content varying by liturgical season (hymns, Marian antiphons)
- `proper` — Mass proper slot filled from propers data source (EF bundled, OF via API)

### Unified Flow System

> Full spec: `docs/features/unified-flow-system.md`

Each practice has **one flow** — a self-contained JSON document with all conditional logic expressed via the `select` section type. The flow describes the complete prayer, including branches for different contexts (day of week, time of day, liturgical form, manual choice).

**Key primitives:**
- `select` — picks one option from a list, based on context or manual choice. Three modes: silent conditional (no UI), default+override (auto-picks but shows picker), manual (user must choose).
- `repeat` with `data` — iterates over flow-local data arrays with template substitution.
- `options` — shows ALL alternatives simultaneously (distinct from `select` which picks ONE).
- `alternativeTo` on manifests — groups practices across libraries as content alternatives (e.g., Traditional vs Montfort Rosary meditations are separate practices).

**Replaces:** the earlier variants, forms, multiple flows, and `setKeyOverride` mechanisms.

### Resolution Engine

```typescript
function resolveFlow(flow: FlowDefinition, context: FlowContext, ec: EngineContext): RenderedSection[]
```

Steps: walk sections → resolve refs from prayer assets → evaluate `select` branches → expand `repeat` with flow-local data → resolve dynamic sources (cycle, lectio, psalmody, proper) → flatten to `RenderedSection[]`.

The engine is in `packages/content-engine/`. The app wires dependencies via `EngineContext` (`apps/app/src/content/engineContext.ts`).

### Example: Rosary Flow

```json
{
  "data": {
    "joyful": [{ "name": "The Annunciation", "meditation": "..." }, "..."],
    "sorrowful": ["..."], "glorious": ["..."], "luminous": ["..."]
  },
  "sections": [
    { "type": "prayer", "ref": "sign-of-cross" },
    "... opening prayers ...",
    {
      "type": "select",
      "on": "dayOfWeek",
      "as": "mysteries",
      "label": { "en-US": "Mysteries" },
      "map": { "0": "glorious", "1": "joyful", "2": "sorrowful", "3": "glorious", "4": "luminous", "5": "sorrowful", "6": "joyful" },
      "options": [
        { "id": "joyful", "label": { "en-US": "Joyful Mysteries" } },
        { "id": "sorrowful", "label": { "en-US": "Sorrowful Mysteries" } },
        { "id": "glorious", "label": { "en-US": "Glorious Mysteries" } },
        { "id": "luminous", "label": { "en-US": "Luminous Mysteries" } }
      ]
    },
    { "type": "repeat", "count": 5, "data": "{{mysteries}}", "sections": [
      { "type": "heading", "text": "{{ordinal}} Mystery: {{name}}" },
      { "type": "meditation", "text": "{{meditation}}" },
      "... decade prayers ..."
    ]},
    "... closing prayers ..."
  ]
}
```

This single flow handles all four mystery sets via `select` + `repeat` — no variants, no multiple flows.

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

---

## Schedule Model

Single JSON field on `user_practice_slots.schedule`. Discriminated union — extensible without migrations. Six schedule types: `daily`, `days-of-week`, `day-of-month`, `nth-weekday`, `times-per`, `fixed-program`. Any schedule can be season-gated (e.g., Stations of the Cross only in Lent). Streaks respect schedule: non-applicable days don't break streaks.

See `packages/content-engine/src/types.ts` for the `Schedule` and `ScheduleRule` types, and `packages/content-engine/src/engine.ts` for evaluation logic (`isApplicableOn`, `isFaithful`).

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

Most programs share the same prayer structure daily with day-specific meditations. This maps to the `cycle` section type:

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

Day tracking uses the `cursors` table with `sub_id: "day-N"` completions for per-day checkmarks.

---

## Plan of Life

**Why:** The Plan of Life is a traditional Catholic concept — a structured daily schedule of prayer and devotion. The app makes it trackable with a multi-hue fidelity wall that reflects both consistency and depth of practice.

### Practice Tiers

| Tier | Purpose | Wall Color | Examples |
|------|---------|------------|----------|
| **Essential** | Core daily commitments | Green | Morning Offering, Mental Prayer, Rosary, Night Prayer |
| **Ideal** | Recommended devotions | Blue/Teal | Angelus, Spiritual Reading, Confession |
| **Extra** | Additional enrichment | Gold/Amber | Divine Mercy Chaplet, Lectio Divina, Memorare |

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

### Data Model Principles

1. **The manifest IS the practice definition.** The DB stores only what the user chose and did.
2. **One persistence layer.** SQLite only. See `apps/app/src/db/migrations/0001_initial.sql`.
3. **Schemaless where it matters.** Cursors and schedules store JSON — no migrations for new shapes.
4. **Adding a practice = adding content files.** No seed edits, no code changes.

Stores: `preferencesStore` (all user preferences) and `navigationStore` (ephemeral UI state). Everything else queried via TanStack Query from SQLite.

---

## Other Features

**Bible Reader** — Two-drawer navigation (books left, chapters right). Bundled Douay-Rheims (73 books, only public-domain English Catholic Bible). Online translations via Bolls.life API cached in SQLite. See `apps/app/src/features/bible/`.

**Catechism Reader** — Three-panel sliding drawer for the CCC's 5-level hierarchy (~2,865 paragraphs). See `apps/app/src/features/catechism/`.

**Mass (Ordo Missae)** — Complete ordinary with OF/EF toggle. EF propers filled daily from bundled Divinum Officium data (Latin, English, Portuguese). OF propers: PT-BR complete via Liturgia Diária API, English readings via Evangelizo, English collects/antiphons blocked by ICEL copyright. Three view modes: Full, Propers, Readings. See `packages/mass-propers/`.

**Reading Config** — Shared reading styles across all reading surfaces. 7 curated serif fonts, 5-step sizing scales, margins, alignment. See `apps/app/src/features/reading-config/`.

**i18n** — react-i18next with English + Brazilian Portuguese, ~150 keys, synchronous init. See `apps/app/src/lib/i18n/`.

**Book Reader** — WebView with CSS column pagination for long-form prose from `.pray` libraries. Markdown converted at runtime via `marked`. See `apps/app/src/features/books/`.
