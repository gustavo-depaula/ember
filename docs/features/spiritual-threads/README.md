# Spiritual Threads — Intentions, Gratitude, Resolutions, Plan of Life

> Status: Approved design. Phasing in progress.
>
> **Greenfield.** No one uses the current intentions/gratias features. The existing `apps/app/src/features/intentions/`, `apps/app/src/features/gratias/`, the hardcoded Examen screen, and their repositories/event types are to be **deleted and replaced** by the design below. No data migration, no compatibility shims, no schema migration files (per `CLAUDE.md`: solo project, lightweight changes preferred). Old events left in any local DB can be wiped or ignored — the new projection only consumes new event kinds.

## Implementation docs

This file is the product spec — the *what* and *why*. Each phase has a dedicated technical design doc with the *how*: major decisions (alternatives considered, rationale, implications), data model details, and a task list ready for execution.

| Phase | Doc | Goal |
|-------|-----|------|
| 1 | [01-movement-model.md](01-movement-model.md) | Movement projection (replacing intentions/gratitudes stores); cadence (perpetual / goal / bounded) and subject tags; rebuilt `/intentions` and `/gratias` screens. No DSL changes; no prayer integration. |
| 2 | [02-prayer-integration.md](02-prayer-integration.md) | `offering` and `capture-movement` DSL blocks; per-practice pinning; Morning Offering reads active intentions. Movements now flow through prayer. |
| 3 | [03-resolutions-and-examen.md](03-resolutions-and-examen.md) | Resolution model, `capture-resolution` + `review-resolution` DSL blocks, delete the hardcoded Examen, daily resolution loop end-to-end. |
| 4 | [04-plan-of-life.md](04-plan-of-life.md) | Full hierarchy (weekly/monthly/seasonal/annual), Plan of Life Resolutions panel, weekly review practice. |
| 5 | [05-periodic-reviews.md](05-periodic-reviews.md) | Monthly / seasonal / annual review practices; Particular Examen with its own schedule. |
| 6 | [06-companion-features.md](06-companion-features.md) | Saint companion, confession bridge, virtue heatmap, petition→thanksgiving bridge. |

## Context

Today, three core spiritual concepts in Ember are either disconnected from prayer or missing entirely:

- **Intentions** are event-sourced and have a dedicated screen, but they are *never surfaced inside any prayer flow*. A user can write down "praying for Dad" but cannot offer their Rosary for Dad without leaving the app's metaphor.
- **Gratitude** is event-sourced with a dedicated screen, but is similarly disconnected from prayer flows and has no role in the Examen, the Morning Offering, or any thanksgiving practice.
- **Resolutions** do not exist as a feature. The current hardcoded Examen prompts a `propositum` (resolution for tomorrow) and discards it.

The result is that the most personal expressions of a user's prayer life live as parallel side-features rather than being woven into the practices the app exists to support. A traditional Catholic spiritual life integrates these tightly: the rule of life sets resolutions; the Morning Offering presents the day's intentions; intercession threads through the Rosary and Mass; the Examen reviews mercies received, opens new petitions, and sets the next day's resolution.

This spec makes that traditional integration real, while extending it with a true **Plan of Life** — a five-level resolution hierarchy (daily / weekly / monthly / seasonal / annual) anchored to the liturgical calendar and serviced by periodic review practices.

## Vision

> *Three threads run through every Catholic life: petitions raised, mercies received, resolutions kept. Ember holds them together — the Examen writes them at dusk, the Morning Offering reads them at dawn, every prayer in between can carry them.*

## Pillars

1. **One ritual loop.** The Examen at dusk *writes* a daily resolution and surfaces today's gratitudes/petitions. The Morning Offering at dawn *reads* yesterday's resolution and the day's active intentions. Tomorrow's Examen evaluates that resolution and closes the loop.
2. **Prayers carry intentions.** A new flow-DSL `offering` block lets any practice surface the user's intentions/gratitudes at the appropriate liturgical moment. The Rosary's intercessory beat, the Mass's Prayers of the Faithful, a Te Deum — all become real channels for personal prayer.
3. **Defaults + occasion.** A user can pin standing intentions to a practice ("every Rosary is for my family") and add per-occurrence intentions ("today's Rosary also for Maria's surgery"). The traditional practice of habitual offering, made cheap.
4. **The Plan of Life is the rule of life.** Resolutions live at five cadences (daily / weekly / monthly / seasonal / annual), anchored to the liturgical calendar, reviewed by periodic review practices that the app schedules and notifies for.
5. **Everything is a practice.** No more hardcoded ritual screens. The Examen, the Morning Offering, the periodic reviews are all flow.json files driven by the same DSL. New DSL primitives let those flows both *surface* and *capture* spiritual state.

## Concept model

### Movements of prayer

The unifying abstraction at the projection layer. Not a user-facing word — internal vocabulary.

```
Movement {
  id
  kind: 'petition' | 'thanksgiving'
  text
  subject?: { tag: string }              // optional person/group ("mom", "parish")
  cadence?: 'perpetual' | 'goal' | 'bounded'   // petitions only
  bounded_until?: date                   // cadence='bounded' only
  state: 'active' | 'closed'
  closure_kind?: 'answered' | 'expired' | 'retired'   // when state='closed'
  recorded_at
  closed_at?
  notes?
}
```

State semantics are **cadence-aware** — there is no universal open/answered binary. Many traditional Catholic petitions are not goal-shaped; they are *carried*, not *resolved*. "For the sanctification of my family," "for peace in the world," "for the conversion of sinners," "for the souls in purgatory" — these are lifelong intercession.

| Cadence | Lifecycle | Closure |
|---------|-----------|---------|
| `perpetual` | Carried indefinitely; never auto-closes. | User-`retired` only — closure means the user chose to set it down. "Answered" is not the right verb. |
| `goal` | A specific ask awaiting outcome. | User marks `answered` (with optional free-text notes describing the outcome). |
| `bounded` | Active during a window (a novena, a season, a date range). | Auto-`expired` at `bounded_until`; user can also mark `answered` early or `retired`. |

The user-facing affordance per cadence:
- perpetual → "Retire intention" (no "Mark answered" verb)
- goal → "Mark answered"
- bounded → window indicator + auto-expiry; "Mark answered" and "Retire" still available

Backed by **two separate event streams**:
- `PetitionRaised` / `PetitionUpdated` / `PetitionAnswered` / `PetitionExpired` / `PetitionRetired`
- `ThanksgivingOffered` / `ThanksgivingUpdated` / `ThanksgivingRetired`

Two user-facing screens stay distinct (`/intentions`, `/gratias`) — different lifecycles, different moods. The shared picker and the new Offering DSL block consume the unified `Movement` view. This pattern leaves room to add future kinds (lament, oblation, praise) without schema churn.

### Intention configuration

Optional but encouraged at capture time. Default cadence is `perpetual` — most spiritual intentions are carried, not goal-shaped.
- **Cadence**:
  - `perpetual` (default): always carried, never auto-closes. *Examples: "for the sanctification of my family", "for the conversion of sinners", "for the Holy Father".*
  - `goal`: closes when the user marks it answered. *Examples: "for Maria's surgery on Tuesday", "that I find a job".*
  - `bounded`: auto-closes at a date or season. *Examples: "during this novena", "throughout Lent".*
- **Subject tag** — short text label ("mom", "parish", "Holy Father"). Free-form initially. Enables grouping and showing all active petitions for a person.
- **Notes** — captured at "answered" time (for goal/bounded; not used for perpetual closure).

Capture UX makes the cadence choice cheap (a 3-way toggle, default = perpetual) and never demands it — a user who just types "Dad" creates a perpetual intention.

### Resolution

```
Resolution {
  id
  text
  level: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual'
  virtue?: string              // optional tag: 'patience', 'humility', etc.
  parent_id?: id               // higher-level resolution this supports
  starts_at: date
  ends_at?: date               // computed from level + liturgical calendar
  state: 'active' | 'fulfilled' | 'broken' | 'archived'
  reviews: ResolutionReview[]
  source: 'examen' | 'manual' | 'review'
}

ResolutionReview {
  reviewed_at
  outcome: 'kept' | 'partial' | 'broken'
  notes?
}
```

Backed by `ResolutionSet`, `ResolutionRevised`, `ResolutionReviewed`, `ResolutionFulfilled`, `ResolutionBroken`, `ResolutionArchived` events.

### Resolution hierarchy

| Level | Cadence | Lifetime | Review trigger |
|-------|---------|----------|----------------|
| Daily | 1 day | next morning | next Examen |
| Weekly | Sun → Sat | 1 week | Sunday-evening review practice |
| Monthly | 1st of month | 1 month | first-of-month review practice |
| Seasonal | liturgical season (Advent/Christmas/Lent/Easter/Ordinary) | varies | season transition review practice |
| Annual | liturgical year | 1 year | Advent retreat (1st Sunday of Advent) |

Higher levels **scope** lower ones. An annual resolution ("grow in humility") frames seasonal options ("during Lent, daily Rosary"); the Examen can prompt: *"Your monthly resolution is silence at table — what step can you take tomorrow?"*

### Practice ↔ movement pinning

```
PracticePin {
  practice_id
  movement_id
  pinned_at
}
```

Per-practice **default** intentions/gratitudes. The Offering block at runtime presents pinned items pre-selected, plus an "add more for this occurrence" affordance. Per-occurrence selections are *not* persisted as pins (they're a one-shot per practice run).

## Flow DSL extensions

The Examen, the Morning Offering, and the periodic reviews are all practices. The DSL must therefore both **surface** spiritual state inside a flow and **capture/update** it. Four new primitives, all consuming the same Movement / Resolution projections.

### `offering` — surface movements

Display intentions and/or gratitudes at a liturgical moment in a flow.

```jsonc
{
  "type": "offering",
  "mode": "intercessory",          // 'intercessory' | 'thanksgiving' | 'both'
  "label": "For our intentions",
  "default": "pinned",             // 'pinned' | 'all-active' | 'user-pick'
  "show": "list",                  // 'list' | 'count' | 'silent'
  "scope": "practice"              // 'practice' (whole flow) | 'section' (this section)
}
```

- `mode: 'intercessory'` filters movements to `kind: petition, state: active`.
- `mode: 'thanksgiving'` filters to `kind: thanksgiving` (recent N, configurable).
- `mode: 'both'` shows both registers, visually distinct.
- `default: 'pinned'` shows pinned items. `'all-active'` shows every active movement. `'user-pick'` requires the user to have picked at the start.
- The picker presented at practice start adapts to the same `mode`.
- Practices place `offering` at their natural location (Rosary: at intentions before each decade or once at start; Mass: at Prayers of the Faithful; Te Deum: at thanksgiving moment).

### `capture-movement` — write a new petition or thanksgiving

Used in the Examen's Gratitude and Hope & Resolution movements, in the Morning Offering's "anything new today?" moment, and anywhere a flow wants to invite the user to record a movement.

```jsonc
{
  "type": "capture-movement",
  "kind": "petition",              // 'petition' | 'thanksgiving'
  "prompt": "What weighs on your heart tonight?",
  "multi": true,                   // allow capturing many in one block
  "optional": true,                // user can skip
  "defaults": {
    "cadence": "perpetual"         // 'perpetual' | 'goal' | 'bounded' (petition only)
  }
}
```

Writes one event per item: `PetitionRaised` or `ThanksgivingOffered`. Cadence/subject capture follows the same UX as the standalone capture screen (default perpetual; cadence is a 3-way toggle, not a required field).

### `capture-resolution` — write a resolution

Used in the Examen's Hope & Resolution movement and in periodic reviews.

```jsonc
{
  "type": "capture-resolution",
  "level": "daily",                // 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual'
  "for": "next",                   // 'next' (default) | 'current' — which window this resolution is for
  "prompt": "One concrete resolution for tomorrow.",
  "scaffolded_by": "active-higher", // 'active-higher' shows annual/seasonal/monthly above as gentle context; 'none' = no scaffolding
  "optional": false
}
```

Writes a `ResolutionSet` event whose `starts_at`/`ends_at` cover the targeted window:
- `for: 'next'` — the upcoming window at this level (tomorrow's daily, next Sunday→Saturday for weekly, next month, next liturgical season, next liturgical year). This is the dominant case: a review practice writes the resolution that the next cycle will live under.
- `for: 'current'` — the in-progress window (today's daily, this week, etc.). Used when the user is starting a rule mid-cycle.

Window math comes from `packages/liturgical/`: `windowFor(level, anchor='now', for='next' | 'current')`.

### `review-resolution` — review an existing resolution

Used in the Examen (review the day that's ending, or the previous day if missed), Particular Examen (review the active daily mid-day), and periodic reviews.

```jsonc
{
  "type": "review-resolution",
  "target": "pending-daily",       // 'active-daily' | 'pending-daily' | 'active-weekly' | 'pending-weekly' | ... | 'pending-annual'
  "prompt": "Did you keep this resolution?",
  "outcomes": ["kept", "partial", "broken"],
  "allow_notes": true,
  "skip_if_none": true             // skip the block if nothing matches
}
```

Target semantics (per level — same pattern at every level):
- `active-<level>` — the resolution whose window contains "now". Used by mid-cycle check-ins (e.g., Particular Examen at noon: `active-daily`).
- `pending-<level>` — the most-recent unreviewed resolution at this level: prefers the currently-active one if it exists, falls back to the most recent expired one if not. This is what end-of-cycle reviews use, and it's robust to missed days/weeks: an Examen run at 8am the morning after still finds yesterday's daily because today's hasn't been written yet.

Writes a `ResolutionReviewed` event. If `skip_if_none` and there's nothing to review, the block resolves silently.

### The daily loop (explicit)

The resolution model and these primitives compose into the ritual loop the spec opens with. Walking through it concretely with a daily resolution:

```
Tuesday evening  ─ Examen runs ─────────────────────────────────────────
  • review-resolution   target=pending-daily  → reviews R(Tuesday)
                                              writes ResolutionReviewed(R(Tuesday), kept|partial|broken)
  • capture-resolution  level=daily for=next  → writes R(Wednesday)
                                              starts_at=Wed morning, ends_at=Wed end-of-day

Wednesday morning ─ Morning Offering runs ──────────────────────────────
  • read active-daily                          → surfaces R(Wednesday)

Wednesday daytime ─ Particular Examen (optional) ──────────────────────
  • review-resolution   target=active-daily   → reviews R(Wednesday) mid-stride
                                              writes ResolutionReviewed(R(Wednesday), …)

Wednesday evening ─ Examen runs ────────────────────────────────────────
  • review-resolution   target=pending-daily  → reviews R(Wednesday) (now ending)
  • capture-resolution  level=daily for=next  → writes R(Thursday)
…
```

Two timing details worth pinning down:

- **Logical-day cutoff.** The engine treats "today" as the logical day, with a 4am cutoff (configurable). An Examen done at Wed 1am still reviews R(Tuesday) and writes R(Wednesday) — what the user expects.
- **Missed days.** If the user skips Tuesday evening, `pending-daily` on Wednesday morning resolves to R(Tuesday) (most recent unreviewed), so they can still review it during Wednesday's Examen. R(Wednesday) gets written by the next Examen and becomes Thursday's. Days don't compound silently.

The same loop runs at each higher level — weekly review on Sunday writes next week's resolution, monthly on the first writes next month's, etc. — driven by the same two primitives with `level` and `for` parameters changed.

## Examen as a practice (no hardcoded UI)

There are currently two Examens in the codebase:
- **A content practice** at `content/practices/examination-of-conscience/` (`manifest.json` + `flow.json`) with the classical Ignatian 5-movement structure: *Gratitude → Petition for Light → Review of the Day → Sorrow → Hope & Resolution*. It's the right structure but its blocks are inert (text/prayer only — nothing is persisted).
- **A hardcoded screen** at `apps/app/src/app/examen.tsx` with a parallel 6-phase Latin structure (Praesentia / Gratia / Affectus / Peccatum / Propositum / Closing), routed at `/examen`. This is the experiment; `PrayNowCard.tsx` and `explore.tsx` currently send the user here.

We **delete the hardcoded screen** and **rebuild the existing practice flow** in place — keeping its practice id (`examination-of-conscience`) and its 5-movement Ignatian shape, but replacing inert text blocks with the new DSL primitives so the practice actually persists what it captures. Entry points (`PrayNowCard`, `explore.tsx`) are redirected from `/examen` to the practice player loading the practice id.

Sketch of the rebuilt `content/practices/examination-of-conscience/flow.json` (5-movement structure preserved, with a Verificatio block prepended to review yesterday's resolution):

```jsonc
[
  { "type": "section", "title": "Verificatio", "blocks": [
    { "type": "review-resolution", "target": "pending-daily",
      "prompt": "How did this resolution go?", "skip_if_none": true }
  ]},
  { "type": "section", "title": "Gratitude", "blocks": [
    { "type": "text", "ref": "examen-gratitude-prompt" },
    { "type": "capture-movement", "kind": "thanksgiving",
      "prompt": "What graces from today?", "multi": true, "optional": true }
  ]},
  { "type": "section", "title": "Petition for Light", "blocks": [
    { "type": "prayer", "ref": "prayer/come-holy-spirit" }
  ]},
  { "type": "section", "title": "Review of the Day", "blocks": [
    { "type": "text", "ref": "examen-review-prompt" }
  ]},
  { "type": "section", "title": "Sorrow", "blocks": [
    { "type": "text", "ref": "examen-sorrow-prompt" },
    { "type": "prayer", "ref": "prayer/act-of-contrition" }
  ]},
  { "type": "section", "title": "Hope & Resolution", "blocks": [
    { "type": "offering", "mode": "intercessory", "default": "all-active", "show": "list" },
    { "type": "capture-movement", "kind": "petition",
      "prompt": "Anything new to lift up?", "multi": true, "optional": true,
      "defaults": { "cadence": "perpetual" } },
    { "type": "capture-resolution", "level": "daily", "for": "next",
      "prompt": "One concrete resolution for tomorrow.",
      "scaffolded_by": "active-higher" }
  ]}
]
```

The structure follows the existing Ignatian 5 movements, with Verificatio as a brief leading review (skipped silently if no resolution exists yet). "Movements of the heart" (Affectus) from the hardcoded screen are not modeled now; if they become a first-class thread later, a new primitive and section slot in cleanly.

The Particular Examen and the four periodic reviews are built from the same primitives — only the configuration differs (e.g., `review-resolution` with `target: 'pending-weekly'` and `capture-resolution` with `level: 'weekly'`).

## Morning Offering — the reader

The Morning Offering practice is updated to:
1. Open with **today's daily resolution** (read aloud / displayed as the day's intent).
2. Show **active intentions** with subject grouping via an `offering` block.
3. Include a `capture-movement` block (`kind: petition`, optional) for "anything new this morning?"
4. Optionally surface a saint companion if one is tied to a current resolution (deferred to later phase).

## Plan of Life — the rule

The existing Plan of Life screen (`apps/app/src/features/plan-of-life/`) gets a **Resolutions panel** above the tier/time-block grid:

```
┌───────────────────────────────────────────────┐
│ Today's resolution                            │
│   "Don't interrupt Maria"                     │
│   ✓ kept   ⚠ partial   ✗ broken              │
├───────────────────────────────────────────────┤
│ Standing resolutions                          │
│   Annual (AD 2026): Grow in humility          │
│   Seasonal (Lent): Daily Rosary               │
│   Monthly (Nov): Silence at table             │
│   Weekly (Wk 45): Read Sunday's readings      │
│   Next review: Sunday Nov 9 (weekly)          │
├───────────────────────────────────────────────┤
│ [Tier/time-block grid as today]              │
└───────────────────────────────────────────────┘
```

The panel is collapsible. Each standing resolution shows kept/broken streak.

## Periodic review practices

Each review is a regular Ember practice with its own flow.json, built entirely from the four new DSL primitives.

- **Particular Examen** (`particular-examen`) — short, ~3 min. Scheduled multiple times per day. Uses `review-resolution { target: 'active-daily' }` (mid-stride check-in on today's resolution).
- **Weekly Review** (`weekly-review`) — Sunday evening. Uses `review-resolution { target: 'pending-weekly' }`, an `offering { mode: 'thanksgiving' }` to surface the week's gratitudes, and `capture-resolution { level: 'weekly', for: 'next' }`.
- **Monthly Review** (`monthly-review`) — first Sunday of the month. Same shape, `monthly` level.
- **Seasonal Review** (`seasonal-review`) — fires at liturgical season transitions (handled by `packages/liturgical/`). `seasonal` level.
- **Annual Review** (`annual-review`) — first Sunday of Advent. `annual` level.

All reviews are essential-tier when the user opts in to that level of the rule. Notifications use the existing schedule mechanism (no new infra).

## Notifications

No new notification infrastructure. The review practices are scheduled like any other practice; the existing scheduling + notification system fires them. Particular Examens use the practice's standard schedule to fire at e.g. noon and 18:00.

## Critical files

### Deleted (greenfield rewrite)
- `apps/app/src/app/examen.tsx` — the hardcoded Examen screen and any helpers it owns. The `/examen` route is removed; entry points are redirected to the practice player loading practice id `examination-of-conscience`.
- All `examen.*` i18n strings tied only to the hardcoded screen (those reused by the practice flow stay).
- `apps/app/src/features/intentions/` — entire folder.
- `apps/app/src/features/gratias/` — entire folder.
- `apps/app/src/db/repositories/intentions.ts`.
- `apps/app/src/db/repositories/gratias.ts`.
- Existing intention/gratitude event types in `apps/app/src/db/events/state.ts` (and any related files).

### New
- `apps/app/src/db/repositories/movements.ts` — single repository emitting Petition*/Thanksgiving* events and exposing the unified Movement projection.
- `apps/app/src/db/repositories/resolutions.ts` — emit resolution events; expose active-resolution view + helpers (`activeDaily`, `activeAtLevel`, `closingFor(target)`).
- `apps/app/src/db/repositories/practice-pins.ts` — per-practice movement pins.
- `apps/app/src/features/movements/` — shared list/capture/picker components, parameterized by `kind`.
- `apps/app/src/features/resolutions/` — hooks, components, panel for Plan of Life.
- `apps/app/src/app/intentions/index.tsx` — thin screen using `<MovementList kind="petition" />`.
- `apps/app/src/app/gratias/index.tsx` — thin screen using `<MovementList kind="thanksgiving" />`.
- `content/practices/particular-examen/` — manifest + flow.
- `content/practices/weekly-review/`, `monthly-review/`, `seasonal-review/`, `annual-review/` — manifests + flows.

### Extended
- `apps/app/src/db/events/state.ts` — add Petition/Thanksgiving/Resolution/PracticePin event types; Movement projection logic.
- `apps/app/src/db/events/projections.ts` — projection from event log into Movement view + active-resolution view.
- `apps/app/src/features/plan-of-life/components/` — Resolutions panel above the tier/time-block grid.
- `packages/content-engine/src/types.ts` — `OfferingBlock`, `CaptureMovementBlock`, `CaptureResolutionBlock`, `ReviewResolutionBlock` types.
- `packages/content-engine/src/engine.ts` — resolve all four new blocks via injected `EngineContext` deps (the engine stays practice-agnostic; movement/resolution stores are dependencies).
- `apps/app/src/components/practice/` — render the four new block kinds.
- `content/practices/examination-of-conscience/flow.json` — rewrite in place using the new DSL primitives, preserving the existing 5-movement Ignatian structure (Gratitude → Petition for Light → Review of the Day → Sorrow → Hope & Resolution), prepended with a Verificatio review block. Keep the practice id; bump manifest version.
- `apps/app/src/components/home/PrayNowCard.tsx` — redirect the evening Examen recommendation from `/examen` to the practice player with id `examination-of-conscience`.
- `apps/app/src/app/explore.tsx` — same redirect for the Examen home card.
- `content/practices/morning-offering/flow.json` — read daily resolution + add Offering block + optional capture-movement. Bump manifest version.
- `docs/features/features-overview.md` — add Movements, Resolutions, and the four new primitives.
- `docs/features/unified-flow-system.md` — document the four new primitives in the DSL reference.
- `packages/liturgical/` — expose helpers for "is today first Sunday of month / Advent / season transition", and `windowFor(level, date)` returning `{ starts_at, ends_at }` used by `capture-resolution`.

## Phasing

Each phase ships independently — the user can stop after any of them and have a coherent, useful slice. See per-phase docs (linked at the top of this file) for technical detail and task lists.

- **Phase 1 — Movement model.** Replace intentions/gratias stores with the unified Movement projection; capture cadence (perpetual / goal / bounded) + subject tags; rebuild `/intentions` and `/gratias` screens. No DSL changes yet.
- **Phase 2 — Prayer integration.** `offering` and `capture-movement` DSL blocks; per-practice pinning; Morning Offering reads active intentions. Movements now flow through prayer.
- **Phase 3 — Resolutions + new Examen.** Resolution event model; `capture-resolution` and `review-resolution` blocks; delete the hardcoded Examen and ship the flow-based one; daily resolution writes/reads end-to-end.
- **Phase 4 — Plan of Life as rule.** Full hierarchy (weekly/monthly/seasonal/annual), Plan of Life Resolutions panel, weekly review practice.
- **Phase 5 — Periodic reviews + Particular Examen.** Monthly / seasonal / annual review practices. Particular Examen with its own schedule.
- **Phase 6 — Companion features.** Saint companion tied to active resolution, confession bridge from Examen patterns, virtue heatmap, petition→thanksgiving bridge (see Future considerations).

## Future considerations (note for later, out of scope here)

- **Petition → Thanksgiving bridge.** When a goal-petition is marked answered, or a bounded petition reaches its window's end, there is a natural moment to invite thanksgiving: *"Your petition for Maria's surgery has been answered. Would you like to record a gratitude?"* This could be a small UI affordance on closure, an entry in the next Examen's Gratitude movement pre-populated with closed petitions from the day, or a dedicated `bridge-closed-petitions` DSL primitive that surfaces recently-closed petitions and offers to convert them into thanksgivings. Worth designing in Phase 5; the data model already supports it (closed petitions are queryable by `closure_kind` and `closed_at`).
- **Affectus as a fourth thread.** "Movements of the heart" (consolation/desolation) could become a first-class kind alongside petition/thanksgiving. Would need its own capture primitive, its own Examen step, and probably its own screen. Out of scope; the kind-discriminated Movement model leaves room for it without churn.

## Open questions (deferred)

- Should higher-level resolutions auto-suggest daily ones during the Examen, or just be visible? *Lean: visible + gentle prompt, never auto-fill.*
- Should Particular Examens be tied to a specific resolution by default, or to today's daily resolution? *Lean: today's daily.*
- How does the Plan of Life surface resolution streaks visually — separate heatmap, or merged into the fidelity wall? *Defer to design.*
- Saint companion: does it pick a saint, or does the user pick? *Defer.*

## Verification

End-to-end checks once implemented:

- A user captures a perpetual intention "for the sanctification of my family" with no cadence selected; it defaults to perpetual; it appears in /intentions with no "Mark answered" verb (only "Retire"); it never auto-closes; the Examen never asks "did this get answered?"
- A user captures a goal intention "for Maria's surgery on Tuesday"; marks it answered Wednesday with notes "surgery went well"; it closes with `closure_kind: 'answered'`.
- A user captures a bounded intention "during this novena", `bounded_until=`novena end date; it auto-closes with `closure_kind: 'expired'` on that date; it disappears from active intercession in the Offering picker.
- A user pins two intentions to "Rosary" practice; starts the Rosary; sees both pinned + an "add more" affordance; finishes; per-occurrence additions do not persist as pins.
- The full daily loop runs end to end: Tuesday-evening Examen reviews `pending-daily` (R(Tue)) and writes a new `daily/for=next` ResolutionSet (R(Wed)). Wednesday-morning Morning Offering reads the active-daily and surfaces R(Wed). Wednesday-evening Examen reviews `pending-daily` (now R(Wed)) and writes R(Thu). No daily resolution is ever orphaned across that loop.
- An Examen run at Wed 1am still reviews R(Tue) and writes R(Wed) — the 4am logical-day cutoff is honored.
- If the user skips Tuesday-evening Examen, Wednesday's Examen still finds R(Tue) via `pending-daily` and reviews it; R(Wed) is then written and becomes Thursday's. Missed days don't compound silently.
- The Examen is opened via the home card or Pray Now: it routes through the practice player to `examination-of-conscience` (no `/examen` route exists).
- Gratitude writes ThanksgivingOffered events; Hope & Resolution writes PetitionRaised events (default cadence=perpetual) plus the daily ResolutionSet.
- On a Sunday evening, the weekly review practice is queued; running it calls `review-resolution { target: 'pending-weekly' }`, surfaces the week's gratitudes, and writes a weekly `ResolutionSet`.
- On the first Sunday of Advent, the annual review practice is queued.
- A particular examen scheduled for noon fires a notification, and running it records a `ResolutionReviewed` event for the active daily resolution.
- The hardcoded `apps/app/src/app/examen.tsx` no longer exists; the Examen route resolves to the practice player loading the flow from `content/practices/examination-of-conscience/`.
- Run `pnpm test` from root after each phase: existing tests pass, new tests cover the Movement projection, Resolution lifecycle (set → review → close), all four DSL block resolutions, and review practice scheduling.
