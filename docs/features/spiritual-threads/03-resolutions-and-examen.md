# Phase 3 — Resolutions and the New Examen

> Status: Design ready. Depends on Phases 1 and 2.
>
> Predecessors: Phase 2 (Prayer Integration) for the engine extension pattern. Successors: Phase 4 builds the Plan of Life UI on this resolution model; Phase 5 schedules periodic reviews against it.

## Goal

User-visible: the daily ritual loop is closed. The Examen at night reviews the day's resolution and writes tomorrow's; the Morning Offering reads the day's resolution and surfaces it. The hardcoded `/examen` screen is replaced by the practice player loading `examination-of-conscience`. Resolutions become a first-class concept the user can see written down (still daily-only this phase; higher cadences arrive in Phase 4).

Technical: introduce the **Resolution** event-sourced model, two new DSL primitives (`capture-resolution`, `review-resolution`), a unified review-resolution primitive that operates in three **modes** (show / checkin / review), the **logical-day cutoff** semantics (4am), and the rewritten Examen practice flow. The hardcoded screen and its i18n strings are deleted; entry points (`PrayNowCard`, `explore.tsx`) are rerouted.

## Out of scope (later phases)

- Higher-level resolutions (weekly / monthly / seasonal / annual) — they exist in the data model from this phase, but their **review and capture flows live in Phase 4** (Plan of Life) and **Phase 5** (Periodic reviews). The DSL primitives accept the higher levels, but no review practice flow consumes them yet.
- Plan of Life Resolutions panel UI — Phase 4.
- Particular Examen — Phase 5.
- Petition → thanksgiving bridge on closure — Phase 6.

## Architectural context

Inherited:
- Phase 1 Movement projection and event sourcing pattern.
- Phase 2 DSL extension pattern (resolver per block type, `EngineContext` deps, player-side render components).
- Existing examen practice at `content/practices/examination-of-conscience/` with the 5-movement Ignatian structure (Gratitude → Petition for Light → Review of the Day → Sorrow → Hope & Resolution). Inert text/prayer blocks today; we keep the structure and replace the blocks.
- Hardcoded `apps/app/src/app/examen.tsx` (172 lines, `phases` array, animated state machine). Routed at `/examen`. Referenced from `apps/app/src/app/explore.tsx` and `apps/app/src/components/home/PrayNowCard.tsx`.
- `packages/liturgical/` exports season computation (`getLiturgicalSeason`, `computeEaster`, `getFirstSundayOfAdvent`, …) and date predicates (`dateInRange`, etc.). No `windowFor` helper today — this phase adds it.

## Major decisions

### 1. Resolution data shape — stored state vs derived

**Context.** A resolution has a window (`starts_at`, `ends_at`) and possibly multiple checkins plus one closing review. "Active" / "closed" / "fulfilled" / "broken" could all be stored or all be derived.

**Options.**
- **A. Store every state.** `state: 'active' | 'fulfilled' | 'broken' | 'archived'` with explicit transition events.
- **B. Derive state from window + reviews.** `state` is computed: active while `now < ends_at`; closed otherwise. Outcome (kept / partial / broken) lives on the closing Review event, not the Resolution.

**Decision.** **B.** The window is structural data; the outcome is review data. Mixing them inflates the event surface and creates ambiguity (e.g., `ResolutionFulfilled` vs `ResolutionReviewed { outcome: 'kept' }` would mean almost the same thing).

**Implications.**
- Resolution events: `ResolutionSet`, `ResolutionRevised`, `ResolutionCheckin`, `ResolutionReviewed`, `ResolutionArchived`. Five total.
- Projection has `resolutions: Map<id, Resolution>` and `resolutionReviews: Map<id, Review[]>` separately.
- "Kept streak" is a query against reviews, not against resolution state.

### 2. Two review event types — Checkin vs Reviewed

**Context.** A Particular Examen at noon checks in on the active daily resolution mid-stride. The night Examen makes the closing review. Both write something to the resolution's history. Are they the same event or different?

**Options.**
- **A. Single `ResolutionReviewed` event** with a `mode` field on the event payload.
- **B. Two events**: `ResolutionCheckin` (any number, mid-stride) and `ResolutionReviewed` (exactly one closing review per resolution).

**Decision.** **B.** The cardinality is different (N vs 1) and the closure semantics is different (only Reviewed marks "this resolution has had its closing review"). Separating them lets `pending-<level>` resolve correctly: a resolution with a Checkin but no Reviewed is still pending.

**Implications.**
- Particular Examen (Phase 5) writes `ResolutionCheckin`.
- Night Examen writes `ResolutionReviewed`.
- `pending-<level>` resolver: most-recent resolution at this level with **no** `ResolutionReviewed` event. Active or expired both qualify.
- A resolution can accumulate many Checkins; their outcomes inform the kept-streak heuristic later, but Reviewed is the canonical close.

### 3. `review-resolution` block — three modes

**Context.** The same primitive is used to *display* a resolution (Morning Offering's "today's resolution" header), to *check in* (Particular Examen mid-day), and to *review* (Examen at night). They all resolve to the same target (a Resolution by id), they all need to render the resolution's text, but only the latter two write events.

**Options.**
- **A. Three separate primitives** (`show-resolution`, `checkin-resolution`, `review-resolution`).
- **B. One primitive with a `mode` field.** Default mode is `review`; `show` is read-only; `checkin` writes a `ResolutionCheckin` event.

**Decision.** **B.** Holds the four-primitive count. The DSL surface is smaller. Behavior is mode-keyed at the player layer.

**Implications.** The original spec's `review-resolution` shape gains a `mode` field. See *Data model → DSL types* below.

### 4. Logical-day cutoff (4am)

**Context.** A user doing the Examen at 1am Wednesday is conceptually "Tuesday night." Without a logical-day cutoff, the Examen would treat 1am Wed as Wednesday, review the wrong resolution, and write tomorrow's for Thursday instead of Wednesday.

**Options.**
- **A. Hardcoded 4am.** Simple, opinionated.
- **B. User-configurable** in preferences.
- **C. No cutoff** — use civil midnight.

**Decision.** **B**, default 4am. Most users will never touch it; night-shift users can move it.

**Implications.**
- New helper `logicalDay(now: Date, cutoff_h?: number): { date: Date }` in `packages/liturgical/src/`. `cutoff_h` defaults to 4. Returns the logical-day midnight (so `at 1:30am Wed with cutoff 4` → Tuesday's midnight).
- A user-preference key `logicalDayCutoffHour` (defaulting to 4) read at every call site.
- All "is it today?" predicates in this feature go through `logicalDay`. Other parts of the app (calendar UI, completion stamps) keep civil-day for now; we don't propagate the cutoff globally.

### 5. Window math — `windowFor(level, anchor, for)`

**Context.** `capture-resolution` needs to know what window it's targeting. `for: 'next'` from a Tuesday-evening Examen means the Wednesday window; from a Sunday-evening weekly review means next-Sun-to-Sat; from a Lent-end seasonal review means Easter season.

**Decision.** A single helper:

```ts
function windowFor(
  level: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual',
  anchor: Date,
  forward: 'current' | 'next' = 'next',
): { starts_at: number; ends_at: number }
```

`anchor` is "now in user's local timezone, possibly logical-day-shifted." Implementation table:

| Level | `current` | `next` |
|-------|-----------|--------|
| daily | logical-day(anchor).start … logical-day(anchor).end | logical-day(anchor + 1d).start … end |
| weekly | nearest Sun ≤ anchor … the following Sat 23:59 | following Sun … Sat |
| monthly | 1st of month containing anchor … last day | 1st of next month … last day |
| seasonal | start of liturgical season containing anchor … end | start of next season … end |
| annual | 1st Sunday of Advent ≤ anchor … day before next 1st Sunday of Advent | next 1st Sunday of Advent … day before the one after |

**Implications.**
- `packages/liturgical/src/windows.ts` (new file) implements `windowFor` plus internal helpers (`startOfLiturgicalSeason`, `endOfLiturgicalSeason`, `liturgicalYearWindow`, etc.). Reuses existing `getLiturgicalSeason`, `getFirstSundayOfAdvent`, `computeEaster`.
- Edge cases: a daily resolution set on Saturday Dec 31 with `for: 'next'` is for Sunday Jan 1 — straightforward. A seasonal resolution set on Ash Wednesday with `for: 'next'` is for Easter season (skipping the rest of Lent) — this is the *correct* read of "the next seasonal window," and the seasonal review practice (Phase 5) is what triggers transitions.
- Tests must cover: year boundaries, leap years, Ash Wednesday in late Feb / early March, Advent at the very end of December.

### 6. `pending-<level>` and `active-<level>` resolution

**Context.** Phase 0 spec defined these but didn't pin the SQL/projection logic. With the events from Decision 1+2 in hand:

**Definitions.**
- `active-<level>`: the resolution at this level whose window contains `logicalDay(now).start` (i.e., the in-progress one). At most one — multiple `ResolutionSet` events at the same (level, window) collapse via Decision 9. Returns `undefined` if none.
- `pending-<level>`: the most-recent unreviewed resolution at this level. "Unreviewed" = no `ResolutionReviewed` event for that resolution id. Prefers an active one if it exists; otherwise falls back to the most recently expired. Returns `undefined` only if no resolutions exist at all at this level.

**Implications.** Selectors in the Zustand store, exposed via:
```ts
useActiveResolution(level)
usePendingResolution(level)
useResolutions({ level, window?, state? })   // generic
```

Both selectors are pure functions of the projection — no async, no SQL.

### 7. Idempotency on resolution capture

**Context.** What if a user runs the Examen twice in one night and both write a "next daily" resolution?

**Options.**
- **A. Block the second.** UI prevents reopening the Examen if today's already done.
- **B. Replace the first.** The second write emits `ResolutionRevised`, the projection updates the existing resolution.
- **C. Allow duplicates; latest wins.** Each `ResolutionSet` creates a new resolution; selectors pick the most-recent by `recorded_at`.

**Decision.** **B.** When `capture-resolution` runs, it first checks the projection for an existing resolution at the same (level, target window). If one exists, the block prefills the input and emits `ResolutionRevised` on submit. If not, it emits `ResolutionSet`.

**Implications.**
- The capture block UI shows a soft hint "You already wrote one for tomorrow — editing it" when prefilling.
- `ResolutionRevised` events update text, virtue, parent_id; the resolution id stays stable so review history is preserved.
- This also handles the "I changed my mind 5 minutes after writing" case naturally.

### 8. `scaffolded_by: 'active-higher'`

**Context.** When capturing a daily, the user benefits from seeing their active monthly/seasonal/annual resolutions as gentle context.

**Decision.** Read-only display above the input. Pulls from `useActiveResolution('monthly')`, `useActiveResolution('seasonal')`, `useActiveResolution('annual')`. Renders as compact cards: level badge + text. No auto-fill, no link, no parent_id auto-set.

**Implications.**
- The capture-resolution block resolves with `scaffolded_by` carried through; the player renders the scaffolding section above the input.
- If no higher-level resolutions exist (common until Phase 4 ships), the scaffolding section is silent (no empty state).

### 9. Resolution model — fields

```
Resolution {
  id: string                     // UUID
  text: string
  level: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual'
  virtue?: string                // optional tag
  parent_id?: string             // optional explicit link to a higher resolution (manual; not auto-set by scaffolded_by)
  starts_at: number              // epoch ms (window start, computed at write time)
  ends_at: number                // epoch ms (window end)
  recorded_at: number            // when ResolutionSet was emitted
  source: 'examen' | 'manual' | 'review'   // which entry path created it
  archived_at?: number           // set by ResolutionArchived
}

Review {
  resolution_id: string
  kind: 'checkin' | 'review'
  outcome: 'kept' | 'partial' | 'broken'
  notes?: string
  reviewed_at: number
}
```

`parent_id` is wired in but unused this phase (no UI). Phase 4 introduces the panel that can set it. We expose the field now to avoid a later schema change.

### 10. Hardcoded Examen — full deletion

**Context.** `apps/app/src/app/examen.tsx` is 172 lines of bespoke UI. Two callers (PrayNowCard, explore.tsx) push to `/examen`. The replacement is the practice player at the practice id `examination-of-conscience`.

**Decision.** Delete the file. Delete the route. Update both callers to navigate to the practice player route (typically `/practice/[id]` per existing convention — verify in the codebase). Audit `apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts` for `examen.title`, `examen.phases.*` keys; remove any not also referenced by the practice flow's `LocalizedText`.

**Implications.**
- A `git grep "/examen"` after this phase should return zero application references.
- Any deep links that exist (e.g., from a notification scheduled in a previous app version) need a fallback — the route file can be replaced with a thin redirect for one release, then removed. Decision: skip the redirect (greenfield posture; solo user); just delete.

### 11. Examen flow — replace the data-driven pattern with explicit sections

**Context.** The current `flow.json` uses `data.questions` as a list and a `repeat` block to walk it, outputting heading + meditation per item. The new flow needs heterogeneous sections (capture-movement here, review-resolution there, prayer ref elsewhere) and can't fit that pattern cleanly.

**Decision.** Rewrite `flow.json` with explicit top-level sections — one per Ignatian movement plus a leading Verificatio. The `data.questions` array is removed. See *Data model → Examen flow.json* below for the full draft.

**Implications.**
- Localized text is inlined as `LocalizedText` objects on each `text`/`prayer` block (matching the rest of the corpus's convention).
- The flow length is similar (~80 lines of JSON) but reads more linearly.
- Manifest `version` bump.

### 12. Verifying prayer refs and creating missing text refs

**Context.** The flow references `prayer/come-holy-spirit` (Petition for Light) and `prayer/act-of-contrition` (Sorrow). It also references three text refs: `examen-gratitude-prompt`, `examen-review-prompt`, `examen-sorrow-prompt`.

**Decision.** Verify both prayer refs already exist in the corpus (`content/prayers/`). Create any missing ones as plain prayer YAML/JSON entries with English+PT-BR text. Create the three text refs in `content/text-snippets/` (or wherever short prompts live — verify existing convention; otherwise inline as `LocalizedText` directly in `flow.json`).

**Implications.** Possible `content/build-corpus.py` rerun. Manifest version bump applies.

## Data model

### Resolution event types

```ts
type ResolutionSet = {
  type: 'ResolutionSet'
  id: string                // resolution id
  level: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual'
  text: string
  virtue?: string
  parent_id?: string
  starts_at: number
  ends_at: number
  source: 'examen' | 'manual' | 'review'
  recorded_at: number
}

type ResolutionRevised = {
  type: 'ResolutionRevised'
  id: string
  text?: string
  virtue?: string | null
  parent_id?: string | null
  revised_at: number
}

type ResolutionCheckin = {
  type: 'ResolutionCheckin'
  resolution_id: string
  outcome: 'kept' | 'partial' | 'broken'
  notes?: string
  reviewed_at: number
}

type ResolutionReviewed = {
  type: 'ResolutionReviewed'
  resolution_id: string
  outcome: 'kept' | 'partial' | 'broken'
  notes?: string
  reviewed_at: number
}

type ResolutionArchived = {
  type: 'ResolutionArchived'
  id: string
  archived_at: number
}
```

### Projection extensions

```ts
type EventState = {
  // ... Phases 1+2 fields
  resolutions: Map<string, Resolution>
  resolutionReviews: Map<string, Review[]>
  resolutionsByLevel: Map<Resolution['level'], Set<string>>
}
```

### DSL types — refined `review-resolution`

```ts
// packages/content-engine/src/types.ts

type CaptureResolutionBlock = {
  type: 'capture-resolution'
  level: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual'
  for?: 'current' | 'next'                 // default: 'next'
  prompt: LocalizedText
  scaffolded_by?: 'active-higher' | 'none'  // default: 'none'
  optional?: boolean                        // default: false
}

type ReviewResolutionBlock = {
  type: 'review-resolution'
  mode?: 'review' | 'checkin' | 'show'      // default: 'review'
  target:
    | 'active-daily'   | 'pending-daily'
    | 'active-weekly'  | 'pending-weekly'
    | 'active-monthly' | 'pending-monthly'
    | 'active-seasonal' | 'pending-seasonal'
    | 'active-annual'  | 'pending-annual'
  prompt?: LocalizedText                    // ignored when mode='show'
  outcomes?: Array<'kept' | 'partial' | 'broken'>   // default: all three; ignored when mode='show'
  allow_notes?: boolean                     // default: true
  skip_if_none?: boolean                    // default: false
}
```

### Resolved (rendered) shapes

```ts
type RenderedCaptureResolution = {
  type: 'rendered-capture-resolution'
  level: CaptureResolutionBlock['level']
  forward: 'current' | 'next'
  prompt: BilingualText
  scaffolding?: { level: Resolution['level']; text: string }[]   // active higher resolutions
  prefill?: { resolution_id: string; text: string }              // when revising an existing one
}

type RenderedReviewResolution = {
  type: 'rendered-review-resolution'
  mode: 'review' | 'checkin' | 'show'
  resolution?: Resolution                   // undefined if no target match (engine + skip_if_none)
  prompt?: BilingualText
  outcomes: Array<'kept' | 'partial' | 'broken'>
  allow_notes: boolean
}
```

### Engine context extension

```ts
type EngineContext = {
  // ... Phase 2 fields (movements?)
  resolutions?: {
    active(level: Resolution['level']): Resolution | undefined
    pending(level: Resolution['level']): Resolution | undefined
    activeHigher(thanLevel: Resolution['level']): Resolution[]
  }
  logicalDay?(): Date          // host injects with user's cutoff applied
  windowFor?(level: Resolution['level'], anchor: Date, forward: 'current' | 'next'): { starts_at: number; ends_at: number }
}
```

The engine reads only. Writes happen at the player layer (same as Phase 2).

### Examen `flow.json` (draft)

```jsonc
{
  "version": 2,
  "sections": [
    {
      "type": "section",
      "title": { "en-US": "Verificatio", "pt-BR": "Verificação" },
      "blocks": [
        {
          "type": "review-resolution",
          "mode": "review",
          "target": "pending-daily",
          "prompt": { "en-US": "How did this resolution go?", "pt-BR": "Como foi esta resolução?" },
          "skip_if_none": true
        }
      ]
    },
    {
      "type": "section",
      "title": { "en-US": "Gratitude", "pt-BR": "Gratidão" },
      "blocks": [
        { "type": "prose", "text": { "en-US": "Where did God meet you today? Where did grace surprise you?", "pt-BR": "Onde Deus o encontrou hoje? Onde a graça o surpreendeu?" } },
        {
          "type": "capture-movement",
          "kind": "thanksgiving",
          "prompt": { "en-US": "What graces from today?", "pt-BR": "Quais graças deste dia?" },
          "multi": true,
          "optional": true
        }
      ]
    },
    {
      "type": "section",
      "title": { "en-US": "Petition for Light", "pt-BR": "Petição pela Luz" },
      "blocks": [
        { "type": "prayer", "ref": "prayer/come-holy-spirit" }
      ]
    },
    {
      "type": "section",
      "title": { "en-US": "Review of the Day", "pt-BR": "Revisão do Dia" },
      "blocks": [
        { "type": "prose", "text": { "en-US": "Walk through the day. Where did you fail in love? Where did fear or pride steer you?", "pt-BR": "Reveja o dia. Onde você falhou no amor? Onde o medo ou o orgulho o guiaram?" } }
      ]
    },
    {
      "type": "section",
      "title": { "en-US": "Sorrow", "pt-BR": "Contrição" },
      "blocks": [
        { "type": "prose", "text": { "en-US": "Hand it over. Ask for mercy.", "pt-BR": "Entregue tudo. Peça misericórdia." } },
        { "type": "prayer", "ref": "prayer/act-of-contrition" }
      ]
    },
    {
      "type": "section",
      "title": { "en-US": "Hope & Resolution", "pt-BR": "Esperança e Resolução" },
      "blocks": [
        {
          "type": "offering",
          "mode": "intercessory",
          "default": "all-active",
          "show": "list"
        },
        {
          "type": "capture-movement",
          "kind": "intention",
          "prompt": { "en-US": "Anything new to lift up?", "pt-BR": "Algo novo para apresentar a Deus?" },
          "multi": true,
          "optional": true,
          "defaults": { "cadence": "perpetual" }
        },
        {
          "type": "capture-resolution",
          "level": "daily",
          "for": "next",
          "prompt": { "en-US": "One concrete resolution for tomorrow.", "pt-BR": "Uma resolução concreta para amanhã." },
          "scaffolded_by": "active-higher"
        }
      ]
    }
  ]
}
```

### Morning Offering — minimal extension

Adds one block at the top of the existing flow:

```jsonc
{
  "type": "review-resolution",
  "mode": "show",
  "target": "active-daily",
  "skip_if_none": true
}
```

Phase 2 already added `offering` and `capture-movement` here. With this addition the user sees: today's resolution → today's intentions → "anything new this morning?"

## Module structure

### Created

| File | Purpose |
|------|---------|
| `packages/liturgical/src/windows.ts` | `windowFor(level, anchor, forward)`, `logicalDay(now, cutoff?)`. Reuses existing season helpers. |
| `apps/app/src/db/repositories/resolutions.ts` | `setResolution`, `reviseResolution`, `checkinResolution`, `reviewResolution`, `archiveResolution`. Each emits exactly one event. |
| `apps/app/src/features/resolutions/hooks.ts` | `useActiveResolution(level)`, `usePendingResolution(level)`, `useResolutions(filter)`, `useResolutionReviews(id)`, plus mutation hooks. |
| `apps/app/src/features/resolutions/index.ts` | Barrel. |
| `apps/app/src/features/practice/blocks/RenderedReviewResolutionBlock.tsx` | Renders the `review-resolution` block in all three modes. |
| `apps/app/src/features/practice/blocks/RenderedCaptureResolutionBlock.tsx` | Renders capture with optional scaffolding. |
| `packages/content-engine/src/blocks/review-resolution.ts` | Resolver. |
| `packages/content-engine/src/blocks/capture-resolution.ts` | Resolver. |
| `packages/liturgical/__tests__/windows.test.ts` | Window math tests across cadences and edges. |
| `packages/content-engine/__tests__/review-resolution.test.ts` |  |
| `packages/content-engine/__tests__/capture-resolution.test.ts` |  |
| `apps/app/src/db/events/__tests__/resolutions-projection.test.ts` |  |

### Extended

- `apps/app/src/db/events/types.ts` — five new event types per *Data model*.
- `apps/app/src/db/events/state.ts` — `resolutions`, `resolutionReviews`, `resolutionsByLevel`.
- `apps/app/src/db/events/projections.ts` — five new arms.
- `packages/content-engine/src/types.ts` — `CaptureResolutionBlock`, `ReviewResolutionBlock` in `FlowSection`.
- `packages/content-engine/src/engine.ts` — extend `EngineContext`; add `case 'capture-resolution'` and `case 'review-resolution'` arms.
- `apps/app/src/components/practice/PracticePlayer.tsx` — render the two new block types; on `capture-resolution` submit, call `setResolution` or `reviseResolution`; on `review-resolution` submit, call `reviewResolution` or `checkinResolution` per mode.
- `apps/app/src/lib/preferences.ts` (or equivalent user-prefs store) — add `logicalDayCutoffHour: number = 4`.
- `content/practices/examination-of-conscience/flow.json` — full rewrite per *Examen flow.json* draft.
- `content/practices/examination-of-conscience/manifest.json` — `version` bump.
- `content/practices/morning-offering/flow.json` — prepend the `review-resolution { mode: 'show', target: 'active-daily' }` block. Manifest version bump.
- `apps/app/src/components/home/PrayNowCard.tsx` — replace `'/examen'` href with the practice-player route for `examination-of-conscience`.
- `apps/app/src/app/explore.tsx` — same.
- `apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts` — remove `examen.title`, `examen.phases.*`. Add new strings for capture/review block UI (outcome buttons, "skip", "edit existing", scaffolding labels).
- `docs/features/unified-flow-system.md` — document `capture-resolution` and `review-resolution`.
- `docs/features/features-overview.md` — link Resolutions section.

### Deleted

- `apps/app/src/app/examen.tsx`.
- The `/examen` route entry (Expo Router file-based).
- Stale i18n keys.
- Phase 1's transitional no-op arms for old `Intention*` / `Gratitude*` events (any local DBs from before Phase 1 are now well past their wipe horizon).

## Tasks

1. **Liturgical helpers.** `windowFor` + `logicalDay`. Tests cover at least: ordinary daily wrap; week containing a year-boundary; month with leap day; Lent → Easter season; Advent year-roll. *Tests green before continuing.*
2. **Resolution events + projection.** Type-define five events; extend `EventState`; add `applyEvent` arms; index by level. *Projection tests.*
3. **Resolution repository.** Five emit functions. `setResolution` accepts a level + window inputs (callers compute window via `windowFor`); `reviseResolution` rewrites text/virtue/parent without changing the window. *Round-trip tests.*
4. **Resolution hooks.** `useActiveResolution(level)`, `usePendingResolution(level)`, generic queries. *Selector tests.*
5. **Engine — DSL types and resolvers.** Add the two block types to `FlowSection`; extend `EngineContext` with `resolutions`, `logicalDay`, `windowFor` injection points; implement resolvers. *Engine unit tests with hand-built context.*
6. **Player — render components.** `RenderedCaptureResolutionBlock` (with scaffolding section), `RenderedReviewResolutionBlock` (3 modes). Wire submit handlers to repo functions. *Manual visual checks.*
7. **Practice flow rewrite.** Update `examination-of-conscience/flow.json` per draft; verify all `prayer/*` refs resolve; create any missing text refs; bump manifest version. Run `pnpm build:corpus` and confirm output.
8. **Morning Offering update.** Prepend the show-resolution block. Manifest version bump.
9. **Hardcoded Examen deletion.** Remove `apps/app/src/app/examen.tsx` and the `/examen` route. Update `PrayNowCard.tsx` and `explore.tsx`. *`git grep "/examen"` returns zero hits.*
10. **i18n cleanup + additions.** Remove stale keys; add new ones for capture/review UI.
11. **Run app, full daily-loop QA.** End-to-end:
    - First run: open Examen — Verificatio is silent (skip_if_none). Walk the 5 movements. Hope & Resolution captures a daily resolution for tomorrow.
    - Restart app, advance device clock to next morning. Open Morning Offering. Today's resolution shows. Active intentions show. Capture-movement is skippable.
    - Advance clock to next evening. Open Examen. Verificatio shows yesterday's daily; outcome buttons work; Reviewed event written. Hope & Resolution captures next-daily.
    - Advance clock to 1am the day after. Open Examen — review applies to the just-ended logical day, not the day after.
    - Open Examen twice in one night. Second time, capture-resolution prefills; submit emits Revised; only one active resolution exists for tomorrow.
12. **Run `pnpm test`** — all workspaces green.

## Tests

Required:

- **`windowFor`** — table-driven covering each level × `for=current|next` × four representative anchors (mid-cycle, boundary, year-end, leap day).
- **`logicalDay`** — 1am with cutoff 4 returns previous-day midnight; 4am returns same day; 4:01am returns same day; cutoff 0 (midnight) is identity.
- **Resolution projection** — Set then Revised updates fields; Set then Reviewed leaves resolution active in window but produces a Reviewed event; multiple Checkins accumulate; Archived sets the field.
- **Selectors** — `pending-daily` returns the last Set'd resolution that has no Reviewed event; `active-daily` returns one whose window contains `logicalDay(now)`; `activeHigher('daily')` returns active monthly/seasonal/annual.
- **Engine** — `capture-resolution` resolves with scaffolding when context has higher resolutions; `review-resolution { mode: 'show' }` returns rendered with `prompt: undefined`; `skip_if_none: true` with no target returns `undefined` resolution.
- **Repo idempotency** — calling `reviewResolution` twice for the same resolution emits two events but the projection only counts the first as the closing review (per Decision 7's natural extension — though typically the UI prevents this).

Manual QA in step 11 covers the integration paths.

## Verification

This phase is done when:

- Daily loop test in *Tasks → step 11* passes.
- `apps/app/src/app/examen.tsx` no longer exists.
- `git grep "/examen\\b"` from repo root returns zero application code references.
- `pnpm test` passes.
- `pnpm build:corpus` runs cleanly with the rewritten Examen flow.
- A user opening Morning Offering sees today's resolution at the top (when one exists) or nothing (when not).
- The Examen ends with a written daily resolution; the very next Morning Offering reads it.
- `docs/features/unified-flow-system.md` documents `capture-resolution` and `review-resolution` (mode field included).

## Risks and watchpoints

- **Window math mistakes are silent until the user hits the boundary.** Cover edges with tests; consider a debug screen during dev that dumps `windowFor` results across the next 30 days so an integrator can eyeball them.
- **Logical-day cutoff and existing completion stamps.** Practice completions are recorded against civil-day today (per `apps/app/src/db/schema.ts` Completion.date). We don't propagate the cutoff there — for now, "did I complete the Examen today?" follows civil-day. Document this asymmetry in `docs/journal.md`.
- **Rewriting the examen flow breaks downstream content.** If anything outside this feature template-substitutes against the old `data.questions` shape, it'll silently 404. Grep for `examination-of-conscience` and `data.questions` before deleting.
- **Verificatio empty state on first run.** `skip_if_none: true` plus the entire section being silent might surprise the player UI (a section with all blocks skipped). Verify the player handles "section yields no rendered content" by skipping the section header too.
- **Localized text drift.** With prompts inlined as `LocalizedText` in `flow.json`, both languages must be updated together. Add a content-build assertion that every `LocalizedText` has both `en-US` and `pt-BR` keys.
- **Resolution prefill for revision.** When the user revises tomorrow's resolution, the prefill carries the previous text. UX consideration: should the prefill be obvious ("editing existing") so the user doesn't think they're starting fresh? The capture block's `RenderedCaptureResolution.prefill` field carries this signal; the player should render a soft "Editing tomorrow's resolution" header.
