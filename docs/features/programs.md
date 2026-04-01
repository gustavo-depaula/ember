# Programs — Time-Bounded Practices

Novenas, triduums, consecrations, and periodic devotions like First Fridays — practices with a defined start, end, and day-by-day progression.

---

## Core Concept

A **program** is a practice with a finite duration and sequential content. Where a regular practice (Morning Offering, Rosary) repeats indefinitely on a schedule, a program has a beginning and an end. The user starts it, progresses through it day by day, and completes it.

Programs build on the existing practice content architecture — same manifest format, same flow system, same resolution engine. The key additions are:

1. **Day-indexed content** — the flow resolves differently on each day of the program
2. **Progress tracking** — a cursor in the `cursors` table tracks the user's position
3. **Progress policies** — rules for what happens when the user misses a day
4. **Program detail screen** — a navigable day list showing the full journey and progress

### Content vs. Structure

Most programs share the same prayer structure every day with day-specific meditations or intentions. A novena typically has:
- Fixed opening prayers
- Day-specific meditation/intention (varies by day)
- Fixed closing prayers

This maps naturally to the existing cycle mechanism: a single flow template with a `cycle` section that resolves day-specific data based on the current program day. No new content primitives needed — just a new index mode (`program-day`) and output mode (`template`) on the existing `cycle` section type.

For programs where the structure genuinely differs each day (e.g., 33-day Marian consecration with distinct daily readings), per-day flow files provide a fallback.

---

## Program Types

### Sequential Programs

Consecutive-day devotions: novenas (9 days), triduums (3 days), octaves (8 days), consecrations (33 days), the 54-day Rosary novena.

**Characteristics:**
- Fixed total number of days
- Day-specific content (meditations, intentions, readings)
- One completion per day
- Progress is linear: Day 1 → Day 2 → … → Day N

### Periodic Series

Non-consecutive devotions tied to specific calendar occurrences: First Fridays (9 consecutive first Fridays), First Saturdays (5 consecutive first Saturdays).

**Characteristics:**
- Fixed total number of occurrences (not days)
- Same content each occurrence (go to Mass, receive communion)
- Progress is monthly: 1st occurrence → 2nd → … → Nth
- Missing an occurrence traditionally breaks the chain

---

## Content Model

### Day Data via Cycle Template (primary pattern)

Extends the existing `cycle` section type with:
1. `indexBy: 'program-day'` — indexes by the current day within the program
2. `as: 'template'` with `sections` — substitutes `{{vars}}` into child sections using the looked-up entry's fields

**File structure:**
```
src/content/practices/novena-sacred-heart/
  manifest.json
  flow.json              # shared structure (template)
  data/days.json         # cycle data with 9 entries
```

**Day data file** (`data/days.json`) — standard `CycleData` format:
```json
{
  "indexBy": "program-day",
  "entries": {
    "default": [
      {
        "dayTitle": { "en": "Day 1: Love of God", "pt-BR": "Dia 1: Amor de Deus" },
        "meditation": { "en": "Consider how the Sacred Heart…", "pt-BR": "Considere como o Sagrado Coração…" },
        "intention": { "en": "For the conversion of sinners.", "pt-BR": "Pela conversão dos pecadores." }
      },
      {
        "dayTitle": { "en": "Day 2: Trust in God", "pt-BR": "Dia 2: Confiança em Deus" },
        "meditation": { "en": "Reflect upon the infinite mercy…", "pt-BR": "Reflita sobre a infinita misericórdia…" },
        "intention": { "en": "For the souls in purgatory.", "pt-BR": "Pelas almas do purgatório." }
      }
    ]
  }
}
```

**Flow template** — the `cycle` section wraps the day-varying block:
```json
{
  "sections": [
    { "type": "prayer", "ref": "sign-of-cross" },
    { "type": "heading", "text": { "en": "Novena to the Sacred Heart", "pt-BR": "Novena ao Sagrado Coração" } },
    { "type": "cycle", "data": "novena-days", "as": "template", "sections": [
      { "type": "subheading", "text": { "en": "{{dayTitle}}" } },
      { "type": "meditation", "text": { "en": "{{meditation}}" } },
      { "type": "rubric", "text": { "en": "Intention: {{intention}}" } }
    ]},
    { "type": "divider" },
    { "type": "prayer", "ref": "our-father" },
    { "type": "prayer", "ref": "hail-mary" },
    { "type": "prayer", "ref": "glory-be" },
    { "type": "divider" },
    { "type": "prayer", "inline": {
      "en": "Sacred Heart of Jesus, I place all my trust in You.",
      "pt-BR": "Sagrado Coração de Jesus, em Vós confio."
    }}
  ]
}
```

**How it works at runtime:**
1. The `programDay` (e.g., 4) is passed in `FlowContext`
2. `getCycleIndex` returns 4 for `indexBy: 'program-day'`
3. The engine looks up `entries.default[4]`, extracts all fields as template vars
4. Child sections get `{{dayTitle}}`, `{{meditation}}`, `{{intention}}` substituted via existing `deepSubstitute`
5. Substituted sections are resolved normally

### Per-Day Flows (fallback for complex programs)

When the prayer structure genuinely differs each day — not just the meditations but the readings, structure, and sections — each day gets its own flow file.

```
src/content/practices/33-days-morning-glory/
  manifest.json
  days/
    day-01.json
    day-02.json
    ...
    day-33.json
```

Each `day-NN.json` is a standard `FlowDefinition` with a `sections` array. The engine loads the file matching the current program day.

### Manifest Extension

```typescript
type ProgramConfig = {
  totalDays: number                         // 9 for novenas, 33 for consecrations
  perDayFlows?: string                      // path to directory (e.g., "days/"), absent = use cycle template
  progressPolicy: 'continue' | 'wait' | 'restart'
  completionBehavior: 'auto-disable' | 'offer-restart' | 'keep'
}
```

Added to `PracticeManifest`:
```typescript
type PracticeManifest = {
  // ...existing fields...
  program?: ProgramConfig
}
```

**Example novena manifest:**
```json
{
  "id": "novena-sacred-heart",
  "name": { "en": "Novena to the Sacred Heart", "pt-BR": "Novena ao Sagrado Coração" },
  "categories": ["program", "devotion"],
  "estimatedMinutes": 10,
  "flowMode": "scroll",
  "completion": "flow-end",
  "program": {
    "totalDays": 9,
    "progressPolicy": "continue",
    "completionBehavior": "offer-restart"
  },
  "data": {
    "novena-days": "data/days.json"
  },
  "flows": [{ "id": "default", "name": { "en": "Daily Prayer" }, "file": "flow.json" }],
  "description": { "en": "A nine-day prayer to the Sacred Heart of Jesus…" },
  "history": { "en": "Devotion to the Sacred Heart was promoted by St. Margaret Mary Alacoque…" },
  "howToPray": { "en": "Pray once daily for nine consecutive days…" },
  "tags": ["novena", "sacred-heart", "9-days"]
}
```

---

## Progress Policies

| Policy | When day advances | On missed day | Best for |
|--------|-------------------|---------------|----------|
| `continue` | Each calendar day, regardless of completion | Gap in progress, no prompt | Novenas where the user can catch up |
| `wait` | Only on completion of current day | Nothing — program pauses until user prays | Self-paced programs (33-day consecration) |
| `restart` | Each calendar day (like `continue`) | Prompts user to restart from Day 1 | First Fridays, strict novenas |

### `continue`

Program day = `differenceInCalendarDays(today, startDate)`. Advances with the calendar regardless of whether the user prayed. Missed days appear as gaps in the program detail screen. The user can go back and pray missed days but the "current" day always matches the calendar.

**Schedule:** `{ type: 'fixed-program', totalDays, startDate }` — existing type, no changes.

### `wait`

Program day = cursor position, only incremented on completion. If the user misses Tuesday, Wednesday still shows the same day. No time pressure — a 9-day novena could take 15 calendar days.

**Schedule:** `{ type: 'daily' }` — the program slot appears in the checklist every day until all days are completed. The `totalDays` and progress live in the program config + cursor, not the schedule.

### `restart`

Same as `continue` (calendar-based) but with gap detection. If the user hasn't completed the previous day by the time the next day arrives, prompt: "You missed Day 3. Would you like to restart?" The user can restart (cursor resets to 0, schedule gets new `startDate`) or continue anyway.

For periodic series (First Fridays), missing an applicable occurrence triggers the same restart prompt.

---

## Program Day Tracking

### Cursor in `cursors` table

The existing `cursors` table (used by Divine Office reading tracks) stores program position:

```
id:       "program/novena-sacred-heart"
position: '{"day": 4, "status": "active"}'
```

| Field | Type | Description |
|-------|------|-------------|
| `day` | number | 0-indexed current program day |
| `status` | `"active"` \| `"completed"` | Program lifecycle state |

**How `day` advances per policy:**

| Policy | Advancement | Source of truth |
|--------|------------|-----------------|
| `continue` | Calendar: `differenceInCalendarDays(today, startDate)` | Derivable from schedule, cursor is cache |
| `wait` | Completion: increment on prayer completion | Cursor is authoritative |
| `restart` | Calendar (like `continue`), reset to 0 on restart | Cursor + schedule mutation |

**Why a cursor instead of pure derivation:**
- `wait` policy is completion-gated — the day cannot be derived from the calendar
- Cursor makes day lookup O(1) instead of counting completions each render
- The `status` field tracks lifecycle without additional queries
- No migration needed — `cursors` table already exists with schemaless `position` JSON

### Completions

The existing `completions` table tracks which days were completed:

```sql
-- Day 3 of novena completed
INSERT INTO completions (practice_id, sub_id, date, completed_at)
VALUES ('novena-sacred-heart', 'day-3', '2026-04-03', 1743638400000);
```

The `sub_id` carries the day identifier (e.g., `"day-3"`) so the program detail screen can show per-day checkmarks.

---

## UX

### Discovery (Catalog)

Programs appear in the practice catalog (`/practices/`) alongside regular practices:
- A `"program"` category in `CategoryChips` filters to programs only
- Program cards show a duration badge: "9 days", "33 days", "9 months"
- Tapping opens the practice detail screen

### Starting a Program

On the practice detail screen (`/practices/[manifestId]`), when `manifest.program` exists:
- Teaching content (description, history, how-to-pray) is shown as usual
- Instead of "Add to Plan," show program-specific UI:
  - Duration: "9-day novena"
  - "Begin Program" button
  - Date picker defaulting to today
- On confirm:
  - Create slot with appropriate schedule (`fixed-program` for `continue`/`restart`, `daily` for `wait`)
  - Create cursor at `program/{practiceId}` with `{ "day": 0, "status": "active" }`
  - Slot tier defaults to `'extra'` (user can change)

### Program Detail Screen (Day Navigation)

When the user taps a program slot in the daily checklist, they land on a **program detail screen** — not directly into the pray screen. This shows the full program as a navigable day list:

- Progress indicator at top: "Day 5 of 9" with a progress bar
- All days listed vertically, each showing:
  - Day number
  - Day title (from day data entry, e.g., "Love of God")
  - Completion checkmark for completed days
- **Current day** is highlighted with accent color — primary tap target
- **Past uncompleted days** are tappable (to pray missed days)
- **Future days** show titles but are dimmed / not tappable
- Tapping a day navigates to the pray screen with that day's `programDay` in context

This mirrors the Rosary experience (seeing all mysteries and picking one) but adapted for sequential content — the user sees the full journey and their place in it.

**Route:** `/practices/[manifestId]/program`

### Daily Checklist

Program slots appear in the daily checklist alongside regular practices:
- Same display as other practices (icon, name)
- Subtitle: "Day 5 of 9" (or "4th of 9 First Fridays" for periodic series)
- Tapping goes to the program detail screen

### Pray Screen

The pray screen receives `programDay` as a parameter:
- Day indicator at top: "Day 5 of 9"
- Flow resolves with `programDay` in context → day-specific content appears
- On completion: log completion with `sub_id: "day-4"`, advance cursor if `wait` policy

### Program Completion

When the user completes the final day:
- Show a completion card/modal: "You have completed the Novena to the Sacred Heart!"
- Actions based on `completionBehavior`:
  - `auto-disable`: slot disabled, disappears from checklist
  - `offer-restart`: show "Pray Again" option (creates new cursor, new startDate)
  - `keep`: slot naturally stops appearing (schedule window passed)
- Cursor status set to `"completed"`
- Completed days remain in the `completions` table for history

---

## Periodic Series

### Schedule Type

```typescript
type PeriodicSeriesSchedule = {
  type: 'periodic-series'
  rule: ScheduleRule              // the underlying schedule (e.g., nth-weekday for First Fridays)
  totalOccurrences: number        // 9 for First Fridays, 5 for First Saturdays
  startDate: string               // ISO date when the series began
}
```

**`isApplicableOn`:** delegates to the inner `rule`. The slot appears on First Fridays only (not every day). The series window is open-ended — it ends when all occurrences are completed or the user gives up.

**Progress:** Cursor `day` represents the occurrence count (0-indexed). Advanced on completion of each applicable date.

### Missed Occurrence

First Fridays/Saturdays use `progressPolicy: 'restart'`. If the user misses an applicable date (the first Friday of a month passes without completion), prompt on next app open:

"You missed the First Friday in March. The Nine First Fridays devotion requires consecutive months. Would you like to restart?"

Options:
- **Restart** — cursor resets to `{ "day": 0 }`, schedule gets new `startDate`
- **Continue anyway** — keep going (user's choice to override tradition)

### Content

Periodic series typically have no day-indexed content — the prayer is the same each time (or is simply "attend Mass and receive communion"). The manifest has a teaching page but the flow is either:
- A simple prayer flow (e.g., prayers before/after communion)
- `completion: 'manual'` — just a checkbox

### Example: First Fridays Manifest

```json
{
  "id": "first-fridays",
  "name": { "en": "Nine First Fridays", "pt-BR": "Nove Primeiras Sextas-feiras" },
  "categories": ["program", "devotion"],
  "estimatedMinutes": 0,
  "flowMode": "scroll",
  "completion": "manual",
  "program": {
    "totalDays": 9,
    "progressPolicy": "restart",
    "completionBehavior": "offer-restart"
  },
  "flows": [{ "id": "default", "name": { "en": "First Friday" }, "file": "flow.json" }],
  "description": { "en": "A devotion to the Sacred Heart: attend Mass and receive Holy Communion on nine consecutive first Fridays of the month…" },
  "history": { "en": "The devotion originates from the promises of the Sacred Heart to St. Margaret Mary Alacoque…" },
  "howToPray": { "en": "Attend Holy Mass and receive Communion in a state of grace on the first Friday of each month, for nine consecutive months." },
  "tags": ["first-fridays", "sacred-heart", "9-months"]
}
```

---

## Engine Changes

### `FlowContext`

```typescript
type FlowContext = {
  // ...existing fields...
  programDay?: number     // 0-indexed day within the active program
}
```

### `CycleData.indexBy`

Add `'program-day'` to the union:

```typescript
type CycleData = {
  indexBy: 'day-of-month' | 'day-of-week' | 'fixed' | 'program-day'
  // ...existing fields...
}
```

### `getCycleIndex`

Add one case:
```typescript
if (indexBy === 'program-day') return (context.programDay ?? 0) % length
```

### `resolveSection` — cycle case

When `as === 'template'` and the section has `sections`:
1. Look up the cycle entry (reusing existing cycle lookup logic)
2. Build template vars from the entry's fields (same pattern as `resolveRepeat`)
3. Run `substituteInFlowSection` on each child section
4. Resolve the substituted child sections normally

### `FlowSection` type

Extend the cycle variant to accept optional child sections:
```typescript
| { type: 'cycle'; data: string; key?: string; as: string; sections?: FlowSection[] }
```

---

## Implementation Phases

### Phase 1: Engine + content model
- Add `ProgramConfig` to manifest types
- Add `program-day` indexBy to `CycleData`
- Add `template` output mode to cycle resolution
- Add `programDay` to `FlowContext`
- Create first novena content (Sacred Heart) to validate

### Phase 2: Schedule + progress tracking
- Add `periodic-series` schedule type
- Add `getProgramDay` helper
- Add program cursor repository functions
- Add `useProgramProgress` hook

### Phase 3: Program detail screen
- New route `/practices/[manifestId]/program`
- Day list with progress, navigation to pray screen
- Checklist "Day X of Y" subtitle

### Phase 4: Catalog + start flow
- Program category in catalog
- Duration badge on cards
- "Begin Program" UI with date picker
- Slot + cursor creation on start

### Phase 5: Pray screen + completion
- Thread `programDay` into flow resolution
- Day indicator on pray screen
- Completion detection and modal
- `completionBehavior` handling

### Phase 6: Content
- Novena to the Sacred Heart (9 days, cycle template)
- Novena to Our Lady of Perpetual Help (9 days)
- First Fridays (9 months, periodic series, manual completion)
