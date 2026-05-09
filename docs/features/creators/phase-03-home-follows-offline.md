# Phase 3 — Home, Follows & Offline

> Wires up everything users actually do day-to-day: follow a creator, see their latest content on home, pin it for offline, and trust the app cold-start with airplane mode on.

**Goal.** Activate the Follow button. Add a Home `Latest from your creators` row. Implement per-item and per-creator auto-pin. Add storage management UI. Make every screen network-aware.

**Success criteria.**
1. Follow / unfollow from profile or directory; persists across app reload.
2. Home shows a `Latest` row only when ≥1 creator is followed; sorts by `published_at DESC` across all followed creators.
3. Per-item pin toggle from any episode/article row; pinned items survive cold-start with airplane mode on.
4. `Pin latest 3` on profile writes `creator_follows.auto_pin_count = 3`; subsequent feed refreshes auto-pin newest 3 and unpin anything older than the latest 3.
5. Settings → Storage shows per-creator size, oldest pinned date, count.
6. Toggling Wi-Fi-only download in Settings prevents cellular downloads.
7. App-wide "offline" chip appears in nav when offline; non-pinned remote items show a clear "needs internet" state.

**Dependencies.** Phase 1 (`creator_follows`, `feed_items.pinned`, `pinningManager`) and Phase 2 (`creatorsStore`, profile, directory, players).

---

## 1. Major design decisions

### 1.1 Follow / unfollow is event-sourced; auto-pin policy is a derived projection

**Decision.** `followCreator` and `unfollowCreator` emit events into `useEventStore`. Auto-pin policy is computed on-demand by walking `creator_follows` × `feed_items` per refresh; the `pinned` column on `feed_items` is updated as a side effect.

**Why.** Follows are user actions where event sourcing's auditability matters. Auto-pin is *derived* state — given (follow set, auto_pin_count, recent items), the pin set is deterministic. Storing it as a projection means we can always recompute, which makes RSS reordering or a missed refresh non-fatal.

### 1.2 Home `Latest` row reads from a `recent_feed_items` view, not by aggregating in JS

**Decision.** Add a SQLite query helper `feedItems.getRecentForFollowed(limit = 8)`:

```sql
SELECT fi.* FROM feed_items fi
INNER JOIN creator_follows cf ON cf.creator_id = fi.creator_id
ORDER BY fi.published_at DESC
LIMIT ?
```

**Why.** Aggregating in JS forces N queries (one per creator) and re-sorts in memory — fine for 5 creators, painful at 50. A single indexed JOIN is cheap (existing `feed_items_recent` index already covers it) and lets us paginate trivially in v1.1.

### 1.3 Auto-pin policy is recomputed on every successful feed refresh

**Decision.** After `feedFetcher.refreshCreator(id)` writes new rows, run:

```ts
async function reconcilePins(creatorId: string) {
  const cf = await creators.getFollow(creatorId)
  if (!cf || cf.autoPinCount === 0) return
  const items = await feedItems.getFeedItemsByCreator(creatorId, cf.autoPinCount)
  const targetIds = new Set(items.map(i => i.itemId))
  const currentlyAutoPinned = await feedItems.getAutoPinnedByCreator(creatorId)
  const toPin = items.filter(i => !currentlyAutoPinned.has(i.itemId))
  const toUnpin = [...currentlyAutoPinned].filter(id => !targetIds.has(id))
  await Promise.all([
    ...toPin.map(i => pinFeedItem(i.itemId, { source: 'auto' })),
    ...toUnpin.map(id => unpinFeedItem(id, { source: 'auto' })),
  ])
}
```

**Why.** Reconciling vs. the post-condition (top-N pinned) is idempotent and survives RSS shuffles, missed refreshes, and clock skew. Tracking *why* an item was pinned (`source: 'auto' | 'manual'`) ensures we never auto-unpin something the user manually pinned.

### 1.4 Pinning a feed-item downloads media + image, marks `pinned = 1`

**Decision.** `pinFeedItem(itemId)` does:
1. Load row from `feed_items`.
2. Skip download if Wi-Fi-only is on and we're on cellular (return a deferred-pin status).
3. Download `media_url` → blob; compute SHA-256; write `feed_items.media_hash`.
4. Download `image_url` → blob; write `feed_items.image_hash`.
5. Set `feed_items.pinned = 1`, `feed_items.pin_source`, `feed_items.pinned_at`.
6. The `'feed-item'` collector in pinning manager (see Phase 1, §1.8) makes those hashes protected on next GC pass.

**Why.** Two-blob materialization (media + image) means the pinned episode renders correctly offline including art. The `pin_source` column lets reconcile distinguish auto vs. manual; `pinned_at` enables LRU on auto-pins if storage pressure mounts.

### 1.5 Wi-Fi-only is a hard gate at download time, not a preference suggestion

**Decision.** When Wi-Fi-only is on and the device is on cellular, `pinFeedItem` returns `'deferred'` and writes to a `pending_pins` queue. On next Wi-Fi reconnect (detected via `expo-network`'s `addNetworkStateListener`), the queue drains.

**Why.** Cellular bills are real. A "preference" that downloads anyway when convenient is not a feature, it's a bug. Hard gate means trust.

### 1.6 Network-aware UX uses `expo-network`, single source of truth

**Decision.** A small `useNetworkState()` hook subscribes to `expo-network` and exposes `{ isOnline, type: 'wifi' | 'cellular' | 'none' }`. Every component that needs network awareness reads this hook.

**Why.** Status bar chip, refresh disabling, "needs internet" placeholders, Wi-Fi-only gate all need the same answer. One hook prevents drift.

### 1.7 Storage management UI is read-only + one-tap "free up X MB"

**Decision.** Settings → Storage gains a Creators section listing each followed creator with:
- Local size (sum of pinned media + image blob bytes).
- Oldest pinned episode date.
- Count of pinned episodes.
- A `Free up X MB` action that unpins least-recently-played auto-pinned episodes until the budget is met.

**Why.** Forces the heavy operation behind one explicit tap. No background "magic" that surprises the user.

---

## 2. Tasks

### 2.1 Follow / unfollow

1. Wire the `Follow` button on profile + directory to `creators.followCreator(id)` / `creators.unfollowCreator(id)`.
2. Render the followed badge state from `useEventStore` selector.
3. Trigger a single `refreshCreator(id, { force: true })` on first follow so the user sees content within seconds.

### 2.2 Home Latest row

4. Add `feedItems.getRecentForFollowed(limit = 8)` per §1.2.
5. Create `apps/app/src/features/creators/home/LatestRow.tsx`:
   - `useQuery(['latest', followedIds.join(',')])` for the list.
   - Render only if `useEventStore.getState().followedCreators.size > 0`. Otherwise omit entirely (no empty-state CTA on Home — the directory's empty state covers discovery).
   - Up to 8 horizontal cards. Each card: 1:1 thumbnail · creator avatar overlay · title (2 lines, ellipsis) · type chip (🎧 / ▶ / 📄) · duration if media.
   - Tap → routes to the appropriate detail (audio / video / article).
6. Mount the row in the Home screen above the fold's lower edge. (Confirm exact location with the maintainer; default: above the existing daily section.)

### 2.3 Per-item pin

7. Add a `pinFeedItem(itemId, { source: 'manual' | 'auto', force?: boolean })` helper in `apps/app/src/features/creators/pinning/feedItemPin.ts`.
   - Performs §1.4 steps.
   - Writes `feed_items.pinned`, `pin_source`, `pinned_at`.
   - On Wi-Fi-only + cellular, returns `'deferred'` and inserts a row into `pending_pins`.
8. Add a `unpinFeedItem(itemId, { source })` helper. Removes blob refs from the protected set on next GC; nukes `feed_items.media_hash` / `image_hash` to allow eviction.
9. Append the schema to `0001_initial.sql`:

   ```sql
   ALTER TABLE feed_items ADD COLUMN pin_source TEXT;     -- 'manual' | 'auto'
   ALTER TABLE feed_items ADD COLUMN pinned_at INTEGER;
   CREATE TABLE IF NOT EXISTS pending_pins (
     item_id TEXT PRIMARY KEY,
     queued_at INTEGER NOT NULL
   );
   ```

   ⚠️ `ALTER TABLE` is **not** idempotent. Wrap in a try/catch on bootstrap, or check `pragma table_info(feed_items)` first and skip if column exists. Pattern:

   ```ts
   await ensureColumn('feed_items', 'pin_source', 'TEXT')
   await ensureColumn('feed_items', 'pinned_at', 'INTEGER')
   ```

   `ensureColumn` runs `pragma table_info` and conditionally executes `ALTER TABLE`. Lives in `db/client.ts` next to the migration runner. **Document this exception clearly** — it's the only place where we deviate from pure `IF NOT EXISTS` idempotency.

10. Render a Pin toggle on every episode/article row + on the player screen.

### 2.4 Auto-pin reconcile

11. Add `creators.setAutoPinCount(creatorId, count)` event-sourced setter, wired to the profile's `Pin latest N` action sheet (options: 0 / 3 / 5 / 10 / 20).
12. Add `reconcilePins(creatorId)` per §1.3 in `feedItemPin.ts`.
13. Hook `reconcilePins` into the tail of `feedFetcher.refreshCreator(id)` — runs after the upsert.

### 2.5 Wi-Fi-only + pending pins

14. Add `useNetworkState()` hook in `apps/app/src/lib/network.ts` wrapping `expo-network`.
15. Add a Wi-Fi-only toggle to Settings (default ON). Persists in `preferences['creators.wifiOnly']`.
16. On Wi-Fi reconnect, drain `pending_pins` table — call `pinFeedItem(itemId)` for each row in age order.

### 2.6 Storage UI

17. Extend Settings → Storage with a Creators section. Per followed creator:
    - Local size = `SUM(LENGTH(blob bytes))` over pinned media + image blob hashes (compute via `store` API; don't read filesystem directly).
    - Oldest pinned episode date.
    - Count.
    - `Free up X MB` action: `unpinFeedItem` on least-recently-played auto-pinned items until the bytes-target is met. "Least-recently-played" = `MIN(media_progress.updated_at, feed_items.pinned_at)`; if neither, fall back to `feed_items.pinned_at ASC`.
18. Soft cap bump (Phase 1 §2.4 #12) lights up automatically — no UI change needed beyond the existing settings cap field.

### 2.7 Network-aware UX

19. Add an "offline" chip in the navigation header when `isOnline === false`. Positioned next to existing header actions.
20. On non-pinned remote items, show a "Needs internet" placeholder when offline (in player screen, video screen, article reader summary mode).
21. Disable pull-to-refresh on profile + Home Latest row when offline (`refreshControl` disabled vs. failing).
22. The streamed-audio progressive-cache that `expo-av` does by default is preserved — we don't fight it.

### 2.8 Tests

23. Repository tests for `feedItems.getRecentForFollowed` (sort + limit + JOIN correctness).
24. `reconcilePins` test covering: increase, decrease, manual-pinned not removed, missing items.
25. Network-aware UX test: mock `useNetworkState` to offline, assert chip + disabled refreshes.
26. Wi-Fi-only deferral test: mock cellular, assert `pinFeedItem` returns `deferred` and writes to `pending_pins`.

---

## 3. Files touched / created

### Created

| Path | Purpose |
|---|---|
| `apps/app/src/features/creators/home/LatestRow.tsx` | Home row |
| `apps/app/src/features/creators/pinning/feedItemPin.ts` | Pin / unpin / reconcile helpers |
| `apps/app/src/features/creators/settings/StorageSection.tsx` | Settings → Storage Creators block |
| `apps/app/src/lib/network.ts` | `useNetworkState` |
| `apps/app/src/lib/db/ensureColumn.ts` | Idempotent `ALTER TABLE` helper |

### Modified

| Path | Change |
|---|---|
| `apps/app/src/db/migrations/0001_initial.sql` | `pending_pins` table; new columns guarded via `ensureColumn` at boot |
| `apps/app/src/db/client.ts` | Run `ensureColumn` calls after main migration |
| `apps/app/src/db/repositories/feedItems.ts` | Add `getRecentForFollowed`, `getAutoPinnedByCreator`, pin/unpin helpers |
| `apps/app/src/db/repositories/creators.ts` | Add `setAutoPinCount` event |
| `apps/app/src/features/creators/audio/audioPlayer.ts` | Read pinned local URI when present |
| `apps/app/src/features/creators/feeds/fetcher.ts` | Call `reconcilePins` after each successful refresh |
| `apps/app/src/app/_layout.tsx` | Mount network chip |
| `apps/app/src/app/index.tsx` (Home) | Mount `<LatestRow />` |
| `apps/app/src/app/creators/[creatorId].tsx` | Wire Follow + `Pin latest N` sheet |
| `apps/app/src/app/settings/storage.tsx` | Render Creators storage section |

---

## 4. Open questions

1. **Where exactly on Home does Latest go?** Above or below the daily section. **Default**: above (it's the user's primary daily-content surface). Confirm with maintainer.
2. **Auto-pin: should the count be per-creator or global?** Per-creator (matches the user's stated mental model: "I want 3 PPR + 10 Bishop Barron"). Global cap can come later.
3. **Streaming progressive cache TTL.** `expo-av`'s built-in cache is cleared on app eviction; do we want to persist? **Default**: no — pinning is the user-controlled contract; transient stream cache is opportunistic only.

---

## 5. Verification

| Check | How |
|---|---|
| Follow persists | Follow a creator, kill the app, reopen — followed badge still shows. |
| Latest row appears | Follow ≥1 creator with feed items; Latest row appears on Home with newest items. |
| Latest row hidden | Unfollow all creators; Latest row disappears. |
| Per-item pin → offline play | Pin an episode, force airplane mode, kill app, reopen, tap ▶ — plays from local blob. |
| Auto-pin reconcile | Set `auto_pin_count = 3`, force-refresh feed; top 3 items have `pinned = 1`, oldest item that was previously auto-pinned has `pinned = 0`. |
| Manual-pin survives reconcile | Manually pin a 5th item; raise auto_pin_count to 3; manual pin remains. |
| Wi-Fi-only deferral | Enable Wi-Fi-only, disable Wi-Fi (cellular only), tap pin — item is queued, not downloaded. Reconnect Wi-Fi → download proceeds. |
| Storage UI | Pin two episodes, open Settings → Storage; per-creator size matches sum of pinned blob bytes (±100 bytes). |
| Free up X MB | Tap action; smallest LRU-rank pinned items are unpinned until the target is met. |
| Offline chip | Airplane mode → chip appears in nav header. |
| Needs-internet placeholder | Offline + tap a non-pinned video — placeholder shows, no spinner. |

---

## 6. Phase 3 → Phase 4 handoff

After Phase 3:
- Follows, Latest row, pinning, and offline UX all work.
- `feed_items` is steadily-populated SQLite truth for ~12 followed creators × ~50 items each.
- `useNetworkState` is the canonical network awareness signal.

Phase 4 builds the search index over this stable substrate: `feed_items` + corpus titles + chapter markers, with FlexSearch as the runtime.
