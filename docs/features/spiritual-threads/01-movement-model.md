# Phase 1 — Movement Model

> Status: Design ready. No code yet.
>
> Predecessors: none. Successors: Phase 2 (Prayer Integration) consumes the Movement projection via DSL blocks.

## Goal

User-visible: a person can capture intentions with a **cadence** (perpetual, goal, bounded) and an optional **subject tag**, see them grouped, and close them out with the right verb (retire / mark answered / auto-expire). The `/intentions` and `/gratias` screens look largely the same as today but with cadence + subject affordances.

Technical: replace the parallel intentions/gratias state with a single **Movement projection** in Zustand, sourced from new typed events. Old `Intention*` and `Gratitude*` events are dropped (greenfield — no migration). All read sites move to the new hooks.

This phase ships **no DSL changes and no prayer integration**. Movements are still siloed to their own screens. Phase 2 adds the `offering` and `capture-movement` blocks that route them through prayer.

## Out of scope (Phase 2+)

- `offering` / `capture-movement` DSL blocks.
- Per-practice pinning.
- Morning Offering reading active intentions.
- Resolutions, Examen rewrite, Plan of Life panel.
- Petition → thanksgiving bridge on closure.

## Architectural context

Existing patterns we adopt:

- **Event sourcing in SQLite + Zustand projection** (`apps/app/src/db/events/`). The `events` table is `(sequence, type, payload, timestamp, version)`. Events are typed discriminated unions keyed on `type`. Projections live in `useEventStore` (Zustand + Immer) and rebuild via `replayAll()`. Reads happen through hooks that subscribe to the store.
- **Repository pattern** (`apps/app/src/db/repositories/`). Each domain has a thin repo of imperative helpers (`addIntention`, `markIntentionAnswered`, …) that call `emit()` to write events.
- **TanStack Query for async DB reads** (per `CLAUDE.md`), but for this slice everything is synchronous Zustand reads — no Query needed.
- **No `intentions`/`gratitudes` SQLite tables today** — state is purely an in-memory projection. We keep it that way (see Decision 9).
- **i18n via flat-key locale objects** at `apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts`. Flow content uses `LocalizedText` directly; UI uses `t('key')`.

## Major decisions

### 1. One Movement projection vs two parallel ones

**Context.** Petitions and thanksgivings live in separate event streams (different events, different lifecycles), but the picker, the offering DSL block (Phase 2), and the Examen all need to query "any active movement." Parallel projections would force every consumer to know about both.

**Options.**
- **A. Two projections** (`petitions`, `thanksgivings`) with their own hooks. Type-narrow at every site. Verbose but loud.
- **B. One Movement projection** (`movements: Map<id, Movement>`) discriminated by `kind`. Type-narrow via filtered hooks (`useIntentions()`, `useThanksgivings()`).

**Decision.** **B.** One projection, kind-discriminated, with thin filter-hooks per kind. Events stay typed (`IntentionRaised` ≠ `ThanksgivingOffered`) so writes remain crisp.

**Implications.**
- One `movements` Map in Zustand, one switch arm per event in `applyEvent`.
- Hooks: `useMovements({kind, state})` (generic), `useIntentions()`, `useThanksgivings()` (kind-bound wrappers).
- Future kinds (lament, oblation, praise) slot in without new projections.

### 2. Cadence-aware state machine

**Context.** Per the spec, perpetual intentions are *carried* (never "answered"); goal intentions close on `answered`; bounded ones auto-`expired`. A flat `state: 'open' | 'answered'` doesn't fit perpetuals.

**Options.**
- **A. Single 4-value enum** (`'active' | 'answered' | 'expired' | 'retired'`). One column, atomic.
- **B. Two-field**: `state: 'active' | 'closed'` + `closure_kind?: 'answered' | 'expired' | 'retired'`.

**Decision.** **B.** `state` is the boolean predicate every query needs ("is this active right now?"). `closure_kind` is the analytic detail for closed items. Keeping them split avoids 4-way pattern matching at every read site.

**Implications.**
- `Movement.state` answers the dominant query. Index in Zustand: `movementsByState: Map<'active'|'closed', Set<id>>`.
- Closure UX (action-menu verbs) reads `cadence`:
  - `perpetual` → only "Retire."
  - `goal` → "Mark answered" + "Retire."
  - `bounded` → "Mark answered" + "Retire" (and the auto-expiry runs in the background).

### 3. Bounded petition expiry

**Context.** A bounded intention has `bounded_until: Date`. After that timestamp, it must transition to `closed/expired`. No background job runs reliably on mobile, so expiry has to be either lazy on read or driven by app lifecycle.

**Options.**
- **A. Pure lazy on read.** Every read filters out items past `bounded_until`. The event log never records the closure.
- **B. Sweep on app foreground.** A hook scans active bounded movements and emits `IntentionExpired` for any past their `bounded_until`. Periodic re-scan (e.g. every hour while app is open).
- **C. Sweep + lazy fallback.** B as the normal path; reads also defensively filter out expired-but-not-yet-eventized items so a missed sweep can't show a stale state.

**Decision.** **C.** The sweep keeps the event log honest (closure has a recorded moment); the lazy filter prevents user-visible glitches if the sweep hasn't run yet (e.g., app foregrounded for milliseconds).

**Implications.**
- New module `apps/app/src/features/movements/expiry.ts` exporting `useExpirySweep()`. Triggered by `AppState` change → 'active'. Internally uses `setInterval(sweep, 60 * 60 * 1000)` while foregrounded.
- Sweep is idempotent: re-emits do nothing because the event is filtered against `state === 'active'` before emission.
- Read hooks (`useMovements`) defensively skip items where `cadence === 'bounded' && bounded_until <= now() && state === 'active'`.

### 4. Subject tag — free-form vs canonicalized

**Context.** A user wants to group "Mom" intentions. Should subject be a normalized entity, or just a string?

**Options.**
- **A. Free-form string.** "Mom" and "mom" become two groups; user has to be consistent.
- **B. Canonical subject entity** with its own table and ids.
- **C. Free-form with auto-suggest** of recently-used subjects to nudge consistency.

**Decision.** **C.** Single string field; capture form auto-suggests from the last N unique subjects. No separate entity. Solo-user app — collisions are rare and fixable in-place.

**Implications.**
- `Movement.subject?: string` (undefined when no subject; never empty string).
- Hook `useRecentSubjects(n = 8)` derives from the event log (most recent unique non-undefined subjects).
- Future canonicalization is a non-breaking refactor: introduce a Subject entity and migrate string → ref. Defer.

### 5. Event naming and vocabulary

**Context.** The user-facing screen is `/intentions`. Catholic theology distinguishes intentions (broad, often perpetual) from petitions (specific asks). The Movement abstraction in code unifies them under `kind: 'petition' | ...` was an earlier draft choice.

**Options.**
- **A. `kind: 'petition'`** (theological precision). UI says "intentions"; code says "petitions"; contributors learn the dual vocabulary.
- **B. `kind: 'intention'`** (UI parity). Lose precision but avoid a translation layer.

**Decision.** **B.** `kind: 'intention' | 'thanksgiving'`. The UI word wins because the cognitive cost of dual vocabulary outweighs the theological nuance — perpetual *intentions* are perfectly within the meaning of "intention." Event names follow: `IntentionRaised`, `IntentionUpdated`, `IntentionAnswered`, `IntentionExpired`, `IntentionRetired`, `ThanksgivingOffered`, `ThanksgivingUpdated`, `ThanksgivingRetired`.

**Implications.** Naming throughout this PRD that says "Petition*" is updated to "Intention*" for code-facing artifacts. The README's *Movements of prayer* section uses `kind: 'intention' | 'thanksgiving'` going forward.

### 6. Replace old events vs run in parallel

**Context.** Old events (`IntentionAdded`, `IntentionUpdated`, `IntentionAnswered`, `IntentionRemoved`, `GratitudeRecorded`, `GratitudeRemoved`) exist in any local DB the user already opened.

**Options.**
- **A. Migrate** old events into new (`IntentionAdded` → `IntentionRaised` with default cadence='perpetual').
- **B. Wipe** old events on first new-version startup.
- **C. Ignore** them — new projection only handles new event types; old ones become inert.

**Decision.** **C.** Greenfield was approved; CLAUDE.md says no migrations. The new `applyEvent` switch handles only the new types. Old types fall through to a no-op default arm so SQLite stays valid but the Zustand store ignores them.

**Implications.**
- Solo user can wipe their local DB manually if they care; we don't write migration code.
- `applyEvent` has explicit no-op cases for old types (just to suppress dev-mode "unknown event type" warnings during the transition window). Removed in Phase 2 once the dust settles.

### 7. Repository function naming

**Context.** Old repos exposed verb-keyed mutators (`addIntention(text)`). New design has more parameters (cadence, subject) and more verbs (retire, expire).

**Options.**
- **A. Kind-specific functions.** `raiseIntention(input)`, `markIntentionAnswered(input)`, `offerThanksgiving(input)`, etc.
- **B. Generic with kind param.** `recordMovement({kind, ...})`, `closeMovement({id, closure_kind, ...})`.

**Decision.** **A** for the imperative repo; export both. Kind-specific reads better at call sites (`raiseIntention(...)` vs `recordMovement({kind: 'intention', ...})`). The generic shape is exposed alongside for the picker / DSL block (Phase 2) and tests.

**Implications.**
- `apps/app/src/db/repositories/movements.ts` exports both narrow (`raiseIntention`, …) and broad (`recordMovement`) APIs.
- Hooks mirror: `useRaiseIntention()`, `useOfferThanksgiving()`, plus the generic `useRecordMovement()`.

### 8. Module layout

**Context.** Old code had `features/intentions/` and `features/gratias/` as siblings. The new design has one shared module backing both screens.

**Decision.**
- `apps/app/src/features/movements/` is the home for everything: hooks, components, expiry logic, types.
- `apps/app/src/app/intentions/index.tsx` and `apps/app/src/app/gratias/index.tsx` are thin route shims that mount `<MovementList kind="..." />`.
- The old `features/intentions/` and `features/gratias/` folders are deleted entirely.

### 9. Persistence — no SQLite table for movements

**Context.** Today, intentions/gratitudes are pure projections in Zustand. Events go to SQLite; the in-memory store rebuilds on launch via `replayAll()`. For solo use with thousands-of-events scale, this is fine.

**Decision.** Keep the same pattern. **No `movements` table.** All Movement state is the Zustand projection. The event log is the only durable artifact.

**Implications.**
- Boot path is: open SQLite → read events → replay → render. No new query layer.
- Future scale concern (10⁵+ events) would warrant a materialized table; not now.

### 10. Capture UX (cadence + subject)

**Context.** The capture sheet has to fit cadence + subject without making the common case (just type "Dad") more than one tap.

**Decision.**
- Top of sheet: text input (multiline, autofocus).
- Below: a single horizontal segmented control with three options: **Perpetual** (default, selected), **Goal**, **Bounded**.
- A small chevron-style "Add subject" affordance opens a second-row input with auto-suggested subjects (chips, tap to insert) plus free-text.
- If `Bounded` is selected, a date picker appears below. Default: 30 days from now.
- Save button is enabled as soon as text is non-empty.
- The cadence segmented control has a tooltip/help icon explaining the difference.

This keeps the zero-config path one tap (type → save) while making cadence/subject visible without nesting them under a "more options" disclosure.

## Data model

### Event types (additions to existing union)

```ts
// apps/app/src/db/events/types.ts (extend existing discriminated union)

type IntentionRaised = {
  type: 'IntentionRaised'
  id: string                          // UUID
  text: string
  subject?: string                    // freeform tag, undefined if absent
  cadence: 'perpetual' | 'goal' | 'bounded'
  bounded_until?: number              // epoch ms; required iff cadence='bounded'
  raised_at: number
}

type IntentionUpdated = {
  type: 'IntentionUpdated'
  id: string
  text?: string
  subject?: string | null             // null = explicit clear
  cadence?: 'perpetual' | 'goal' | 'bounded'
  bounded_until?: number | null
}

type IntentionAnswered = {
  type: 'IntentionAnswered'
  id: string
  notes?: string
  answered_at: number
}

type IntentionExpired = {
  type: 'IntentionExpired'
  id: string
  expired_at: number                  // typically === movement.bounded_until
}

type IntentionRetired = {
  type: 'IntentionRetired'
  id: string
  retired_at: number
}

type ThanksgivingOffered = {
  type: 'ThanksgivingOffered'
  id: string
  text: string
  subject?: string
  offered_at: number
}

type ThanksgivingUpdated = {
  type: 'ThanksgivingUpdated'
  id: string
  text?: string
  subject?: string | null
}

type ThanksgivingRetired = {
  type: 'ThanksgivingRetired'
  id: string
  retired_at: number
}
```

### Projection (Zustand)

```ts
// apps/app/src/db/events/state.ts (extend)

type Movement = {
  id: string
  kind: 'intention' | 'thanksgiving'
  text: string
  subject?: string
  cadence?: 'perpetual' | 'goal' | 'bounded'   // intentions only
  bounded_until?: number                        // intentions, cadence='bounded' only
  state: 'active' | 'closed'
  closure_kind?: 'answered' | 'expired' | 'retired'
  recorded_at: number
  closed_at?: number
  notes?: string                                // captured at IntentionAnswered
}

type EventState = {
  // ... existing fields
  movements: Map<string, Movement>
  movementsByKind: Map<Movement['kind'], Set<string>>
  movementsByState: Map<Movement['state'], Set<string>>
}
```

### `applyEvent` arms (sketch)

```ts
case 'IntentionRaised': {
  draft.movements.set(e.id, {
    id: e.id, kind: 'intention', text: e.text,
    subject: e.subject, cadence: e.cadence, bounded_until: e.bounded_until,
    state: 'active', recorded_at: e.raised_at,
  })
  addToIndex(draft.movementsByKind, 'intention', e.id)
  addToIndex(draft.movementsByState, 'active', e.id)
  break
}

case 'IntentionAnswered': {
  const m = draft.movements.get(e.id); if (!m) break
  m.state = 'closed'; m.closure_kind = 'answered'; m.closed_at = e.answered_at; m.notes = e.notes
  moveIndex(draft.movementsByState, e.id, 'active', 'closed')
  break
}
// IntentionExpired, IntentionRetired similar
// ThanksgivingOffered/Updated/Retired similar
```

## Module structure

### Created

| File | Purpose |
|------|---------|
| `apps/app/src/db/repositories/movements.ts` | `raiseIntention`, `updateIntention`, `markIntentionAnswered`, `retireIntention`, `expireIntention` (used internally by sweep), `offerThanksgiving`, `updateThanksgiving`, `retireThanksgiving`, plus generic `recordMovement`. Each calls `emit()` with the corresponding event. |
| `apps/app/src/features/movements/hooks.ts` | `useMovements({kind, state})`, `useIntentions({state})`, `useThanksgivings()`, `useActiveIntentions()`, `useAnsweredIntentions()`, `useRecentSubjects(n)`, plus mutation hooks (`useRaiseIntention`, …) wired through `useMutation`. |
| `apps/app/src/features/movements/expiry.ts` | `useExpirySweep()`. Subscribes to `AppState`, runs `sweepExpiredIntentions()` on foreground + 1h interval. `sweepExpiredIntentions` iterates active bounded intentions and calls `expireIntention(id)` for any past `bounded_until`. |
| `apps/app/src/features/movements/components/MovementList.tsx` | Generic list parameterized by `kind`. Uses Tamagui section list. Groups by `subject` when at least one item has one. |
| `apps/app/src/features/movements/components/MovementCard.tsx` | Single-row item: text + subject chip + cadence indicator + closure status. Long-press opens action menu. |
| `apps/app/src/features/movements/components/MovementCaptureSheet.tsx` | Tamagui Sheet with the capture UX from Decision 10. Kind is a prop. |
| `apps/app/src/features/movements/components/CadenceToggle.tsx` | The 3-way segmented control. |
| `apps/app/src/features/movements/components/SubjectInput.tsx` | Free-text + auto-suggest chips (driven by `useRecentSubjects`). |
| `apps/app/src/features/movements/components/MovementActionMenu.tsx` | Context menu rendering verbs based on `cadence`/`state`. |
| `apps/app/src/features/movements/index.ts` | Barrel: re-exports hooks and components. |
| `apps/app/src/features/movements/__tests__/projection.test.ts` | Unit tests for the new event handlers. |
| `apps/app/src/features/movements/__tests__/expiry.test.ts` | Unit tests for `sweepExpiredIntentions`. |

### Deleted

- `apps/app/src/db/repositories/intentions.ts`
- `apps/app/src/db/repositories/gratias.ts`
- `apps/app/src/features/intentions/` (whole folder, including `hooks.ts` and `index.ts`)
- `apps/app/src/features/gratias/` (whole folder)
- The old event types `IntentionAdded`, `IntentionUpdated`, `IntentionAnswered`, `IntentionRemoved`, `GratitudeRecorded`, `GratitudeRemoved` — both their type definitions and their `applyEvent` arms.

### Extended

- `apps/app/src/db/events/types.ts` — extend the union with the eight new event types from the *Data model* section.
- `apps/app/src/db/events/state.ts` — add `movements`, `movementsByKind`, `movementsByState` to the projection.
- `apps/app/src/db/events/projections.ts` — add the eight new arms to `applyEvent`. Add no-op arms for the deleted old types (transitional; remove in Phase 2).
- `apps/app/src/app/intentions/index.tsx` — replace screen body with `<MovementList kind="intention" />` plus a FAB that opens `<MovementCaptureSheet kind="intention" />`.
- `apps/app/src/app/gratias/index.tsx` — same with `kind="thanksgiving"`.
- `apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts` — add keys for cadence labels, action menu verbs, capture sheet copy. Remove keys that were referenced only from the deleted features.

## Tasks

Ordered. Each task is one PR-sized commit unless noted. **`*`** = test must be green before moving on.

1. **Type-define the new events.** Extend the union in `apps/app/src/db/events/types.ts`. No projection wiring yet.
2. **Add Movement projection state and indexes** to `apps/app/src/db/events/state.ts`. Wire the eight `applyEvent` arms in `projections.ts`. Add no-op arms for old types. *Unit tests for projection: replay a hand-built event list and assert resulting `Movement` shapes.*
3. **Build the movements repository** (`apps/app/src/db/repositories/movements.ts`). Each function emits a single event, returns the new id where applicable. Add `recordMovement` as the generic facade.
4. **Build the hooks** (`apps/app/src/features/movements/hooks.ts`). Read hooks select from the Zustand store; mutation hooks wrap the repo. *Unit tests: round-trip add → read → close → read.*
5. **Build the expiry sweep** (`apps/app/src/features/movements/expiry.ts`). Mount `useExpirySweep()` from the app root layout. *Unit test: prepare three bounded movements (past, future, already-closed); sweep emits exactly one event.*
6. **Capture sheet and supporting controls.** `CadenceToggle`, `SubjectInput`, `MovementCaptureSheet`. Add a Storybook-style screen `dev/movements-capture` for visual review (optional; remove before merge if not wanted).
7. **List and card.** `MovementList`, `MovementCard`. Subject grouping is on whenever ≥1 item in the list has a subject; otherwise flat. Sort: active by recorded_at desc, then a divider, then closed.
8. **Action menu.** `MovementActionMenu` with cadence-aware verbs. Wire to mutation hooks. Confirmation dialog only for "Retire" (no undo).
9. **Wire `/intentions` and `/gratias` route shims.** Both point at `MovementList` + capture sheet. FAB icon and copy per i18n.
10. **Delete old code.** Remove `repositories/intentions.ts`, `repositories/gratias.ts`, `features/intentions/`, `features/gratias/`. Remove their event types and projection arms. Run `pnpm biome check .` to find dangling imports; fix or delete callers.
11. **i18n cleanup.** Audit `en-US.ts` / `pt-BR.ts` for now-unused keys (specifically `intentions.*` and `gratias.*` strings tied to the old hooks); remove them. Add new keys.
12. **Run the app.** Manual checks: capture a perpetual intention; capture a goal; capture a bounded with `bounded_until` 1 day out; mark goal answered with notes; retire perpetual; advance device clock past `bounded_until` and verify auto-expiry on next foreground.
13. **Run `pnpm test` from root.** All workspaces green.

## Tests

Minimum coverage for this phase:

- **Projection**: every event type produces the expected Movement state and index updates. Idempotent against duplicate events (e.g., two `IntentionAnswered` for the same id — the second is a no-op).
- **Expiry sweep**: emits exactly one `IntentionExpired` per overdue active bounded intention; never emits for non-bounded; never emits twice.
- **Hooks**: `useActiveIntentions` excludes closed; `useAnsweredIntentions` excludes retired/expired; `useRecentSubjects` returns top-N unique subjects newest-first.
- **Repo round-trip**: `raiseIntention → store reflects → markIntentionAnswered → store reflects → useAnsweredIntentions returns it`.

No e2e/UI tests this phase; the screens are simple enough that manual QA in step 12 is sufficient.

## Verification

This phase is done when:

- `/intentions` and `/gratias` routes load and behave as described in *Tasks → step 12*.
- The old `apps/app/src/features/intentions/` and `apps/app/src/features/gratias/` folders no longer exist.
- `git grep "IntentionAdded\\|IntentionRemoved\\|GratitudeRecorded"` returns nothing in `apps/app/src/`.
- `pnpm test` passes in all workspaces.
- A device/emulator session covers: capture (×3 cadences), close (×3 closure paths), restart-and-replay (state restored), advance-clock (auto-expiry).
- The journal at `docs/journal.md` gets one entry: any non-obvious gotcha discovered (e.g., `AppState` listener quirks).

## Risks and watchpoints

- **Event-replay performance** if the user has accumulated thousands of old `Intention*` events that we no-op. Acceptable for now (their no-op handlers are O(1)). Revisit if startup is sluggish.
- **`AppState` listener cleanup.** A common Expo pitfall is leaking listeners on hot reload. `useExpirySweep` must `removeSubscription()` on unmount.
- **Date picker timezone.** `bounded_until` is stored as epoch ms (UTC). Display always uses the user's locale. The sweep compares to `Date.now()`. No DST footguns expected.
- **Subject auto-suggest UX in PT-BR.** Verify diacritics survive the round-trip (e.g., "Mãe" should match "Mãe", not be split).
