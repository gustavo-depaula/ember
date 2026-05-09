# Phase B — Spiritual surface

> Scope: all cross-platform UI, the custody session runner, examen + confessio integration, notifications.
> Complexity: **Moderate.** No native code. The cost is breadth — multiple touch points across Custody, Examen, Confessio, Home, and Notifications.
> Depends on: Phase A (data layer + types + routing scaffold).
> Independently shippable: yes. Ember v(N+1) without bound mode but with the spiritual frame intact.

## Goal

Give the user the full Custody experience minus OS-level enforcement. Commitments at `light` and `firm` severity work end-to-end. Custody sessions run with bells and an anchor. Falls surface in examen and confessio. Bound severity shows up in the UI but is gated as "Coming on iOS" / "Coming on Android in v2." After Phase B, an honest user gets real spiritual value with no native dependency; Phase C just adds the prevention layer for the borderline case.

## Major decisions

### B1. Custody session state machine

States: `idle`, `running`, `paused`, `completed`, `aborted`, `app-killed`.

Transitions:

```
idle ─start→ running ─pause→ paused ─resume→ running
                ├─timer→ completed
                ├─stop→ aborted
                └─background→ (see B2)
```

State lives in a Zustand store (`apps/app/src/features/custody/sessionStore.ts`) with immer middleware. Transition events get persisted as DB writes via `endSession(id, reason)`. The store is in-memory only — on cold launch we never resume an in-flight session, we treat it as `app-killed` (see B2).

### B2. Backgrounding policy: timer authoritative, bells foreground-only

Three plausible policies for what happens when the user backgrounds the app mid-session:

- **(a) Pause and resume.** Pause on `AppState.change → background`; resume on `foreground`. Kind UX. Rewards cheating (background, scroll TikTok, return claiming credit).
- **(b) Wall-clock authoritative; bells foreground-only.** `started_at + plannedSeconds` is the truth. On foreground, recompute elapsed. No system notifications during the session — bells only fire when the app is foreground.
- **(c) Treat background as kill.** Harsh; punishes legitimate interruptions (a phone call).

**Decision: (b).** A custody session is a sit-down prayer block; if the user leaves Ember mid-session, they are not praying with the app. The wall clock keeps running so a brief interruption doesn't reset progress, but we don't push notification "bells" while the user is in another app — a chime that interrupts whatever they're doing is the opposite of formative.

Edge cases:
- User backgrounds for the entire planned duration. On return, elapsed ≥ planned. End the session with `ended_reason: 'completed'` and `completed_at = started_at + plannedSeconds` (not `now`). Show a gentle "you spent the time elsewhere; the session is closed."
- User force-quits the app. On next launch the in-memory store is empty; we never auto-resume. The DB has the `started_at` row with `completed_at = NULL`. A reconciliation step on app boot writes `ended_reason: 'app-killed'` to any session older than the planned duration with no `completed_at`.

### B3. CommitmentEditor: a single form, not a wizard

Wizards add ceremony for what is essentially six fields. A scroll-form with collapsible sections is more direct and matches the project's existing `SchedulePicker` UX from plan-of-life.

Sections (top to bottom):

1. Name + description (text inputs)
2. Kind (segmented control: Abstain / Daily limit / Time fence)
3. Targets (kind-aware sub-component; see B6)
4. Schedule (reuse `SchedulePicker` from plan-of-life)
5. Severity (radio + help text; see B4)
6. Friction (radio + help text; only visible when severity = `bound`; see B5)
7. Shield anchor (button that opens a sub-screen; see B11)
8. Confessor note (optional text)

Single Save button at the bottom. No partial save, no drafts. Validation: name required, at least one target, schedule must be set.

### B4. SeverityPicker honest about what each tier does

Severity is the most consequential choice in the editor. The labels must reflect actual behavior, not aspiration:

- **Light** — *Logged at examen and confession prep. Not enforced.*
- **Firm** — *Logged + reminders. Not enforced.*
- **Bound** — *Enforced by your phone.*
  - On iOS during Phase B (before Phase C ships): selectable but with a "Coming on iOS — for now this acts as Firm" inline note.
  - On Android: selectable but with a "Coming on Android in v2" note.
  - On web: hidden (Custody isn't shown on web in v1).

The platform-aware copy is computed at render time from `Platform.OS` and the feature flag `flags.custodyBoundIOS` / `flags.custodyBoundAndroid`. No code that reads severity ever needs to branch on platform — the data stays clean; only the UI explains the asymmetry.

### B5. FrictionPicker is conditional on `bound`

Friction is meaningless for `light` and `firm` — there is nothing to make harder; the OS isn't preventing anything. Only render the FrictionPicker section when severity = `bound`. The user can still configure friction on Android pre-v2 ("we'll honor this when bound mode lands"), so we save the choice; we just don't pretend it's active.

### B6. TargetPicker: split by `Target.kind`, not unified

A single picker that handles "iOS apps OR Android apps OR domains OR curated lists" is fragile. Split by kind, with the user picking *target type* first:

- `domain` → text input with `[+ Add another]`. Validates basic shape (`example.com`, `*.example.com`).
- `domain-list` → multi-select chips of curated lists shipped with the app (`porn`, `gambling`, `social`, `news`). Each list ships ~50 domains in a JSON file under `apps/app/src/features/custody/blocklists/`.
- `ios-app` / `ios-category` → button "Pick apps" that opens `FamilyActivityPicker`. Phase B renders the button as a placeholder ("Coming on iOS"). Phase C wires it.
- `android-app` → button "Pick apps" that opens our installed-apps list. Phase B placeholder; Phase G wires it.

In Phase B, only `domain` and `domain-list` are functional. That's enough to ship a real porn-blocking commitment for users willing to set up DNS (Phase D walks them through it).

### B7. Examen integration: extend, don't replace

`apps/app/src/app/examen.tsx:13-47` runs a six-phase Ignatian examen (`praesentia`, `gratia`, `affectus`, `peccatum`, `propositum`, closing). Decision: don't modify the flow. Extend the data each phase reads.

- **`peccatum`** — surface a list of falls since the last completed examen via a new hook `useFallsSinceLastExamen()`. Render below the existing prose. The user can tap a fall to add a note (writes to `commitment_events.note`).
- **`propositum`** — surface active commitments. For each: "Will you keep this tomorrow?" with a yes/no toggle. The toggles don't change the commitment — they're a journaling artifact persisted to a new `examen_resolutions` collection in `preferences` (no schema change needed; `preferences` is the project's existing key-value store for this kind of small free-form data).

Last-examen timestamp lives in `preferences` already (existing pattern). Custody reads it and joins against `commitment_events`.

### B8. Confessio integration: a `FallsLog` component

`apps/app/src/app/confessio/index.tsx` tracks confession dates. Add a `FallsLog` component below the existing "last confession" surface. Renders:

- Falls grouped by commitment, ordered by `occurred_at DESC`
- Per-commitment: name, severity dot, fall count, kept count
- Per-fall: timestamp, optional note, "include in confession prep" toggle (writes a separate `commitment_events.confession_marked` flag stored as a metadata key)

Implementation: a new component `apps/app/src/features/custody/components/FallsLog.tsx` calling `useFallsSinceLastConfession()`. The hook reads the last confession's `recorded_at` from the existing `confessio` schema and joins `commitment_events WHERE type = 'fell' AND occurred_at > ?`.

A dedicated "Confession prep" screen is out of scope for v1; the falls log is the substitute.

### B9. Notifications for firm commitments

Severity = `light` triggers no notifications — log only. Severity = `firm` triggers nudges. Three nudge points per commitment:

1. **At fence start** (`time-fence` only): "Your Instagram fence starts now. Pray for the grace to keep it."
2. **Halfway through fence**: "You've kept your fence for {N} hours. Halfway."
3. **Daily examen reminder** (per user, not per commitment): at 21:00 default, "Time for examen. {N} falls today."

Channel: a new `'custody'` channel (Android) with `LOW` importance — these are gentle nudges, not alarms. Reuse `requestNotificationPermission()` and the channel-setup pattern from `apps/app/src/lib/notifications.ts:26-80`. Add a `setupCustodyNotifications()` function alongside the existing `setupNotifications()`.

Scheduling: recompute and re-schedule on every commitment edit. The strategy is identical to the existing `scheduleRemindersForSlot()` in `notifications.ts:80` — clear all existing notifications for the commitment, then schedule fresh based on its current schedule. Keep notification IDs in a per-commitment array so cancellation is precise.

If notification permission is denied, degrade to in-app-only nudges (a banner on the home screen) and surface a one-time prompt explaining how to enable.

### B10. Home-today active-commitment block

Add a new block to `apps/app/src/app/index.tsx:33-51` between the greeting and the time-block sections. The block renders the active commitments for today and their state.

Visual:

```
TODAY'S COMMITMENTS
╭─────────────────────────────────────────╮
│ 🔒 No pornographic sites — kept         │
│    Bound · always                       │
├─────────────────────────────────────────┤
│ ⏰ Instagram 21:00–07:00 — active 2h    │
│    Bound · time fence                   │
├─────────────────────────────────────────┤
│ 📰 No news during Lent — fell 14:23 ⚠   │
│    Firm · season                        │
╰─────────────────────────────────────────╯
```

A fall today shows a discreet red marker. Tapping a row opens the commitment. The block is hidden entirely when there are no active commitments — Custody is opt-in.

### B11. ShieldAnchorPicker: a sub-screen with five sources

Anchor selection is rich enough to warrant its own screen, reached from CommitmentEditor's "Shield anchor" row.

Five sources:

1. **Curated text** — a list of saint quotes and Scripture aspirations shipped with the app. Phase E populates ~30; Phase B ships ~6 as a starter.
2. **Prayer** — pick a `prayer/...` ref via the existing content resolver. The selected prayer's text is denormalized into the anchor at save time (the iOS extension can't fetch at trigger time).
3. **Lectio** — a Bible reference + version. Resolved + inlined at save time.
4. **Image** — a bundled sacred-art asset. Phase E ships ~6; Phase B ships 1 (Sacred Heart) as a starter.
5. **Silence** — no content; the shield is monochrome with the commitment name only.

The picker writes a fully-resolved `Anchor` (see Phase A's `Anchor` type). Trade-off: text changes upstream don't propagate — Phase E adds a "Refresh anchor" affordance.

### B12. Phase B ships independently

After Phase B, with `flags.custody = true` but `flags.custodyBoundIOS = false`:

- Custody is visible from the Plan tab.
- Users can declare commitments at `light` and `firm` severity.
- Domain and curated-list targets work end-to-end (paired with Phase D's DNS walkthrough for actual web blocking — the OS does the work, Ember just records the rule).
- Custody sessions run with anchor + bells.
- Examen surfaces falls; Confessio shows the falls log.
- Notifications nudge firm commitments.

This is a real shippable surface. It validates the data model and UX flow before Phase C commits to native code.

## Architecture

### File layout added in Phase B

```
apps/app/src/features/custody/
  sessionStore.ts                       Zustand store for session state
  components/
    CommitmentList.tsx
    CommitmentEditor.tsx
    SeverityPicker.tsx
    FrictionPicker.tsx
    TargetPicker.tsx                    Dispatcher
    DomainTargetPicker.tsx
    DomainListTargetPicker.tsx
    AppTargetPickerPlaceholder.tsx      Phase B placeholder; Phase C/G wire real pickers
    ShieldAnchorPicker.tsx              Sub-screen
    AnchorPreview.tsx                   Renders an Anchor (used in editor + session)
    CustodySessionRunner.tsx
    SessionDurationPicker.tsx
    ActiveCommitmentsBlock.tsx          Home-today block
    FallsLog.tsx                        Confessio integration
    CommitmentRow.tsx                   Reused in lists
  blocklists/
    porn.json
    gambling.json
    social.json
    news.json
  anchors/
    starter-text.ts                     ~6 starter text anchors (Phase E expands)
    starter-images/
      sacred-heart.png
  notifications.ts                      Custody-specific scheduling

apps/app/src/app/custody/
  index.tsx                             [filled in: list + active-today + sessions]
  new.tsx                               [filled in: CommitmentEditor]
  [commitmentId].tsx                    [filled in: CommitmentEditor]
  session.tsx                           [filled in: CustodySessionRunner]
  anchor.tsx                            [new: ShieldAnchorPicker sub-screen]

apps/app/src/app/index.tsx              [edited: ActiveCommitmentsBlock]
apps/app/src/app/examen.tsx             [edited: peccatum + propositum extensions]
apps/app/src/app/confessio/index.tsx    [edited: FallsLog mount]

apps/app/src/lib/notifications.ts       [edited: setupCustodyNotifications]

apps/app/src/lib/i18n/locales/{en-US,pt-BR}.ts   [edited: custody.* expanded]
```

### Custody session runner sketch

```typescript
// apps/app/src/features/custody/sessionStore.ts
type SessionState =
  | { kind: 'idle' }
  | { kind: 'running'; sessionId: string; startedAt: number; plannedSeconds: number; anchor: Anchor }
  | { kind: 'paused'; sessionId: string; startedAt: number; pausedAt: number; plannedSeconds: number; elapsedAtPause: number; anchor: Anchor }

const useSessionStore = create<{
  state: SessionState
  start: (input: { plannedSeconds: number; anchor: Anchor }) => Promise<void>
  pause: () => void
  resume: () => void
  abort: () => Promise<void>
  tick: () => void   // called by an interval; transitions to 'idle' on completion
}>(...)

// Bell scheduling: an effect inside CustodySessionRunner watches elapsed and plays
// a chime via expo-av at floor(elapsed / planned * 3) crossings. Only when foreground.
```

### Examen integration sketch

```typescript
// apps/app/src/features/custody/hooks.ts
function useFallsSinceLastExamen() {
  const lastExamen = usePreference<number>('examen.lastCompletedAt')
  return useQuery({
    queryKey: ['custody', 'falls', 'since-examen', lastExamen],
    queryFn: () => listFallsSince(lastExamen ?? 0),
  })
}

// In examen.tsx peccatum phase render:
const { data: falls } = useFallsSinceLastExamen()
return (
  <YStack>
    {/* existing prose */}
    {falls?.length ? <FallsRecap falls={falls} editable /> : null}
  </YStack>
)
```

## Tasks

### T-B1. CommitmentList component

`apps/app/src/features/custody/components/CommitmentList.tsx`. Renders rows from `useCommitments({ includeArchived: false })`. Each row: name, kind icon, severity dot, last-event indicator (kept today / fell at HH:MM / paused). Tap → `/custody/[commitmentId]`. Empty state: "Add your first commitment" CTA → `/custody/new`.

### T-B2. CommitmentEditor

`apps/app/src/features/custody/components/CommitmentEditor.tsx`. Single scroll-form with the eight sections from B3. On Save: validate, call `createCommitment` or `updateCommitment` from the repo, navigate back. Used by both `new.tsx` and `[commitmentId].tsx`.

### T-B3. SeverityPicker

`apps/app/src/features/custody/components/SeverityPicker.tsx`. Vertical radio with help text per option. Platform-aware copy for `bound` (B4). Reads `flags.custodyBoundIOS` / `flags.custodyBoundAndroid` to render the inline platform note.

### T-B4. FrictionPicker

`apps/app/src/features/custody/components/FrictionPicker.tsx`. Vertical radio; conditional rendering tied to severity prop. For `wait`, renders a duration sub-input. For `prayer`, renders a prayer-ref picker (reuse the prayer picker from ShieldAnchorPicker).

### T-B5. TargetPicker dispatcher

`apps/app/src/features/custody/components/TargetPicker.tsx`. The user picks a target *type* first; then the matching sub-picker mounts. Supports add-multiple. State is a `Target[]` list shown above the type picker.

### T-B6. DomainTargetPicker + DomainListTargetPicker

`DomainTargetPicker.tsx` is a text input with `[+ Add]`. `DomainListTargetPicker.tsx` is a multi-select chip list reading from `apps/app/src/features/custody/blocklists/`. Ship the four starter blocklists (`porn`, `gambling`, `social`, `news`) — domain lists curated from known sources, ~50 domains each, hand-reviewed (deferred to Phase E for the full curation pass; Phase B ships minimal seed content).

### T-B7. ShieldAnchorPicker sub-screen

`apps/app/src/app/custody/anchor.tsx` + `ShieldAnchorPicker.tsx`. Five tabs: Text, Prayer, Lectio, Image, Silence. Text tab reads from `apps/app/src/features/custody/anchors/starter-text.ts`. Prayer tab uses the existing content resolver to pick a `prayer/...` ref; on selection, calls the resolver to get rendered text and inlines it into the anchor. Lectio tab is a Bible reference picker (reuse existing component if present; otherwise a simple book/chapter/verse triple). Image tab is a grid of `apps/app/src/features/custody/anchors/starter-images/`. Save returns to the editor with the chosen Anchor.

### T-B8. CustodySessionRunner

`apps/app/src/features/custody/components/CustodySessionRunner.tsx`. Full-screen view bound to the route `/custody/session`. Reads `sessionStore` for state. Renders the anchor (via `AnchorPreview`), the elapsed/remaining timer, and a Pause/Resume/Stop control. Plays a chime via `expo-av` at 1/3, 2/3, end (foreground only — see B2). Calls `useKeepAwake()` for the duration. On `AppState` background → does not pause; just stops bell scheduling. On foreground → recomputes elapsed.

### T-B9. SessionDurationPicker + start flow

`SessionDurationPicker.tsx` — five chips (5/10/20/40/60). On selection, opens AnchorPicker (or "use last anchor"); on confirm, starts the session. Entry point lives on `/custody/index.tsx` ("Begin custody" button) and on individual commitment screens ("Pray over this commitment").

### T-B10. ActiveCommitmentsBlock

`apps/app/src/features/custody/components/ActiveCommitmentsBlock.tsx`. Reads `useActiveCommitmentsToday()`. Renders rows per B10. Mount in `apps/app/src/app/index.tsx` between the greeting and the time-block sections; conditional on the hook returning a non-empty array.

### T-B11. FallsLog component for Confessio

`apps/app/src/features/custody/components/FallsLog.tsx`. Reads `useFallsSinceLastConfession()`. Mount in `apps/app/src/app/confessio/index.tsx` below the last-confession surface. Per-row toggle marks/unmarks for confession prep (writes a metadata key on the event).

### T-B12. Examen integration

Edit `apps/app/src/app/examen.tsx`: in the `peccatum` phase render, mount a `FallsRecap` component below the existing prose; in the `propositum` phase, mount a `ResolutionCheck` component listing active commitments with yes/no toggles. Implement `useFallsSinceLastExamen()` and a `markExamenCompleted()` mutation that bumps `examen.lastCompletedAt` in `preferences` on examen completion. The existing examen completion hook fires this mutation.

### T-B13. Notification scheduling

`apps/app/src/features/custody/notifications.ts`:

- `setupCustodyNotifications()` — creates the `'custody'` channel with `LOW` importance. Called from existing app-init alongside `setupNotifications()`.
- `scheduleNudgesForCommitment(commitment)` — clears any existing notifications for this commitment, then schedules fence-start + fence-half notifications for `firm` time-fence commitments.
- `scheduleDailyExamenReminder()` — single global daily nudge at 21:00 that fetches the current fall count and renders the body.

Hook into `useUpdateCommitment` and `useCreateCommitment` mutations to re-schedule on every save. Hook into `useArchiveCommitment` and `useDeleteCommitment` to clear.

### T-B14. Default text-anchor pool

`apps/app/src/features/custody/anchors/starter-text.ts` — ~6 starter text anchors. Sample seeds: "Custodi linguam tuam a malo, et labia tua ne loquantur dolum" (Ps 33:14); "Quis ascendet in montem Domini?" (Ps 23:3); "Vigilate et orate" (Mt 26:41); "He must increase, but I must decrease" (Jn 3:30); a de Sales line on custody of the eyes; a Bosco line on the dignity of the body. Text + attribution. Phase E expands to ~30.

### T-B15. Feature flag flip + smoke test

Set `flags.custody = true` for development builds. Walk the full flow on iOS Simulator and an Android emulator: create commitment → run session → trigger a fall (manual log) → complete examen → verify falls in confessio → verify nudges fire. Confirm bound mode shows the platform note, not error states.

## Verification

- **Unit tests**: `useActiveCommitmentsToday`, `useFallsSinceLastExamen`, `useFallsSinceLastConfession` for correct date filtering. Session store transitions for all state changes including background recovery.
- **Component tests**: `CommitmentEditor` validation, `SeverityPicker` platform copy, `FrictionPicker` conditional rendering, `CustodySessionRunner` bell scheduling.
- **Manual**: full flow on a physical device (iOS + Android) with notifications enabled, then with notifications denied (degrade path).
- **Manual**: backgrounding mid-session for varied durations (10s, half the session, longer than the session) — verify the policy from B2 holds in each case.

## Risks

| Risk | Mitigation |
|---|---|
| iOS audio session conflict with Mass / liturgy practices that play audio | Configure session bell category as `ambient` so it ducks but doesn't preempt; test alongside an active liturgy practice. |
| Notification permission denied → silent commitments | In-app banner on home for upcoming nudges; one-time educational prompt. |
| Falls-log query performance with thousands of events | Index `commitment_events_by_type` from Phase A handles this; verify with seeded data. |
| Examen flow disturbance from new components | Feature-flag the integration; A/B against the existing flow before turning on by default. |
| Anchor inlining stale prayer text | Phase E "Refresh anchor" affordance documented and visible in the editor. |
| Bell chime startles user during prayer | Bells are quiet (`-12 dB`); volume override via user setting; default off for the closing bell. |
| Background-policy edge cases (B2) feel arbitrary | Surface the policy in a help-text tooltip on the session start screen so the user knows what counts. |
