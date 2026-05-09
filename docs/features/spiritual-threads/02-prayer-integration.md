# Phase 2 — Prayer Integration

> Status: Design ready. Depends on Phase 1.
>
> Predecessors: Phase 1 (Movement Model). Successors: Phase 3 introduces parallel `capture-resolution` / `review-resolution` blocks reusing the same engine wiring.

## Goal

User-visible: when a user starts a practice that has an `offering` block (Rosary, Morning Offering, …), pinned intentions/gratitudes appear pre-selected in a launch picker; per-occurrence picks can be added; the running practice surfaces those movements at the right liturgical moment. A `capture-movement` block can also create new movements mid-flow.

Technical: extend the `packages/content-engine/` DSL with two new block types (`offering`, `capture-movement`); extend `EngineContext` with movement-read/write deps; build per-practice pinning with the same event-sourced pattern as Phase 1; the practice player UI renders the new blocks and runs a pre-flow picker.

## Out of scope (later phases)

- Resolutions and the `capture-resolution`/`review-resolution` blocks (Phase 3).
- Examen rewrite (Phase 3).
- Plan of Life Resolutions panel (Phase 4).
- Petition → thanksgiving bridge (Phase 6).

## Architectural context

Prerequisites and conventions we lean on:

- **Phase 1 lands first.** Movement projection is in Zustand, `useIntentions()`, `useThanksgivings()`, `useRecordMovement()` exist.
- **Content engine** at `packages/content-engine/src/`. The `FlowSection` discriminated union in `types.ts` lists ~25 block types (`prayer`, `hymn`, `repeat`, `cycle`, `psalmody`, …). `engine.ts` exports `resolveFlow(definition, context, ec)` returning `RenderedSection[]`. `EngineContext` (lines 35–69 of `engine.ts`) holds language, localizers, `prayers`, `canticles`, `prose`, optional fetchers — pure host-injected deps. **The engine is practice-agnostic and must stay so.** All Movement deps go through `EngineContext`.
- **Flow text.** Prompts use `LocalizedText` objects (`{ "en-US": "...", "pt-BR": "..." }`) directly in the manifest, not i18n keys. Matches the rest of the corpus.
- **Practice player.** Lives in `apps/app/src/components/practice/`. Mounts the engine, renders `RenderedSection[]`, owns the run state (current section, completion). New block types render via this layer.

## Major decisions

### 1. Block surface — two primitives or one with discriminator

**Context.** `offering` (read-side surface) and `capture-movement` (write-side capture) share concepts (kind, subject) but are distinct interactions. They could be folded into one (`movement-block { mode: 'show' | 'capture' }`) or kept separate.

**Options.**
- **A. One block with a `mode` discriminator.** Less DSL surface; reads and writes look uniform.
- **B. Two distinct block types.** Clearer at flow-author time; mode-specific fields don't need to be optional.

**Decision.** **B.** Two blocks. The fields differ enough (`mode`/`default`/`show` vs `prompt`/`multi`/`defaults`) that a unified block becomes a tangle of mutually-exclusive optional fields. Two blocks read better in flow.json. Phase 3's `capture-resolution`/`review-resolution` follow the same shape.

**Implications.** Two new entries in the `FlowSection` union; two new resolver arms; two new render components.

### 2. EngineContext extension — what the engine sees

**Context.** The engine is pure: takes a flow definition + context, returns `RenderedSection[]`. To resolve `offering`, it needs to know which movements are active. To resolve `capture-movement`, it needs to know default cadence (and at runtime, write events).

**Options.**
- **A. Make engine deps wider.** Add live `movements` repo + Zustand-backed read methods to `EngineContext`. Engine can now both read and write.
- **B. Engine reads only; writes happen in the player.** `EngineContext` exposes only read methods. The engine resolves a `capture-movement` block to a `RenderedCaptureMovement` element with the prompt and cadence default; the practice player owns the `onSubmit` that calls `useRecordMovement()`.

**Decision.** **B.** Keeps the engine pure (no side-effect dependencies). The player is already where user interactions resolve. Tests of the engine don't need a Zustand harness.

**Implications.**
- `EngineContext` gains:
  ```ts
  movements?: {
    listActive: (filter: { kind: 'intention' | 'thanksgiving'; subject?: string }) => Movement[]
    listPinnedFor: (practiceId: string, kind: 'intention' | 'thanksgiving') => Movement[]
    recentSubjects: (n?: number) => string[]
  }
  ```
  All read-only. Optional so non-app contexts (tests, cloud-prerender) can omit.
- The practice player wires the movement repos into `EngineContext` at engine instantiation.
- `capture-movement` blocks resolve to a `RenderedCaptureMovement` element holding `{ kind, prompt, cadenceDefault, multi, optional }`. The player attaches its own submit handler.

### 3. Pinning storage — projection or table

**Context.** Pins are small and rarely changed. Same trade-off as Phase 1's Movement projection.

**Decision.** Same answer: **event-sourced, projected into Zustand. No SQLite table.** Two events:

```ts
type MovementPinned   = { type: 'MovementPinned';   practice_id: string; movement_id: string; pinned_at: number }
type MovementUnpinned = { type: 'MovementUnpinned'; practice_id: string; movement_id: string; unpinned_at: number }
```

Projection: `pins: Map<practiceId, Set<movementId>>`. A pin is also a structural reference — if the underlying movement is closed (answered/expired/retired), it stays pinned but `listPinnedFor` filters it out (only active movements surface). When a movement is unpinned (or removed in the future), the index is updated.

**Implications.**
- Repo `apps/app/src/db/repositories/practice-pins.ts` exposes `pinMovement(practiceId, movementId)`, `unpinMovement(...)`, `listPinnedFor(practiceId, kind)`.
- Hook `usePinnedFor(practiceId, kind)`.
- A Movement closure does **not** auto-unpin; the user can intentionally retire-and-keep-pinned (rare) or explicitly unpin. Filtering at the read layer handles the common case.

### 4. Picker model — flow block or pre-flow UI

**Context.** When a practice with an `offering` block starts, pinned items are pre-selected, and the user can add per-occurrence picks. Where does that picker live — as part of the flow itself, or as a separate UI step before the flow?

**Options.**
- **A. New `offering-picker` block** at the start of the flow. Engine renders it, player handles selection.
- **B. Player-level pre-flow sheet.** The player inspects the resolved flow at launch; if any `offering` block exists with a non-`silent` show mode, it opens a sheet before the flow's first section.
- **C. Inline in the first `offering` block** with a "select intentions" affordance when it renders.

**Decision.** **B.** The picker isn't really a prayer step — it's a launch-time configuration moment, conceptually like choosing the language or psalm cycle. Adding `offering-picker` to the DSL bloats the surface for no flow-author benefit. Inline (C) makes the first `offering` block heavier than later ones, which is inconsistent.

**Implications.**
- Practice player gains a "pre-flow" phase: scan resolved flow → if `offering` blocks exist that need selection (`default: 'user-pick'` or pinned items present) → show `<OfferingPickerSheet practiceId mode>` → on confirm, store selection in run-state.
- Run-state has new field: `offering: { intentions: Movement[], thanksgivings: Movement[] }`.
- All `offering` blocks in the flow read from this run-state, not from `EngineContext.movements.*` directly. (The engine still resolves the block; rendering uses run-state.)

This means the engine's `resolveOffering` resolves to a `RenderedOffering` placeholder; the player fills in actual movements at render time from run-state.

### 5. `default` semantics

**Context.** The `offering` block's `default` field controls what the picker pre-selects.

**Options recap.**
- `default: 'pinned'` — pre-select pinned movements; user can add/remove.
- `default: 'all-active'` — pre-select every active movement of the right kind.
- `default: 'user-pick'` — start empty; user picks.

**Decision.** All three supported. Practice authors choose:
- Rosary uses `default: 'pinned'` (the user's standing intentions are the natural ones).
- Morning Offering uses `default: 'all-active'` (every intention the user carries is offered into the day).
- A novena could use `default: 'user-pick'` to force conscious choice.

**Implications.**
- `OfferingPickerSheet` initial state derives from `default` × pin/active queries.
- If `default: 'all-active'` and there are zero active movements, the picker still shows (empty state with "you have no intentions — capture one?") so the user knows the offering block is a no-op.
- If `default: 'pinned'` and there are zero pinned items for this practice, the sheet shows pinned section empty + an "all active" tab.

### 6. `show` mode at render time

**Context.** When the `offering` block resolves inside the flow, how is it visually presented?

**Options recap.**
- `show: 'list'` — full list, subject-grouped, non-interactive.
- `show: 'count'` — short summary ("Offering 5 intentions for the family").
- `show: 'silent'` — renders nothing visible; only informs the run that intentions are being carried (e.g., for a reflective practice that doesn't need to display them again after picking).

**Decision.** All three. Default is `'list'`.

**Implications.**
- `RenderedOffering` carries `show`; the player switches on it.
- `'silent'` still triggers the picker pre-flow (so the user *consciously* chooses what they're offering); it just suppresses in-flow rendering.

### 7. `capture-movement` mid-flow vs end-of-flow

**Context.** A `capture-movement` block could appear anywhere — at the start of the Morning Offering ("anything new this morning?") or at the end of the Examen ("anything else?"). Both work the same.

**Decision.** No special positioning rules. The block resolves to a card with prompt + capture sheet UI; on submit, it advances the flow (or stays if `multi: true` until the user taps "Done").

**Implications.**
- `RenderedCaptureMovement` is just another rendered section; the player handles it via a submit-then-advance handler.
- `multi: true` collects N entries before advancing; each submission writes a separate event.
- `optional: true` shows a "skip" affordance.

### 8. Pin entry points

**Context.** Where does the user discover pinning?

**Options.**
- From `/intentions`: tap-and-hold a movement → action menu has "Pin to practice…" → sheet listing user's active practices, multi-select.
- From the picker (pre-flow): each movement row has a star icon; tapping toggles pin for the current practice.
- From the practice settings: each practice has a "Default offerings" section.

**Decision.** Two entry points: the long-press menu in `/intentions` and `/gratias` (multi-select practice list), plus the in-picker star icon. Practice settings is over-engineering for v1; defer.

**Implications.**
- `MovementActionMenu` (Phase 1 component) gains "Pin to practice…" action that opens `<PinPracticeSheet movementId>`.
- `OfferingPickerSheet` rows include a star toggle that calls `pinMovement(practiceId, movementId)` / `unpinMovement(...)`.

### 9. Morning Offering integration shape

**Context.** The Morning Offering flow needs to surface active intentions and optionally let the user capture new ones.

**Decision.** Insert two new blocks in the appropriate section of `content/practices/morning-offering/flow.json`:

1. `{ "type": "offering", "mode": "intercessory", "default": "all-active", "show": "list", "label": { "en-US": "Today's intentions", "pt-BR": "Intenções de hoje" } }`
2. `{ "type": "capture-movement", "kind": "intention", "prompt": { "en-US": "Anything new this morning?", "pt-BR": "Algo novo nesta manhã?" }, "multi": true, "optional": true, "defaults": { "cadence": "perpetual" } }`

The exact placement (which section, before/after which existing block) is a content-author decision; the design only mandates that both appear once, in the order above.

**Implications.**
- Bump `content/practices/morning-offering/manifest.json` `version`.
- Other practices (Rosary, Te Deum, Mass propers) are **not** modified in this phase. Authors can add `offering` blocks opportunistically; one example (Morning Offering) is enough to validate the pipeline.

### 10. Failure modes — empty states and reduced motion

**Context.** Several edge cases need defined behavior:
- Active movements list is empty.
- Picker dismissed without any selection.
- A pinned movement has been retired but pin is stale.
- `offering` block in a flow that has no movement deps in `EngineContext`.

**Decision.**
- **Empty active list (`default: 'all-active'`).** Picker shows a friendly empty state with a "Capture an intention" shortcut that opens `MovementCaptureSheet` inline. If user dismisses without capturing, run-state.offering is `[]` and the in-flow `offering` block renders an empty state (`'list'` shows "No intentions today", `'count'` shows "Offering today's prayer", `'silent'` renders nothing).
- **Picker dismissed empty.** Same as above.
- **Stale pin.** Filtered at read time (`listPinnedFor` returns only `state === 'active'` movements). The pin still exists in the projection; `useUnpin` is called only on user action.
- **Missing deps.** If `EngineContext.movements` is `undefined`, the engine skips `offering` blocks (returns nothing) and renders `capture-movement` as a no-op text ("This block requires app context"). Useful for prerender/test.

## Data model

### Event types (additions to existing union)

```ts
type MovementPinned = {
  type: 'MovementPinned'
  practice_id: string
  movement_id: string
  pinned_at: number
}

type MovementUnpinned = {
  type: 'MovementUnpinned'
  practice_id: string
  movement_id: string
  unpinned_at: number
}
```

### Projection state extension

```ts
// apps/app/src/db/events/state.ts
type EventState = {
  // ... existing fields including Phase 1 movements/movementsByKind/movementsByState
  pins: Map<string, Set<string>>   // practice_id -> set of movement_ids
}
```

### `applyEvent` arms

```ts
case 'MovementPinned': {
  let s = draft.pins.get(e.practice_id)
  if (!s) { s = new Set(); draft.pins.set(e.practice_id, s) }
  s.add(e.movement_id)
  break
}
case 'MovementUnpinned': {
  draft.pins.get(e.practice_id)?.delete(e.movement_id)
  break
}
```

Idempotent — adding/removing twice is a no-op.

### DSL types (content-engine)

```ts
// packages/content-engine/src/types.ts (extend FlowSection union)

type OfferingBlock = {
  type: 'offering'
  mode: 'intercessory' | 'thanksgiving' | 'both'
  default?: 'pinned' | 'all-active' | 'user-pick'   // default: 'pinned'
  show?: 'list' | 'count' | 'silent'                // default: 'list'
  label?: LocalizedText
  scope?: 'practice' | 'section'                    // default: 'practice'
}

type CaptureMovementBlock = {
  type: 'capture-movement'
  kind: 'intention' | 'thanksgiving'
  prompt: LocalizedText
  multi?: boolean                                   // default: false
  optional?: boolean                                // default: false
  defaults?: {
    cadence?: 'perpetual' | 'goal' | 'bounded'      // default: 'perpetual' for intentions
  }
}
```

### Resolved/rendered shapes

```ts
// What the engine emits for the player to render
type RenderedOffering = {
  type: 'rendered-offering'
  mode: OfferingBlock['mode']
  show: NonNullable<OfferingBlock['show']>
  default: NonNullable<OfferingBlock['default']>
  label?: BilingualText
  // movements are NOT inlined here — player reads from run-state at render time
}

type RenderedCaptureMovement = {
  type: 'rendered-capture-movement'
  kind: CaptureMovementBlock['kind']
  prompt: BilingualText
  multi: boolean
  optional: boolean
  defaultCadence: 'perpetual' | 'goal' | 'bounded'
}
```

### Engine context extension

```ts
// packages/content-engine/src/engine.ts
type EngineContext = {
  // ... existing
  movements?: {
    listActive(filter: { kind: 'intention' | 'thanksgiving'; subject?: string }): Movement[]
    listPinnedFor(practiceId: string, kind: 'intention' | 'thanksgiving'): Movement[]
    recentSubjects(n?: number): string[]
  }
}
```

### Practice run state

```ts
// apps/app/src/features/practice/runtime.ts (or wherever run state lives)
type PracticeRunState = {
  // ... existing
  offering: {
    intentions: Movement[]
    thanksgivings: Movement[]
  }
}
```

## Module structure

### Created

| File | Purpose |
|------|---------|
| `apps/app/src/db/repositories/practice-pins.ts` | `pinMovement`, `unpinMovement`, `listPinnedFor(practiceId, kind)` (reads from projection). |
| `apps/app/src/features/movements/hooks-pins.ts` | `usePinnedFor(practiceId, kind)`, `usePinMovement()`, `useUnpinMovement()`. |
| `apps/app/src/features/practice/OfferingPickerSheet.tsx` | Pre-flow picker. Tabs for "Pinned" and "All active" (when both make sense). Star toggle per row. |
| `apps/app/src/features/practice/PinPracticeSheet.tsx` | Multi-select sheet of practices, opened from a movement's action menu. |
| `apps/app/src/features/practice/blocks/RenderedOfferingBlock.tsx` | Renders `RenderedOffering` from run-state. Switches on `show`. |
| `apps/app/src/features/practice/blocks/RenderedCaptureMovementBlock.tsx` | Inline capture; uses `MovementCaptureSheet` from Phase 1 (or its inline variant). |
| `packages/content-engine/src/blocks/offering.ts` | Resolver for `OfferingBlock` → `RenderedOffering`. |
| `packages/content-engine/src/blocks/capture-movement.ts` | Resolver for `CaptureMovementBlock` → `RenderedCaptureMovement`. |
| `packages/content-engine/__tests__/offering.test.ts` | Engine tests for offering resolution. |
| `packages/content-engine/__tests__/capture-movement.test.ts` | Engine tests for capture-movement resolution. |

### Extended

- `apps/app/src/db/events/types.ts` — add `MovementPinned`, `MovementUnpinned`.
- `apps/app/src/db/events/state.ts` — add `pins: Map<string, Set<string>>`.
- `apps/app/src/db/events/projections.ts` — add the two new arms.
- `packages/content-engine/src/types.ts` — extend `FlowSection` union with `OfferingBlock` and `CaptureMovementBlock`.
- `packages/content-engine/src/engine.ts` — extend `EngineContext`; add `case 'offering'` and `case 'capture-movement'` arms in `resolveSection`.
- `apps/app/src/components/practice/PracticePlayer.tsx` (or equivalent) — pre-flow picker phase; render the two new block types; manage `runState.offering`.
- `apps/app/src/features/movements/components/MovementActionMenu.tsx` — add "Pin to practice…" verb that opens `PinPracticeSheet`.
- `apps/app/src/features/movements/components/MovementCard.tsx` — show a small pin indicator if the movement is pinned to ≥1 practice (a tiny pin icon with count tooltip).
- `content/practices/morning-offering/flow.json` — add the two blocks per Decision 9. Bump version in `manifest.json`.
- `apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts` — copy for picker, "pin to practice", capture inline prompts where they don't come from the flow JSON, empty states.
- `docs/features/unified-flow-system.md` — document the two new block types in the DSL reference (one paragraph + a JSON example for each).
- `docs/features/features-overview.md` — link to the new sections; cross-reference the spiritual-threads README.

### Deleted

Nothing this phase. (The transitional no-op arms for old `IntentionAdded` / `GratitudeRecorded` / etc. added in Phase 1 can be deleted now if any local devs have completed the Phase 1 transition. Optional cleanup.)

## Tasks

1. **Pin events and projection.** Add the two event types, projection state, and `applyEvent` arms. *Unit tests for projection.*
2. **Pin repository.** `practice-pins.ts` exposes `pinMovement`, `unpinMovement`, `listPinnedFor`. *Round-trip test.*
3. **Pin hooks.** `usePinnedFor`, `usePinMovement`, `useUnpinMovement`.
4. **Engine — types.** Extend `FlowSection` and `EngineContext` in `packages/content-engine/src/types.ts` and `engine.ts`. Compile-only checkpoint; no runtime change yet.
5. **Engine — resolvers.** Implement `offering.ts` and `capture-movement.ts` resolvers. Wire them into `resolveSection`. *Engine tests with hand-built `EngineContext`.*
6. **Practice player — run-state extension.** Add `offering: { intentions, thanksgivings }` to run state. Default empty.
7. **Pre-flow picker.** `OfferingPickerSheet`. Inputs: practice id, mode, default. Reads from `usePinnedFor`/`useIntentions`/`useThanksgivings`. Emits selection. Wired into the practice player launch path: scan resolved flow → present sheet if applicable → confirm → start flow.
8. **In-flow rendering.** `RenderedOfferingBlock` (switch on `show`), `RenderedCaptureMovementBlock` (inline capture; submit advances or accumulates per `multi`). *Manual visual checks at this point.*
9. **Pin entry point — long-press in `/intentions` and `/gratias`.** `MovementActionMenu` "Pin to practice…" → `PinPracticeSheet`. Practice list comes from existing user-practices query.
10. **Pin entry point — in-picker star.** Star toggle on `OfferingPickerSheet` rows.
11. **Morning Offering content update.** Add the two blocks per Decision 9. Bump manifest version. *Manual verification: launch Morning Offering with 0 / 1 / many active intentions.*
12. **i18n strings.** New copy added in both locales.
13. **Docs update.** `docs/features/unified-flow-system.md` and `features-overview.md` reference the new blocks.
14. **Run `pnpm test`.** All workspaces green.
15. **Manual QA.** End-to-end: capture intention → pin to Rosary → start Rosary → see picker pre-flow → confirm → see offering rendered. Capture-movement: start Morning Offering → "Anything new this morning?" → submit one → continue.

## Tests

- **Engine** (`packages/content-engine/__tests__/`):
  - `offering` resolves with `default: 'pinned'` returns `RenderedOffering` with the right shape; movements are not inlined (player concern).
  - `capture-movement` with `defaults: { cadence: 'goal' }` carries through to `RenderedCaptureMovement.defaultCadence`.
  - Missing `EngineContext.movements`: both blocks resolve gracefully (or are skipped, per Decision 10).
- **Pin projection** (`apps/app/src/db/events/__tests__/`):
  - `MovementPinned` then `MovementUnpinned` leaves the index empty.
  - Duplicate `MovementPinned` events are idempotent.
- **Pin hooks/repos**:
  - `listPinnedFor` filters out closed movements.
  - `usePinnedFor` reactively updates when pins change.
- **Practice run-state**:
  - Selecting two intentions in the picker populates `runState.offering.intentions` with those two; restarting the practice clears it.

No e2e UI tests; manual QA in step 15 covers the integration paths.

## Verification

This phase is done when:

- A practice with an `offering` block surfaces a picker pre-flow when run.
- The Morning Offering flow includes the two new blocks and they render correctly with 0, 1, and N active intentions.
- Pinning from `/intentions` shows a pin indicator on the movement and that movement appears pre-selected in the practice's picker.
- `pnpm test` passes.
- The `unified-flow-system.md` DSL doc has sections for `offering` and `capture-movement` with valid JSON examples.

## Risks and watchpoints

- **Engine context bloat.** Adding optional deps is fine; if Phase 3 piles on `resolutions`, we may want to group: `EngineContext.spiritual: { movements, resolutions, … }`. Defer until pattern repeats.
- **Pre-flow picker UX latency.** If the picker appears every time the user starts a practice, it'll feel like friction. Mitigation: when `default: 'pinned'` and pins exist (the common case), the picker auto-confirms after a short delay (or skips entirely with a small "tap to edit" affordance). Refine in manual QA.
- **Run-state lifetime.** The picker selection lives only for one run. Hot-reload during dev can wipe it; not a real-user concern.
- **Engine purity.** Ensure no Zustand or React imports leak into `packages/content-engine/`. The resolvers receive `EngineContext.movements?` and call those functions — they don't import the store directly.
- **i18n synchronization.** Picker copy is repetitive; check both locales and have someone fluent in PT-BR sanity-check tone.
