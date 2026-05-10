# Prayer Memorization — Implementation Journal

Companion to `docs/features/prayer-memorization.md` (the PRD).

The feature ships in phases. Each phase follows **Plan → TDD → Execute → Refactor → Simplify**. This journal captures progress, surprises, and the decisions whose *why* won't survive in the diff.

---

## Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation: schema, events, SM-2, line/portion/notation/mode helpers | ✅ shipped |
| 2 | Card render primitives: Cued / Letters / Cold + shared subcomponents | ✅ shipped |
| 3 | Daily queue + session orchestration (80/20 cap, hook) | ✅ shipped |
| 4 | `/memorize` screen — content resolution, mode dispatcher, empty/done states | ✅ shipped (untested in app) |
| 5 | Prayer-detail entry point + opt-in flow + `practice/memory-work` POL slot + Wall completion | ⏳ pending |
| 6 | Canonical content portions for ~5–8 long prayers | ⏳ pending |

**252 unit tests across 22 files, all passing. `tsc --noEmit` clean. Biome clean.**

---

## What's been built

### Phase 1 — Foundation
- Extended `PrayerItemManifest` with optional `memorize: { eligible?, portions? }`. Default is "eligible, single portion".
- Added 3 events to the existing event-sourced store: `MemorizationOptedIn`, `MemorizationOptedOut`, `MemorizationReviewed`. Projection writes into `memorizationCards: Map<cardKey, MemorizationCardState>` plus a derived index `cardsByPrayerLanguage` for O(1) opt-in checks.
- Pure SM-2: `applyOutcome(card, outcome, { now, today })` — Cued got-it / missed-it, Letters/Cold tap-K + tap-nothing. Ease bounded `[1.3, 3.0]`, lenient defaults, first-cold bonus is sticky (one-time, never re-awarded after regression).
- Pure helpers: `splitBodyLines`, `resolvePortions`, `toFirstLetter`, `pickMode`, `composeCardKey`, `composePrayerLangKey`, `partitionLinesForCued`.
- Repository wraps emit + reads. Unit tests cover SM-2, line/portion math, first-letter notation, mode selection, projection behavior.

### Phase 2 — Card primitives
- Three Tamagui components matching the reverent-defaults spec:
  - **CuedCard** — body lines visible up to mastery; line `mastery+1` hidden behind a Reveal button; outcome buttons "Got it" / "Missed it".
  - **LettersCard** — first-letter notation visible; Reveal button + "Couldn't get past the cue" pre-reveal; tappable line list post-reveal.
  - **ColdCard** — title only; Reveal + "Couldn't" pre-reveal; tappable line list post-reveal.
- Shared subcomponents: `CardShell`, `CardButton` (primary/secondary tonal), `TappableLineList`.
- All three components accept the same `MemorizeCardProps` shape so the screen-level dispatcher is uniform — Letters/Cold ignore the `mastery` field, but the type contract holds across the dispatcher.
- 16 i18n keys per locale (en-US + pt-BR) under the `memorize` namespace.

### Phase 3 — Queue + session
- `buildSession({ allCards, today, cap, newRatio })` — pure. Default cap 10, default ratio 0.2 → 8 review + 2 new. Review pool sorted by `dueAt` ascending; new pool sorted by `createdAt` ascending. **Relaxed cap rule:** when review pool is short, the freed slots backfill with extra new cards (`expandedNewCap = cap - review.length`).
- Predicates `isReviewCard` / `isNewCard` / `isDueOn` extracted to `predicates.ts` — used by the queue and re-exported for the screen.
- `useMemorizeSession({ today })` — snapshots the queue at mount, tracks `currentIndex` via React state, exposes `record(outcome)` that calls the repository and advances. **Snapshot, not subscription** — mid-session opt-ins wait until next session per spec.

### Phase 4 — `/memorize` screen
- Route file `apps/app/src/app/memorize/index.tsx`. Layout shell with safe-area insets, close icon, centered "N of M" progress, scrollable card area.
- `extractPortionContent(prayer, language, portionIndex)` — pure helper that pulls localized title + portion lines + portion label out of a prayer manifest. Tested against single-portion and portioned shapes.
- `useCardContent(card)` — `useMemo` wrapper around `resolvePrayer` (sync, manifests are warmed at boot) + `extractPortionContent`.
- Three top-level states in the screen: empty (no cards opted in or none due today), active (renders the card matching `currentMode`), done (rotated reverent line).
- Added `getTodayString()` helper to `apps/app/src/hooks/useToday.ts` — replaces inline `format(getToday(), 'yyyy-MM-dd')` (which the codebase has 15+ times; future migration target).

---

## Key findings & decisions

### Architecture

- **Event-sourced is the project pattern, not a SQL row.** I started by sketching a `memorization_state` SQLite table and discovered every other domain (practices, completions, intentions, gratitudes, oblatio, confessio) goes through the events module. Memorization follows the same pattern: events append to `events`, the in-memory projection rebuilds at boot via `replayAll`. The trade-off is that the events table grows unbounded across all domains, but this is a project-wide concern — not memorization's to solve.
- **Card state is recomputed during replay**, not stored on the event. `MemorizationReviewed` carries only the outcome (mode + result), and the projection runs `applyOutcome` against the prior card state to derive the new state. This kept events small and made SM-2 deterministic.
- **Derived index `cardsByPrayerLanguage`** matches the existing `completionsByDate` / `completionsByPractice` pattern. O(1) `isOptedIn`, O(k) `MemorizationOptedOut`. Not premature — the simplify reviewer flagged this as a Phase 1 fix.

### Spec interpretations

- **`portionIndex` is 0-indexed throughout.** Whole-prayer cards use 0; portioned prayers use 0, 1, 2, ... The spec wording "0 for prayers that aren't broken into portions" is consistent with this — the whole-prayer case has only `portions[0]`.
- **Cold-mode regression resets `coldSuccesses` to 0** but keeps `hasFirstColdBonus` sticky. Spec says "first time" for the +0.15 ease bonus — interpreted as truly one-time, never re-awarded. Without this stickiness, a user who regresses and re-masters would get the bonus twice; the rule prevents that.
- **Tap-nothing floors mastery at 1.** Re-reading the spec: "mastery floors at 1 (don't punish a single bad day with a full reset)" — implemented as `mastery := 1` regardless of prior value, never 0. The user keeps a foothold (line 1 known) even after a complete blank.
- **Strict alternation in the middle range is sufficient for v1.** Spec defers probabilistic weighting to v1.1. `pickMode` toggles cued ↔ letters based on `lastMode`; defaults to cued when `lastMode` is null.
- **Cap relaxation logic.** Spec says "If review queue is empty, the cap relaxes — up to all available new cards may be introduced." Generalized this to: any unused review slots become new-card budget. Math: `expandedNewCap = cap - review.length`. Original 80/20 ratio holds when both pools are abundant.

### Unexpected gaps

- **`LocalizedText` type omits Latin.** `@ember/content-engine` defines `LocalizedText = { 'en-US'?, 'pt-BR'? }`, but the corpus prayer JSONs include `la`. I worked around with a local `AnyLangText = Partial<Record<ContentLanguage, string>>` cast inside `content.ts`. Worth fixing project-wide later — the existing `localizeBilingual` already handles the third language internally.
- **Tamagui token access.** `theme.colorSubtle?.get()` works, but the codebase's canonical pattern is `.val` (per `PageHeader.tsx` and `Ornament.tsx`). Caught by simplify; switched.

### Worktree-vs-canonical-repo gotcha

Mid-Phase-1 I noticed all my Write/Edit calls had landed at `/Users/gustavo/Documents/prayer/...` (the canonical repo on `main`) instead of the worktree. Absolute paths bypassed the worktree. I:
1. Captured the diff with `git diff HEAD` from the canonical repo (using `rtk proxy` to bypass token filtering — the standard rtk wrapper truncates large diff output).
2. Copied the new files + applied the modification patch into the worktree.
3. Verified files were byte-identical, then `git restore` + `rm` cleaned up the canonical repo.

Subsequent phases wrote directly to the worktree. **Lesson:** when the harness reports a worktree, all paths must start with the worktree root.

### Skipped (intentionally)

- **Memory Work POL completion logging.** The screen completes a card but does not yet log a `practice/memory-work` completion. Phase 5 creates the practice manifest and adds the Wall integration.
- **Audio.** v2 per spec.
- **Bridging cards** between portions of long prayers. v1.1 per spec.
- **"Prayers known by heart" devotion scroll.** v1.1 per spec.
- **Probabilistic mode weighting.** v1.1 per spec.

---

## Manual smoke-test plan

The `/memorize` route compiles and types check, but **no UI flow has been verified in a running app**. To smoke-test:

1. `pnpm start` (or `pnpm start:web`).
2. Until Phase 5 ships the opt-in flow, seed cards manually from the dev console:
   ```js
   // After app boot, in the JS context:
   const repo = await import('@/db/repositories/memorization')
   await repo.optInMemorization('prayer/our-father', 'en-US', [{ portionIndex: 0, totalLines: 10 }])
   await repo.optInMemorization('prayer/ave-maria', 'la', [{ portionIndex: 0, totalLines: 8 }])
   ```
3. Navigate to `/memorize` (e.g. `router.push('/memorize')` from any screen, or set up a temporary link from home).
4. Verify the three modes render correctly as mastery progresses:
   - First review of a new card: Cued mode (line 1 hidden, "Reveal next line").
   - After ~2 Got-its: alternates Cued ↔ Letters in the middle range.
   - At full mastery: alternates Letters ↔ Cold for ~2 exposures, then Cold dominates.
5. Verify the empty state when no cards are opted in.
6. Verify the done state after completing every queued card.

---

## What's left

### Phase 5 — Entry point + opt-in
- "Learn by heart" affordance on the prayer detail screen (status: *not started* / *Learning* / *Remembering*).
- Bottom-sheet language picker (EN / PT-BR / Latin / multiple).
- First-time POL slot auto-creation: `practice/memory-work` at Extra tier, daily schedule.
- Long-prayer "psalms are deep waters" nudge.
- Practice manifest authoring: `content/practices/memory-work/{manifest.json, flow.json}` with a one-section flow that links to `/memorize`.
- Wall integration: log `practice/memory-work` completion when the user finishes any review session that day.

### Phase 6 — Canonical content
- Add `memorize.portions` to ~5–8 long prayers per the spec list: Te Deum, Magnificat, Benedictus, Beatitudes, Psalm 50, Psalm 22, possibly Anima Christi-extended.
- Verify the ~12 short prayers (Pater, Ave, Credo, Memorare, Salve Regina, Suscipe, Sub Tuum, Anima Christi, Glory Be, Sign of the Cross, Act of Contrition, Angel of God) are eligible by default (no schema change needed).

### Project-wide deferred
- `LocalizedText` should include Latin in the package type. Currently widened locally per consumer.
- Migrate the 15+ inline `format(getToday(), 'yyyy-MM-dd')` sites to `getTodayString()`.
- `ScreenShell` extraction — `examen.tsx`, `kyrie.tsx`, and `/memorize` share the close-icon-+-centered-content header pattern.
