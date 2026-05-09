# Phase 6 — Companion Features

> Status: Design speculative. Likely re-sliced before execution.
>
> Predecessors: all prior phases. This phase is the bundle of "things that build on the spiritual-threads foundation but aren't strictly part of the loop."

## Goal

User-visible: smart, lightweight features that use the data the prior phases have been accumulating. A user offers a goal-petition; when answered, a tap converts it to thanksgiving. A user lives with a daily resolution tagged "humility"; the app surfaces a saint who lived that virtue. A user goes to confession every two weeks; the app gently surfaces patterns from their Examens.

Technical: this phase is a **bundle**, not a coherent loop. Each item is independently valuable and independently shippable. The doc describes each as a sketch with key decisions; full per-item docs would be drafted as each one is picked off the backlog.

**Honest framing.** This phase is the most speculative in the plan. By the time the prior five phases ship, real usage will reshape priorities. The items below are anchored in the original PRD; treat the contents of this doc as a starting point for re-design, not a commitment.

## Items

### A. Petition → Thanksgiving bridge

**Trigger.** A petition closes with `closure_kind ∈ {'answered', 'expired'}`. (Retired petitions don't trigger — retirement is a setting-down, not a fulfillment.)

**Two surface paths**, both ship together:

1. **Closure dialog inline prompt.** When the user marks a goal petition answered, the closure sheet has a "Record this as thanksgiving?" affordance with a prefilled text suggestion ("for Maria's surgery — answered").
2. **Next-Examen `bridge-closed-petitions` block.** A new DSL primitive surfaces recently-closed-but-unbridged petitions in the Gratitude movement. The user can convert each with a tap.

**New DSL primitive.**

```jsonc
{
  "type": "bridge-closed-petitions",
  "since": "last-examen",   // 'last-examen' | 'last-N-days' | number-of-days
  "mode": "capture",        // 'capture' (default) writes ThanksgivingOffered + tags origin; 'show' just lists
  "skip_if_none": true
}
```

**Storage.** A converted thanksgiving carries an optional `from_intention?: string` field on the `ThanksgivingOffered` event so the lineage is queryable. New event field; backward-compatible (existing thanksgivings just don't have it).

**Decisions to make later.**
- Should the bridge include `expired` bounded petitions, or only `answered` ones? Lean: only answered.
- Should there be a "thanksgiving for an unanswered prayer" path (acknowledging trust without claim)? Lean: yes, but it's a separate primitive for "consolation"; not part of this bridge.

### B. Saint companion

**v1 scope.** A "saint companion of the day" card appears in the Morning Offering, drawn from the liturgical day. The user can also pin a personal patron from the saints library.

**Sources.**
- **Liturgical-day saint.** Already partially modeled in the corpus per CLAUDE.md mentions. Need to verify completeness; if gaps, fill from public-domain hagiographic sources.
- **Virtue match.** When an active resolution has a `virtue` tag (e.g., "humility"), a separate "Saint for this virtue" card can surface — drawn from a virtue→saints mapping authored in the corpus.
- **Personal patron.** User picks from the saints library; persisted as a user preference.

**v1 decision.** Ship only the liturgical-day card. Virtue and patron are v2.

**Module touch points.**
- `apps/app/src/features/saints/` (new) — companion card, hooks for liturgical-day saint.
- `content/saints/<id>.json` — saint entries, possibly already extant.
- `content/practices/morning-offering/flow.json` — add a `saint-companion` block (new DSL primitive) at the start.

**New DSL primitive.**

```jsonc
{
  "type": "saint-companion",
  "source": "liturgical-day"   // 'liturgical-day' | 'virtue-of-active-resolution' | 'pinned-patron'
}
```

Resolves to a card with image, name, dates, one-line "feast of …" and (optionally) a one-paragraph short bio.

### C. Virtue heatmap

**Goal.** A user with virtue-tagged resolutions sees their "growth in humility" or "growth in patience" over time, summarized at a glance.

**v1 scope.** A panel in the Plan of Life screen below the Resolutions panel. Each row = one virtue tag the user has used. Each column = one week. Color intensity = kept ratio (resolutions tagged with that virtue, kept that week / total).

**Inputs.** All from the existing projection (Phases 3+5). No new event types.

**Computation.** A pure function `virtueWeeklyMatrix(events, weeks: number)` returns `Record<string, number[]>` (virtue → array of kept-ratios for the last N weeks). Memoized in a hook.

**Decisions to make later.**
- How many weeks? Default 12, scrollable to year.
- What's the color scheme? Match existing fidelity wall colors for visual cohesion, but distinct enough to read as different.
- Should the heatmap aggregate weekly or daily? Weekly is denser/lower resolution; daily is more granular. Lean: weekly for v1; daily (heatmap-style) is its own future feature.

### D. Confession bridge

**This is the most sensitive item.** Pattern surfacing of accumulated peccatum reflections requires that those reflections be stored, which they currently aren't (the Examen's "Sorrow" movement is free-text without persistence in Phase 3). Phase 6 introduces optional persistence and a careful surfacing UX.

**New event.**

```ts
type SinNoted = {
  type: 'SinNoted'
  id: string
  text: string                                 // free-form
  category?: string                            // optional; one of a fixed list (see below)
  noted_at: number
  examen_run_id?: string
}
```

**Categories (suggested initial set).** Based on traditional examination-of-conscience categories: `'pride'`, `'envy'`, `'wrath'`, `'sloth'`, `'avarice'`, `'gluttony'`, `'lust'`, `'detraction'`, `'omission'`, `'other'`. The user can skip categorization.

**New DSL primitive.**

```jsonc
{
  "type": "capture-sin",
  "prompt": { "en-US": "...", "pt-BR": "..." },
  "multi": true,
  "optional": true,
  "categories": ["pride", "wrath", "sloth", "..."]   // optional; if absent, no category UI
}
```

Inserted into the Examen's Sorrow movement. Replaces (or complements) the current free-text prose block.

**Surfacing UX.** A new practice `confession-prep`, opt-in tier. Flow:

```
Sabbath Pause
  →  Notice: top 3 categories from the last N days (e.g., last 14)
  →  A list of accumulated SinNoted entries grouped by category
  →  Prayer: Act of Contrition or invitation to confession
```

After confession (manual user-marked completion), the user can optionally archive the noted sins (a `SinNotedArchived` event marks them as covered). Archived sins drop out of the surfacing query. **Nothing is ever transmitted off-device. No analytics. No remote sync of these events.** Document this prominently in the practice's introductory copy and in `docs/journal.md`.

**Decisions to make later.**
- Default categories by language. PT-BR Catholic vocabulary may differ.
- Whether to surface frequency counts ("noted 8 times in 14 days") or just bare lists. Lean: frequency, because it helps the user notice patterns — but visually muted (small numerals) so it doesn't feel like scoring.
- Whether the user can edit or delete a `SinNoted` entry after the Examen. Lean: yes, via the confession-prep practice.

**Privacy.** Add `apps/app/src/lib/privacy.ts` (if not extant) with a checked invariant that `SinNoted` events are excluded from any future cloud-sync layer. Defensive; we have no sync today.

## DSL surface added in this phase

Three new primitives:
- `bridge-closed-petitions`
- `saint-companion`
- `capture-sin`

Plus a `from_intention?: string` field on `ThanksgivingOffered` and a `category?: string` field on `SinNoted`.

## Data model summary

Additions to the event union:

```ts
type SinNoted = { type: 'SinNoted'; id: string; text: string; category?: string; noted_at: number; examen_run_id?: string }
type SinNotedArchived = { type: 'SinNotedArchived'; id: string; archived_at: number }
type PinnedPatronSet = { type: 'PinnedPatronSet'; saint_id: string; set_at: number }
type PinnedPatronCleared = { type: 'PinnedPatronCleared'; cleared_at: number }
```

`ThanksgivingOffered` gains `from_intention?: string` (optional; backward compatible).

Projection extensions:

```ts
type EventState = {
  // ... prior phases
  notedSins: Map<string, NotedSin>
  pinnedPatron?: string             // saint id
}
```

## Rough task list

This phase isn't a single sprint. It's four work items, each a sub-phase:

### 6a — Petition → Thanksgiving bridge
1. Add `from_intention` to `ThanksgivingOffered`. Update Phase 1 projection arms.
2. Closure dialog "convert to thanksgiving" affordance.
3. `bridge-closed-petitions` DSL primitive: types, resolver, render component.
4. Add the block to the Examen's Gratitude movement (between the existing prose and `capture-movement`). Bump examen manifest version.
5. Tests + manual QA.

### 6b — Saint companion v1
1. Verify or fill out `content/saints/` for liturgical-day coverage.
2. `saint-companion` DSL primitive: type, resolver, render component (image + bio).
3. Add the block to Morning Offering. Bump manifest.
4. Manual visual QA across feast days; PT-BR localization check.

### 6c — Virtue heatmap
1. `virtueWeeklyMatrix` pure function + hook.
2. Heatmap component using existing color tokens.
3. Mount below Resolutions panel in Plan of Life.
4. Tests for the matrix computation.

### 6d — Confession bridge
1. New event types: `SinNoted`, `SinNotedArchived`. Projection.
2. `capture-sin` DSL primitive.
3. Replace the `Sorrow` movement's prose-only block with a structured `capture-sin` (or augment alongside; design choice during execution).
4. `confession-prep` practice — manifest + flow.
5. Privacy invariant doc + journal entry.
6. Manual QA across two weeks of usage to verify pattern surfacing reads naturally.

## Out of scope

- A full saints library / browse experience (separate Devotion track in CLAUDE.md).
- Sharing or exporting any of this data.
- A community / multi-user dimension.
- Statistics dashboards beyond the modest virtue heatmap.

## Verification

This phase is done — or, more honestly, *each sub-phase is done* — when:

- **6a.** A user marks a goal petition answered and is offered a one-tap thanksgiving. The next Examen surfaces unbridged closed petitions with a `bridge-closed-petitions` block. `ThanksgivingOffered.from_intention` round-trips through events and projection.
- **6b.** Morning Offering shows the day's saint card; user can tap through to a longer view (or this is deferred). Verified across at least one full liturgical week.
- **6c.** Plan of Life screen shows the virtue heatmap below the Resolutions panel; the matrix updates as new reviews are recorded.
- **6d.** Sorrow movement of the Examen captures structured sins; `confession-prep` surfaces patterns; archive on confession works; no `SinNoted` event leaves the device under any code path (verified by code search and a privacy invariant test).

## Risks and watchpoints

- **Speculative scope.** Don't pre-build any of this until the prior phases have shipped and the user has lived with them for several weeks. Real usage will likely reshape priorities; one item below may obviate or replace another.
- **Sensitivity of the confession bridge.** This feature touches the seal and personal moral struggle. Defaults must err on the side of not-storing (the `capture-sin` block is `optional: true` always; the `confession-prep` practice is `tier: 'extra'`, not `ideal`). Any UX that *summarizes* sin patterns must read with humility, not as a scoring system.
- **Saint data licensing.** Public-domain hagiographic sources only. Image rights need verification per saint; default to text-only when uncertain.
- **Heatmap reading as judgment.** A row of "broken" weeks could discourage rather than illuminate. Consider a deliberately low-contrast color scheme and an explanatory note ("a record, not a verdict").
- **Bridge feature creep.** "Convert to thanksgiving" is the simplest case. The richer cases ("offer this answered prayer for someone else's intention," "tag this thanksgiving with the saints I prayed to") are real but should not land in v1 of 6a.

## Closing note

The five prior phases close the structural loops the PRD opens with. Phase 6 is what lets the loops *speak back* to the user — surfacing pattern, suggesting connection, gently reminding. Build it slowly. Each item should feel earned by the data, not invented to fill the screen.
