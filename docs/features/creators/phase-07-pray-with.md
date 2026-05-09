# Phase 7 — Pray with [Creator] (Guided Prayers, v1.1)

> The flagship of v1.1 — **and the most architecturally delicate phase in the whole feature**. Adds `practiceBinding` to playlists, builds the runtime that drives the audio along with the practice flow, and gates everything on a tiny but real spike to define stable section addressing.

**Goal.** A user opens the Rosary, taps "Pray with Padre Paulo Ricardo," and prays alongside that priest's voice. Each Hail Mary, mystery announcement, and Glory Be is voiced by the creator. Pause, skip, and resume keep audio aligned with the flow. Pinned guided Rosary plays cold-start with airplane mode on.

**Success criteria.**
1. Voice selector on the Rosary practice start screen lists all `practiceBinding`-bearing playlists for that practice in the user's language.
2. Selecting a voice and starting the practice plays the creator's audio in sync with the flow.
3. As the user advances sections (auto or manual), audio re-cues to the right boundary within ±300 ms.
4. Pause / resume keep audio aligned with the current section.
5. Mystery cycle correctness: praying the Sorrowful Mysteries on Tuesday produces audio aligned to the Sorrowful sections, not the Joyful ones.
6. `pnpm build:corpus` fails clearly when a `practiceBinding.segments[*].sectionPath` doesn't resolve.
7. A pinned guided Rosary completes end-to-end with no network.

**Dependencies.** Phases 1-5 (creators + pinning + audio player), Phase 6 (`playlist` corpus kind).

---

## 1. Pre-implementation spike: `sectionPath` semantics

> ⚠️ **Do not skip.** Doing this spike before writing controller code prevents weeks of rework.

### The problem

The Rosary practice flow is dynamic. Looking at `packages/content-engine/src/types.ts`'s `FlowSection`:
- It's a structurally-nested discriminated union with no stable `id` on container nodes.
- `select` chooses one of N branches at runtime (day-of-week → Joyful / Sorrowful / Glorious / Luminous).
- `repeat` expands a template N times.
- `cycle` rotates through state-driven options.
- Fragments are inlined.

A naive index-path (e.g., `0.body.2.body.3`) is fragile under all of these — the same logical "third Hail Mary of the second decade of the Sorrowful Mysteries" gets a different index path each day depending on which `select` branch resolved.

The `select` node carries an `overrideKey: string` (per-day-of-week / per-mystery cycle keying). This is a real lever. So is `select.options[].id`. We have two viable design candidates.

### Candidate A — structural address using `overrideKey` + `option.id`

**Path syntax**:
```
mysteries[sorrowful]/decade[2]/hail-mary[3]
```

Where:
- `mysteries` is the `overrideKey` of the top-level `select`.
- `sorrowful` is the `id` of one of the `select.options[]`.
- `decade[2]` resolves to the second `repeat` iteration in the chosen branch.
- `hail-mary[3]` resolves to the third `repeat` iteration of the Hail Mary template inside that decade.

Resolver implementation: a small visitor over `FlowSection` keeps a `path` accumulator; when entering a `select`, prefer `overrideKey + option.id`. When entering a `repeat`, the path includes `repeatIndex`.

**Pros**: zero DSL change; addresses are invariant under flow re-ordering as long as `overrideKey` and `option.id` remain stable.

**Cons**: introducing a new `repeat`-template that changes the count silently shifts paths. Editorial review must catch this.

### Candidate B — opt-in `id` field on container FlowSection types

**Path syntax**:
```
sorrowful/decade-2/hail-mary-3
```

Where every `select.option` and every `repeat` template can carry an `id?: string`. The build-script validator requires playlists to address only nodes that have an `id`. Other parts of the flow (those without an id) are unaddressable, which is fine — guided prayers only need to address what their audio chunks cover.

**Pros**: explicit, robust to refactors. Practice authors think about which sections are guided-addressable.

**Cons**: requires a (tiny) DSL change. Other practice flows must migrate if we extend Pray-with beyond the Rosary in v2.

### Spike output

Write `apps/app/src/features/practice/guided/sectionPath.ts` with:
- A pure function `resolveSectionPath(flow, renderContext, sectionPath): RenderedSection | undefined`.
- A pure function `enumerateAddressablePaths(flow): { path, label }[]` for use by the build validator.
- Implementations for both Candidate A and Candidate B behind a tiny strategy flag.

Spike validation:
- Walk the existing `practice/rosary` flow on each weekday (Joyful / Sorrowful / Glorious).
- For each weekday, render the flow → compute `sectionPath` for every prayer (Sign of the Cross, Apostles' Creed, Our Father, Hail Mary x10 per decade, Glory Be, Fatima Prayer, ...).
- Confirm the same logical prayer always gets the same `sectionPath` regardless of the day's mystery cycle when the mystery is the same; produces different `sectionPath`s across mystery cycles.

**Decision criterion.** Pick Candidate A unless the spike reveals a path-instability under existing flow operators. Default = Candidate A (no DSL change). If the spike fails Candidate A, fall back to Candidate B and add a one-line `id?: string` field to the relevant container types.

**Document the result** in `docs/features/guided-prayers.md` (a new file) before any controller code is written.

---

## 2. Major design decisions

### 2.1 `GuidedAudioController` is decoupled from `PracticeFlow.tsx`'s render loop

**Decision.** `apps/app/src/features/practice/guided/GuidedAudioController.tsx` mounts inside the practice screen, listens to the same `RenderedSection` cursor that `PracticeFlow.tsx` uses, and drives the audio player. It does **not** modify `PracticeFlow.tsx`'s render or the flow engine's section walker.

**Why.** Keeps `packages/content-engine/` audio-agnostic. Lets us iterate on guided behavior without churning the practice render path. Future practices that don't have guided variants pay zero cost.

### 2.2 Cursor exposure: the controller subscribes to `currentRenderedSectionPath`

**Decision.** Add a small `useCurrentSectionPath()` hook to `apps/app/src/features/practices/components/` that returns the path of the currently-rendered section as a stable string. The controller subscribes; when the path changes, the controller seeks audio to the matching segment's `tStart`.

**Why.** The mutation in `useAdvanceCursor` already exists for advancing reading tracks (Phase 1 explore §4). Re-exposing the *current* position via a hook is additive — no public-API breakage.

### 2.3 Auto-advance is opt-in per-user, on by default

**Decision.** When auto-advance is on (default), the controller listens for `playbackStatus.didJustFinish` of each segment and advances the practice's section cursor. When off, audio plays through but the user advances manually via tap.

**Why.** Pace. Some users pray faster than the recorded creator; auto-advance lets them set the rhythm by tapping ahead. Others prefer to pace alongside the creator. The setting is a single toggle — `Practice with auto-advance`.

### 2.4 Audio segment boundaries have a small lookahead pad

**Decision.** When seeking to `segment.tStart`, subtract a 250 ms lookahead pad. This avoids audible clipping at the start of the segment (creators don't always start *exactly* on the cue).

**Why.** Creators don't time mark-to-mark to the millisecond; humans pause, breathe, take a sip. A small pad makes the experience feel intentional.

### 2.5 Voice selector lives on the practice start screen, not in a global setting

**Decision.** Selection is per-practice-instance: the user picks a voice on the Rosary start screen; persistence is in `practice_voice` (Phase 1) keyed by `practice_id`. Reset to "Silent" on every practice start? **No** — last-selected voice is preselected. The user can change it any time.

**Why.** Sticky-but-changeable matches how a user actually relates to creators: "I always pray with Padre Paulo Ricardo, but tonight I'd like silence." One surface, one mental model.

### 2.6 Build validation is not optional

**Decision.** `build_playlists()` (Phase 6) gains a `practiceBinding` validator (when present):
- Resolve every `segments[*].sectionPath` against the referenced practice's flow on each plausible context (e.g., each weekday for the Rosary).
- Fail the build with a clear error pointing at the playlist source file if any path doesn't resolve.

**Why.** A Pray-with playlist that crashes mid-prayer because a path drifted is a fidelity bug. Catch it at build time.

### 2.7 Pinning a Pray-with playlist auto-pins the audio for cold-play

**Decision.** Pinning a playlist with `practiceBinding` always materializes its `audio-blob` items (existing collector behavior from Phase 6 §1.6). No "include items" toggle for guided prayers — the audio IS the playlist's reason to exist.

**Why.** Asking a user "do you want to include the prayer audio?" when they pin a guided Rosary is friction that exists for no reason. The decision was made the moment they tapped pin.

### 2.8 No AI voice cloning, ever

**Decision.** Recorded as a hard rule in `docs/features/creators/README.md` §6.8 and in this phase's editorial process. We will not synthesize a creator's voice or augment their audio with TTS.

**Why.** Trust. A guided prayer where the priest's voice is fake is no longer a guided prayer — it's a deepfake. We will turn down opportunities that require this, and we'll never ship one.

---

## 3. Tasks

### 3.1 The spike

1. Create `apps/app/src/features/practice/guided/sectionPath.ts`:
   - `resolveSectionPath(flow, renderContext, path)` (pure).
   - `enumerateAddressablePaths(flow)` (pure).
   - Two strategies behind a flag (`'overrideKey' | 'idField'`); default `'overrideKey'`.
2. Run on `practice/rosary` flow for each weekday context. Verify path stability under each mystery cycle.
3. Document the chosen strategy in a new `docs/features/guided-prayers.md`.
4. **Gate**: Phases 7 task 5+ do not start until this doc lands.

### 3.2 Validator extension

5. Extend `_validate_playlist_refs` (Phase 6 §2.2 #7) to also handle `practiceBinding`:
   - Load referenced practice's flow.
   - For each plausible render context (e.g., each weekday for a select-by-day flow), `enumerateAddressablePaths` and intersect with `segments[*].sectionPath`.
   - Fail clearly when a binding doesn't resolve for some context.
6. Add a fixture playlist with an intentionally bad sectionPath; assert build fails with the file path + bad-path noted.

### 3.3 GuidedAudioController

7. Create `apps/app/src/features/practice/guided/GuidedAudioController.tsx`:
   - Reads the active voice from `practiceVoice.getVoice(practiceId)`; loads the referenced playlist via `loadPlaylist`.
   - Reads the playlist's `practiceBinding`; precomputes a `Map<sectionPath, segment>`.
   - Subscribes to `useCurrentSectionPath()`.
   - On path change, calls `audioPlayer.seekTo(segment.tStart - 0.25)` and (if not playing) `audioPlayer.play()`.
   - On `playbackStatus.didJustFinish` for a single-track playlist when auto-advance is on, advances the practice's section cursor.
   - On pause / resume, re-cues to the current section's `tStart`.
8. Mount the controller inside `apps/app/src/features/practices/components/PracticeFlow.tsx` (or its parent), guarded by `voice != 'silent'`.

### 3.4 Voice selector UI

9. Create `apps/app/src/features/practice/guided/VoiceSelector.tsx`:
   - Dropdown / sheet on practice start screen.
   - Options: "Silent" + each `practiceBinding`-bearing playlist whose `language` matches user locale.
   - Default = last-selected (`practiceVoice.getVoice(practiceId)` or `'silent'`).
   - Persist on change.
10. Mount in the practice start screen (`apps/app/src/app/practices/[practiceId].tsx` or equivalent).

### 3.5 Profile Pray-with tab

11. Add a Pray-with tab to `creators/[creatorId].tsx`:
    - Visible if `getPlaylistsFeaturing(creatorId).filter(p => p.practiceBinding).length > 0`.
    - Each row: cover + practice name + duration estimate.
    - Tap → routes to the practice with the voice preselected (writes `practiceVoice` then routes).

### 3.6 Seed Pray-with playlists

12. Coordinate with creator(s) for permission + audio source.
13. For at least one en-US creator and one pt-BR creator, produce a single-track Rosary recording.
14. Build the `practiceBinding.segments[]` map by manual chapter timing — a small spreadsheet with `(sectionPath, tStart, tEnd)` rows that the manifest is generated from.
15. Commit `content/playlists/<id>/`:
    ```
    manifest.json    # contains practiceBinding
    cover.webp
    audio.mp3        # single track
    ```
16. `pnpm build:corpus` → confirm validator passes.

### 3.7 Tests

17. Spike validation harness: render the Rosary on Mon-Sun, assert path resolution.
18. Validator unit test: bad sectionPath surfaces clear error.
19. Controller unit test:
    - Mock `useCurrentSectionPath` to step through a flow.
    - Assert `audioPlayer.seekTo` called with the right `tStart - 0.25` per step.
    - Assert auto-advance fires on `didJustFinish` and pauses the audio at last segment end.
20. Integration test (manual): pin a guided Rosary, force airplane mode, pray it through end-to-end.

### 3.8 i18n

21. Add `guided.*` namespace to `en-US.ts` and `pt-BR.ts`: voice selector copy, "Praying with [creator]" chip, control sheet labels.

---

## 4. Files touched / created

### Created

| Path | Purpose |
|---|---|
| `apps/app/src/features/practice/guided/sectionPath.ts` | Pure path resolver + enumerator |
| `apps/app/src/features/practice/guided/GuidedAudioController.tsx` | Runtime |
| `apps/app/src/features/practice/guided/VoiceSelector.tsx` | Practice start UI |
| `apps/app/src/features/practice/guided/PrayingChip.tsx` | In-flow chip |
| `docs/features/guided-prayers.md` | Spike output + sectionPath spec |
| `content/playlists/<guided-rosary>/` | Seed Pray-with playlist (≥1 en + ≥1 pt) |

### Modified

| Path | Change |
|---|---|
| `apps/app/src/content/manifestTypes.ts` | `practiceBinding` formally activated (was deferred) |
| `apps/app/src/db/repositories/practiceVoice.ts` | Hooked into start screen |
| `apps/app/src/features/practices/components/PracticeFlow.tsx` | Add `useCurrentSectionPath` export; mount controller |
| `apps/app/src/app/practices/[practiceId].tsx` | Mount `<VoiceSelector />` |
| `apps/app/src/app/creators/[creatorId].tsx` | Pray-with tab |
| `scripts/build-corpus.py` | `practiceBinding` validator branch |

---

## 5. Open questions

1. **Per-section vs single-track recording.** Single-track is cheapest for creators (one continuous take). Per-section is cleaner editorial (re-record one prayer without redoing everything). Phase 7 supports both shapes; seed creators choose. Future creators get a recommendation in the editorial guide (`docs/features/guided-prayers.md`).
2. **Mystery selection override.** Voice selector currently respects today's mystery. Should there be an in-flow override "today's chosen mystery: Sorrowful — switch to Joyful"? Defer; not blocking.
3. **What happens if the user changes the practice flow's mystery mid-prayer?** Today the flow doesn't allow this; if it ever does, the controller must handle the path-change event and seek accordingly. The current event-driven design handles it — confirm in tests.

---

## 6. Verification

| Check | How |
|---|---|
| Spike doc | `docs/features/guided-prayers.md` exists; documents chosen `sectionPath` strategy with worked examples for the Rosary on each weekday. |
| Build validator | A fixture playlist with bad `sectionPath` fails build with file path. |
| Voice selector | Open Rosary start → voice options include silent + 1+ creators in user's language. |
| Auto-advance | Begin Rosary; audio leads; flow advances on each `didJustFinish`. Section boundaries align ±300 ms. |
| Manual advance | Toggle auto-advance off; tap-advance — audio re-cues to next segment immediately. |
| Pause/resume | Pause mid-Hail-Mary; resume; audio re-cues to the start of that Hail Mary. |
| Mystery correctness | Pray on Tuesday (Sorrowful); audio matches Sorrowful, not Joyful. Repeat for Mon-Sun coverage. |
| Pinned cold play | Pin guided Rosary; airplane mode; complete the practice end-to-end. |
| Voice persistence | Pick voice X; close app; reopen; start Rosary — X preselected. |
| Voice exit | Select silent mid-prayer via control sheet; audio stops; flow continues silently. |

---

## 7. Phase 7 → Phase 8 handoff

After Phase 7:
- Pray-with works end-to-end. Two seed creators have guided Rosaries in production.
- The `sectionPath` semantics are documented and validated.

Phase 8 enriches search with curated answers and full corpus body indexing — independent of guided prayers.
