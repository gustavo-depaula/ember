# Phase 10 — Search v2 (Transcripts)

> **Status: research-only stub.** Do not implement until v1.1 search has run for ≥3 months and we have a query log showing what's failing.

**Goal.** Extend search beyond titles/descriptions/show-notes/bodies into full Whisper-transcribed audio segments — but only for creators whose content doesn't title-search well today.

---

## 1. The hypothesis to falsify before building this

The premise of v1 + v1.1 search is: **editorial curation × the right indexable surface beats ML.** Phase 10 only opens if we falsify that premise — i.e., if measurable user demand exists for queries that CANNOT be answered by curated content + title/body indexing.

**Falsification test (run for ≥3 months post-v1.1):**

- Maintainer reviews their own search-history (`search_history` table on their device) qualitatively. Note queries that returned zero or weak top-3 results.
- Identify whether each missed query's *answer* exists in:
  - A creator's existing podcast/video/article episode (not in title/description) → would be helped by transcripts.
  - A book chapter not yet indexed → fixable via Phase 8 enrichment, no transcripts needed.
  - A doctrinal gap in the seed list → fixable by curation.

**Open Phase 10 only if** ≥30% of missed queries fall in the first bucket. Otherwise, redirect effort to enrichment + curation.

---

## 2. Major design questions

### 2.1 Where does transcription happen?

**Three options.**

- **Server-side, batch, on the maintainer's machine.** Run Whisper locally over selected creators' episodes; commit the resulting transcript JSON to the corpus. Pros: zero on-device cost, deterministic quality. Cons: storage + compute on maintainer, doesn't update with new episodes without manual reruns.
- **Client-side, on-device, on demand.** Run a small Whisper variant (Whisper-tiny or DistilWhisper) on the device when the user pins an episode. Pros: privacy-perfect, works for any followed creator. Cons: 100-500 MB model download, slow (≥1× realtime on phones), battery hit.
- **Hybrid.** Server-batch for top creators (highest expected coverage); client-on-demand fallback for everyone else.

**Default**: server-side, batch, scoped narrowly to creators whose v1.1 search performance is measurably weak. Client-side TTS gates on a separate research spike.

### 2.2 Storage model for transcripts

- Per-episode transcript JSON: `{ segments: [{ start, end, text }] }` — tiny (50 KB per 30-min episode).
- Ship as a corpus blob keyed by feed-item id; resolve via the existing pinning system.
- Index on the device when pinned.

### 2.3 Index integration

- New source `transcriptSegmentsSource.ts` per Phase 4's pluggable source registry.
- Each segment is a doc with `parentId: 'feed-item/<id>'`, `tStart`, `tEnd`, `text`.
- Search hit deep-links to the audio at `tStart` (mechanism already exists for chapter markers).

### 2.4 Index size discipline

Phase 8 already pushed index toward 12 MB. Transcripts can blow this up. Mitigation:

- Index transcripts only for **pinned** episodes by default. User pins → segments enter the index.
- For server-batched creators, a separate "transcript pack" is a pinnable catalog item — opt-in.
- Memory cap of 24 MB total post-Phase-10. If exceeded, drop oldest unpinned-creator segments.

### 2.5 Quality & responsibility

- Whisper occasionally hallucinates; prayer/doctrinal terms in pt-BR are particularly mistranscribed (e.g., proper names, Latin inserts).
- Show transcript matches with a small badge: "Transcribed by Ember — may contain errors."
- Provide a "Report transcription error" link on each hit.

---

## 3. Pre-implementation prerequisites

- [ ] Falsification test (§1) done with documented findings in `docs/journal.md`.
- [ ] Maintainer has run Whisper locally over a small sample of pt-BR + en-US episodes; gauged quality.
- [ ] Storage budget reviewed and accepted.
- [ ] Phase 8's enrichment has been live for ≥3 months and remaining gaps clearly stem from un-titled audio content.

---

## 4. Tasks (sketch)

When this phase opens:

1. Pick top-N creators where transcription would help (per falsification analysis).
2. Build a server-side script (`scripts/transcribe.py`) using `whisper` (CTranslate2 / faster-whisper preferred) to produce transcript JSON.
3. Add `'transcript-pack'` corpus kind: a transcript pack groups transcripts for a creator, hashed and pinnable.
4. Build walker `build_transcript_packs(b)`.
5. Add `transcriptSegmentsSource.ts` to the indexer registry (gated on pin / pack resident).
6. Add segment-level result rendering (audio + scrubbed-to-segment).
7. Ship + monitor.

Detailed task list will be written when this phase opens.

---

## 5. Out-of-scope guardrails

- **No proprietary transcription APIs.** OpenAI's hosted Whisper API would phone home with audio data; not acceptable for the privacy contract. Use only locally-runnable Whisper variants.
- **No identity-recognizing or speaker-diarization features.** We index *what was said*, not *who said it* via voice fingerprint.
- **No transcript publication beyond Ember.** Transcripts ride the corpus distribution path, but we are not turning them into a public dataset.

---

## 6. References

- [Phase 4 — Global Search v1](phase-04-search-v1.md) — base architecture.
- [Phase 8 — Search v1.1 Enrichment](phase-08-search-v11.md) — preferred enrichment path before transcripts.
- [README §5.6](README.md#56-phased-rollout) — search phasing.
