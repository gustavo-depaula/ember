# Phase 5 — Periodic Reviews and the Particular Examen

> Status: Design ready. Depends on Phases 3 and 4.
>
> Predecessors: Phase 4 (Plan of Life). Successors: Phase 6 (Companion Features) is the final speculative phase.

## Goal

User-visible: the four periodic review practices (monthly / seasonal / annual) plus the Particular Examen are available and scheduled to fire at the right liturgical moments. Each closes its level's loop the same way the weekly review (Phase 4) closes the weekly loop. Particular Examens fire mid-day for in-stride checkins on the active daily resolution.

Technical: this phase is mostly **content authoring** (four new practice directories) plus **one schedule-DSL extension** (`liturgical-event` rule type) so practices can fire on first Sunday of Advent / season transitions. No new event types, no new DSL primitives.

## Out of scope

- Saint companion / virtue heatmap / petition→thanksgiving bridge — Phase 6.
- A confession bridge from accumulated Examen reflection — Phase 6.

## Architectural context

- Phase 3 ships the resolution model and review primitives.
- Phase 4 ships the weekly review practice and the Plan of Life Resolutions panel.
- Existing schedule DSL (`apps/app/src/features/plan-of-life/schedule.ts`) supports `daily`, `days-of-week`, `day-of-month`, `nth-weekday`, `times-per`, `fixed-program`, `periodic-series`, `holy-days-of-obligation`. Multi-slot practices already exist.
- Liturgical computations (`packages/liturgical/`) include `getFirstSundayOfAdvent`, `getLiturgicalSeason`, season-boundary helpers (Phase 3 added `windowFor`).

## Major decisions

### 1. Schedule DSL extension — `liturgical-event` rule

**Context.** Annual review fires on first Sunday of Advent; seasonal review fires on the first day of a new liturgical season. Existing rules (`nth-weekday`, `day-of-month`) are civil-calendar; they cannot express these triggers correctly.

**Options.**
- **A. Hardcode dates per year.** Author dates for 2026, 2027, … into the manifest. Brittle.
- **B. Compute dates dynamically per liturgical event.** Add a `liturgical-event` rule type that the scheduler resolves via `packages/liturgical/`.

**Decision.** **B.** New rule shape:

```ts
type ScheduleRule =
  // ... existing
  | { type: 'liturgical-event'; event:
      | 'first-sunday-of-advent'
      | 'season-transition'              // fires once on day-1 of each new liturgical season
      | 'ash-wednesday'
      | 'easter-sunday'
      | 'pentecost'
      | 'christ-the-king'                // last Sunday of liturgical year
    }
```

**Implications.**
- `isApplicableOn(schedule, date, ctx?)` gains a new arm. Implementations call into `packages/liturgical/` helpers; for `season-transition`, compares yesterday's season to today's.
- Phase 5 only uses `first-sunday-of-advent` and `season-transition`, but the union enumerates the others for forward compatibility.
- Tests cover boundary days (e.g., Ash Wednesday is a `season-transition` from "Time after Epiphany" to "Lent"; it should fire both as `ash-wednesday` and as `season-transition` if both schedules are active — they are independent rules).

### 2. Practice flows — four near-identical bodies

**Context.** Monthly / seasonal / annual reviews share the same shape:

```
Sabbath Pause  →  Verificatio (pending-<level>)  →  Gratitude (offering, thanksgiving)  →  Capture next-<level>
```

The differences are level name, copy, and the schedule.

**Decision.** Author four separate flow.json files. Don't introduce flow templating — content stays direct, even at the cost of repetition. Each flow is ~30-40 lines; the redundancy is acceptable and easier to evolve content individually (e.g., the annual review will eventually carry a year-in-review reflection that the others don't).

**Implications.** Four practice directories under `content/practices/`. Each has its own manifest + flow + corpus build entry.

### 3. Schedules

| Practice | Schedule | Time | Tier |
|----------|----------|------|------|
| `monthly-review` | `{ type: 'nth-weekday', n: 1, day: 0 }` (1st Sunday of month) | `20:00` | `ideal` |
| `seasonal-review` | `{ type: 'liturgical-event', event: 'season-transition' }` | `20:00` | `ideal` |
| `annual-review` | `{ type: 'liturgical-event', event: 'first-sunday-of-advent' }` | `20:00` | `essential` |
| `particular-examen` | two slots: `{ type: 'daily' }` at `12:00` and `{ type: 'daily' }` at `18:00` | (per slot) | `ideal` |

**Annual review at `essential`** is the one exception — once a year is the right opt-in cadence; defaulting it on-board makes sense if the user has any active resolution at all. Monthly/seasonal/Particular Examen default to `ideal` (user opts in).

### 4. Particular Examen — flow shape

**Context.** Brief mid-day check-in on the active daily resolution (~3 min). Not the closing review.

**Flow:**

```jsonc
{
  "version": 1,
  "sections": [
    { "type": "section", "title": { "en-US": "Pause", "pt-BR": "Pausa" }, "blocks": [
      { "type": "prose", "text": { "en-US": "Take a breath. The day is in motion; come back to it.", "pt-BR": "Respire. O dia está em curso; volte a ele." } }
    ]},
    { "type": "section", "title": { "en-US": "How is it going?", "pt-BR": "Como está indo?" }, "blocks": [
      { "type": "review-resolution", "mode": "checkin", "target": "active-daily",
        "prompt": { "en-US": "How is today's resolution going so far?", "pt-BR": "Como está sendo a resolução de hoje até agora?" },
        "skip_if_none": true }
    ]},
    { "type": "section", "title": { "en-US": "Continue", "pt-BR": "Continuar" }, "blocks": [
      { "type": "prose", "text": { "en-US": "Hand the morning to God. Walk into the afternoon with him.", "pt-BR": "Entregue a manhã a Deus. Caminhe pela tarde com Ele." } }
    ]}
  ]
}
```

When no `active-daily` exists, the middle block silently skips and the practice becomes a 30-second reflective pause. Acceptable.

### 5. Annual review — slightly fuller flow

**Context.** Once-a-year practice; the user invests more time. Phase 5 ships the structural minimum (review pending-annual + capture next-annual); fuller year-in-review prompts (saints encountered, intentions answered, virtue progress) are a Phase 6 elaboration.

**Decision.** Phase-5 annual review flow is the same shape as monthly/seasonal but with longer prose copy reflecting on the closing year. No new blocks.

### 6. Sabbath Pause — shared opening section

**Context.** Each periodic review opens with a brief stillness prompt (the "Sabbath Pause" section in the weekly review from Phase 4). Same idea here.

**Decision.** Each flow has its own copy. No template extraction. The sentiments are different per cadence (weekly = "the week is closing"; monthly = "look back across these weeks"; seasonal = "this season is ending"; annual = "another year of grace closes").

### 7. Particular Examen — two slots vs one slot

**Context.** Default schedule for the Particular Examen — one mid-day moment, or two?

**Options.**
- **A. One slot at 12:00.** Minimal default; user adds more if desired.
- **B. Two slots at 12:00 and 18:00.** Classic Ignatian Particular Examen practice.

**Decision.** **B.** Two slots. Tier `ideal`, so the user opts in; if they opt in, the historical pattern of two daily examens is the right default. They can disable one in practice settings.

**Implications.** The manifest's `defaults.slots` lists two slots. Schedule rendering and notifications flow through the existing system.

### 8. Discovery of `ideal`-tier review practices

**Context.** Tier-`ideal` practices don't appear in a user's active list until they opt in. The Plan of Life Resolutions panel's "Next review" footer (Phase 4) only shows reviews from active practices. So a user with a monthly resolution but no opt-in to `monthly-review` sees nothing for that level.

**Options.**
- **A. Auto-opt-in.** When a user captures a higher-level resolution, automatically add the matching review practice.
- **B. Surface a suggestion.** When a user has an active resolution at level X but no opt-in to `<X>-review`, the panel shows "Want a <X> review?" as a CTA.
- **C. Document-only.** Tell users in onboarding; don't auto-suggest.

**Decision.** **B.** Conservative. Adds a one-tap path but doesn't surprise the user with new practices appearing in their list.

**Implications.** Each `StandingResolutionCard` (Phase 4) gains an inline banner ("Want a monthly review every first Sunday? [Add practice]") when the level's review practice isn't active. Tap adds the practice with default schedule. Already-handled CTA pattern.

## Module structure

### Created

| File | Purpose |
|------|---------|
| `content/practices/particular-examen/manifest.json` |  |
| `content/practices/particular-examen/flow.json` |  |
| `content/practices/monthly-review/manifest.json` |  |
| `content/practices/monthly-review/flow.json` |  |
| `content/practices/seasonal-review/manifest.json` |  |
| `content/practices/seasonal-review/flow.json` |  |
| `content/practices/annual-review/manifest.json` |  |
| `content/practices/annual-review/flow.json` |  |
| `apps/app/src/features/plan-of-life/__tests__/schedule-liturgical.test.ts` | Tests for new rule. |

### Extended

- `apps/app/src/features/plan-of-life/schedule.ts` — extend `ScheduleRule` union; extend `isApplicableOn` with `liturgical-event` arm.
- `packages/liturgical/src/index.ts` — re-export season-transition predicate (or add `isSeasonTransition(date)` if not already present). Likely composed: yesterday's season ≠ today's season.
- `apps/app/src/features/plan-of-life/components/resolutions/StandingResolutionCard.tsx` — add the "Want a <level> review?" banner per Decision 8.
- `apps/app/src/features/plan-of-life/next-review.ts` (Phase 4) — already generic over user practices; verify the new practice ids appear in its scan.
- `apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts` — copy for "Want a monthly review?" CTAs and any standalone strings.
- `docs/features/features-overview.md` — link the periodic reviews section.

### Deleted

Nothing.

## Tasks

1. **Schedule DSL extension.** Add the `liturgical-event` rule type to `apps/app/src/features/plan-of-life/schedule.ts`; implement `isApplicableOn` arm. *Tests: a date that's the first Sunday of Advent in 2026 is applicable; an ordinary Wednesday in Lent is not; a season-transition fires on Ash Wed but not on Wed of week 2 of Lent.*
2. **Particular Examen content.** Manifest with two slots; flow per Decision 4. Run `pnpm build:corpus`.
3. **Monthly review content.** Manifest + flow.
4. **Seasonal review content.** Manifest + flow.
5. **Annual review content.** Manifest + flow (longer prose).
6. **Standing card "Want a review?" banner.** UI + opt-in handler that calls the existing user-practice add API. *Manual check.*
7. **i18n strings.** Both locales.
8. **Manual QA.** Set up a future date in dev tooling (or device clock) and verify each practice fires on the correct day:
   - Sun Nov 1 2026 (1st Sunday) → monthly-review queued.
   - Ash Wed (Feb 18 2026) → seasonal-review queued.
   - Sun Nov 29 2026 (1st Sunday of Advent) → annual-review queued + seasonal-review (transition into Advent) queued.
9. **Run `pnpm test`.**

## Tests

- **Schedule extension** — table-driven tests over a year for each `liturgical-event` value.
- **Season-transition specifically** — covers transitions: Ord. Time → Lent (Ash Wed), Lent → Easter (Easter Sun), Easter → Ord. Time (Pentecost+1 / Trinity Sunday boundary, depending on calendar form), Ord. Time → Advent (1st Sunday of Advent), Advent → Christmas (Dec 25), Christmas → Ord. Time (Baptism of the Lord).
- **No-op fallback** — if `getLiturgicalSeason` returns the same value yesterday and today, `season-transition` does not fire.

Manual QA covers integration paths.

## Verification

This phase is done when:

- Each of the four review practices ships with a manifest + flow that loads correctly under `pnpm build:corpus`.
- The schedule DSL evaluates `liturgical-event` rules correctly on a year-long horizon.
- Setting up a user with an active monthly resolution shows the "Want a monthly review?" banner; tapping adds `monthly-review` to their practices.
- The "Next review" footer (Phase 4) lists each opt-in review practice's next firing.
- A walk through a fast-forwarded calendar (mocked clock or manual on device) fires all four review practices on their correct days.
- `pnpm test` passes.

## Risks and watchpoints

- **Liturgical season ambiguity.** The Catholic calendar has variants (OF/EF, the optional Septuagesima). The Phase 5 schedule rule uses whatever `getLiturgicalSeason` returns under the user's selected calendar form (per existing app conventions). Document that seasonal-review fires per the user's calendar form.
- **Christ the King floating.** Last Sunday of Ordinary Time before Advent. If the annual review is anchored to first Sunday of Advent and Christ the King is the Sunday before, the user may want the annual review *on* Christ the King. Defer; document as a future option.
- **Notification storm on transition days.** Ash Wednesday could fire the seasonal review at 20:00; if Lent also has its own daily content (Lenten devotions), the user gets multiple notifications. The existing notification system de-duplicates per practice; verify behavior in QA.
- **Particular Examen fatigue.** Two daily slots may feel like nagging. Tier `ideal` means it's opt-in; the onboarding for the practice should set expectations clearly. Consider adding a "skip today" affordance on each notification.
- **Annual review content depth.** The Phase 5 flow is structurally complete but spiritually thin. Phase 6 enriches it. Don't over-invest here.
