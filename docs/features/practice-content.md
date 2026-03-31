# Practice Content Architecture

A unified content system for piety practices — from a simple Morning Offering to the full Divine Office. Adding a new practice means writing content files, not code.

---

## Core Concept

Every practice has two layers:

1. **Manifest** — metadata and teaching content (what the practice is, its history, how to pray it)
2. **Flow** — the prayer itself as a sequence of sections (renderable by the existing `SectionBlock` dispatcher)

A resolution engine transforms the declarative flow definition + runtime context (date, variant, reading progress) into a flat array of renderable sections.

### Content vs. Personalization

The manifest defines **what the practice IS** — its name, description, teaching content, and prayer structure. This is static content.

The database stores **the user's relationship** with the practice — their chosen icon, tier, time block, schedule, variant preference, and notification settings. All of these are user personalization.

---

## File Structure

```
src/content/practices/
  morning-offering/
    manifest.json         # metadata + teaching content
    flow.json             # single prayer text
  angelus/
    manifest.json
    flow.json             # versicle/response + 3 Hail Marys
  rosary/
    manifest.json
    flow.json             # prayer skeleton with repeat/variable slots
    variants/
      traditional.json    # traditional mystery meditations
      scriptural.json     # scripture-based meditations
      montfort.json       # St. Louis de Montfort's meditations
  stations-of-the-cross/
    manifest.json
    flow.json
    variants/
      traditional.json
      scriptural.json
      jpii.json           # John Paul II's Way of the Cross
  divine-mercy-chaplet/
    manifest.json
    flow.json
  divine-office/
    manifest.json
    flows/
      lauds.json
      vespers.json
      compline.json
  little-office-bvm/
    manifest.json
    flows/
      lauds.json
      vespers.json
      compline.json
```

Shared prayer texts remain in `src/assets/prayers/` (Our Father, Hail Mary, Glory Be, etc.) — referenced by ID from flows.

---

## Manifest Schema

```typescript
type LocalizedText = { en: string; 'pt-BR'?: string }

type PracticeManifest = {
  id: string
  name: LocalizedText
  categories: string[]           // multiple: ["marian", "meditation"]
  estimatedMinutes: number

  // Images
  image?: string                 // header/catalog image path
  thumbnail?: string             // smaller catalog thumbnail

  // Teaching content
  description: LocalizedText     // what is this practice
  history: LocalizedText         // where it comes from
  howToPray: LocalizedText       // step-by-step guide for beginners

  // Flow configuration
  flowMode: 'scroll' | 'step'   // preferred rendering UX
  completion: 'flow-end' | 'manual'

  // Completion side-effects
  completionEffects?: {
    advanceReadings?: boolean    // auto-advance reading tracks for any lectio sections in the flow
  }

  // Rendering theme
  theme?: 'office'               // ornamental office-style (HeaderFlourish, OrnamentalRule, illuminated drop caps)

  // Single flow (most practices)
  flow?: string                  // relative path to flow file

  // Multi-hour (Little Office, Divine Office)
  hours?: {
    id: string                   // "lauds" | "vespers" | "compline" | custom
    name: LocalizedText
    flow: string                 // relative path to flow file
    timeBlock: TimeBlock
  }[]

  // Variants (different meditation sets for the same prayer structure)
  variants?: {
    id: string
    name: LocalizedText
    description: LocalizedText
    file: string                 // relative path to variant data file
  }[]

  // Catalog metadata
  pack?: string                  // undefined = base catalog, "lent-2026" = seasonal pack
  tags: string[]                 // for search/filtering
}
```

**Not in the manifest** (user personalization, stored in DB):
- `custom_icon` — user chooses emoji
- `tier` — user assigns essential/ideal/extra
- `time_block` — user assigns morning/daytime/evening/flexible
- `schedule` — JSON blob: daily, days-of-week, day-of-month, etc. (with optional notify array)
- `sort_order` — user reorders
- `variant` — user selects variant (e.g. prayer form)

---

## Flow Schema

A flow is a JSON file containing a `sections` array. Each section is one of the types below.

### Leaf Sections

```typescript
// Instructional label (red rubric text)
type RubricSection = { type: 'rubric'; text: LocalizedText }

// Ornamental divider
type DividerSection = { type: 'divider' }

// Section heading
type HeadingSection = { type: 'heading'; text: LocalizedText }

// Image with optional caption
type ImageSection = { type: 'image'; src: string; caption?: LocalizedText }
```

### Text Content Sections

```typescript
// Prayer text — reference a shared prayer asset or define inline
type PrayerSection =
  | { type: 'prayer'; ref: string }                      // e.g., "our-father"
  | { type: 'prayer'; inline: LocalizedBilingualText }   // { en, latin?, 'pt-BR'? }

// Hymn — bilingual (Latin + vernacular)
type HymnSection =
  | { type: 'hymn'; ref: string }
  | { type: 'hymn'; inline: LocalizedBilingualText }

// Canticle
type CanticleSection =
  | { type: 'canticle'; ref: string }                    // e.g., "benedictus"
  | { type: 'canticle'; inline: { title: LocalizedText; subtitle?: LocalizedText; text: LocalizedBilingualText } }

// Reflective/meditation text (e.g., Rosary mystery meditation, Stations reflection)
type MeditationSection = { type: 'meditation'; text: LocalizedText }

// Versicle/Response — very common pattern in Catholic prayer
// V. The angel of the Lord declared unto Mary.
// R. And she conceived of the Holy Spirit.
type ResponseSection = {
  type: 'response'
  verses: { v: LocalizedText; r: LocalizedText }[]
}
```

### Structural Sections

```typescript
// Repeat a template N times, optionally with variable data per iteration
type RepeatSection = {
  type: 'repeat'
  count: number
  variable?: {
    source: 'variant'              // data comes from the active variant file
    key: string                    // which data key in the variant (e.g., "mysteries")
  }
  sections: Section[]              // template sections, repeated `count` times
  // Templates can use {{index}} (0-based), {{ordinal}} ("First", "Second"...),
  // and any field from the variable data ({{name}}, {{meditation}}, {{image}})
}
```

### Dynamic Source Sections (Office-level)

These resolve at runtime using existing engine logic:

```typescript
// Psalms from a cycle (e.g., 30-day DWDO psalter)
type PsalterSection = { type: 'psalter'; hour: string; cycle: string }

// Lectio continua reading from current progress
// The `testament` field is carried through to the rendered `reading` section
// so the completion handler knows which reading track to advance
type LectioSection = { type: 'lectio'; testament: 'ot' | 'nt' | 'catechism' }

// Content that varies by liturgical season (hymns, Marian antiphons)
type SeasonalSection = { type: 'seasonal'; set: string; hour: string }
```

### Union Type

```typescript
type Section =
  | RubricSection | DividerSection | HeadingSection | ImageSection
  | PrayerSection | HymnSection | CanticleSection | MeditationSection | ResponseSection
  | RepeatSection
  | PsalterSection | LectioSection | SeasonalSection
```

---

## Variant Schema

Variants provide interchangeable content for the same prayer structure. The user selects their preferred variant; the engine injects the matching data into repeat sections.

```typescript
type Variant = {
  id: string
  name: LocalizedText
  selector: 'day-of-week' | 'liturgical-season' | 'manual'  // how to pick the active set
  schedule?: Record<string, string>  // maps selector value → set key (day-of-week only)
  data: Record<string, VariantEntry[]>  // set key → array of entries (one per repeat iteration)
}

// Each entry provides fields that match the {{placeholders}} in the flow template
type VariantEntry = {
  name?: string
  meditation?: string
  image?: string
  [key: string]: string | undefined  // extensible for future fields
}
```

**Example: Rosary traditional variant**
```json
{
  "id": "traditional",
  "name": { "en": "Traditional Meditations" },
  "selector": "day-of-week",
  "schedule": {
    "sunday": "glorious",
    "monday": "joyful",
    "tuesday": "sorrowful",
    "wednesday": "glorious",
    "thursday": "luminous",
    "friday": "sorrowful",
    "saturday": "joyful"
  },
  "data": {
    "joyful": [
      { "name": "The Annunciation", "meditation": "The angel Gabriel was sent to Mary..." },
      { "name": "The Visitation", "meditation": "Mary set out in haste to visit Elizabeth..." },
      { "name": "The Nativity", "meditation": "And she brought forth her firstborn son..." },
      { "name": "The Presentation", "meditation": "They brought him up to Jerusalem..." },
      { "name": "Finding in the Temple", "meditation": "After three days they found him..." }
    ],
    "sorrowful": [],
    "glorious": [],
    "luminous": []
  }
}
```

**How it works at runtime:**
1. User has `selected_variant: "traditional"` in their DB record
2. Engine loads `variants/traditional.json`
3. Selector is `day-of-week` → today is Monday → `schedule.monday` = `"joyful"`
4. Engine gets `data.joyful` → array of 5 entries
5. The repeat section with `variable.key: "mysteries"` iterates 5 times
6. Each iteration, `{{name}}` and `{{meditation}}` resolve to the entry's fields

**`liturgical-season` selector:** The engine calls `getLiturgicalSeason(date, form)` using the user's liturgical calendar preference (OF or EF) and uses the returned season string (e.g. `"lent"`, `"easter"`) as the data key. If the season key doesn't exist in `data`, falls back to the first available key. No `schedule` field needed — the season is computed from the date. Data keys should use the `LiturgicalSeason` values: `advent`, `christmas`, `epiphany`, `septuagesima`, `lent`, `easter`, `ordinary`, `post-pentecost`.

---

## Resolution Engine

A pure function that transforms a flow definition into renderable sections:

```typescript
function resolveFlow(flow: Flow, context: FlowContext): RenderedSection[]

type FlowContext = {
  date: Date
  variant?: string                    // user's selected variant ID
  variantData?: Variant               // loaded variant file
  liturgicalCalendar?: 'of' | 'ef'   // for liturgical-season selector
  readingProgress?: ReadingProgress   // for lectio sections
  psalterNumbering?: 'mt' | 'lxx'    // for psalter sections
}
```

**Resolution steps:**
1. Walk the sections array
2. For each section:
   - `prayer.ref` → load shared prayer JSON from `src/assets/prayers/{ref}.json`, return inline text
   - `hymn.ref` / `canticle.ref` → same, from respective asset dirs
   - `repeat` → expand template `count` times; if `variable`, inject data from active variant
   - `psalter` → call existing `getPsalmsForDay()` from `src/features/divine-office/psalter.ts`
   - `lectio` → use reading progress to determine current book/chapter/paragraph
   - `seasonal` → call existing `getLiturgicalSeason()` + `getHymnForHour()`
   - All others → pass through as-is
3. Flatten nested results into a single `RenderedSection[]` array
4. The output type matches what `SectionBlock` already renders

**Existing functions to extract/reuse from Divine Office:**
- `getPsalmsForDay(date, numbering)` — `src/features/divine-office/psalter.ts`
- `getComplinePsalms(date, numbering)` — same file
- `getLiturgicalSeason(date)` — `src/features/divine-office/engine.ts`
- `getHymnForHour(hour)` — same file
- `getMarianAntiphon(date)` — same file

---

## Database Integration

The practices table gains two fields:

```sql
ALTER TABLE practices ADD COLUMN manifest_id TEXT;          -- links to content manifest ID
ALTER TABLE practices ADD COLUMN selected_variant TEXT;     -- user's preferred variant
```

- `manifest_id` is null for custom user practices (no content manifest)
- `manifest_id` points to a manifest ID for content-backed practices
- `selected_variant` is the variant ID the user prefers (null = default/first)

**Seed logic changes:** Instead of hardcoded practice objects in `seed.ts`, read manifests from `src/content/practices/*/manifest.json` and create DB records with sensible default tier/timeBlock/schedule from manifest `defaults` section.

---

## UX Entry Points

### From the checklist (daily prayer)
- Tap practice → opens prayer flow (uses manifest's `flowMode`)
- Complete flow → auto-marks practice done for today
- Checkbox or long-press → manual complete without opening flow

### From the catalog (discovering practices)
- Browse by category, filter by tags
- Tap → learn screen showing description, history, how-to-pray, images, estimated time
- "Add to my Plan" → user picks tier, time block, schedule → creates DB record
- Preview flow available before adding

### From plan overview (stats)
- Tap practice → fidelity wall, streaks, completion stats
- Link to prayer flow from stats screen

---

## Examples

### Morning Offering (simplest)

**manifest.json:**
```json
{
  "id": "morning-offering",
  "name": { "en": "Morning Offering", "pt-BR": "Oferecimento do Dia" },
  "categories": ["daily"],
  "estimatedMinutes": 1,
  "flowMode": "scroll",
  "completion": "flow-end",
  "flow": "flow.json",
  "description": { "en": "A prayer offering the day's activities to God through the Immaculate Heart of Mary." },
  "history": { "en": "The Morning Offering tradition grew from the Apostleship of Prayer, founded in 1844..." },
  "howToPray": { "en": "Upon waking, make the Sign of the Cross and slowly pray the offering, consciously dedicating your day." },
  "tags": ["morning", "offering", "daily"]
}
```

**flow.json:**
```json
{
  "sections": [
    { "type": "prayer", "ref": "sign-of-cross" },
    { "type": "divider" },
    { "type": "prayer", "inline": {
      "en": "O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day, for all the intentions of Your Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, for the salvation of souls, the reparation of sins, the reunion of all Christians, and in particular for the intentions of the Holy Father this month. Amen.",
      "pt-BR": "Ó Jesus, pelo Coração Imaculado de Maria, eu Vos ofereço as orações, obras, alegrias e sofrimentos deste dia, por todas as intenções do Vosso Sagrado Coração, em união com o Santo Sacrifício da Missa em todo o mundo, pela salvação das almas, pela reparação dos pecados, pela reunião de todos os cristãos e em particular pelas intenções do Santo Padre neste mês. Amém."
    }}
  ]
}
```

### Angelus (response pattern)

**flow.json:**
```json
{
  "sections": [
    { "type": "response", "verses": [
      {
        "v": { "en": "The Angel of the Lord declared unto Mary," },
        "r": { "en": "And she conceived of the Holy Spirit." }
      }
    ]},
    { "type": "prayer", "ref": "hail-mary" },
    { "type": "response", "verses": [
      {
        "v": { "en": "Behold the handmaid of the Lord," },
        "r": { "en": "Be it done unto me according to Thy word." }
      }
    ]},
    { "type": "prayer", "ref": "hail-mary" },
    { "type": "response", "verses": [
      {
        "v": { "en": "And the Word was made flesh," },
        "r": { "en": "And dwelt among us." }
      }
    ]},
    { "type": "prayer", "ref": "hail-mary" },
    { "type": "divider" },
    { "type": "prayer", "inline": {
      "en": "Pour forth, we beseech Thee, O Lord, Thy grace into our hearts, that we, to whom the Incarnation of Christ Thy Son was made known by the message of an angel, may by His Passion and Cross be brought to the glory of His Resurrection. Through the same Christ our Lord. Amen."
    }}
  ]
}
```

### Rosary (structured with variants)

See the Variant Schema section above for the full example. Key points:
- `flow.json` defines the prayer skeleton (fixed structure)
- `variants/*.json` files provide interchangeable meditation content
- The engine merges structure + variant data at runtime based on day of week + user's variant preference

### Divine Office Morning Prayer (real practice at `src/content/practices/divine-office/`)

**flows/morning.json:**
```json
{
  "sections": [
    { "type": "rubric", "text": { "en": "Opening Verse" } },
    { "type": "prayer", "ref": "opening-verse" },
    { "type": "divider" },
    { "type": "rubric", "text": { "en": "Hymn" } },
    { "type": "seasonal", "set": "hymns", "hour": "morning" },
    { "type": "divider" },
    { "type": "rubric", "text": { "en": "Psalmody" } },
    { "type": "psalter", "hour": "morning", "cycle": "30-day" },
    { "type": "divider" },
    { "type": "rubric", "text": { "en": "Scripture Reading" } },
    { "type": "lectio", "testament": "ot" },
    { "type": "divider" },
    { "type": "rubric", "text": { "en": "Canticle" } },
    { "type": "canticle", "ref": "benedictus" },
    { "type": "divider" },
    { "type": "rubric", "text": { "en": "Our Father" } },
    { "type": "prayer", "ref": "our-father" }
  ]
}
```

---

## Implementation Phases

### Phase 1: Format + simple practices
- Create manifests + flows for all existing built-in practices
- Build the resolution engine for static content (ref resolution, inline text, response sections)
- Generalize the existing `PrayerFlow` renderer to accept resolved sections from any source
- Wire up practice → flow navigation from the checklist
- Add `manifest_id` and `selected_variant` columns to practices table

### Phase 2: Structured prayers with repeats + variants
- Implement repeat section expansion in the engine
- Implement variant loading and template variable injection
- Create Rosary content (flow + traditional/scriptural/montfort variants)
- Create Stations of the Cross (flow + multiple meditation variants)
- Create other chaplets (Divine Mercy, etc.)
- Build variant selection UI in practice settings

### Phase 3: Catalog + teaching UX
- Build practice catalog browsing screen (by category, with search)
- Implement learn/teaching view (description, history, how-to-pray, images)
- Add-to-plan flow with personalization (tier, time block, schedule)
- Seasonal/thematic pack system

### Phase 4: Multi-hour + dynamic sources ✅
- Implement multi-hour practice support (Little Office of BVM)
- Implement dynamic section types (psalter, lectio, seasonal)
- Extract reusable liturgical library from Divine Office engine to `src/lib/liturgical/`
- Migrate Divine Office to the content format with `completionEffects` and `theme` support
