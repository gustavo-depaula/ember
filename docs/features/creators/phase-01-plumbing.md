# Phase 1 — Plumbing

> Foundation phase. **Nothing user-visible ships in this phase.** Everything downstream depends on these primitives.

**Goal.** Establish the data model, build pipeline, resolver, pinning, SQLite tables, and feed fetcher needed for creators. Land 2-3 seed creators in the corpus and verify the catalog/blob pipeline produces the expected output. After Phase 1, every subsequent UI phase builds on a known-good substrate.

**Success criteria.**
1. `pnpm build:corpus` produces `creator/<id>` catalog entries with avatar/banner blobs.
2. App boot warms the new kind without measurable impact on first paint.
3. `feedFetcher` ingests fixture XML for podcast / YouTube / RSS and writes correct rows to `feed_items`.
4. Pinning a creator → avatar/banner blobs are protected from LRU eviction.
5. All five new tables exist after a fresh DB bootstrap with no migration rollouts beyond the existing `0001_initial.sql`.

---

## 1. Major design decisions

### 1.1 `creator` is a new first-class catalog kind, not a sub-type of `collection`

**Decision.** Add `'creator'` to `CatalogItemKind` in `apps/app/src/content/manifestTypes.ts:14-26`.

**Why.** A creator has structural metadata (channels, languages, charism, role, links) that has nothing to do with `CollectionItemManifest.sections`. Trying to overload collections would force every consumer of `CatalogItemKind` to disambiguate, and would block clean per-kind treatment in the directory grid, in pinning collectors, and in search ranking. Cost of a new kind is one line in the union plus one collector entry — far cheaper than the lifetime cost of an overloaded primitive.

**Alternatives ruled out.**
- *Reuse `collection`.* See above; structural mismatch.
- *Inline creators inside `book.author` or similar.* No — creators are independent entities that exist before/independent of any specific work.

### 1.2 Live items (episodes, videos, articles) are NOT in the corpus

**Decision.** `feed_items` is a SQLite-only concept. Episode lists are fetched live from external feeds, cached in SQLite, and (when pinned) materialized as local file blobs keyed by `sha256(media_url)`. They never get a hash-addressed manifest in Hearth.

**Why.** A podcast with a daily episode would force a corpus rebuild (and a 5KB+ catalog mutation) every day. Hash-addressing a stream that the upstream creator can edit, retract, or replace breaks the immutability contract that makes the corpus cheap and offline-friendly. SQLite gives us indexable, paginatable, cheaply-updatable storage for high-churn data — exactly what episode lists are.

**Alternatives ruled out.**
- *Treat each episode as a corpus blob.* Volatile data into immutable storage = constant catalog growth and cache thrash.
- *Per-creator JSON snapshot blob refreshed daily.* Pre-fetches the world; defeats the demand-driven model.

### 1.3 Append to existing `0001_initial.sql`, no new migration files

**Decision.** New tables go into `apps/app/src/db/migrations/0001_initial.sql` (the file `client.ts:33` calls via `_db.execAsync`). All `CREATE TABLE IF NOT EXISTS` — idempotent on re-run.

**Why.** Per `CLAUDE.md`: *"Currently this is a personal/solo project — do NOT add database migrations for schema changes unless explicitly asked."* The existing migration file is the bootstrap path; appending more `IF NOT EXISTS` statements keeps fresh installs and existing installs converging without versioning machinery.

**Alternatives ruled out.**
- *New `0002_creators.sql`.* Project policy says no.
- *Programmatic schema management.* Premature complexity.

### 1.4 Repository pattern split: event-sourced vs. raw SQLite

**Decision.** Two tiers of new repos:

- **Event-sourced** (small, user-action-driven): `creator_follows`, `practice_voice`, `search_history`. Use the existing `useEventStore.emit({ type: '...' })` pattern from `apps/app/src/db/repositories/practices.ts`.
- **Direct SQLite** (high-volume, machine-driven): `feed_items`, `media_progress`. New repo helpers in `apps/app/src/db/repositories/feedItems.ts` and `mediaProgress.ts` use `_db` (`apps/app/src/db/client.ts`) directly with prepared statements.

**Why.** Event sourcing each of ~2400 feed-item rows × refresh-every-30-min = unbounded event-log growth. Follows + voice selections are low-volume user actions where event sourcing's auditability is worth keeping. This split mirrors how the codebase already treats high-cardinality reads (cursors, completions) vs. user actions (practices).

**Alternatives ruled out.**
- *All event-sourced.* Event log explosion.
- *All raw SQLite.* Loses the benefit existing repos get from `useEventStore`.

### 1.5 Feed-item ID is `sha256(creator_id + ':' + guid)`, deterministic

**Decision.** `feed_items.item_id = sha256(creator_id + ':' + guid)`. The same field is the sole stable cross-device identifier for an episode.

**Why.** Reinstalls / device backups must restore pinned media to the same logical item. Hash-of-(creator+guid) is portable, doesn't depend on database row IDs, and survives RSS feed reordering. Using only `guid` would collide between creators that have shared an episode.

### 1.6 Three-parser design with a shared dispatcher

**Decision.** `apps/app/src/features/creators/feeds/` contains:

```
feeds/
  fetcher.ts          # public entrypoint: refreshCreator(id) → fetch all channels
  podcast.ts          # parses podcast RSS / Atom (itunes / podcast namespace)
  youtube.ts          # parses YouTube Atom (feeds/videos.xml)
  rss.ts              # parses generic blog RSS / Atom
  chapters.ts         # parses chapter markers (podcast:chapters + plain-text regex)
  xml.ts              # shared fast-xml-parser instance
  rateLimit.ts        # global p-limit-style concurrency cap
  __fixtures__/       # XML fixtures for unit tests
```

Each parser exposes the same shape: `parse(xml: string): FeedItemDraft[]`. The fetcher dispatches on `CreatorChannel.kind`, runs the parser, and the chapter-marker regex pass on the raw description.

**Why.** Three feed shapes (podcast, YouTube, RSS) overlap in XML primitives but diverge in fields and namespaces. Forcing them through one normalizer creates a fat conditional; keeping them as siblings keeps each parser focused and unit-testable. The shared `xml.ts` ensures every parser sees the same XML option flags.

**Alternatives ruled out.**
- *One generic XML normalizer.* Forces lowest-common-denominator field set; loses YouTube `videoId`, podcast `enclosure`, etc.
- *Per-creator custom parsers.* Combinatorial explosion as creators are added.

### 1.7 YouTube uses public Atom feed, no API key

**Decision.** YouTube channels are fetched from `https://www.youtube.com/feeds/videos.xml?channel_id=<id>` — a public XML endpoint, no auth, no quota.

**Why.** Avoids quota-managing the YouTube Data API v3, avoids embedding an API key, sidesteps Apple's privacy requirements for third-party API keys. The public feed exposes the most-recent ~15 videos, sufficient for a "latest from this creator" surface. If YouTube removes this endpoint, fall back to the Data API (a separate spike, not this phase).

### 1.8 Pinning uses a transitive collector contract identical to existing kinds

**Decision.** Add three entries to `COLLECTORS` in `apps/app/src/features/pinning/pinningManager.ts:66-98`:

```ts
const COLLECTORS = {
  // existing: collection, practice, chapter, book...
  creator: (body, add) => {
    const c = body as CreatorManifest
    if (c.avatarHash) add(c.avatarHash)
    if (c.bannerHash) add(c.bannerHash)
    return [] // creators don't transitively pull other catalog items
  },
  'feed-item': (body, add) => {
    // feed_items is SQLite-only, but pinning materializes media_url as a blob
    const f = body as FeedItem
    if (f.mediaHash) add(f.mediaHash)
    if (f.imageHash) add(f.imageHash)
    return []
  },
}
```

**Why.** The contract `(body, add) => string[]` (return = child catalog refs to recurse into) already encodes everything we need. `add()` registers blob hashes as protected; recursion handles transitive pinning of catalog children. We slot in cleanly.

> **Note**: `feed-item` is *not* a `CatalogItemKind`. It's a virtual collector that the pinning manager dispatches on when a feed-item is pinned. The collector type signature accepts an arbitrary "kind" string so we can add it without polluting the catalog kind union.

### 1.9 `feedFetcher` runs only on app foreground, debounced 30 min/creator

**Decision.** No background scheduling in v1. A foreground listener triggers `refreshAllFollowed()` with a 30-min per-creator debounce stored in-memory; pull-to-refresh bypasses the debounce.

**Why.** Background tasks (iOS background URL session, Android WorkManager) are platform-specific work we defer to Phase 5. Foreground-only refresh is sufficient for the daily formation use case ("open the app at 7am, see today's episode"), avoids battery and cellular surprise, and is verifiable with simple TanStack Query cache hooks.

---

## 2. Tasks

### 2.1 Type & manifest plumbing

1. Add `'creator'` to `CatalogItemKind` union in `apps/app/src/content/manifestTypes.ts:14-26`.
2. Add `CreatorManifest`, `CreatorChannel`, `CreatorRole`, `CreatorCharism` types to `manifestTypes.ts`. Keep the channel-kind union narrow (`'podcast' | 'youtube' | 'rss'`) — adding more is a future change.
3. Extend `CatalogEntry` (`manifestTypes.ts:27-46`) with two optional hint fields used by the directory grid: `creatorRole?: CreatorRole` and `creatorLanguages?: ('en-US' | 'pt-BR' | 'la')[]`. Both optional so existing consumers keep type-checking.
4. Re-run `pnpm tsc -p apps/app` to confirm nothing in `contentIndex.ts`, `resolver.ts`, `pinningManager.ts`, or `browse/index.tsx` accidentally exhaustively-switches `CatalogItemKind` without a default branch (TS strict will flag).

### 2.2 Catalog index registration

5. In `apps/app/src/content/contentIndex.ts`, add `'creator'` to `RESIDENT_KINDS` (resolver.ts:41-47 in the explore report — confirm exact constant name in code). This makes creator manifests warm in-memory so the directory renders without per-card fetches.
6. Add a `getCreators()` helper to `contentIndex.ts` mirroring the existing `getEntriesByKind('creator')` pattern. Call sites: directory route, profile route, search index builder.

### 2.3 Resolver & store

7. Add `loadCreator(id)` to `apps/app/src/content/resolver.ts` mirroring `loadCollection`:
   - Resolve catalog entry → fetch manifest blob via `store.getJson(hash)`.
   - Parse as `CreatorManifest`.
   - Cache in resident map per `RESIDENT_KINDS`.
8. Hook `'creator'` into `warmDeferredManifests()` (resolver.ts:94-98) so first-paint already has the directory data.
9. No store.ts changes — blob cache is kind-agnostic.

### 2.4 Pinning collectors

10. Add the `creator` and `'feed-item'` entries to `COLLECTORS` in `apps/app/src/features/pinning/pinningManager.ts:66-98` per §1.8. Type-check the body arg via the new `CreatorManifest` import.
11. Add a `pinnedFeedItemHashes()` helper to `pinningManager.ts` that walks `feed_items WHERE pinned = 1` (after we add the `pinned` column, see §2.5) and returns the union of their `mediaHash` and `imageHash` values. Feed it into the existing `store.evictTo(budgetBytes, protectedHashes)` call site.
12. Bump the default soft cap **conditionally**: if any podcast/YT creator is followed, cap = 1 GB; otherwise = existing 200 MB. Compute on read; don't persist.

### 2.5 SQLite schema

13. Append to `apps/app/src/db/migrations/0001_initial.sql`:

    ```sql
    CREATE TABLE IF NOT EXISTS creator_follows (
      creator_id  TEXT PRIMARY KEY,
      followed_at INTEGER NOT NULL,
      auto_pin_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS feed_items (
      item_id      TEXT PRIMARY KEY,
      creator_id   TEXT NOT NULL,
      channel_kind TEXT NOT NULL,
      guid         TEXT NOT NULL,
      title        TEXT NOT NULL,
      summary      TEXT,
      published_at INTEGER NOT NULL,
      duration_s   INTEGER,
      media_url    TEXT,
      web_url      TEXT,
      image_url    TEXT,
      chapters_json TEXT,
      raw_json     TEXT NOT NULL,
      fetched_at   INTEGER NOT NULL,
      pinned       INTEGER NOT NULL DEFAULT 0,
      media_hash   TEXT,
      image_hash   TEXT
    );
    CREATE INDEX IF NOT EXISTS feed_items_by_creator ON feed_items(creator_id, published_at DESC);
    CREATE INDEX IF NOT EXISTS feed_items_recent     ON feed_items(published_at DESC);
    CREATE INDEX IF NOT EXISTS feed_items_pinned     ON feed_items(pinned) WHERE pinned = 1;

    CREATE TABLE IF NOT EXISTS media_progress (
      item_id      TEXT PRIMARY KEY,
      position_s   REAL NOT NULL,
      duration_s   REAL,
      completed_at INTEGER,
      updated_at   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS search_history (
      query        TEXT NOT NULL,
      searched_at  INTEGER NOT NULL,
      PRIMARY KEY (query, searched_at)
    );

    CREATE TABLE IF NOT EXISTS practice_voice (
      practice_id  TEXT PRIMARY KEY,
      guided_id    TEXT,
      updated_at   INTEGER NOT NULL
    );
    ```

14. Verify `client.ts:33` `execAsync(initialMigration)` is idempotent — run on an existing DB and confirm no errors. (`IF NOT EXISTS` plus no `ALTER` statements means we're safe.)

### 2.6 Repositories

15. Create `apps/app/src/db/repositories/creators.ts` (event-sourced):
    - `followCreator(creatorId)` → emits `{ type: 'CreatorFollowed', creatorId }`.
    - `unfollowCreator(creatorId)` → emits `{ type: 'CreatorUnfollowed', creatorId }`.
    - `setAutoPinCount(creatorId, count)` → emits `{ type: 'CreatorAutoPinCountSet', creatorId, count }`.
    - `getFollows(): Map<string, FollowRecord>` reads from `useEventStore.getState()`.
    - Events project into the existing event store; SQLite persistence is owned by `useEventStore`'s persistence layer (do not write directly to `creator_follows`).

16. Create `apps/app/src/db/repositories/feedItems.ts` (raw SQLite):
    - `upsertFeedItems(rows: FeedItemRow[])` — batched `INSERT OR REPLACE` in a single transaction.
    - `getFeedItemsByCreator(creatorId, limit = 50): FeedItemRow[]`.
    - `getRecentFeedItems(limit = 8): FeedItemRow[]` for the home Latest row (Phase 3).
    - `pruneOlderThan(creatorId, keep = 200)`.
    - `setPinned(itemId, pinned: boolean)`.
    - All methods take a `_db` arg defaulted to the singleton — keeps tests injectable.

17. Create `apps/app/src/db/repositories/mediaProgress.ts`:
    - `getProgress(itemId)`.
    - `recordProgress(itemId, positionS, durationS)`.
    - `markCompleted(itemId)` (sets `completed_at = now`).

18. Create `apps/app/src/db/repositories/practiceVoice.ts` (event-sourced):
    - `getVoice(practiceId): string | undefined`.
    - `setVoice(practiceId, guidedId | undefined)` → emits `{ type: 'PracticeVoiceSet', ... }`.
    - Used in v1.1 (Phase 7); created here so Phase 7 doesn't need migration churn.

### 2.7 Feed fetcher

19. Create `apps/app/src/features/creators/feeds/xml.ts`: shared `fast-xml-parser` instance with options:

    ```ts
    new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      cdataPropName: '__cdata',
      trimValues: true,
      processEntities: true,
    })
    ```

20. Create `feeds/podcast.ts` parsing standard RSS + iTunes namespace + (when present) the `podcast` namespace's `<podcast:chapters>` URL. Returns `FeedItemDraft[]` with normalized `{guid, title, summary, publishedAt, durationS, mediaUrl, imageUrl}`. Unit-test against three real-feed fixtures (PPR, Pints With Aquinas, Catholic Stuff).

21. Create `feeds/youtube.ts` parsing the YouTube Atom feed: `<entry>` → `{guid: yt:videoId, title, summary: media:description, publishedAt: published, imageUrl: media:thumbnail@url}`. No duration field on the public Atom feed — fetched per-video would require the Data API; defer.

22. Create `feeds/rss.ts` for generic blog feeds. Same `FeedItemDraft` shape; `mediaUrl` may be empty.

23. Create `feeds/chapters.ts`:
    - `parsePodcastChapters(jsonUrl): Promise<Chapter[]>` for the JSON `podcast:chapters` namespace.
    - `parseInlineChapters(description: string): Chapter[]` regex-based for plain-text timestamp lists. Regex hits at minimum: `^(\d{1,2}:)?\d{1,2}:\d{2}\s+.+$` per line; permissive enough for `00:00 Intro`, `12:34 - title`, and `[12:34] title`.
    - Output: `Chapter = { tStart: number, title: string }`.

24. Create `feeds/fetcher.ts`:
    - Public API: `refreshCreator(creatorId, { force?: boolean }): Promise<void>`.
    - In-memory `lastRefreshedAt: Map<string, number>` enforces 30-min debounce unless `force=true`.
    - Loads creator manifest via `loadCreator()`, iterates `channels[]`, dispatches to the right parser, writes via `feedItems.upsertFeedItems()`.
    - Global concurrency cap (4 concurrent fetches) using a tiny p-limit-style helper (`feeds/rateLimit.ts`); avoids adding a dependency.
    - Persists `chaptersJson` per item.

25. Create `feeds/__fixtures__/`: real-world XML samples for one PPR podcast feed, one YouTube channel Atom feed, one blog Atom feed. Tests assert fixture → expected `FeedItemDraft[]` snapshot.

### 2.8 Build pipeline

26. Add `build_creators(b: BuildContext)` to `scripts/build-corpus.py`, slotted next to `build_collections()`. Pseudocode:

    ```py
    def build_creators(b):
      for creator_dir in (b.content_root / 'creators').iterdir():
        if not creator_dir.is_dir(): continue
        cid = creator_dir.name
        manifest_src = json.loads((creator_dir / 'manifest.json').read_text())

        # Avatar / banner go through the existing image pipeline
        if (creator_dir / 'avatar.webp').exists():
          h, sz = b.write_blob((creator_dir / 'avatar.webp').read_bytes())
          manifest_src['avatarHash'] = {'hash': h, 'size': sz}
        if (creator_dir / 'banner.webp').exists():
          h, sz = b.write_blob((creator_dir / 'banner.webp').read_bytes())
          manifest_src['bannerHash'] = {'hash': h, 'size': sz}

        manifest_src['id'] = f'creator/{cid}'
        h, sz = b.write_json_blob(manifest_src)

        entry = {
          'kind': 'creator',
          'hash': h,
          'size': sz,
          'name': manifest_src['name'],
          'creatorRole': manifest_src.get('role'),
          'creatorLanguages': manifest_src.get('languages'),
          'tags': manifest_src.get('tags'),
        }
        b.add_catalog(f'creator/{cid}', entry)
    ```

27. Wire `build_creators(b)` into the top-level build orchestration in `scripts/build-corpus.py` (next to the `build_collections(b)` call). Run `pnpm build:corpus` and confirm catalog.json gains `creator/<id>` entries.

28. Lint pass: `pnpm biome check --write content/creators/`.

### 2.9 Seed creators (2-3, no permissions tangle)

29. Create `content/creators/<id>/` for two seed creators picked for breadth (one en-US, one pt-BR), with public RSS/YT feeds and no rights complications:
    - `manifest.json` (CreatorManifest shape from §3 of README).
    - `avatar.webp` (512×512).
    - `banner.webp` (1600×900) — optional.
30. Pick channels that exercise all three parsers: a podcast RSS, a YouTube channel, and (where available) a blog feed. Even one creator with all three is fine for testing parser coverage.
31. Maintainer holds the right to swap final picks; the seed list itself is not part of this PRD.

### 2.10 Tests

32. Unit tests under `apps/app/src/features/creators/feeds/__tests__/`:
    - One per parser: snapshot `parse(fixtureXml)` against expected `FeedItemDraft[]`.
    - `chapters.test.ts`: cover JSON `podcast:chapters`, plain-text timestamp lists with various separators.
33. Repository tests under `apps/app/src/db/repositories/__tests__/`:
    - `feedItems.test.ts`: upsert idempotency, prune behavior, ordering invariants.
    - `mediaProgress.test.ts`: round-trip a progress record, mark completed.
34. Integration test in `apps/app/src/features/creators/__tests__/refreshCreator.test.ts`:
    - Stubs `fetch` with fixture responses for podcast + YT + RSS.
    - Asserts `feed_items` reflects the union of all three.
    - Asserts the 30-min debounce skips the second call within the window unless `force=true`.

---

## 3. Files touched / created

### Created

| Path | Purpose |
|---|---|
| `apps/app/src/features/creators/feeds/fetcher.ts` | Public refresh entrypoint |
| `apps/app/src/features/creators/feeds/podcast.ts` | RSS / iTunes parser |
| `apps/app/src/features/creators/feeds/youtube.ts` | YT Atom parser |
| `apps/app/src/features/creators/feeds/rss.ts` | Generic blog parser |
| `apps/app/src/features/creators/feeds/chapters.ts` | Chapter-marker parsing |
| `apps/app/src/features/creators/feeds/xml.ts` | Shared parser instance |
| `apps/app/src/features/creators/feeds/rateLimit.ts` | Concurrency cap |
| `apps/app/src/features/creators/feeds/__fixtures__/*` | Test XML |
| `apps/app/src/db/repositories/creators.ts` | Event-sourced follows |
| `apps/app/src/db/repositories/feedItems.ts` | Raw-SQLite feed-items repo |
| `apps/app/src/db/repositories/mediaProgress.ts` | Raw-SQLite progress repo |
| `apps/app/src/db/repositories/practiceVoice.ts` | Event-sourced voice (used in v1.1) |
| `content/creators/<id>/manifest.json` | Seed creator data |
| `content/creators/<id>/avatar.webp` | Seed creator avatar |

### Modified

| Path | Change |
|---|---|
| `apps/app/src/content/manifestTypes.ts` | Add `'creator'` to `CatalogItemKind`; add `CreatorManifest`, `CreatorChannel` types; extend `CatalogEntry` hints |
| `apps/app/src/content/contentIndex.ts` | Register `'creator'` in `RESIDENT_KINDS`; add `getCreators()` |
| `apps/app/src/content/resolver.ts` | Add `loadCreator(id)`; include `'creator'` in `warmDeferredManifests` |
| `apps/app/src/features/pinning/pinningManager.ts` | Add `creator` and `'feed-item'` collector entries; soft-cap bump logic; `pinnedFeedItemHashes()` |
| `apps/app/src/db/migrations/0001_initial.sql` | Append five `CREATE TABLE IF NOT EXISTS` blocks + indexes |
| `scripts/build-corpus.py` | Add `build_creators()`; call from top-level orchestration |
| `apps/app/src/lib/i18n/locales/en-US.ts` | Stub `creators.*` namespace (filled in Phase 2) |
| `apps/app/src/lib/i18n/locales/pt-BR.ts` | Stub `creators.*` namespace (filled in Phase 2) |

---

## 4. Open questions

1. **Image format hash equivalence.** When a creator updates their avatar, the new file → new hash → new manifest hash → catalog mutation. Is that fine, or do we want avatar/banner to be content-addressed by URL not bytes? **Default: hash by bytes**, same as book images. Re-uploading the same image twice produces no change.
2. **`feed_items` retention beyond 200/creator.** Some users may want longer history (e.g., "all of *Resposta Católica* since 2018"). For Phase 1, hard cap at 200 to prevent runaway storage. Revisit after observed usage.
3. **YouTube duration.** The public Atom feed omits duration. Acceptable in v1; the player reads duration from the actual YT iframe once playback starts. Search ranking won't have video duration as a feature in v1.

---

## 5. Verification

| Check | How |
|---|---|
| Type-safety | `pnpm tsc -p apps/app` passes with no `any` introduced. |
| Build pipeline | `pnpm build:corpus` produces `creator/<id>` catalog entries; `jq '.items["creator/fr-mike-schmitz"]' _site/hearth/v2/catalog.json` shows expected shape. |
| Resolver | App boot warms creator manifests; log timing. Confirm first paint ≤ pre-feature baseline + 5 ms. |
| Pinning | `db.execAsync("UPDATE feed_items SET pinned = 1 WHERE item_id = ?", [id])` followed by `pinningManager.gc()` does not evict the pinned media hash. |
| Schema | `sqlite3 ember.db ".tables"` shows the five new tables on a fresh install AND on an existing DB with prior schema. |
| Parsers | `pnpm test apps/app/src/features/creators/feeds` — all snapshot tests green. |
| Refresh | Fixture-stubbed integration test confirms multi-channel ingestion + debounce. |

---

## 6. Phase 1 → Phase 2 handoff

After Phase 1, Phase 2 (Browse UI) can assume:
- `getCreators()` returns hydrated creator hints from the catalog index.
- `loadCreator(id)` resolves the full manifest.
- `feedItems.getFeedItemsByCreator(id)` returns recent items.
- `refreshCreator(id)` is callable from a route on first-mount or pull-to-refresh.
- `mediaProgress` is ready for the player to write into.

Nothing in Phase 2 needs to touch the build script, resolver, or pinning manager again.
