/**
 * Feed-items repository — episodes, videos, and articles cached from external
 * feeds. High-volume, machine-driven; goes straight to SQLite (no event log).
 *
 * `item_id` is `sha256(creator_id + ':' + guid)` — deterministic so pinned
 * blobs survive reinstalls when device backups restore the documents directory.
 */

import { sha256Hex } from '@/lib/sha256'
import { getDb } from '../client'

export type FeedItemChapter = { tStart: number; title: string }
export type PinSource = 'manual' | 'auto'

export type FeedItemRow = {
  itemId: string
  creatorId: string
  channelKind: 'podcast' | 'youtube' | 'rss'
  guid: string
  title: string
  summary?: string
  publishedAt: number
  durationS?: number
  mediaUrl?: string
  webUrl?: string
  imageUrl?: string
  chapters?: FeedItemChapter[]
  rawJson: string
  fetchedAt: number
  pinned: boolean
  pinSource?: PinSource
  pinnedAt?: number
  mediaHash?: string
  imageHash?: string
}

type Row = {
  item_id: string
  creator_id: string
  channel_kind: string
  guid: string
  title: string
  summary: string | null
  published_at: number
  duration_s: number | null
  media_url: string | null
  web_url: string | null
  image_url: string | null
  chapters_json: string | null
  raw_json: string
  fetched_at: number
  pinned: number
  pin_source: string | null
  pinned_at: number | null
  media_hash: string | null
  image_hash: string | null
}

function rowToItem(row: Row): FeedItemRow {
  return {
    itemId: row.item_id,
    creatorId: row.creator_id,
    channelKind: row.channel_kind as FeedItemRow['channelKind'],
    guid: row.guid,
    title: row.title,
    summary: row.summary ?? undefined,
    publishedAt: row.published_at,
    durationS: row.duration_s ?? undefined,
    mediaUrl: row.media_url ?? undefined,
    webUrl: row.web_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    chapters: row.chapters_json ? (JSON.parse(row.chapters_json) as FeedItemChapter[]) : undefined,
    rawJson: row.raw_json,
    fetchedAt: row.fetched_at,
    pinned: row.pinned !== 0,
    pinSource: (row.pin_source as PinSource | null) ?? undefined,
    pinnedAt: row.pinned_at ?? undefined,
    mediaHash: row.media_hash ?? undefined,
    imageHash: row.image_hash ?? undefined,
  }
}

export type FeedItemDraft = Omit<
  FeedItemRow,
  'itemId' | 'fetchedAt' | 'pinned' | 'pinSource' | 'pinnedAt' | 'mediaHash' | 'imageHash'
> & { itemId: string }

// Stay under SQLite's 999 bound-parameter cap (14 cols × 70 rows = 980).
const UPSERT_CHUNK = 70

const UPSERT_COLUMNS =
  'item_id, creator_id, channel_kind, guid, title, summary, published_at, duration_s, media_url, web_url, image_url, chapters_json, raw_json, fetched_at'

// Leaves pinned/pin_source/pinned_at and media_hash/image_hash alone so
// user-touched state survives refreshes.
const UPSERT_CONFLICT =
  'ON CONFLICT (item_id) DO UPDATE SET title = excluded.title, summary = excluded.summary, published_at = excluded.published_at, duration_s = excluded.duration_s, media_url = excluded.media_url, web_url = excluded.web_url, image_url = excluded.image_url, chapters_json = excluded.chapters_json, raw_json = excluded.raw_json, fetched_at = excluded.fetched_at'

function bindRow(item: FeedItemDraft, fetchedAt: number): (string | number | null)[] {
  return [
    item.itemId,
    item.creatorId,
    item.channelKind,
    item.guid,
    item.title,
    item.summary ?? null,
    item.publishedAt,
    item.durationS ?? null,
    item.mediaUrl ?? null,
    item.webUrl ?? null,
    item.imageUrl ?? null,
    item.chapters ? JSON.stringify(item.chapters) : null,
    item.rawJson,
    fetchedAt,
  ]
}

export async function upsertFeedItems(items: FeedItemDraft[]): Promise<void> {
  if (items.length === 0) return
  const db = getDb()
  const fetchedAt = Date.now()
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < items.length; i += UPSERT_CHUNK) {
      const chunk = items.slice(i, i + UPSERT_CHUNK)
      const placeholder = `(${'?,'.repeat(13)}?)`
      const sql = `INSERT INTO feed_items (${UPSERT_COLUMNS}) VALUES ${chunk.map(() => placeholder).join(',')} ${UPSERT_CONFLICT}`
      const params = chunk.flatMap((item) => bindRow(item, fetchedAt))
      await db.runAsync(sql, params)
    }
  })
}

export async function getFeedItem(itemId: string): Promise<FeedItemRow | undefined> {
  const row = await getDb().getFirstAsync<Row>('SELECT * FROM feed_items WHERE item_id = ?', [
    itemId,
  ])
  return row ? rowToItem(row) : undefined
}

export async function getFeedItemsByCreator(creatorId: string, limit = 50): Promise<FeedItemRow[]> {
  const rows = await getDb().getAllAsync<Row>(
    'SELECT * FROM feed_items WHERE creator_id = ? ORDER BY published_at DESC LIMIT ?',
    [creatorId, limit],
  )
  return rows.map(rowToItem)
}

/**
 * First non-empty image_url from any of the creator's items, preferring
 * podcast and RSS items over YouTube. Podcast `<itunes:image>` is the
 * channel logo; YouTube Atom feeds publish per-video thumbnails, so the
 * "latest YouTube item" is whatever they uploaded last — not a stable
 * face for the creator. Used as a fallback avatar when the manifest
 * doesn't ship one.
 *
 * Returns `null` (not undefined) so TanStack Query v5 queryFns can
 * forward it without tripping the "queryFn returned undefined" guard.
 */
export async function getCreatorAvatarUrl(creatorId: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<{ image_url: string | null }>(
    `SELECT image_url FROM feed_items
     WHERE creator_id = ? AND image_url IS NOT NULL AND image_url != ''
     ORDER BY
       CASE channel_kind
         WHEN 'podcast' THEN 1
         WHEN 'rss'     THEN 2
         WHEN 'youtube' THEN 3
         ELSE 4
       END,
       published_at DESC
     LIMIT 1`,
    [creatorId],
  )
  return row?.image_url ?? null
}

export async function getRecentFeedItems(limit = 8): Promise<FeedItemRow[]> {
  const rows = await getDb().getAllAsync<Row>(
    'SELECT * FROM feed_items ORDER BY published_at DESC LIMIT ?',
    [limit],
  )
  return rows.map(rowToItem)
}

export async function getRecentForFollowed(limit = 8): Promise<FeedItemRow[]> {
  const rows = await getDb().getAllAsync<Row>(
    `SELECT fi.* FROM feed_items fi
     INNER JOIN creator_follows cf ON cf.creator_id = fi.creator_id
     ORDER BY fi.published_at DESC LIMIT ?`,
    [limit],
  )
  return rows.map(rowToItem)
}

export async function pruneOlderThan(creatorId: string, keep = 200): Promise<void> {
  await getDb().runAsync(
    `DELETE FROM feed_items
     WHERE creator_id = ?
       AND pinned = 0
       AND item_id NOT IN (
         SELECT item_id FROM feed_items
         WHERE creator_id = ?
         ORDER BY published_at DESC
         LIMIT ?
       )`,
    [creatorId, creatorId, keep],
  )
}

export async function setPinned(
  itemId: string,
  pinned: boolean,
  source?: PinSource,
  hashes?: { mediaHash?: string; imageHash?: string },
): Promise<void> {
  if (pinned) {
    await getDb().runAsync(
      `UPDATE feed_items SET pinned = 1, pin_source = ?, pinned_at = ?, media_hash = ?, image_hash = ?
       WHERE item_id = ?`,
      [
        source ?? 'manual',
        Date.now(),
        hashes?.mediaHash ?? null,
        hashes?.imageHash ?? null,
        itemId,
      ],
    )
  } else {
    await getDb().runAsync(
      `UPDATE feed_items SET pinned = 0, pin_source = NULL, pinned_at = NULL, media_hash = NULL, image_hash = NULL
       WHERE item_id = ?`,
      [itemId],
    )
  }
}

export async function getAutoPinnedByCreator(creatorId: string): Promise<Set<string>> {
  const rows = await getDb().getAllAsync<{ item_id: string }>(
    `SELECT item_id FROM feed_items
     WHERE creator_id = ? AND pinned = 1 AND pin_source = 'auto'`,
    [creatorId],
  )
  return new Set(rows.map((r) => r.item_id))
}

export type PinnedCreatorSummary = {
  creatorId: string
  count: number
  oldestPinnedAt?: number
}

export async function getPinnedCreatorSummaries(): Promise<PinnedCreatorSummary[]> {
  const rows = await getDb().getAllAsync<{
    creator_id: string
    count: number
    oldest: number | null
  }>(
    `SELECT creator_id, COUNT(*) as count, MIN(pinned_at) as oldest
     FROM feed_items WHERE pinned = 1 GROUP BY creator_id`,
  )
  return rows.map((r) => ({
    creatorId: r.creator_id,
    count: r.count,
    oldestPinnedAt: r.oldest ?? undefined,
  }))
}

export async function getPinnedItemIdsByCreator(creatorId: string): Promise<string[]> {
  const rows = await getDb().getAllAsync<{ item_id: string }>(
    'SELECT item_id FROM feed_items WHERE creator_id = ? AND pinned = 1',
    [creatorId],
  )
  return rows.map((r) => r.item_id)
}

export async function pinnedFeedItemHashes(): Promise<Set<string>> {
  const rows = await getDb().getAllAsync<{ media_hash: string | null; image_hash: string | null }>(
    'SELECT media_hash, image_hash FROM feed_items WHERE pinned = 1',
  )
  const out = new Set<string>()
  for (const r of rows) {
    if (r.media_hash) out.add(r.media_hash)
    if (r.image_hash) out.add(r.image_hash)
  }
  return out
}

/**
 * Construct a deterministic item_id from a creator + GUID. Used by the feed
 * fetcher when ingesting new items. Stability matters: pinned blobs survive
 * reinstalls only when item_id is reproducible across devices.
 */
export function deriveItemId(creatorId: string, guid: string): Promise<string> {
  return sha256Hex(`${creatorId}:${guid}`)
}
