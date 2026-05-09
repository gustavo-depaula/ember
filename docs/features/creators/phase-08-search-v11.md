# Phase 8 — Search v1.1 Enrichment

> Doctrinal-search quality pass. Three orthogonal upgrades to the Phase 4 indexer, each cheap to ship and high-value.

**Goal.** Add (a) curated canonical-question redirects so the very most common queries always land on the maintainer's hand-picked answer, (b) multilingual question synonyms so paraphrases work, and (c) full book bodies + every CCC paragraph in the index so definitional queries hit the actual paragraphs.

**Success criteria.**
1. Querying any of ~50 maintainer-curated canonical questions returns the curated top hit in the #1 slot.
2. Synonyms (e.g., `comunhão` ↔ `Eucaristia`, `confession` ↔ `reconciliation`) widen recall without poisoning precision.
3. Searching for "acedia" returns the actual CCC paragraph 2733 (not just headings) and the relevant book chapters.
4. Index size stays under ~12 MB (was ~5 MB in v1) — the body-indexing add is the heavy line.
5. No regression on Phase 4 verification checks.

**Dependencies.** Phase 4 (search engine + ranker + indexer registry).

---

## 1. Major design decisions

### 1.1 Canonical-question redirects are corpus content, not app code

**Decision.** Add a new flat dir `content/answers/<lang>/*.json`. Each file maps frequent user questions to a top hand-picked target (an `itemId`, a `feed-item#chapterIdx`, a CCC paragraph, a book chapter, etc.). Built into the corpus by a new walker; resident in-memory at runtime.

```jsonc
// content/answers/pt-BR/comungar-pecado-mortal.json
{
  "question": "posso comungar em pecado mortal",
  "synonyms": ["comungar pecado mortal", "comunhão pecado", "comunhão estado de pecado"],
  "target": {
    "kind": "feed-item",
    "id": "feed-item/<sha256>",
    "chapterTStart": 150
  },
  "fallback": { "kind": "ccc", "id": "ccc/1385" }
}
```

**Why.** Editorial truth ships through the same pipeline as creators and books. Maintainer can hand-curate ~50 redirects per language and ship updates in a normal corpus deploy without app updates. The `fallback` is a target that's always-present (e.g., a CCC paragraph) so the redirect still works for users who haven't fetched the relevant feed.

**Alternatives ruled out.**
- *Hard-coded JS table in the app.* Couples editorial content to app releases. Bad for the maintainer's ability to iterate.
- *Network-fetched canonical map.* Defeats offline-first.

### 1.2 Synonyms are corpus content too — bilingual JSON files

**Decision.** `content/synonyms/<lang>/<topic>.json` lists canonical-term ↔ aliases.

```json
{
  "topic": "eucharist",
  "lang": "pt-BR",
  "canonical": "Eucaristia",
  "synonyms": ["comunhão", "Santíssimo Sacramento", "Pão da Vida"]
}
```

At index time, when a doc mentions any synonym, the canonical term is added to the doc's `summary` field (so FlexSearch's `forward` tokenizer picks it up). At query time, expand the user's query with synonyms before sending to FlexSearch.

**Why.** Two-sided expansion — index-time AND query-time — is overkill but cheap (synonyms are O(50) per language). It also means a user typing "comunhão" hits docs that mention "Eucaristia" and vice versa, no matter which side held the synonym.

### 1.3 Full book bodies and CCC paragraphs go into the indexer at boot

**Decision.** Two new sources:
- `bookBodiesSource.ts` iterates resident book chapter blobs, splits on heading + paragraph boundaries, emits one doc per paragraph.
- `cccParagraphsSource.ts` iterates the bundled CCC structure, emits one doc per paragraph (id `ccc/<num>`).

**Why.** Phase 4 only indexed headings/titles to keep the index small. v1.1 has data showing many users type definitional queries — "acedia," "subsidiarity," "principle of double effect" — that won't match a heading but match perfectly against a paragraph body. Cost: ~7 MB more index, ~50 ms more cold-start. Acceptable.

### 1.4 Memory budget guardrails

**Decision.** On boot, after the index is built, log total size in `__DEV__`. If > 12 MB on warm-start, surface a console warning. If > 16 MB, drop the lowest-priority source (book bodies first) and warn.

**Why.** Mobile devices with 4 GB RAM can survive 16 MB; older devices struggle. Hard cap with graceful degradation prevents OOM.

### 1.5 Canonical-question lookup is a pre-FlexSearch hash check

**Decision.** Before calling `engine.query`, normalize the input (lowercase, trim, strip diacritics) and look up in a `Map<normalized, AnswerEntry>`. On hit, render the canonical answer as the #1 result; still call FlexSearch for the rest of the page. On miss, normal flow.

**Why.** O(1) lookup, sub-millisecond, no FlexSearch involvement. The canonical hit ALWAYS wins regardless of how good (or bad) FlexSearch's match would have been — the maintainer's editorial authority isn't subject to BM25.

### 1.6 Body-indexed paragraphs stay separate documents from heading docs

**Decision.** A book's chapter is now indexed at three levels — book title, chapter title, and per-paragraph. Each paragraph carries `parentId: 'book/<id>/chapter/<id>'` and `paragraphIdx`.

**Why.** Heading-level matches still rank well because they're shorter, denser docs (BM25 favors them naturally for short queries). Paragraph-level matches kick in when the user's query terms only co-occur in body text. The user sees a hit row showing the chapter title with a "matches in paragraph 7" sub-line.

---

## 2. Tasks

### 2.1 Canonical-question pipeline

1. Add `'answer'` to `CatalogItemKind` in `manifestTypes.ts`.
2. Add `AnswerManifest` type:

   ```ts
   type AnswerManifest = {
     id: string                   // 'answer/<lang>/<slug>'
     question: string             // canonical question, normalized lower-case
     synonyms?: string[]
     language: 'en-US' | 'pt-BR' | 'la'
     target: AnswerTarget
     fallback?: AnswerTarget
   }
   type AnswerTarget =
     | { kind: 'feed-item'; id: string; chapterTStart?: number }
     | { kind: 'ccc'; id: string }              // 'ccc/1385'
     | { kind: 'book-chapter'; ref: string }    // 'book/<id>/chapter/<id>'
     | { kind: 'corpus'; ref: string }
   ```

3. Walker in `scripts/build-corpus.py`: `build_answers(b)` iterates `content/answers/<lang>/*.json`, hashes each, registers `answer/<lang>/<slug>` catalog entries.
4. Resolver: `loadAnswer(id)`; warm in `warmDeferredManifests`.
5. At boot, build `Map<normalizedQuery, AnswerManifest>` covering question + synonyms.

### 2.2 Synonyms pipeline

6. Add `content/synonyms/<lang>/<topic>.json` files; build walker `build_synonyms(b)` registers as `synonym/<lang>/<topic>` catalog entries.
7. Resolver: `loadSynonym`; warm.
8. At boot, build two maps per language:
   - `Map<term, canonical>` — used for query expansion.
   - `Map<canonical, term[]>` — used for index-time enrichment of doc summaries.

### 2.3 Search-engine integration

9. Modify `apps/app/src/features/search/indexer.ts`:
   - For each doc, append synonyms to `summary` based on `(canonical, alias[])` map.
10. Modify `apps/app/src/features/search/useSearch.ts`:
    - First step: normalize query and check the canonical-answer map. On hit, prepend a `CanonicalAnswerHit` to the result list.
    - Second step: expand query with synonyms before passing to `engine.query`.

11. Add `CanonicalAnswerHit` rendering to `SearchResultRow`:
    - Distinct visual treatment (a small "Top answer · curated" badge).
    - Tap routes per `target.kind` (audio with seek, CCC paragraph, book chapter, etc.).

### 2.4 Body indexing

12. Create `apps/app/src/features/search/sources/bookBodiesSource.ts`:
    - Iterates resident book chapter content (already in resolver after Phase 1 explore §1).
    - Splits on `\n\n` (paragraph) into ~200-word docs.
    - Emits docs with `parentId: 'book/<id>/chapter/<id>'`, `paragraphIdx`, `summary` = first 280 chars of paragraph.

13. Create `apps/app/src/features/search/sources/cccParagraphsSource.ts`:
    - Iterates bundled CCC paragraphs.
    - One doc per paragraph; `docId = 'ccc/<num>'`; `summary` = first 280 chars.

14. Register both in `indexer.ts` source list.

### 2.5 Memory guardrails

15. Add `engine.estimateSize(): number` returning approximate index bytes (sum of stored doc fields).
16. After build, log to `__DEV__`. On `> 12 MB` warn; on `> 16 MB` skip `bookBodiesSource` and re-build (one-time fallback).

### 2.6 Maintainer-curated content

17. Maintainer commits ~50 canonical questions (en-US) + ~50 (pt-BR) to `content/answers/`.
18. Maintainer commits ~30 synonym topics per language to `content/synonyms/`.
19. Run `pnpm build:corpus`; confirm catalog has the new entries.

### 2.7 Tests

20. Canonical-redirect test: query a curated question → top hit is the curated target.
21. Synonym test: query "comunhão" → matches docs about "Eucaristia."
22. Body-index test: query "acedia" → top results include CCC paragraph 2733 and the relevant book chapter.
23. Memory-guard test: synthetically pump book bodies to push past 16 MB; assert warning fires and bookBodiesSource is dropped on next build.

---

## 3. Files touched / created

### Created

| Path | Purpose |
|---|---|
| `apps/app/src/features/search/sources/bookBodiesSource.ts` | Per-paragraph book index |
| `apps/app/src/features/search/sources/cccParagraphsSource.ts` | Per-paragraph CCC index |
| `apps/app/src/features/search/canonicalAnswers.ts` | `Map<query, AnswerManifest>` builder |
| `apps/app/src/features/search/synonyms.ts` | Bidirectional synonym expansion |
| `content/answers/<lang>/*.json` | Curated answers |
| `content/synonyms/<lang>/*.json` | Synonym topics |

### Modified

| Path | Change |
|---|---|
| `apps/app/src/content/manifestTypes.ts` | Add `'answer'` and `'synonym'` kinds |
| `apps/app/src/content/contentIndex.ts` | Register new kinds |
| `apps/app/src/content/resolver.ts` | `loadAnswer`, `loadSynonym`, warm |
| `apps/app/src/features/search/indexer.ts` | Index-time synonym enrichment; size guard |
| `apps/app/src/features/search/useSearch.ts` | Pre-engine canonical lookup; query expansion |
| `apps/app/src/features/search/SearchResultRow.tsx` | Render CanonicalAnswerHit |
| `apps/app/src/features/search/ranker.ts` | New per-kind priors for body docs |
| `scripts/build-corpus.py` | `build_answers`, `build_synonyms` |

---

## 4. Open questions

1. **Curation cadence.** Editorial cost of maintaining ~100 canonical answers + 60 synonym topics is non-trivial. Default: monthly review pass. Track in `docs/journal.md`.
2. **Per-paragraph search row UX.** Showing a chapter title with "matches in paragraph 7" — should we render a snippet? Yes, default 60 chars around the match (use FlexSearch's `highlight`).
3. **Diacritic stripping.** pt-BR users routinely type without accents. Normalize both query and indexed-text to NFD-stripped lower-case.

---

## 5. Verification

| Check | How |
|---|---|
| Curated redirect | Type a maintainer-curated question — top hit shows "Top answer · curated" badge. |
| Synonym recall | Type "comunhão" in pt-BR — Eucaristia-tagged docs appear in results. |
| Body match | Type "acedia" — CCC paragraph 2733 appears in top-3. |
| Diacritic-insensitive | Type "comungar em pecado mortal" without accents — same hits as the accented query. |
| Index size | Boot log shows total < 16 MB on a fully-loaded device. |
| No regression | All Phase 4 verification checks still pass. |

---

## 6. Phase 8 → handoff

After Phase 8, **v1.1 ships.** The next phases are v2 expansion stubs — research-only until v1.1 has run for ≥3 months and we have data on what users actually search for and pray with.
