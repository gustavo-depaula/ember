# Phase 4 — Plan of Life as Rule

> **Status:** *Partially deferred.* The Resolutions panel ships with the **daily-only** TODAY card; the STANDING section (weekly / monthly / seasonal / annual), per-level capture, standing-review sheet, weekly-review practice, and `useActiveHigher` scaffolding are **future work**. The Phase 3 daily loop bedded in first; non-daily windows had real defects (post-Pentecost OT collapse, missing logical-day cutoff) that we chose to defer rather than partially fix. The design below remains the design-of-record for when this phase resumes.
>
> Predecessors: Phase 3 (Resolutions). Successors: Phase 5 builds remaining periodic review practices on top of this hierarchy.

## Goal

User-visible: the Plan of Life screen shows the user's standing resolutions across all levels (daily / weekly / monthly / seasonal / annual). The user can capture or edit higher-level resolutions directly from the panel, and review them inline. The weekly review practice closes the weekly loop on Sunday evenings.

Technical: this phase is largely **UI on top of Phase 3's data model**, plus one new practice flow. It does not introduce new event types, but it does:
- Surface every resolution level (Phase 3 only exercised `daily`).
- Expose `parent_id` linking in capture UX.
- Ship `<CaptureResolutionSheet />` / `<ReviewResolutionSheet />` standalone shells that mount the same render components used in flow blocks, for direct interaction outside a practice run.
- Add the `weekly-review` practice.

## Out of scope (later phases)

- Monthly / seasonal / annual review practices (Phase 5).
- Particular Examen (Phase 5).
- Streak heatmap, virtue tag analytics, saint companion (Phase 6).

## Architectural context

- Phase 3 ships the resolution model, projection selectors, and DSL primitives.
- The existing Plan of Life screen lives at `apps/app/src/features/plan-of-life/`, with components under `components/` (`DayCarousel`, `PracticeChecklist`, `SchedulePicker`, `SlotConfigurator`, etc.). Top-level composition: `DayCarousel` for date navigation; `PracticeChecklist` per date.
- The Schedule DSL (`apps/app/src/features/plan-of-life/schedule.ts`) already supports `days-of-week` and `nth-weekday` rules — used for the weekly review practice's Sunday-evening slot.

## Major decisions

### 1. Resolutions panel placement and shape

**Context.** The PRD sketch puts a Resolutions panel above the tier/time-block grid. Concrete shape:

```
┌─────────────────────────────────────────────────┐
│ TODAY                                           │
│   Daily      "Don't interrupt Maria"            │
│              Active until tomorrow 4am          │
│              [✓ Kept]  [~ Partial]  [✗ Broken] │ (inline checkin)
├─────────────────────────────────────────────────┤
│ STANDING                                        │
│   Weekly     "Read Sunday's readings"  Wk 45    │
│              ★★★☆☆  (3 of 5 days kept)         │
│   Monthly    "Silence at table"  Nov            │
│              ★★★★☆  (week 4 of 4)              │
│   Seasonal   "Daily Rosary"  Lent               │
│              [Review now]                        │
│   Annual     "Grow in humility"  AD 2026        │
├─────────────────────────────────────────────────┤
│ + Set weekly   + Set monthly   + Set seasonal   │
│ + Set annual                                    │
├─────────────────────────────────────────────────┤
│ Next review: Sunday Nov 9, 8pm — Weekly         │
└─────────────────────────────────────────────────┘
```

**Decision.** Collapsible panel. Default: open if any resolution exists at any level, collapsed otherwise. Three sub-sections: TODAY (the active daily, with inline checkin verbs), STANDING (active resolutions at higher levels with progress indicators), and "+ Set" CTAs for empty levels. Footer shows the next scheduled review (computed from the user's active practices).

**Implications.** Five new components in `apps/app/src/features/plan-of-life/components/resolutions/`:
- `ResolutionsPanel.tsx`
- `TodayResolutionCard.tsx` (with the inline checkin row — writes a `ResolutionCheckin` event, not a Reviewed)
- `StandingResolutionCard.tsx` (level + text + progress + actions)
- `ResolutionSetCTA.tsx` (per-level "+ Set" buttons)
- `NextReviewFooter.tsx`

### 2. Inline checkin vs full review

**Context.** When the panel surfaces today's daily resolution, what action does the inline button row do — write a checkin, or write the closing review?

**Options.**
- **A. Closing review.** Tapping "Kept" closes today's resolution.
- **B. Checkin.** Multiple taps allowed throughout the day; closing review still happens at the night Examen.

**Decision.** **B.** The panel is a passive surface; the closing review belongs to the Examen ritual. Inline taps write `ResolutionCheckin` events. The night Examen still runs `review-resolution` and the user makes the closing call there (with the day's accumulated checkins shown as context).

**Implications.**
- The user can tap multiple times across the day (changes their mind: tap "Partial," later "Kept"). Each tap writes a Checkin event. Latest tap wins for display.
- "Don't double-write a closing review" is enforced by the Examen flow — `review-resolution` writes `ResolutionReviewed` exactly once.

### 3. Standalone capture/review sheets

**Context.** The DSL primitives are designed for in-flow use. The panel needs the same UX outside a practice run.

**Decision.** Extract two thin shells:
- `<CaptureResolutionSheet level for={…} prefillFromActive />` — Tamagui sheet that wraps the same `RenderedCaptureResolutionBlock` UI used by the player. Submit calls `setResolution` or `reviseResolution` directly.
- `<ReviewResolutionSheet target mode />` — same for review-resolution.

These are **not** DSL blocks; they are application-layer UI that reuses the block render components. The render components are exported from `apps/app/src/features/practice/blocks/` for this purpose.

**Implications.**
- `capture-resolution` and `review-resolution` resolvers (Phase 3) stay untouched.
- The render components must be invokable both ways: with a player-supplied submit handler (in-flow) and with a sheet-supplied one (standalone).
- Tests: standalone capture writes the same events as in-flow capture, given identical input.

### 4. `parent_id` linking UX

**Context.** Phase 3 wired `parent_id` into the schema but didn't expose it. With higher-level resolutions now in play, a daily can be marked as "in support of" the active monthly.

**Options.**
- **A. Always show a link toggle when scaffolding is present.**
- **B. Auto-link if the user types a daily and there's an active monthly with the same virtue tag.**
- **C. Manual checkbox in the capture sheet.**

**Decision.** **C.** A small "Supports my monthly resolution" checkbox below the input, only shown when an active higher-level resolution exists. Default unchecked. Auto-linking (B) is over-clever; daily resolutions are often unrelated to the monthly's exact wording.

**Implications.**
- The capture-resolution rendered block gains a `link_targets?: Resolution[]` field listing the active higher resolutions that could be a parent. The render component shows a checkbox per target (typically just one — the next-higher level).
- On submit, `parent_id` is set to the selected target's id. Multiple parent linking is not supported (a daily can support only one higher-level at a time).

### 5. Progress indicators per level

**Context.** Each standing resolution card needs to communicate progress at a glance.

**Options.**
- **A. Streak display.** "3 of 5 days kept."
- **B. Star rating.** ★★★☆☆ filled by ratio.
- **C. Heatmap dots.** One dot per day.

**Decision.** **A** as the primary text + **B** as a visual companion. C is deferred to Phase 6.

Per-level interpretation:
- **Weekly**: count of daily resolutions linked via `parent_id` to this weekly that have at least one Checkin or Reviewed = `kept`. Plus the weekly's own checkins. Display: "kept N of 7 days."
- **Monthly**: count of weeks with the linked weekly resolution kept ≥ 4 days. Display: "week M of 4."
- **Seasonal**: count of weeks kept since season start. Display: "kept N of W weeks."
- **Annual**: count of months with the linked monthly kept ≥ 3 weeks. Display: "month M of 12."

These heuristics are approximations; the spec acknowledges a more honest model is in Phase 6.

**Implications.**
- New file `apps/app/src/features/resolutions/progress.ts` with pure functions: `weeklyProgress(resolution, projection)`, `monthlyProgress(...)`, etc.
- Tests exercise each formula with hand-built event histories.

### 6. Weekly review practice — content

**Context.** The first periodic review practice. Sunday evening (configurable). Closes the weekly loop.

**Flow:**

```jsonc
{
  "id": "weekly-review",
  "version": 1,
  "sections": [
    { "type": "section", "title": { "en-US": "Sabbath Pause", "pt-BR": "Pausa do Sábado" }, "blocks": [
      { "type": "prose", "text": { "en-US": "The week is closing. Sit with God in stillness for a moment.", "pt-BR": "A semana se encerra. Permaneça em silêncio com Deus por um instante." } }
    ]},
    { "type": "section", "title": { "en-US": "Verificatio", "pt-BR": "Verificação" }, "blocks": [
      { "type": "review-resolution", "mode": "review", "target": "pending-weekly",
        "prompt": { "en-US": "How did this week's resolution go?", "pt-BR": "Como foi a resolução desta semana?" },
        "skip_if_none": true }
    ]},
    { "type": "section", "title": { "en-US": "Gratitude for the week", "pt-BR": "Gratidão pela semana" }, "blocks": [
      { "type": "offering", "mode": "thanksgiving", "default": "all-active", "show": "list" }
    ]},
    { "type": "section", "title": { "en-US": "Next week's resolution", "pt-BR": "Resolução para a próxima semana" }, "blocks": [
      { "type": "capture-resolution", "level": "weekly", "for": "next",
        "prompt": { "en-US": "One concrete resolution for next week.", "pt-BR": "Uma resolução concreta para a próxima semana." },
        "scaffolded_by": "active-higher" }
    ]}
  ]
}
```

**Manifest:**

```jsonc
{
  "id": "weekly-review",
  "name": { "en-US": "Weekly Review", "pt-BR": "Revisão Semanal" },
  "flowMode": "step",
  "completion": "flow-end",
  "flow": "flow.json",
  "defaults": {
    "slots": [ { "schedule": { "type": "days-of-week", "days": [0] }, "time": "20:00", "tier": "ideal" } ]
  }
}
```

Schedule: Sundays at 20:00. Tier `ideal` so the user opts in (rather than `essential`). Once the user has a weekly resolution active, the panel surfaces "Next review: Sun N, 20:00."

### 7. "Review now" escape hatch

**Context.** A user might want to manually close a higher-level resolution before its review practice runs (e.g., reviewing the seasonal resolution at the end of Lent if the seasonal review practice doesn't ship until Phase 5).

**Decision.** Each `StandingResolutionCard` includes a "Review now" action (in an overflow menu) that opens `<ReviewResolutionSheet target={`pending-${level}`} mode="review" />`. Writes a Reviewed event same as the practice would.

**Implications.** Bridges the gap between Phase 4 ship and Phase 5 ship for higher levels. Once Phase 5 lands, the review practices become the canonical path; the "Review now" menu remains as a manual override.

### 8. "Next review" footer computation

**Context.** Tells the user when their next *scheduled* review practice will run, so they don't wonder.

**Decision.** Query the user's active practices for any whose id ∈ `{weekly-review, monthly-review, seasonal-review, annual-review, particular-examen, examination-of-conscience}`. For each, evaluate the next applicable date via the existing `isApplicableOn` (already in `apps/app/src/features/plan-of-life/schedule.ts`). Take the earliest. Display its date + practice name.

**Implications.**
- New helper `apps/app/src/features/plan-of-life/next-review.ts` with `nextReviewDate(userPractices, now)`.
- In Phase 4, only `examination-of-conscience` (daily) and `weekly-review` (Sunday) typically populate; the helper still works correctly when the others arrive in Phase 5.

## Data model

No new event types. No new projection state. Phase 4 is purely consumer-side.

The `link_targets?: Resolution[]` field on `RenderedCaptureResolution` is an extension of the rendered shape (engine still resolves; the render component now optionally uses it).

## Module structure

### Created

| File | Purpose |
|------|---------|
| `apps/app/src/features/plan-of-life/components/resolutions/ResolutionsPanel.tsx` | Top-level panel; collapsible. |
| `apps/app/src/features/plan-of-life/components/resolutions/TodayResolutionCard.tsx` | Daily card with inline checkin row. |
| `apps/app/src/features/plan-of-life/components/resolutions/StandingResolutionCard.tsx` | Per higher-level card with progress + overflow menu. |
| `apps/app/src/features/plan-of-life/components/resolutions/ResolutionSetCTA.tsx` | "+ Set <level>" button row. |
| `apps/app/src/features/plan-of-life/components/resolutions/NextReviewFooter.tsx` | Footer text. |
| `apps/app/src/features/plan-of-life/next-review.ts` | `nextReviewDate(userPractices, now)`. |
| `apps/app/src/features/resolutions/progress.ts` | Per-level progress heuristics. |
| `apps/app/src/features/resolutions/CaptureResolutionSheet.tsx` | Standalone sheet wrapping the block render component. |
| `apps/app/src/features/resolutions/ReviewResolutionSheet.tsx` | Standalone sheet for review (and checkin via mode prop). |
| `content/practices/weekly-review/manifest.json` | Practice metadata. |
| `content/practices/weekly-review/flow.json` | Flow per Decision 6. |
| `apps/app/src/features/resolutions/__tests__/progress.test.ts` | Heuristic tests. |
| `apps/app/src/features/plan-of-life/__tests__/next-review.test.ts` | Scheduling tests. |

### Extended

- `apps/app/src/features/plan-of-life/components/DayCarousel.tsx` (or the screen entry) — mount `<ResolutionsPanel />` above the existing tier/time-block grid.
- `apps/app/src/features/practice/blocks/RenderedCaptureResolutionBlock.tsx` — accept an optional `link_targets` prop and render the link checkbox per Decision 4. The engine resolver populates `link_targets` from `EngineContext.resolutions?.activeHigher(level)` whenever scaffolded_by='active-higher'.
- `packages/content-engine/src/blocks/capture-resolution.ts` — populate `link_targets` in resolved output.
- `apps/app/src/db/repositories/resolutions.ts` — `setResolution` already accepts `parent_id`; ensure the link-checkbox path passes it through.
- `apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts` — copy for panel labels, progress strings, "review now," "supports my monthly resolution," etc.
- `docs/features/features-overview.md` — link the Plan of Life Resolutions panel section.

### Deleted

Nothing.

## Tasks

1. **Standalone sheets.** Build `CaptureResolutionSheet` and `ReviewResolutionSheet`. *Visual checks; submit writes correct events.*
2. **Progress heuristics.** Implement `progress.ts` with the four level-specific formulas. *Unit tests with hand-built event histories.*
3. **Panel components.** Build `ResolutionsPanel` and its five children using existing hooks (Phase 3) for state. *Storybook-style preview screen recommended for visual iteration.*
4. **Engine — link_targets in capture-resolution.** Update resolver to populate `link_targets` from active higher resolutions. Update render component to show the checkbox. Update player submit to pass `parent_id`.
5. **Mount panel.** Add `<ResolutionsPanel />` to the Plan of Life screen above the existing grid. Verify collapsibility and that the panel doesn't displace existing content jarringly.
6. **Weekly review practice.** Author manifest + flow. Run `pnpm build:corpus`. Add the practice to user's available practices (or seed it as `tier: 'ideal'` in the default user-practices list — verify how new practices are bootstrapped).
7. **Next review footer.** Implement `nextReviewDate` and wire to the panel footer. *Tests.*
8. **i18n strings.** Add new copy in both locales.
9. **Manual QA.** Capture a weekly resolution from the panel; mount the daily Examen; capture a daily and link it to the weekly via the new checkbox; verify `parent_id` is set; run weekly-review on a Sunday; review the previous week and capture next week's; confirm the panel updates.
10. **Run `pnpm test`.**

## Tests

- **Progress functions** — verify per-level formulas against hand-built event histories.
- **`nextReviewDate`** — given user practices including Examen + weekly review on a Wed, returns Sunday 20:00 as the earliest review.
- **Standalone capture sheet** — submitting writes a `ResolutionSet` (or `ResolutionRevised`) identical to the in-flow path.
- **`parent_id` propagation** — capturing a daily with the link checkbox produces a Resolution whose `parent_id` matches the active monthly's id.

## Verification

This phase is done when:

- The Plan of Life screen shows the Resolutions panel with TODAY / STANDING / + Set / Next Review.
- A user can capture and edit weekly, monthly, seasonal, annual resolutions from the panel.
- The weekly review practice runs end-to-end on a Sunday: review last week, capture next week, panel reflects both.
- A daily captured during the Examen with the "supports my monthly resolution" checkbox shows up linked (visible in the daily card if we expose it, or in the panel as part of the monthly's progress).
- Inline checkin verbs on TODAY card write `ResolutionCheckin` events; latest tap reflected in the card display.
- "Review now" overflow menu on a STANDING card writes a `ResolutionReviewed` event.
- `pnpm test` passes.

## Risks and watchpoints

- **Panel real estate.** The Plan of Life screen is already dense. The collapsible panel should default open the first time a user has any resolution but be a one-tap collapse afterwards. Persist the open/closed state in user prefs.
- **Progress heuristics drift.** The Phase 4 formulas are honest enough for v1 but will eventually be replaced by the Phase 6 heatmap. Don't over-tune them; document the heuristic in code comments so it's clear why a number says what it says.
- **`weekly-review` discoverability.** The practice ships at `tier: ideal`, which means the user doesn't see it by default. Consider whether the panel surfaces a "Want a weekly review?" suggestion when no weekly practice is active.
- **Locale coverage of dates.** "Wk 45" should localize correctly (`Sem. 45` in PT-BR). Use `Intl.DateTimeFormat` for week numbering where supported.
- **`parent_id` orphan risk.** If a parent resolution is archived, daily resolutions linked to it should not break. Display gracefully (no broken arrow) and consider auto-clearing `parent_id` on archive — defer that decision until it bites.
