# Unified Flow System

## TLDR

| Concept | Before | After |
|---------|--------|-------|
| **Multiple flows** (Rosary mysteries, Office hours, Confession modes) | `flows: FlowEntry[]` in manifest; app selects which flow to render | One flow per practice; `select` section branches conditionally inside the flow |
| **Variants** (Traditional vs Montfort Rosary, etc.) | `variants[]` in manifest + variant JSON files; engine injects data | Separate practices per tradition, grouped by `alternativeTo`; repeat data lives in the flow |
| **Forms** (Mass OF/EF) | `forms` config filters flows by global preference | `select on: "liturgicalCalendar"` inside the flow — same UX, no special mechanism |
| **Scheduling** | Each slot binds to a flow ID (`slot_id`) | Slots bind to the practice; `select` auto-picks content based on context |
| **Repeat data** (mystery names, station meditations) | Loaded from variant files, keyed by flow ID via `setKeyOverride` | `data` field on `FlowDefinition`; `repeat data: "{{var}}"` reads from it |
| **Practice builder** | N/A | Flow JSON is the universal content language — the builder writes it, the app reads it |
| **Liturgical content** (meditacoes-ligorio, future hagiographic practices) | Custom React hooks per practice; app-layer code resolves calendar → content | `resolve` field on flow + dynamic `prose` — fully declarative, no practice-specific code |

**Removed:** `Variant` type + files, `variants[]`, `forms` config, `FlowEntry` type, `flows[]` array, `variant` DB column, `setKeyOverride`, `group` on FlowEntry, `VariantSelector`, `loadFlowForSlot`, form-filtering logic, `useLiturgicalMeditation` hook.

**Added:** `select` section type, `data` on `FlowDefinition`, `alternativeTo` on manifest, `resolve` on `FlowDefinition`, dynamic `prose` with `book` + `chapter`.

**Kept as-is:** `cycle`, `lectio`, `psalmody`, `options`, `prose` (static form), `templateVars`, `program`.

---

## Motivation

The current system has four content-selection mechanisms, each built for specific practices:

| Mechanism | Built for | What it does |
|-----------|-----------|-------------|
| Multiple flows | Rosary, Office, Confession | App-level selection of which prayer sequence to render |
| Variants | Rosary, Stations, Examination | Swaps data injected into a shared flow template |
| Forms | Mass | Filters flows by a global user preference |
| `setKeyOverride` | Rosary + Office | Maps the active flow ID to a data key in variant/cycle data |

Each adds types, loading logic, DB fields, engine code, and UI components. Together they create a system where adding a new practice often means understanding which combination of mechanisms it needs — and sometimes bending one mechanism to fit (e.g., `repeat count=1` with a variant just to swap prayer text).

**The insight:** all four mechanisms are conditional content selection. Given some context (day of week, time of day, user preference, manual choice), pick the right content. One primitive — `select` — can express all of them.

**The vision:** a single flow format expressive enough that:
1. Any Catholic prayer practice can be described in static JSON
2. A **practice builder** can author practices by composing sections + conditionals + data
3. The app is a pure **practice reader** — it renders whatever the flow describes
4. Libraries can contribute alternative content as separate practices, grouped by `alternativeTo`

---

## Design Principle: No Practice-Specific Code

The flow JSON is the **complete description** of a prayer practice. The app is a reader — it renders whatever the flow describes. No practice should require custom hooks, components, or app-layer logic.

If a practice needs code that no other practice uses, that's a signal the DSL is missing a primitive. The correct response is to add a **general primitive** to the engine, then express the practice declaratively.

**Test:** can a future practice builder author this practice by composing existing primitives? If not, the DSL is incomplete.

**Current violation:** `useLiturgicalMeditation` — a 118-line React hook that exists solely for meditacoes-ligorio. It resolves liturgical dates to chapter IDs, loads book chapter texts, and builds template variables. All of this should be expressible in the flow JSON. The primitives needed to eliminate it are `resolve` and dynamic `prose` (see below).

---

## The `select` Primitive

### Type Definition

```typescript
type SelectSection = {
  type: 'select'
  on?: string                    // context key to auto-select from
  as?: string                    // set a context variable to the selected option ID
  label?: LocalizedText          // if present: show UI picker for override
  map?: Record<string, string>   // map raw context values → option IDs
  default?: string               // fallback option ID
  options: {
    id: string
    label: LocalizedText
    sections: FlowSection[]
  }[]
}
```

### Three Modes

| Mode | `on` | `label` | Behavior |
|------|------|---------|----------|
| **Silent conditional** | present | absent | Auto-picks from context, renders selected option's sections, no UI |
| **Default + override** | present | present | Auto-picks from context, shows picker, user can override |
| **Manual** | absent | present | No auto-pick — user must choose (shows `default` initially) |

### Resolution Algorithm

```
1. If `on` is present:
   a. Read context[on] (e.g., dayOfWeek = 1)
   b. If `map` exists, map the value: map["1"] → "joyful"
   c. Find matching option by ID
   d. If no match, use `default` option, then fall back to first option

2. If `on` is absent:
   a. Use `default` option, or first option

3. If `as` is present:
   a. Set context[as] = selected option ID (for downstream sections)

4. If `label` is present:
   a. Emit a rendered `select` section (UI picker + all options' rendered sections)
   b. The renderer shows the picker, auto-selected to the resolved option

5. If `label` is absent:
   a. Emit only the selected option's rendered sections (no UI wrapper)
```

### Rendered Output

```typescript
// When label is present (UI picker)
type RenderedSelect = {
  type: 'select'
  label: BilingualText
  selectedId: string
  options: { id: string; label: BilingualText; sections: RenderedSection[] }[]
}

// When label is absent: the selected option's sections are emitted directly
// (no wrapper — invisible to the renderer)
```

### Context Values

| Key | Type | Source | Values |
|-----|------|--------|--------|
| `dayOfWeek` | string | `Date` | `"0"` (Sun) - `"6"` (Sat) |
| `dayOfMonth` | string | `Date` | `"1"` - `"31"` |
| `timeOfDay` | string | current time | `"morning"` / `"afternoon"` / `"evening"` / `"night"` |
| `liturgicalCalendar` | string | user preference | `"of"` / `"ef"` |
| `liturgicalSeason` | string | computed from date | `"advent"` / `"christmas"` / `"lent"` / `"easter"` / `"ordinary"` |
| `programDay` | string | program state | `"0"` - `"N"` |
| `numbering` | string | user preference | `"mt"` / `"lxx"` |
| `hour` | string | current time | `"0"` - `"23"` |
| `liturgicalDay` | string | computed from date (EF calendar) | `"advent/1/0"`, `"lent/3/5"`, `"post-pentecost/12/0"` |
| `dateKey` | string | computed from date | `"04-12"` (MM-DD format) |

All context values are coerced to strings. `map` is `Record<string, string>` with two key formats:

- **Exact match:** `"1": "joyful"` — matches when context value equals `"1"`
- **Range match:** `"6-8": "lauds"` — matches when numeric context value falls in `[6, 8]` (inclusive). Ranges are checked in declaration order; first match wins.

---

## Flow-Local Data and `from`

`FlowDefinition` gains an optional `data` field — named data arrays that sections can iterate over:

```typescript
type RepeatEntry = Record<string, string | LocalizedText | undefined>

type FlowDefinition = {
  data?: Record<string, RepeatEntry[]>
  resolve?: ResolveStep[]
  sections: FlowSection[]
}
```

Both `repeat` and `options` can generate content from named data arrays using the `from` field:

```typescript
// repeat: iterate over entries
{ type: 'repeat', count: 5, from: '{{mysteries}}', sections: [...] }

// options: generate tabs from entries (each entry must have a `label` field)
{ type: 'options', label: LocalizedText, from: 'meditations', sections: [...] }
```

Resolution for `from`:
1. Template-substitute the string (e.g., `"{{mysteries}}"` → `"joyful"`)
2. Look up the named array — first in `resolve` outputs, then in `flow.data`
3. For `repeat`: iterate `min(count, entries.length)` times, substituting entry fields + `{{index}}` + `{{ordinal}}`
4. For `options`: generate one option tab per entry, using the entry's `label` field as the tab label, `id` field (or index) as the option ID

When `from` is absent: `repeat` falls back to simple N-times repetition; `options` uses its static `options` array.

---

## `alternativeTo` — Practice Grouping

Manifests gain an optional field:

```typescript
type PracticeManifest = {
  // ... existing fields
  alternativeTo?: string    // practice ID of the canonical version
  flow: string              // single flow file path (was: flows: FlowEntry[])
  // variants, forms fields removed
}
```

The canonical practice (e.g., `rosary` with traditional meditations in ember-default) has no `alternativeTo`. Alternatives declare themselves:

```json
// montfort-spirituality library
{
  "id": "rosary-montfort",
  "name": { "en-US": "Holy Rosary (Montfort)" },
  "alternativeTo": "rosary",
  "flow": "flow.json"
}
```

The app collects all practices pointing to the same canonical ID and presents them as alternatives in the configuration UI (reusing the variant selector pattern).

---

## Data Resolution (`resolve`)

Some practices need complex data lookups that go beyond what `cycle` or `select` can express — content that varies by liturgical calendar position, with multi-layer priority rules and dictionary-based keys. The `resolve` field on `FlowDefinition` handles this.

### Type Definition

```typescript
type ResolveStep = {
  data: string        // cycle data key (references practice's data files)
  strategy: string    // resolution algorithm: "liturgical-day", ...
  as: string          // name for the output data array
  book?: string       // book ID — engine derives `label` from TOC titles for each entry
}
```

### How it works

1. Before rendering sections, the engine runs each `ResolveStep` in order
2. The `strategy` determines the resolution algorithm (see below)
3. The algorithm reads the practice's cycle data (`data` key) and the current context
4. The strategy returns a **variable-length array** of `RepeatEntry` items + optional template vars
5. The array is published under the `as` name — available to `from` on `options`/`repeat`
6. If `book` is specified, the engine looks up each entry's `chapterId` in the book's TOC and sets the entry's `label` field to the chapter title

### Strategy output contract

Every strategy returns the same shape:

```typescript
type ResolveOutput = {
  entries: RepeatEntry[]                    // variable-length array of items
  templateVars?: Record<string, string>     // published as template vars
}
```

Entries flow into the `from` namespace. Template vars merge into the context. Sections downstream can iterate over entries or reference template vars.

### Strategy: `"liturgical-day"`

Uses `resolveLiturgicalMeditation(date, map)` from `@ember/liturgical`. The data must conform to the `LiturgicalMeditationMap` structure:

```typescript
type LiturgicalMeditationMap = {
  temporal: Record<string, MeditationEntry>    // "advent/1/0" → entry
  fixedDates: Record<string, MeditationEntry>  // "12-25", "01-25", ...
  feasts: Record<string, MeditationEntry>      // "01-06" or "movable/..." → entry
  novenas: Record<string, MeditationEntry>     // "christmas/1", "holy-spirit/3" → entry
  weekdaysOfMonths?: Record<string, MeditationEntry> // "1st-friday-of-january", "3rd-monday-of-february"
  reserves: string[]
}

type MeditationEntry = { primary: string; secondary?: string }
```

Resolution priority for the main temporal meditation: novenas (Christmas, Holy Spirit, Sacred Heart) → temporal cycle → reserves fallback → fixedDates fallback. Feast days are resolved separately (movable feasts first, then fixed-date). Additional meditations are merged from fixedDates (`MM-DD`) plus optional `weekdaysOfMonths` recurrence keys (`<ordinal>-<weekday>-of-<month>`). The algorithm handles Easter-relative computations, movable feasts, and multi-layer fallbacks.

This algorithm already exists in `packages/liturgical/src/meditation-resolver.ts`. Moving it from a practice-specific hook into the engine makes it available to any practice that indexes content by liturgical day.

**Output:** A flat array of entries — one per resolved chapter (0 to 4 items depending on the day). Each entry has `{ chapterId, category }` at minimum. When `book` is specified, the engine derives a `label` from the book's TOC for each entry. Template vars: `liturgicalLabel` (human-readable day name), `meditationTitle` (first entry's title).

```
// Example output for a feast day with 1 feast chapter + 1 temporal chapter:
entries: [
  { chapterId: "inefavel-dignidade-maria", label: "A inefável dignidade de Maria", category: "feast" },
  { chapterId: "temeridade-pecador-dia-juizo", label: "A temeridade do pecador", category: "temporal" }
]
templateVars: {
  liturgicalLabel: "Low Sunday",
  meditationTitle: "A inefável dignidade de Maria"
}
```

### Example: meditacoes-ligorio resolve step

```json
{
  "resolve": [
    {
      "data": "liturgical-map",
      "calendar": "ef",
      "strategy": "liturgical-day",
      "as": "meditations",
      "book": "meditacoes-ligorio"
    }
  ],
  "sections": [
    { "type": "rubric", "text": { "pt-BR": "{{liturgicalLabel}}" } },
    { "type": "heading", "text": { "pt-BR": "{{meditationTitle}}" } },
    "...",
    {
      "type": "options",
      "label": { "pt-BR": "Meditação" },
      "from": "meditations",
      "sections": [{ "type": "prose", "book": "meditacoes-ligorio", "chapter": "{{chapterId}}" }]
    }
  ]
}
```

No numbered suffixes, no brittle field mapping. The resolve produces a variable-length array; the options section generates one tab per entry. A day with no feast gets fewer tabs — no special casing needed.

Resolve steps can also pin the liturgical form declaratively (`"calendar": "ef"` or `"calendar": "of"`), instead of inheriting user preference for strategy labels/behavior.

### Future strategies

The `strategy` field is an extension point. Possible future additions:

- `"calendar-lookup"` — generic dictionary lookup by any context key
- `"saints-day"` — resolve the saint(s) for today from a hagiographic database

Each strategy is engine code that takes data + context and returns `{ entries, templateVars }`. The flow JSON is purely declarative.

---

## Dynamic Prose

The `prose` section type currently references a static key in `resolvedProse`:

```json
{ "type": "prose", "file": "meditation-feast" }
```

This requires the app layer to populate `resolvedProse` before rendering — which is what `useLiturgicalMeditation` does. To eliminate practice-specific code, `prose` gains dynamic chapter loading:

```json
{ "type": "prose", "book": "meditacoes-ligorio", "chapter": "{{chapterId}}" }
```

### Resolution

1. Template-substitute the `chapter` field: `"{{chapterId}}"` → `"temeridade-pecador-dia-juizo"`
2. Load the chapter text from `content/libraries/{libraryId}/books/{bookId}/{lang}/{chapterId}.html|md`
3. Render as a prose section

If the resolved chapter ID is empty/undefined (e.g., no feast today), the prose section is omitted.

### Pre-loading

The engine walks the flow before rendering, identifies all dynamic prose sections, resolves their chapter IDs, and batches the loads. This replaces the hook's `useQuery` + `Promise.all` pattern with a generic content pre-loading step.

### Backward compatibility

The existing `{ "type": "prose", "file": "key" }` form continues to work — it reads from `resolvedProse` as before. The new `book` + `chapter` form is an addition, not a replacement.

---

## Stress Tests

### Rosary — 4 mystery sets + 3 meditation traditions

**Current:** 4 flows sharing `flow.json`, 3 variant files. `setKeyOverride` maps flow ID to variant data key.

**New:** One flow with `select` + flow-local data. Meditation traditions are separate practices.

```json
{
  "data": {
    "joyful": [
      { "name": { "en-US": "The Annunciation", "pt-BR": "A Anunciação" },
        "meditation": { "en-US": "The Angel Gabriel announces...", "pt-BR": "O Anjo Gabriel anuncia..." } },
      "... 4 more mysteries"
    ],
    "sorrowful": ["..."],
    "glorious": ["..."],
    "luminous": ["..."]
  },
  "sections": [
    { "type": "prayer", "ref": "sign-of-cross" },
    { "type": "prayer", "ref": "apostles-creed" },
    { "type": "prayer", "ref": "our-father" },
    { "type": "repeat", "count": 3, "sections": [{ "type": "prayer", "ref": "hail-mary" }] },
    { "type": "prayer", "ref": "glory-be" },
    { "type": "divider" },
    {
      "type": "select",
      "on": "dayOfWeek",
      "as": "mysteries",
      "label": { "en-US": "Mysteries", "pt-BR": "Mistérios" },
      "map": {
        "0": "glorious", "1": "joyful", "2": "sorrowful",
        "3": "glorious", "4": "luminous", "5": "sorrowful", "6": "joyful"
      },
      "options": [
        { "id": "joyful", "label": { "en-US": "Joyful Mysteries", "pt-BR": "Mistérios Gozosos" } },
        { "id": "sorrowful", "label": { "en-US": "Sorrowful Mysteries", "pt-BR": "Mistérios Dolorosos" } },
        { "id": "glorious", "label": { "en-US": "Glorious Mysteries", "pt-BR": "Mistérios Gloriosos" } },
        { "id": "luminous", "label": { "en-US": "Luminous Mysteries", "pt-BR": "Mistérios Luminosos" } }
      ]
    },
    {
      "type": "repeat",
      "count": 5,
      "from": "{{mysteries}}",
      "sections": [
        { "type": "heading", "text": { "en-US": "{{ordinal}} Mystery: {{name}}", "pt-BR": "{{ordinal}} Mistério: {{name}}" } },
        { "type": "meditation", "text": "{{meditation}}" },
        { "type": "prayer", "ref": "our-father" },
        { "type": "repeat", "count": 10, "sections": [{ "type": "prayer", "ref": "hail-mary" }] },
        { "type": "prayer", "ref": "glory-be" },
        { "type": "prayer", "ref": "fatima-prayer" },
        { "type": "divider" }
      ]
    },
    { "type": "prayer", "ref": "hail-holy-queen" },
    { "type": "prayer", "ref": "sign-of-cross" }
  ]
}
```

**How it works:**
1. `select on: "dayOfWeek"` evaluates today's day, maps it to a mystery set
2. `as: "mysteries"` sets `context.mysteries = "joyful"` (on Monday)
3. `label` is present → shows picker with all 4 options, auto-selected to Joyful
4. The select options have no `sections` — they just set the context variable
5. `repeat from: "{{mysteries}}"` resolves to `"joyful"`, looks up `flow.data["joyful"]`
6. Iterates 5 times with template substitution

**Note:** When `select` options have no `sections` field, they only set the `as` variable and render nothing themselves. The content comes from the `repeat` that follows. This pattern separates selection from rendering.

**Scheduling:** One daily slot. The `select` handles mystery rotation.

**Montfort meditations:** A separate practice `rosary-montfort` in the `montfort-spirituality` library with `alternativeTo: "rosary"`. Same flow structure, different data.

---

### Mass — OF/EF with sub-views

**Current:** 6 flows + `forms` config. Flows tagged with `form` and `group`.

**New:** One flow with nested selects.

```json
{
  "sections": [
    {
      "type": "select",
      "on": "liturgicalCalendar",
      "label": { "en-US": "Form", "pt-BR": "Forma" },
      "map": { "of": "ordinary", "ef": "extraordinary" },
      "default": "ordinary",
      "options": [
        {
          "id": "ordinary",
          "label": { "en-US": "Ordinary Form", "pt-BR": "Forma Ordinária" },
          "sections": [
            {
              "type": "select",
              "label": { "en-US": "View", "pt-BR": "Visualização" },
              "default": "full",
              "options": [
                {
                  "id": "full",
                  "label": { "en-US": "Full Mass", "pt-BR": "Missa Completa" },
                  "sections": [
                    { "type": "subheading", "text": { "en-US": "Introductory Rites" } },
                    { "type": "prayer", "ref": "sign-of-cross" },
                    "... rest of ordinary form ..."
                  ]
                },
                {
                  "id": "propers",
                  "label": { "en-US": "Propers", "pt-BR": "Próprios" },
                  "sections": ["... propers content ..."]
                },
                {
                  "id": "readings",
                  "label": { "en-US": "Readings", "pt-BR": "Leituras" },
                  "sections": ["... readings content ..."]
                }
              ]
            }
          ]
        },
        {
          "id": "extraordinary",
          "label": { "en-US": "Extraordinary Form", "pt-BR": "Forma Extraordinária" },
          "sections": ["... similarly with nested select for views ..."]
        }
      ]
    }
  ]
}
```

**How it works:**
1. Outer `select on: "liturgicalCalendar"` reads the user's global preference → auto-selects OF or EF
2. `label` present → shows form picker, user can override for this session
3. Inner `select` (no `on`, manual) lets user pick view mode (Full/Propers/Readings)
4. `options` within the OF flow still works for Penitential Acts etc.

---

### Divine Office — 7 canonical hours

**Current:** 3 flows (morning/evening/compline) with different cycle keys, lectio tracks, and canticles.

**New:** One flow with `select on: "hour"` containing all 7 canonical hours. Default slots are tiered so the user progressively adds hours.

```json
{
  "sections": [
    {
      "type": "select",
      "on": "hour",
      "label": { "en-US": "Hour", "pt-BR": "Hora" },
      "map": {
        "0-5": "matins",
        "6-8": "lauds",
        "9-11": "terce",
        "12-13": "sext",
        "14-16": "none",
        "17-19": "vespers",
        "20-23": "compline"
      },
      "default": "lauds",
      "options": [
        {
          "id": "matins",
          "label": { "en-US": "Matins", "pt-BR": "Matinas" },
          "sections": [
            { "type": "rubric", "text": { "en-US": "O Lord, open my lips..." } },
            { "type": "prayer", "ref": "invitatory" },
            { "type": "cycle", "data": "office-hymns", "key": "matins", "as": "hymn" },
            { "type": "cycle", "data": "psalter-30-day", "key": "matins", "as": "psalmody" },
            { "type": "lectio", "track": "patristic-readings" },
            { "type": "prayer", "ref": "te-deum" }
          ]
        },
        {
          "id": "lauds",
          "label": { "en-US": "Lauds", "pt-BR": "Laudes" },
          "sections": [
            { "type": "rubric", "text": { "en-US": "O God, come to my assistance..." } },
            { "type": "cycle", "data": "office-hymns", "key": "lauds", "as": "hymn" },
            { "type": "cycle", "data": "psalter-30-day", "key": "lauds", "as": "psalmody" },
            { "type": "lectio", "track": "ot-readings" },
            { "type": "canticle", "ref": "benedictus" },
            { "type": "prayer", "ref": "our-father" }
          ]
        },
        {
          "id": "terce",
          "label": { "en-US": "Terce", "pt-BR": "Terça" },
          "sections": [
            "... gradual psalms, short reading, no canticle ..."
          ]
        },
        {
          "id": "sext",
          "label": { "en-US": "Sext", "pt-BR": "Sexta" },
          "sections": ["... same structure as Terce, different psalms ..."]
        },
        {
          "id": "none",
          "label": { "en-US": "None", "pt-BR": "Noa" },
          "sections": ["... same structure as Terce, different psalms ..."]
        },
        {
          "id": "vespers",
          "label": { "en-US": "Vespers", "pt-BR": "Vésperas" },
          "sections": [
            "... evening hymn, psalms, NT reading, magnificat ..."
          ]
        },
        {
          "id": "compline",
          "label": { "en-US": "Compline", "pt-BR": "Completas" },
          "sections": [
            "... examination, fixed psalms, nunc dimittis, marian antiphon ..."
          ]
        }
      ]
    }
  ]
}
```

**How it works:**
1. `select on: "hour"` reads the current clock hour (0-23), maps it via ranges to the nearest canonical hour
2. `label` present → shows picker, user can always override (e.g., pray lauds late in the day)
3. Each option contains its own cycle/lectio/canticle sections with the right keys
4. No `setKeyOverride` needed — each option hardcodes its own cycle keys

**Scheduling — tiered slots:**

The practice defines all 7 hours as potential slots. The tier system lets the user grow into the full breviary progressively:

```json
"defaults": {
  "slots": [
    { "time": "07:00", "schedule": { "type": "daily" }, "tier": "essential" },
    { "time": "18:00", "schedule": { "type": "daily" }, "tier": "essential" },
    { "time": "21:00", "schedule": { "type": "daily" }, "tier": "ideal" },
    { "time": "09:00", "schedule": { "type": "daily" }, "tier": "aspirational" },
    { "time": "12:00", "schedule": { "type": "daily" }, "tier": "aspirational" },
    { "time": "15:00", "schedule": { "type": "daily" }, "tier": "aspirational" },
    { "time": "03:00", "schedule": { "type": "daily" }, "tier": "aspirational" }
  ]
}
```

| Tier | Hours | UX |
|------|-------|-----|
| `essential` | Lauds (07:00), Vespers (18:00) | Auto-enabled on first setup |
| `ideal` | Compline (21:00) | Suggested after the user is consistent with essentials |
| `aspirational` | Terce, Sext, None, Matins | Available in config, not pushed — the user opts in |

**Slot ↔ select interaction:**
- Each slot has a `time`. When the user opens the practice from that slot, the context `hour` equals the slot time's hour.
- The select evaluates the hour → auto-picks the matching canonical hour.
- Plan view uses `previewSelect()` to show: **"Divine Office — Lauds"** at 07:00, **"Divine Office — Vespers"** at 18:00, etc.
- The user sees exactly which hour each slot corresponds to, and can add/remove slots to customize their breviary commitment.

---

### Confession — 2 modes

**Current:** 2 flows (prepare/thanksgiving), user manually picks.

**New:**

```json
{
  "sections": [
    {
      "type": "select",
      "label": { "en-US": "Mode", "pt-BR": "Modo" },
      "default": "prepare",
      "options": [
        {
          "id": "prepare",
          "label": { "en-US": "Preparation", "pt-BR": "Preparação" },
          "sections": ["... examination + act of contrition ..."]
        },
        {
          "id": "thanksgiving",
          "label": { "en-US": "Thanksgiving", "pt-BR": "Ação de Graças" },
          "sections": ["... thanksgiving prayers ..."]
        }
      ]
    }
  ]
}
```

No `on` → manual mode. User always picks.

---

### Grace at Meals — before/after

Same pattern as Confession: `select` (manual) with "Before Meals" and "After Meals" options.

### Prayers of St. Thomas Aquinas — 5 prayers

`select` (manual) with 5 options: Before Study, After Study, Before Communion, After Communion, Adoro Te Devote.

### Morning Offering — 2 prayer forms

`select` (manual) with "Daily Offering" and "Traditional" options.

### Visit to Blessed Sacrament — 2 durations

`select` (manual) with "Short Visit" and "Holy Hour" options.

---

### Stations of the Cross — 4 meditation traditions

**Current:** 1 flow + 4 variants (traditional, scriptural, jpii, franciscan).

**New:** 4 separate practices, each self-contained:

```
# ember-default
stations-cross/
  manifest.json   { flow: "flow.json" }
  flow.json       { data: { stations: [14 entries with traditional meditations] }, sections: [...] }

# ember-extra
stations-cross-scriptural/
  manifest.json   { alternativeTo: "stations-cross", flow: "flow.json" }
  flow.json       { data: { stations: [14 entries with scriptural meditations] }, sections: [...] }

# etc. for jpii, franciscan
```

Each flow carries its station meditations in `data.stations` and uses `repeat from: "stations"` to iterate.

---

### Examination of Conscience — 3 methods

**Current:** 1 flow with `repeat count=5`, 3 variants with different entry counts (5/10/8).

**New:** 3 separate practices, each with the correct repeat count:

- `examination-of-conscience` (Ignatian, `repeat count=5`)
- `examination-by-commandments` (`alternativeTo: "examination-of-conscience"`, `repeat count=10`)
- `examination-by-beatitudes` (`alternativeTo: "examination-of-conscience"`, `repeat count=8`)

Each practice defines its own flow with the right structure — no more clamping by `Math.min(count, entries.length)`.

---

### Text-swap variants — Act of Contrition, Spiritual Communion, Prayer to St. Joseph

**Current:** 1 flow with `repeat count=1` + variant just to inject different prayer text.

**New:** Separate practices with the prayer inlined directly. No repeat hack.

```json
// act-contrition/flow.json (traditional)
{
  "sections": [
    { "type": "prayer", "ref": "sign-of-cross" },
    {
      "type": "prayer",
      "inline": {
        "en-US": "O my God, I am heartily sorry for having offended Thee...",
        "pt-BR": "Meu Deus, pesa-me muito ter-Vos ofendido..."
      }
    }
  ]
}
```

```json
// act-contrition-short/manifest.json
{ "alternativeTo": "act-contrition", "flow": "flow.json" }
```

---

### meditacoes-ligorio — liturgical meditation

**Current:** 1 flow with `templateVars` + `resolvedProse` + `options`. The `useLiturgicalMeditation` hook (118 lines of practice-specific React code) resolves the liturgical day → looks up chapter IDs in `liturgical-map.json` → loads book chapter texts → builds template vars from TOC titles → injects prose.

**New:** `resolve` + `from` + dynamic `prose` — everything declarative, hook deleted.

```json
{
  "resolve": [
    {
      "data": "liturgical-map",
      "calendar": "ef",
      "strategy": "liturgical-day",
      "as": "meditations",
      "book": "meditacoes-ligorio"
    }
  ],
  "sections": [
    { "type": "rubric", "text": { "pt-BR": "{{liturgicalLabel}}" } },
    { "type": "heading", "text": { "pt-BR": "{{meditationTitle}}" } },
    {
      "type": "prayer",
      "title": { "pt-BR": "Preparação" },
      "sections": ["... unchanged ..."]
    },
    {
      "type": "options",
      "label": { "pt-BR": "Meditação" },
      "from": "meditations",
      "sections": [{ "type": "prose", "book": "meditacoes-ligorio", "chapter": "{{chapterId}}" }]
    },
    {
      "type": "prayer",
      "title": { "pt-BR": "Conclusão" },
      "sections": ["... unchanged ..."]
    }
  ]
}
```

**How it works:**
1. `resolve` runs before sections: calls `resolveLiturgicalMeditation(date, liturgicalMap)`
2. Output: a variable-length array named `"meditations"` — e.g., `[{ chapterId: "...", label: "A temeridade...", category: "feast" }, { chapterId: "...", label: "O amor de Deus...", category: "temporal" }]`
3. Strategy auto-publishes `liturgicalLabel` and `meditationTitle` as template vars
4. `options from: "meditations"` generates one tab per entry — each entry's `label` becomes the tab label
5. Dynamic `prose` loads the chapter by `{{chapterId}}`
6. A day with 1 feast + 2 temporal chapters gets 3 tabs. No feast? Fewer tabs. No numbered suffixes, no brittle mapping.

**What's deleted:** `useLiturgicalMeditation.ts` hook, the `liturgicalTemplateVars`/`liturgicalProse` wiring in `PracticeFlow.tsx`, the practice-specific `if (practiceId === 'meditacoes-ligorio')` branching.

---

### Practices that stay unchanged

**Programs/novenas** (novena-holy-spirit, miraculous-medal-novena, first-friday-devotion, triduum-holy-spirit, novena-sacred-heart, total-consecration): Already 1 flow with cycle data indexed by `program-day`. No changes.

**Simple prayers** (~40 practices — litanies, memorare, guardian-angel, etc.): Already 1 flow, no variants/forms/multi-flow. No changes.

**Bible-in-a-year:** Already 1 flow with lectio tracks. No changes.

---

## What Stays Unchanged

| Mechanism | What it does | Why it stays |
|-----------|-------------|-------------|
| `cycle` | Date-indexed data lookup (psalter, hymns, program-day content) | Generic primitive, not practice-specific |
| `lectio` | Reading progress tracking through books | Independent of flow selection |
| `psalmody` | Psalm rendering with MT/LXX numbering | Leaf section type |
| `options` | Show ALL alternatives simultaneously (user reads any) | Distinct UX from `select` (pick ONE) |
| `prose` | Runtime text injection (static `file` form unchanged; new `book` + `chapter` form for dynamic content) | Extended, not replaced |
| `templateVars` | `{{placeholder}}` substitution throughout sections | Used by many practices |
| `program` | Multi-day tracking (day count, completion, restart) | Orthogonal to flow structure |

### `options` vs `select` distinction

- **`options`**: Renders ALL alternatives visible at once. User reads whichever. Example: three Penitential Acts in the Mass — all shown, user reads the one they want.
- **`select`**: Picks ONE option, renders only that one. Optionally shows a picker for override. Example: which mystery set to pray today.

Both are needed. They serve fundamentally different UX patterns.

---

## Manifest Changes

### Before

```typescript
type PracticeManifest = {
  id: string
  name: LocalizedText
  flows: FlowEntry[]              // multiple flow files
  variants?: { ... }[]            // variant files
  forms?: FormsConfig             // preference-based filtering
  // ... rest
}
```

### After

```typescript
type PracticeManifest = {
  id: string
  name: LocalizedText
  flow: string                    // single flow file path
  alternativeTo?: string          // groups practices across libraries
  // flows, variants, forms removed
  // rest unchanged: categories, estimatedMinutes, description, history,
  // howToPray, flowMode, completion, program, theme, data, tracks, pack, tags, defaults
}
```

### `SlotDefault` changes

```typescript
// Before
type SlotDefault = {
  flowId: string          // which flow this slot is for
  schedule: Schedule
  tier?: Tier
  time?: string
  enabled?: boolean
}

// After
type SlotDefault = {
  schedule: Schedule      // flowId removed — slots bind to the practice, not a flow
  tier?: Tier
  time?: string
  enabled?: boolean
}
```

---

## Engine Changes

### New section type: `select`

Added to `FlowSection` union:

```typescript
| {
    type: 'select'
    on?: string
    as?: string
    label?: LocalizedText
    map?: Record<string, string>
    default?: string
    options: { id: string; label: LocalizedText; sections: FlowSection[] }[]
  }
```

Added to `RenderedSection` union:

```typescript
| {
    type: 'select'
    label: BilingualText
    selectedId: string
    options: { id: string; label: BilingualText; sections: RenderedSection[] }[]
  }
```

### Modified section type: `prose`

```typescript
// Before
| { type: 'prose'; file: string }

// After
| { type: 'prose'; file: string }                                    // static (unchanged)
| { type: 'prose'; book: string; chapter: string }                   // dynamic (NEW)
```

When `chapter` contains template variables (e.g., `"{{feast}}"`), they're resolved first. If the resolved chapter ID is empty, the section is omitted. Otherwise, the engine loads the chapter from the book's content directory.

### Modified section type: `repeat`

```typescript
// Before
{ type: 'repeat', count: number, variable?: { source: 'variant', key: string }, sections: FlowSection[] }

// After
{ type: 'repeat', count?: number, from?: string, sections: FlowSection[] }
```

When `from` is present, template-substitutes it, looks up the named data array (resolve outputs, then `flow.data`), iterates over entries. When only `count` is present, simple repetition. When both present, iterates `min(count, entries.length)`.

### Modified section type: `options`

```typescript
// Static (unchanged)
{ type: 'options', label: LocalizedText, options: { id: string; label: LocalizedText; sections: FlowSection[] }[] }

// Dynamic (NEW) — generates option tabs from a data array
{ type: 'options', label: LocalizedText, from: string, sections: FlowSection[] }
```

When `from` is present, each entry in the named data array becomes one option tab. The entry's `label` field is used as the tab label. The `sections` are templates applied to each entry (with `{{field}}` substitution). Entries with missing/empty `label` are omitted.

### `FlowContext` changes

```typescript
// Before
type FlowContext = {
  date: Date
  variant?: Variant
  setKeyOverride?: string
  // ...
}

// After
type FlowContext = {
  date: Date
  flowData?: Record<string, RepeatEntry[]>  // from flow.data, replaces variant
  selectOverrides?: Record<string, string>   // user overrides for select sections
  // variant, setKeyOverride removed
  // rest unchanged: numbering, liturgicalCalendar, trackDefs, trackState,
  // cycleData, programDay, templateVars, resolvedProse
}
```

`selectOverrides` allows the UI to pass user overrides for named selects (keyed by `as` or a generated ID).

### New: `resolve` step execution

```typescript
async function executeResolveSteps(
  flow: FlowDefinition,
  context: FlowContext,
  ec: EngineContext,
): Promise<FlowContext> {
  if (!flow.resolve) return context
  let ctx = { ...context }

  for (const step of flow.resolve) {
    const data = ctx.cycleData?.[step.data]
    const { entries, templateVars } = runStrategy(step.strategy, data, ctx)

    // Derive labels from book TOC if book specified
    if (step.book) {
      for (const entry of entries) {
        if (entry.chapterId && !entry.label) {
          entry.label = lookupTocTitle(step.book, String(entry.chapterId), ec.language)
        }
      }
    }

    // Publish entries as a named data array (available to `from`)
    ctx.flowData = { ...ctx.flowData, [step.as]: entries }

    // Merge template vars
    if (templateVars) {
      ctx.templateVars = { ...ctx.templateVars, ...templateVars }
    }
  }

  return ctx
}
```

### `resolveFlow` changes

```typescript
async function resolveFlow(flow: FlowDefinition, context: FlowContext, ec: EngineContext) {
  // 1. Inject static flow-local data
  let ctx = flow.data ? { ...context, flowData: { ...context.flowData, ...flow.data } } : context
  // 2. Execute resolve steps — outputs merge into flowData alongside static data
  ctx = await executeResolveSteps(flow, ctx, ec)
  // 3. Resolve sections (unchanged)
  return flow.sections.flatMap(s => resolveSection(s, ctx, ec))
}
```

**Note:** `resolveFlow` becomes async. This is a necessary change — dynamic prose loads book chapters from disk/network. The app already handles async flow resolution via TanStack Query.

### New: `resolveSelect`

```typescript
function resolveSelect(section: SelectSection, context: FlowContext, ec: EngineContext): RenderedSection[] {
  // 1. Determine selected option
  const rawValue = section.on ? getContextValue(context, section.on) : undefined
  const mappedValue = rawValue !== undefined && section.map
    ? lookupMap(section.map, String(rawValue))  // handles exact + range keys
    : rawValue !== undefined ? String(rawValue) : undefined
  const selectedId = mappedValue ?? section.default ?? section.options[0]?.id

  // 2. Check for user override
  const overrideKey = section.as ?? selectedId
  const finalId = context.selectOverrides?.[overrideKey] ?? selectedId

  // 3. Set context variable
  if (section.as) {
    context = { ...context, [section.as]: finalId }  // for downstream sections
  }

  // 4. Render
  if (section.label) {
    // Visible picker: resolve ALL options
    return [{
      type: 'select',
      label: ec.localize(section.label),
      selectedId: finalId,
      options: section.options.map(opt => ({
        id: opt.id,
        label: ec.localize(opt.label),
        sections: opt.sections.flatMap(s => resolveSection(s, { ...context, [section.as!]: opt.id }, ec))
      }))
    }]
  } else {
    // Silent: resolve only selected option
    const option = section.options.find(o => o.id === finalId) ?? section.options[0]
    return option.sections.flatMap(s => resolveSection(s, context, ec))
  }
}
```

---

## Slot and Scheduling Changes

### DB schema

```typescript
// Before
type UserPracticeSlot = {
  practice_id: string
  slot_id: string        // flow ID reference
  variant: string | null // dead column
  // ...
}

// After
type UserPracticeSlot = {
  practice_id: string
  slot_id: string        // pure unique identifier, no longer a flow reference
  // variant removed
  // rest unchanged
}
```

### Default slot definitions

```json
// Before (Rosary)
"defaults": {
  "slots": [
    { "flowId": "joyful", "schedule": { "type": "days-of-week", "days": [1, 6] } },
    { "flowId": "sorrowful", "schedule": { "type": "days-of-week", "days": [2, 5] } },
    { "flowId": "glorious", "schedule": { "type": "days-of-week", "days": [0, 3] } },
    { "flowId": "luminous", "schedule": { "type": "days-of-week", "days": [4] } }
  ]
}

// After (Rosary) — one daily slot, select handles mystery rotation
"defaults": {
  "slots": [
    { "schedule": { "type": "daily" }, "tier": "essential" }
  ]
}
```

```json
// Before (Divine Office)
"defaults": {
  "slots": [
    { "flowId": "morning", "time": "07:00", "schedule": { "type": "daily" } },
    { "flowId": "evening", "time": "18:00", "schedule": { "type": "daily" } },
    { "flowId": "compline", "time": "21:00", "schedule": { "type": "daily" } }
  ]
}

// After — 7 tiered slots, select on: "hour" auto-picks the canonical hour
"defaults": {
  "slots": [
    { "time": "07:00", "schedule": { "type": "daily" }, "tier": "essential" },
    { "time": "18:00", "schedule": { "type": "daily" }, "tier": "essential" },
    { "time": "21:00", "schedule": { "type": "daily" }, "tier": "ideal" },
    { "time": "09:00", "schedule": { "type": "daily" }, "tier": "aspirational" },
    { "time": "12:00", "schedule": { "type": "daily" }, "tier": "aspirational" },
    { "time": "15:00", "schedule": { "type": "daily" }, "tier": "aspirational" },
    { "time": "03:00", "schedule": { "type": "daily" }, "tier": "aspirational" }
  ]
}
```

---

## Plan View Preview

The plan/today view currently shows flow names for multi-flow practices (e.g., "Morning Prayer (Lauds)"). With one flow and `select`, it needs to evaluate the auto-selection to preview today's content.

```typescript
function previewSelect(flow: FlowDefinition, context: FlowContext): string | undefined {
  // Find the first select section with a label (visible selector)
  const selectSection = flow.sections.find(s => s.type === 'select' && s.label)
  if (!selectSection || selectSection.type !== 'select') return undefined

  // Evaluate the auto rule
  const rawValue = selectSection.on ? getContextValue(context, selectSection.on) : undefined
  const mapped = rawValue !== undefined && selectSection.map
    ? lookupMap(selectSection.map, String(rawValue)) : String(rawValue)
  const selectedId = mapped ?? selectSection.default ?? selectSection.options[0]?.id
  const option = selectSection.options.find(o => o.id === selectedId)

  return option ? localizeUI(option.label) : undefined
}
```

Plan view shows: **"Holy Rosary — Joyful Mysteries"** or **"Divine Office — Lauds"** (at 07:00) / **"Divine Office — Vespers"** (at 18:00)

---

## `CycleData.variantKey` Note

`CycleData` in `types.ts` has a `variantKey` field used by the Divine Office psalter data to key on `numbering` (MT vs LXX psalm numbering). Despite the name, it is **completely unrelated** to the variant system being removed. It reads a different context key and serves a different purpose. Rename to `contextKey` during this refactor to avoid confusion.

Note: `CycleData` continues to use array-indexed lookups (`indexBy: day-of-month | day-of-week | fixed | program-day`). Dictionary-based lookups with complex resolution (like liturgical-map) are handled by `resolve`, not by extending `CycleData`.

---

## Migration Path

### Content changes

**Multi-flow practices** (Rosary, Divine Office, Little Office, Mass, Confession, Visit BS, Grace at Meals, Morning Offering, Prayers of St. Thomas, St. Michael, modo-rezar-rosario, para-confissao, preparacao-comunhao):
1. Merge flow files into one `flow.json` with `select` sections
2. Replace `flows: [...]` with `flow: "flow.json"` in manifest
3. Update `defaults.slots` to remove `flowId`

**Variant practices** (rosary, stations-cross, examination-of-conscience, mental-prayer, act-contrition, spiritual-communion, prayer-st-joseph, seven-sorrows, way-of-light, via-sacra):
1. Create separate practice per variant (canonical keeps original ID)
2. Move variant data into `flow.json` as `data` field
3. Add `alternativeTo` to non-canonical manifests
4. For text-swap practices, inline the prayer text directly (remove repeat-count-1 hack)
5. Remove `variants` from manifests

**Mass:**
1. Merge all 6 flow files into one `flow.json` with nested selects
2. Remove `forms` config from manifest
3. Replace `flows: [...]` with `flow: "flow.json"`

**meditacoes-ligorio:**
1. Add `resolve` field to `flow.json` with `strategy: "liturgical-day"`, `as: "meditations"` (see stress test)
2. Replace static `prose` sections (`file: "meditation-feast"`) with dynamic prose (`book` + `chapter: "{{chapterId}}"`)
3. Replace static `options` with `from: "meditations"` — tabs generated from resolve array
4. Remove `templateVars` and `resolvedProse` from `PracticeFlow.tsx` wiring — resolve handles it
5. Delete `useLiturgicalMeditation.ts`

### Engine changes

1. Add `select` to `FlowSection` union type (with range-based `map` support)
2. Add `select` to `RenderedSection` union type
3. Add `resolveSelect()` function with `lookupMap()` for range keys
4. Add `data?: Record<string, RepeatEntry[]>` to `FlowDefinition`
5. Add `resolve?: ResolveStep[]` to `FlowDefinition`
6. Add `executeResolveSteps()` — runs strategies, publishes arrays into `flowData`, merges template vars
7. Add `runStrategy("liturgical-day", ...)` — calls `resolveLiturgicalMeditation`, returns `{ entries, templateVars }`
8. Add dynamic `prose` resolution — `book` + `chapter` form, template var substitution, chapter loading
9. Add `from` to `repeat` and `options` — unified data iteration from named arrays
10. Make `resolveFlow()` async (dynamic prose requires I/O)
11. Rename `VariantEntry` → `RepeatEntry`
12. Modify `resolveRepeat()` to use `from` field + `flowData` lookup
13. Add `resolveOptionsFrom()` — generates option tabs from data array entries
14. Replace `variant?: Variant` with `flowData` + `selectOverrides` on `FlowContext`
15. Add `hour`, `liturgicalDay`, and `dateKey` to standard context values
16. Remove `resolveVariantData()`, `Variant` type

### App changes

1. Remove `variants`, `forms` from `PracticeManifest` type; add `alternativeTo`, change `flows[]` to `flow`
2. Remove `FlowEntry`, `FormsConfig`, `FormOption` types
3. Remove `variant` column from DB reads/writes
4. Remove variant/form loading from filesystem source and registry
5. Simplify flow loading: `loadFlow(practiceId)` instead of `loadFlowForSlot(practiceId, flowId)`
6. Rewrite `PracticeFlow.tsx`: remove flow selection, form handling, variant loading, `useLiturgicalMeditation` call; pass `selectOverrides` to engine
7. Delete `useLiturgicalMeditation.ts` hook entirely — resolve + dynamic prose replaces it
8. Add `SelectBlock` renderer component (picker UI + section switching)
9. Update `getSlotName()` to use `previewSelect()` for plan view labels
10. Remove `SlotDefault.flowId` from all code paths
11. Build alternative-practice selector (replaces `VariantSelector`)
12. Update i18n keys that reference variants/forms

### DB considerations

The `variant` column is dead (never written). The `slot_id` column currently stores flow IDs but can keep its existing values — they just won't be interpreted as flow references. No schema migration needed.
