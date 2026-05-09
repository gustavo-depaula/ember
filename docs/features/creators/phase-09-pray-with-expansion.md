# Phase 9 — Pray-with Expansion (v2, research-only)

> **Status: research-only stub.** Do not implement until v1.1 has run for ≥3 months and we have data showing demand.

**Goal.** Extend the v1.1 Pray-with primitive beyond the Rosary to other devotions, and surface guided playlists as first-class home content.

---

## 1. Candidate scope

### 1.1 Stations of the Cross

- 14 sections + opening/closing prayers.
- Per-section blob model fits naturally (`itemIndex: 0..13`, no `tStart` needed).
- `practiceBinding.sectionPath` references each station's container via the strategy chosen in Phase 7's spike.

### 1.2 Divine Mercy Chaplet

- Smaller than the Rosary; 3 minutes-ish total.
- Single-track recording is the cheapest creator path.

### 1.3 Angelus

- Three repeated Hail Marys around versicles. Tiny audio.

### 1.4 Multi-day program audio companions

- A 30-day St. Joseph consecration with daily ~5 min creator-led reflections.
- Each day binds to one program day's flow.
- Practice already supports per-day flows (`programs/days/day-NN.json`); Pray-with just adds an audio overlay.

### 1.5 Per-section audio mode by default

- Move from "single track + chapter map" being the default to "per-section blob" being the default.
- Smaller blobs → better perceived perf (each segment downloads independently).
- Editorial cost is higher for creators (re-record one prayer instead of one segment of a track).
- Decide based on observed playback patterns post-v1.1.

### 1.6 Seasonal home hero (Pray-with edition)

- During Lent: Home shows "Pray today's Stations with [creator]?"
- During Advent: "Pray today's Angelus with [creator]?"
- Reuses existing seasonal hero infrastructure; new data source = guided playlists tagged for the active season.

---

## 2. Major design questions to resolve before implementation

1. **Per-practice vs per-flow-section binding.** Stations has a fixed 14-section structure; Rosary has a dynamic mystery cycle. The spike from Phase 7 covers the Rosary case; need a parallel pass for Stations to confirm the path strategy works for static-structure flows too (it should — simpler case).

2. **Cross-creator Pray-with layering.** Can a user mix voices — e.g., the Sign of the Cross from Bishop Barron, the Hail Marys from Padre Paulo Ricardo? Probably no in v2; nondeterministic editorial messy. Keep voices monolithic.

3. **Pray-with for the Liturgy of the Hours.** Massive audio, complicated proper, multiple voice roles. **Defer to v3 minimum.** Not in this phase.

4. **Storage at scale.** A user who pins 5 guided practices × 30 daily reflections × 12 MB ≈ 1.8 GB. Audit current cap behavior; surface a warning in storage UI before the user crosses 1 GB of pinned guided audio.

---

## 3. Pre-implementation prerequisites

Before opening this phase:

- [ ] v1.1 has shipped and is at ≥3 months of runtime.
- [ ] Maintainer has telemetry-free signal (qualitative feedback, app reviews, journal entries) on which guided variants users want next.
- [ ] At least one new creator has agreed to record a non-Rosary guided variant.
- [ ] Phase 7's `sectionPath` documentation has held up under all v1.1 rosary-cycle changes (no regression).

---

## 4. Tasks (sketch)

When this phase opens:

1. Re-run the Phase 7 sectionPath spike against the target practice's flow.
2. Coordinate with creators for audio source.
3. Add seed `practiceBinding`-bearing playlists per devotion.
4. Surface them on profile + voice selector + (where seasonal) home hero.
5. Add a UX affordance for "pause between segments" in per-section mode (some users want a gap of 5-10 seconds before the next section to compose themselves).

Detailed task list will be written when this phase opens.

---

## 5. Out-of-scope guardrails (still apply)

- **No AI voice cloning.** This rule does not relax with scope expansion.
- **No automatic enrollment.** A user pinning a guided playlist does NOT silently enroll them in a multi-day program; that remains an explicit action.
- **No "smart suggestions" that recommend Pray-with in moments of vulnerability.** A prayer app must not exploit emotional state for engagement.

---

## 6. References

- [Phase 7 — Pray with [Creator]](phase-07-pray-with.md) — the foundation this phase extends.
- [README §6.3](README.md#63-guided-prayers--the-killer-special-case) — Pray-with mission statement.
- `docs/features/guided-prayers.md` (Phase 7 spike output) — the `sectionPath` spec.
