# Phase 6 — Series (Editorial Playlists, v1.1)

> First v1.1 phase. Adds **Series** — editorial bundles of media — as a first-class corpus kind.

**Goal.** Add the `playlist` corpus kind without `practiceBinding`. Editor-curated playlists become browse-able as Series, surface on creator profiles, and are pinnable with transitive media materialization. Phase 7 adds `practiceBinding` to enable Pray-with on top of this same primitive.

**Success criteria.**
1. `pnpm build:corpus` produces `playlist/<id>` catalog entries with cover blobs.
2. Browse → Series row surfaces 2-3 seed editorial playlists, prioritizing season-aware picks (Lent in Lent, Advent in Advent).
3. Creator profile → Series tab lists playlists featuring that creator.
4. Pinning a playlist transitively pins cover + audio-blob items + (with toggle) feed-item media.
5. Search indexes playlist titles, descriptions, and item titles.
6. Existing v1 features (creators, audio, search) are not regressed.

**Dependencies.** All of v1 (Phases 1-5).

---

## 1. Major design decisions

### 1.1 One corpus kind `playlist`, two user-facing labels

**Decision.** Internal kind: `playlist`. Surface labels:
- `practiceBinding` absent → user-facing "Series".
- `practiceBinding` present (Phase 7) → user-facing "Pray with".

**Why.** A playlist with audio items is structurally identical whether it's a Lenten retreat or a guided Rosary. Forcing two kinds means duplicate manifests, duplicate pinning collectors, duplicate search adapters. One primitive, two views.

### 1.2 `PlaylistItem` is a discriminated union of five kinds

**Decision.** As specified in [README §3.3](README.md#33-new-catalog-kind-playlist-v11), `PlaylistItem` is one of:
- `feed-item` — references an existing podcast/RSS episode (resolved at runtime against `feed_items`).
- `youtube` — references a YouTube video by id.
- `audio-blob` — self-hosted audio (used for guided prayers in Phase 7; usable here too).
- `article` — references an article by URL or RSS GUID.
- `corpus` — a ref to any other catalog item (`prayer/our-father`, `book/.../chapter/...`).

**Why.** An editorial playlist may mix feed episodes with corpus content (a Lenten retreat could include a book chapter on confession alongside a homily podcast). Forcing one item type would lose this composability. The runtime resolver dispatches per item kind to render the right preview.

### 1.3 `feed-item` references can become stale; tolerate gracefully

**Decision.** When a `feed-item` ref's `itemId` doesn't exist in local `feed_items` (creator deleted the episode, or user hasn't refreshed that creator yet), render the row as "no longer available" (greyed, non-tappable). Don't crash the playlist.

**Why.** Editorial content lasts. Creator content can vanish. The playlist is the editorial intent; partial unavailability shouldn't break the whole listing.

### 1.4 `build_playlists()` writes its manifest as a single JSON blob

**Decision.** Cover image hashed separately (existing image pipeline). `audio-blob` items hashed individually (existing track-blob pipeline). The playlist manifest itself — including arrays of items with their item-kind discriminants — is a single JSON blob.

**Why.** Matches the pattern of `build_collections()` and `build_practice_manifests()`. Consistent author workflow: drop a `manifest.json`, run build, get a hash. Per-item blob splitting adds complexity without payoff (playlists are small).

### 1.5 Browse Series row uses the existing season-aware Hero pattern

**Decision.** A `seasonalPlaylistsRow` reads the current liturgical season + current date and selects ≤4 playlists tagged `tags: ['lent']`, `tags: ['advent']`, etc. Other tagged playlists fill out the row in a stable order (curated weight).

**Why.** Reuses the existing seasonal Hero / liturgical-season machinery — see `apps/app/src/features/seasons/`. Don't reinvent.

### 1.6 Pinning a playlist is transitive but item-kind-aware

**Decision.** `COLLECTORS['playlist']` walks `items[]`:
- `feed-item` → enqueues an item-pin (uses Phase 3 `pinFeedItem`) **only if** the user opted into "Include items" on the playlist pin sheet.
- `youtube` → never pinned (YT ToS; this is a hard rule).
- `audio-blob` → blob hash registered as protected (always; the playlist depends on it).
- `article` → enqueues an article pin if "Include items" is on.
- `corpus` → recurse into the existing collector for that kind.

**Why.** The default (no "Include items") just pins the manifest + cover. The user opts in to the larger transfer. We never silently rip podcast episodes or articles.

### 1.7 Playlist search indexing reuses the `IndexableSource` registry from Phase 4

**Decision.** Add `playlistsSource.ts` to `apps/app/src/features/search/sources/` per Phase 4 §1.3. Indexes title + description + item titles; per-language hits via the `language` field.

**Why.** That's exactly what the registry pattern was designed for. No engine changes required.

---

## 2. Tasks

### 2.1 Catalog kind & manifest

1. Add `'playlist'` to `CatalogItemKind` in `apps/app/src/content/manifestTypes.ts:14-26`.
2. Add `PlaylistManifest`, `PlaylistItem`, `PlaylistItemKind`, `PlaylistCurator` types per [README §3.3](README.md#33-new-catalog-kind-playlist-v11). Keep `practiceBinding` in the type but mark it `@since v1.1 (Phase 7)`.
3. Add `'playlist'` to `RESIDENT_KINDS`.
4. Add `loadPlaylist(id)` to `apps/app/src/content/resolver.ts`.
5. Hook `'playlist'` into `warmDeferredManifests`.

### 2.2 Build pipeline

6. Add `build_playlists(b)` to `scripts/build-corpus.py`. Pseudocode:

   ```py
   def build_playlists(b):
     for pdir in (b.content_root / 'playlists').iterdir():
       if not pdir.is_dir(): continue
       pid = pdir.name
       m = json.loads((pdir / 'manifest.json').read_text())

       if (pdir / 'cover.webp').exists():
         h, sz = b.write_blob((pdir / 'cover.webp').read_bytes())
         m['coverHash'] = {'hash': h, 'size': sz}

       # audio-blob items: hash the file at the indicated path
       for item in m.get('items', []):
         if item.get('kind') == 'audio-blob' and 'path' in item:
           audio_path = pdir / item['path']
           h, sz = b.write_blob(audio_path.read_bytes())
           item['hash'] = h
           item['size'] = sz
           del item['path']  # hash supersedes; manifest stays content-addressed

       # cross-reference checks
       _validate_playlist_refs(m, b.catalog)

       m['id'] = f'playlist/{pid}'
       h, sz = b.write_json_blob(m)
       entry = {
         'kind': 'playlist',
         'hash': h,
         'size': sz,
         'name': m['title'],
         'tags': m.get('tags', []),
       }
       b.add_catalog(f'playlist/{pid}', entry)
   ```

7. Implement `_validate_playlist_refs(m, catalog)` to check:
   - `featuredCreatorIds[]` all exist as `creator/<id>` in catalog.
   - `corpus` refs all exist in catalog.
   - `feed-item` refs cannot be validated at build time (they're in SQLite at runtime). Accept and document.
   - `practiceBinding` validation deferred to Phase 7.
8. Add `_validate_playlist_refs` test fixtures: a valid playlist, a playlist with a missing creator ref (build should fail clearly), a playlist with a missing corpus ref (same).

### 2.3 Pinning collector

9. Add `playlist` collector to `apps/app/src/features/pinning/pinningManager.ts:66-98`:

   ```ts
   playlist: (body, add) => {
     const p = body as PlaylistManifest
     if (p.coverHash) add(p.coverHash)
     // audio-blob items always materialize for the playlist to function
     for (const item of p.items) {
       if (item.kind === 'audio-blob') add({ hash: item.hash, size: item.size })
     }
     // corpus items recurse (return their refs to the recursive walker)
     return p.items
       .filter(i => i.kind === 'corpus')
       .map(i => (i as CorpusPlaylistItem).ref)
   },
   ```

10. The "Include items" toggle path is a separate `pinPlaylistWithItems(id)` in `apps/app/src/features/creators/pinning/playlistPin.ts`:
    - Calls the pinning manager's standard `pinItem('playlist/<id>')`.
    - Then iterates `items[]`:
      - `feed-item` → `pinFeedItem(itemId)` (deferral via Wi-Fi-only honored).
      - `youtube` → skipped.
      - `article` → `pinArticle(itemId)` (writes to a local article cache table; small, no Wi-Fi gate beyond size).
      - `audio-blob` → already covered by the manifest collector.
      - `corpus` → already covered by recursion.

### 2.4 Browse Series row & profile tab

11. Add `apps/app/src/features/creators/series/SeriesRow.tsx`:
    - Reads `getEntriesByKind('playlist')`.
    - Filters by season tags via `useLiturgicalSeason()`.
    - Up to 4 cards.
    - Cards: cover image · title · "<creator> · <N items>" subtitle.
12. Mount in `browse/index.tsx` between Formation and Themes. Add a `playlistIds` line to `sectionLayout.ts`.
13. Add a Series tab to `creators/[creatorId].tsx`:
    - Tab visible if `getPlaylistsFeaturing(creatorId).length > 0`.
    - Renders the same `SeriesCard`.
14. Add `apps/app/src/app/playlists/[playlistId].tsx` route — playlist detail:
    - Cover hero + title + description + curator (creator avatar if present).
    - List of items rendered per kind.
    - `Pin` button → action sheet "Pin manifest only" / "Include all items (X MB)".

### 2.5 Search indexing

15. Create `apps/app/src/features/search/sources/playlistsSource.ts` per the Phase 4 §1.3 source contract:
    - Iterates `getEntriesByKind('playlist')`, hydrates manifest, emits docs:
      - One playlist-level doc per language present in `title.<lang>`.
      - Per-item title docs are NOT created in v1.1 — they'd duplicate the parent feed-item / corpus-item titles already indexed. Item titles are concatenated into the parent doc's `summary` for recall.
16. Register `playlistsSource` in the indexer composition.
17. Add ranking prior for `playlist`: 1.0× for definitional and question queries; 1.2× for season-shaped queries (e.g., `"lent"`, `"advent"`).

### 2.6 Seed playlists

18. Maintainer commits 2-3 seed playlists to `content/playlists/`:
    - One Lenten series (40-day daily reflections).
    - One topical bundle ("Best of *Resposta Católica* on Confession").
    - One Advent series.

   Each `manifest.json` references existing seed creators' feed items by `feed-item` (so build doesn't need their audio).

### 2.7 Tests

19. Build-script tests verifying the validator catches missing refs.
20. Resolver test: round-trip a playlist manifest.
21. Pinning test: pin a playlist with `Include items: on` → assert all `audio-blob` hashes are protected AND `feed-item` items are queued for pin.
22. Stale `feed-item` ref test: render a playlist whose `feed-item` ref isn't in local `feed_items` — row shows "no longer available" instead of crashing.
23. Search integration test: query a Lenten playlist's title — the playlist appears in the All tab and a new Series tab.

---

## 3. Files touched / created

### Created

| Path | Purpose |
|---|---|
| `apps/app/src/features/creators/series/SeriesRow.tsx` | Browse Series row |
| `apps/app/src/features/creators/series/SeriesCard.tsx` | Reusable card |
| `apps/app/src/app/playlists/[playlistId].tsx` | Playlist detail route |
| `apps/app/src/features/creators/pinning/playlistPin.ts` | Transitive pin + Include-items |
| `apps/app/src/features/search/sources/playlistsSource.ts` | Indexer adapter |
| `content/playlists/<id>/` | Seed playlists |

### Modified

| Path | Change |
|---|---|
| `apps/app/src/content/manifestTypes.ts` | Add `'playlist'` to union; manifest types |
| `apps/app/src/content/contentIndex.ts` | Register `'playlist'` |
| `apps/app/src/content/resolver.ts` | `loadPlaylist`; warm |
| `apps/app/src/features/pinning/pinningManager.ts` | `playlist` collector |
| `apps/app/src/app/browse/index.tsx` | Mount `<SeriesRow />` |
| `apps/app/src/app/browse/sectionLayout.ts` | `playlistIds` |
| `apps/app/src/app/creators/[creatorId].tsx` | Series tab |
| `apps/app/src/features/search/indexer.ts` | Register playlistsSource |
| `apps/app/src/features/search/ranker.ts` | Playlist priors |
| `scripts/build-corpus.py` | `build_playlists`, validator, orchestration call |

---

## 4. Open questions

1. **Should "Include all items" be per-pin or remembered per-playlist?** Default: per-pin (less surprise; user opts in each time).
2. **Cross-creator "best of" attribution.** A "Best of Confession" playlist with episodes from 5 creators — how should the playlist credit them in browse cards? **Default**: show the curator (editorial) plus a "5 creators" pill.
3. **Playlists in Plan of Life enrollment.** A 40-day Lenten playlist could be auto-enrolled as a daily plan. Defer; not in this phase.

---

## 5. Verification

| Check | How |
|---|---|
| Build | `pnpm build:corpus` emits `playlist/<id>` entries; cover blobs present. |
| Build validator | An intentionally broken seed playlist (bad creator ref) fails the build with a clear error pointing at the playlist source file. |
| Series row | Browse → Series row renders; in March (Lent), Lenten playlists appear first. |
| Profile Series tab | Padre Paulo Ricardo profile shows the topical "Best of *Resposta Católica*" playlist on his Series tab. |
| Detail route | Tap a playlist → detail page renders cover + items list with correct icons per item kind. |
| Pin manifest only | Pin without "Include items" — only cover + manifest are local. |
| Pin with items | Pin with "Include items" — all `audio-blob` items download; `feed-item` items queue for pin (Wi-Fi-only honored). |
| Stale ref | Manually delete a `feed-item` row, reopen playlist — that row shows "no longer available" without crash. |
| Search | Query "Lent" — Lenten Series surfaces in All tab + Series sub-tab. |

---

## 6. Phase 6 → Phase 7 handoff

After Phase 6:
- The `playlist` corpus kind exists and is exercised by ≥3 seed playlists in production.
- Build validation, pinning, and search indexing all work for playlists without `practiceBinding`.

Phase 7 adds `practiceBinding` validation and the `GuidedAudioController` runtime — both targeted, no rewrite needed.
