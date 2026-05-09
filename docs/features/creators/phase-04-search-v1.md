# Phase 4 — Global Search v1

> The flagship of v1. **A doctrinal answer engine, no ML required.**

**Goal.** Ship a single search box that searches across feed-item titles, descriptions, show notes, chapter markers, and corpus content (book titles + chapter titles, prayer titles, saint names, collection names, CCC paragraph headings, Mass propers names). Per-question deep-linking inside Q&A podcasts via parsed chapter markers. All on-device, privacy-preserving, fully offline against any creator whose feed has been fetched once.

**Success criteria.**
1. Typing *"posso comungar em pecado mortal"* (pt-BR) returns the matching PPR *Resposta Católica* episode in the top-3 results within 100 ms on a cold cache, with the chapter chip jumping the player to the right offset.
2. Typing *"how do I prepare for confession"* (en-US) returns relevant podcast episodes + matching CCC paragraph headings + the Confession examen practice.
3. Search works fully offline against pinned creators, including chapter-marker deep-linking.
4. Q&A-tagged channels boost appropriately on question-shaped queries; corpus content boosts on definitional queries.
5. Empty state suggests example questions tailored to the user's language.
6. Recent searches persist and clearable from Settings.
7. No query leaves the device.

**Dependencies.** Phase 1 (`feed_items`, `chapters_json`, `format` field on `CreatorChannel`) and Phase 3 (followed creators producing meaningful index volume).

---

## 1. Major design decisions

### 1.1 FlexSearch over MiniSearch / Lunr / SQLite FTS5

**Decision.** Use **FlexSearch** (`flexsearch` npm package) as the on-device index.

**Why.**
- **Speed.** FlexSearch is empirically the fastest pure-JS full-text engine: well under 50 ms cold-start over ~10k titles in our target memory footprint.
- **Tokenizer.** Built-in `forward` tokenizer handles partial-word matches (the user types `"comung"` and gets `"comungar"`). Lunr is whole-token only.
- **Memory.** A `Document` index over title+summary+chapters across ~10k items lands at ~5 MB in our target. MiniSearch is comparable but slower; Lunr is heavier.
- **Per-language profiles.** FlexSearch supports per-field language config (Portuguese stemmer, English stemmer). Critical for pt-BR + en-US parity.
- **No native deps.** Pure JS — works on web, iOS, Android, and the test runner.

**Alternatives ruled out.**
- *SQLite FTS5.* Tempting (already on-device) but: (a) re-tokenizing on every refresh is slow without `MERGE`-like incremental support, (b) language profiles are limited, (c) cold-start startup-time is comparable but the `LIKE`/`MATCH` query API is more brittle.
- *Lunr.js.* Slower indexer; whole-token only; weak partial-match.
- *Server-side search.* Defeats privacy + offline goals.

### 1.2 Single in-memory index, per-language; rebuilt incrementally on feed refresh

**Decision.** Two `Document` indexes — `searchEnIndex` and `searchPtIndex`. Latin titles are inserted into both. On each successful `refreshCreator(id)`, only that creator's items are re-indexed (`remove(itemId)` + `add(itemId, doc)`).

**Why.** A single global index loses per-language stemming nuance. Two indexes is a cheap doubling. Incremental updates avoid a full rebuild on each refresh; without it, a 12-creator app rebuilds a 10k-doc index every 30 minutes.

### 1.3 Indexer takes a kind-pluggable registry

**Decision.** The index builder accepts a list of `IndexableSource` adapters:

```ts
interface IndexableSource {
  kind: string                                    // 'feed-item' | 'book' | 'prayer' | 'saint' | 'ccc' | 'collection' | 'practice' | 'mass-proper' | (v1.1) 'playlist'
  iterate(): AsyncIterable<{
    id: string                                    // e.g. 'feed-item/...' | 'prayer/our-father' | 'ccc/123'
    docId: string                                 // unique document key for FlexSearch
    language: 'en-US' | 'pt-BR' | 'la'
    title: string
    summary?: string
    chapterMarker?: { tStart: number; title: string; parentItemId: string }   // chapter-level docs duplicate title
    creatorId?: string                            // for ranking
    qaFormat?: boolean                            // if true, boost on question-shaped queries
    publishedAt?: number                          // recency boost
  }>
}
```

A registry of `IndexableSource[]` is composed at boot:

```ts
const sources: IndexableSource[] = [
  feedItemsSource,
  bookTitlesSource,
  prayersSource,
  saintsSource,
  cccHeadingsSource,
  collectionsSource,
  practicesSource,
  massPropersSource,
  // v1.1: playlistsSource
]
```

**Why.** Phase 6 adds `playlist` to the index — without a registry, we'd be rewriting the indexer. Each source isolates its data-extraction logic; the indexer doesn't care where docs come from.

### 1.4 Chapter markers become first-class index docs (one doc per chapter)

**Decision.** When `feed_items.chapters_json` is non-empty, each chapter becomes its own indexable doc with `docId = '<itemId>#<chapterIdx>'` and a `chapterMarker` field. The parent episode is *also* indexed at the episode level, but per-chapter docs win on chapter-title matches.

**Why.** PPR's *Resposta Católica* publishes episodes with timestamp lists in the description: `"00:00 Intro / 02:30 Pergunta 1: Posso comungar em pecado mortal? / 15:42 Pergunta 2: ..."`. The user types *"posso comungar"* and expects to land on the **answer**, not the episode start. Per-chapter docs make this free — no transcription, no ML.

**Result row UX**: the chapter doc renders as one row showing the chapter title with a `02:30 →` chip; tapping seeks the player. Episode-level matches render as a normal row.

### 1.5 Q&A-format boost is a query-time multiplier on a per-channel flag

**Decision.** Channels mark `format: 'qa'` editorially (Phase 1). At query time, if the query starts with a question-word (`como`, `o que`, `posso`, `what`, `how`, `can I`, `should I`, `why`), Q&A-tagged docs get a 1.4× score multiplier in the BM25 result.

**Why.** Editorial metadata, not ML — cheap, explainable, easy to tune. Question-word detection is a small per-language regex. The 1.4× was chosen empirically: enough to pull the right Q&A episode above a longer corpus title that matched on raw tokens, but not so much that it crowds out clearly-better matches.

### 1.6 Per-kind ranking priors

**Decision.** Score = `BM25 × kindPrior × recencyBoost`, where:

| Query shape | Kind boosts |
|---|---|
| Question (`"como confessar"`) | `feed-item-qa` 1.4×, `feed-item` 1.0×, `ccc` 1.2×, `prayer` 0.9×, `book` 0.9× |
| Definitional (`"acedia"`, `"sanctifying grace"`) | `ccc` 1.5×, `book` 1.3×, `feed-item` 1.0×, `prayer` 0.9× |
| Person (`"st thomas"`, `"padre"`) | `saint` 1.5×, `creator` 1.2×, `feed-item` 1.0× |

**Why.** We have prior information about what the user is likely after based on query shape; throwing it away leaves real value on the table. The numbers come from a small offline test set we'll iterate on (see verification §5).

### 1.7 Ranking math runs in JS, not in FlexSearch

**Decision.** FlexSearch returns top-K (K=80) raw matches. JS post-processing applies kind priors, recency, Q&A boost, and produces the final ranked list.

**Why.** FlexSearch's scoring API is limited and not easily configured per-kind. K=80 is wide enough that re-ranking finds the right top-10; small enough that the JS pass is sub-millisecond.

### 1.8 Empty state = a starter catechetical FAQ

**Decision.** When the user opens search with an empty input, render 6-8 example questions drawn from real seed-creator highest-quality Q&A episodes. Localized: pt-BR pulls from PPR; en-US from *Catholic Answers Live* / *Pints With Aquinas*. Tapping a suggestion fills the input AND triggers the search — answers play with one tap.

**Why.** It's marketing-by-product: the empty state itself is a demo of the wow. New users understand the value in 3 seconds.

### 1.9 No analytics, ever

**Decision.** Queries persist to `search_history` only on-device. Nothing is sent anywhere. No "popular searches" feature based on aggregate data.

**Why.** A doctrinal-search query log is *spiritually* sensitive. The user's questions about confession, addiction, doubt, despair, or sin are not data we will ever collect, transmit, or aggregate. Privacy is a feature, not a constraint to compromise.

---

## 2. Tasks

### 2.1 Search engine

1. Create `apps/app/src/features/search/engine.ts`:
   - Initializes two `Document` indexes (FlexSearch) with per-language config.
   - `addDocument(lang, doc)`, `removeDocument(lang, docId)`, `replaceDocumentsForCreator(lang, creatorId, docs)`.
   - `query(lang, q, opts): RawHit[]` returns top-K=80 matches with field hits.

   FlexSearch config:

   ```ts
   const enConfig = {
     tokenize: 'forward',
     stemmer: 'en',
     filter: 'en',
     document: {
       id: 'docId',
       index: ['title', 'summary', 'chapterMarker.title'],
       store: ['kind', 'parentId', 'creatorId', 'qaFormat', 'publishedAt', 'chapterMarker', 'language', 'title'],
     },
   }
   ```

2. Create `apps/app/src/features/search/sources/`:
   - `feedItemsSource.ts` — iterates `feed_items` + per-chapter docs from `chapters_json`. Reads `creator/<id>` manifest to enrich `qaFormat` and per-channel language.
   - `bookTitlesSource.ts` — iterates resident book manifests' `book.json` (titles + TOC headings + chapter titles).
   - `prayersSource.ts` — iterates `getEntriesByKind('prayer')`.
   - `saintsSource.ts` — iterates the saints feed bundle.
   - `cccHeadingsSource.ts` — iterates the bundled CCC structure for headings only (full-paragraph indexing is Phase 8).
   - `collectionsSource.ts` — iterates `getEntriesByKind('collection')`.
   - `practicesSource.ts` — iterates `getEntriesByKind('practice')`.
   - `massPropersSource.ts` — iterates `of-data` for proper names.

3. Create `apps/app/src/features/search/indexer.ts`:
   - On boot (after `warmDeferredManifests`), iterates all sources and adds documents.
   - Hooks `feedFetcher` post-refresh callback to call `replaceDocumentsForCreator`.
   - Cold-start budget: ≤ 50 ms over ~10k docs across both languages. Profile and confirm.

4. Create `apps/app/src/features/search/ranker.ts`:
   - Detect query shape (question / definitional / person / generic).
   - Apply kind priors, Q&A boost, recency boost.
   - Return final ranked hits.

5. Create `apps/app/src/features/search/hits.ts`:
   - Hydrates ranked hits to renderable `SearchHit` objects: title, subtitle, source icon, creator avatar URL, chapter chip, route on tap.

6. Create `apps/app/src/features/search/useSearch.ts` hook:
   - Debounced query input (200 ms).
   - `useQuery(['search', lang, q])` with `staleTime: 0` and a query-fn calling `engine.query` + `ranker.rank` + `hits.hydrate`.

### 2.2 UI

7. Create `apps/app/src/features/search/SearchPill.tsx`: a small `🔍 Ask…` pill rendered on Home (above the fold) and inside the navigation header on every screen via `_layout.tsx`. Tap → opens the search overlay.

8. Create `apps/app/src/app/search.tsx` (full-screen modal):
   - `SafeAreaView` with a tall `<TextInput>` that auto-focuses and shows a clear `✕`.
   - Result tabs: `All · Q&A · Listen · Watch · Read · Books · Catechism · Saints · Prayers`. Tab counts shown when > 0.
   - Result list with `<SearchResultRow />`.
   - Empty state with 6-8 example questions drawn from a small `apps/app/src/features/search/empty-state.ts` constant (pt-BR / en-US).

9. Create `apps/app/src/features/search/SearchResultRow.tsx`:
   - Source icon + creator avatar (creator content) or content icon (corpus content).
   - Title (the question for Q&A channels).
   - Subtitle: creator name / source.
   - Chapter chip when matched: `02:30 →`.

10. Wire the chapter-chip tap: routes to the audio detail screen with a `seekTo` param; `audioPlayer.play(itemId, { startAt: chapter.tStart })` honors it.

### 2.3 Recent searches

11. `search_history` is already created in Phase 1. Add `repositories/searchHistory.ts`:
    - `record(query)` (no-op if same query in last 30 s; dedupes).
    - `recent(limit = 8)` returns most-recent unique queries.
    - `clearAll()`.

12. Render recent searches in the empty state above the example questions: `Recent: <query 1> · <query 2> · <query 3> · ...` with a `Clear` action.

13. Add a Settings → Privacy "Clear search history" button calling `searchHistory.clearAll()`.

### 2.4 Performance & telemetry

14. Add `__DEV__`-only timing logs:
    - Cold-start index build time.
    - Per-query: tokenize / FlexSearch lookup / rank-hydrate / total. Log when total > 100 ms.
15. Snapshot of index size in MB (counting Document store) on startup; log if > 8 MB so we catch creep early.

### 2.5 Tests

16. Unit tests for `ranker.ts`: each query shape → expected boost mix.
17. Unit tests for chapter-marker indexing: PPR-fixture episode with timestamp description produces the right per-chapter docs and they match on chapter title.
18. Snapshot test of seed-creator empty-state suggestions.
19. Performance test: index 10k synthetic docs, run 100 queries, assert mean < 100 ms (skipped in CI by default — manual perf gate).
20. Privacy test: a fixture network-listener asserts no outbound HTTP request fires from `engine.query`.

---

## 3. Files touched / created

### Created

| Path | Purpose |
|---|---|
| `apps/app/src/features/search/engine.ts` | FlexSearch wrapper |
| `apps/app/src/features/search/indexer.ts` | Boot + refresh hooks |
| `apps/app/src/features/search/ranker.ts` | Post-FlexSearch ranking |
| `apps/app/src/features/search/hits.ts` | Hydration |
| `apps/app/src/features/search/useSearch.ts` | Hook |
| `apps/app/src/features/search/SearchPill.tsx` | Entry point |
| `apps/app/src/features/search/SearchResultRow.tsx` | Result row |
| `apps/app/src/features/search/empty-state.ts` | Localized starter questions |
| `apps/app/src/features/search/sources/feedItemsSource.ts` | Live items |
| `apps/app/src/features/search/sources/bookTitlesSource.ts` | Books |
| `apps/app/src/features/search/sources/prayersSource.ts` | Prayers |
| `apps/app/src/features/search/sources/saintsSource.ts` | Saints |
| `apps/app/src/features/search/sources/cccHeadingsSource.ts` | CCC headings |
| `apps/app/src/features/search/sources/collectionsSource.ts` | Collections |
| `apps/app/src/features/search/sources/practicesSource.ts` | Practices |
| `apps/app/src/features/search/sources/massPropersSource.ts` | Mass propers |
| `apps/app/src/db/repositories/searchHistory.ts` | Recent searches |
| `apps/app/src/app/search.tsx` | Full-screen modal |

### Modified

| Path | Change |
|---|---|
| `apps/app/src/features/creators/feeds/fetcher.ts` | Post-refresh callback into `indexer.replaceDocumentsForCreator` |
| `apps/app/src/app/_layout.tsx` | Mount `<SearchPill />` in nav header |
| `apps/app/src/app/index.tsx` (Home) | Mount `<SearchPill />` above the fold |
| `apps/app/src/app/settings/privacy.tsx` | "Clear search history" action |
| `apps/app/src/lib/i18n/locales/en-US.ts` | `search.*` namespace |
| `apps/app/src/lib/i18n/locales/pt-BR.ts` | Mirror |

### Dependencies

Add to `apps/app/package.json`:
- `flexsearch` (~70KB minified, no native deps)

---

## 4. Open questions

1. **Stemmer choice for pt-BR.** FlexSearch ships a Portuguese profile (Portugal Portuguese). Brazilian Portuguese has small-but-real differences in inflection. Acceptable for v1; revisit if pt-BR results are visibly poor on common queries.
2. **CCC paragraph headings only — when to add bodies?** Phase 8 (Search v1.1 enrichment). Don't bloat the v1 index.
3. **Should chapter docs include the parent episode title?** Yes — boosts recall when the user's query matches the parent. Append parent title to `summary` for chapter docs.
4. **Search across un-fetched creators.** Out of scope: search is over-on-device-cache only. Surfacing un-fetched suggestions ("12 more creators have content matching this") is a v1.1 idea, not a v1 must.

---

## 5. Verification

| Check | How |
|---|---|
| Cold-start index | Boot the app fresh; confirm `__DEV__` timing log shows index build < 50 ms over 10k docs. |
| Query latency | Type "comungar em pecado mortal" — total time logged < 100 ms; result is the right episode in top-3. |
| Chapter-level deep-link | Tap a chapter chip — audio player opens AND seeks to `tStart` within 500 ms. |
| Q&A boost | Query "como confessar" shows PPR Resposta Católica episode above a non-Q&A homily that mentions confession. |
| Definitional boost | Query "acedia" surfaces CCC paragraph + book chapter above any podcast match. |
| Localization | pt-BR locale: "como rezar o terço" returns Brazilian-Portuguese-tagged hits first. |
| Recency tie-breaker | Two equally-relevant podcast episodes — the newer one ranks higher. |
| Empty state | Open search with empty input — 6-8 localized example questions render. Tap one — search runs, plays the answer. |
| Recent searches | Run 3 queries; close + reopen overlay — recent shows. Settings → Privacy → Clear; recent is empty. |
| Privacy test | Wireshark / Charles run during 30 search sessions — zero outbound search traffic. |
| Offline | Airplane mode + cold start: search returns hits across all pinned + previously-cached content, including chapter chips. |

---

## 6. Phase 4 → Phase 5 handoff

After Phase 4:
- The wow ships. Search across all on-device content works in 100 ms, on-device, in two languages.
- The indexer architecture is ready for Phase 6 (`playlist`) and Phase 8 (canonical-question redirects + full bodies + synonyms) without rewrite.

Phase 5 is polish: lock-screen artwork, sleep timer hardening, skeletons, accessibility, background download.
