/**
 * Public feed-fetcher entrypoint. Iterates a creator's channels, dispatches to
 * the right parser, and upserts the result into `feed_items`.
 *
 * Foreground-only refresh, debounced 30 minutes per creator unless `force` is
 * passed (used by pull-to-refresh and "first follow").
 */

import type { CreatorChannel, CreatorManifest } from '@/content/manifestTypes'
import { loadCreator } from '@/content/resolver'
import {
  deriveItemId,
  type FeedItemDraft,
  pruneOlderThan,
  upsertFeedItems,
} from '@/db/repositories/feedItems'
import { type PodcastChaptersDoc, parsePodcastChaptersDoc } from './chapters'
import { type PodcastDraft, parsePodcastFeed } from './podcast'
import { createLimiter } from './rateLimit'
import { parseRssFeed, type RssDraft } from './rss'
import { parseYoutubeFeed, type YoutubeDraft } from './youtube'

const REFRESH_DEBOUNCE_MS = 30 * 60 * 1000
const KEEP_PER_CREATOR = 200

const lastRefreshedAt = new Map<string, number>()
const limiter = createLimiter(4)

let postRefresh: ((creatorId: string) => Promise<void>) | undefined

/** Wire a post-refresh callback (e.g. auto-pin reconciliation). */
export function onPostRefresh(fn: (creatorId: string) => Promise<void>): void {
  postRefresh = fn
}

type Fetcher = (url: string) => Promise<string>

const defaultFetcher: Fetcher = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`feed ${url}: ${res.status}`)
  return res.text()
}

const defaultJsonFetcher = async (url: string): Promise<unknown> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`chapters ${url}: ${res.status}`)
  return res.json()
}

export type RefreshOptions = {
  force?: boolean
  /** Inject `fetch` for tests. */
  fetcher?: Fetcher
  /** Inject the chapters-JSON fetcher for tests. */
  jsonFetcher?: (url: string) => Promise<unknown>
}

/**
 * Pure: fetch + parse all channels for a creator manifest. No DB writes, no
 * debounce — exposed so tests can drive the parsing pipeline without touching
 * SQLite (which transitively imports React Native and breaks vitest).
 */
export async function fetchCreatorDrafts(
  manifest: CreatorManifest,
  opts: Pick<RefreshOptions, 'fetcher' | 'jsonFetcher'> = {},
): Promise<FeedItemDraft[]> {
  const fetcher = opts.fetcher ?? defaultFetcher
  const jsonFetcher = opts.jsonFetcher ?? defaultJsonFetcher
  const creatorId = manifest.id
  const all: FeedItemDraft[] = []
  await Promise.all(
    manifest.channels.map((channel) =>
      limiter(async () => {
        const drafts = await fetchChannel(channel, creatorId, fetcher, jsonFetcher)
        all.push(...drafts)
      }),
    ),
  )
  return all
}

export async function refreshCreator(creatorId: string, opts: RefreshOptions = {}): Promise<void> {
  const now = Date.now()
  if (!opts.force) {
    const last = lastRefreshedAt.get(creatorId)
    if (last !== undefined && now - last < REFRESH_DEBOUNCE_MS) return
  }
  lastRefreshedAt.set(creatorId, now)
  const manifest = loadCreator(creatorId)
  if (!manifest) return
  const all = await fetchCreatorDrafts(manifest, opts)
  if (all.length > 0) {
    await upsertFeedItems(all)
    await pruneOlderThan(creatorId, KEEP_PER_CREATOR)
  }
  if (postRefresh) await postRefresh(creatorId)
}

export async function refreshAllFollowed(
  creatorIds: string[],
  opts: RefreshOptions = {},
): Promise<void> {
  await Promise.all(creatorIds.map((id) => refreshCreator(id, opts)))
}

type ParsedDraft = PodcastDraft | YoutubeDraft | RssDraft

async function toDraft(
  d: ParsedDraft,
  creatorId: string,
  channelKind: 'podcast' | 'youtube' | 'rss',
): Promise<FeedItemDraft> {
  return {
    itemId: await deriveItemId(creatorId, d.guid),
    creatorId,
    channelKind,
    guid: d.guid,
    title: d.title,
    summary: d.summary,
    publishedAt: d.publishedAt,
    durationS: 'durationS' in d ? d.durationS : undefined,
    mediaUrl: 'mediaUrl' in d ? d.mediaUrl : undefined,
    webUrl: d.webUrl,
    imageUrl: d.imageUrl,
    chapters: 'chapters' in d ? d.chapters : undefined,
    rawJson: JSON.stringify(d),
  }
}

async function fetchChannel(
  channel: CreatorChannel,
  creatorId: string,
  fetcher: Fetcher,
  jsonFetcher: (url: string) => Promise<unknown>,
): Promise<FeedItemDraft[]> {
  switch (channel.kind) {
    case 'youtube': {
      if (!channel.channelId) return []
      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`
      const xml = await fetcher(url)
      return Promise.all(parseYoutubeFeed(xml).map((d) => toDraft(d, creatorId, 'youtube')))
    }
    case 'podcast': {
      if (!channel.feedUrl) return []
      const xml = await fetcher(channel.feedUrl)
      const drafts = parsePodcastFeed(xml)
      // Resolve podcast:chapters JSON URLs (best-effort) — share the limiter
      // so a 200-episode feed doesn't fan out into 200 concurrent requests.
      await Promise.all(
        drafts.map((d) =>
          limiter(async () => {
            if (!d.chaptersUrl || d.chapters?.length) return
            try {
              const json = (await jsonFetcher(d.chaptersUrl)) as PodcastChaptersDoc
              d.chapters = parsePodcastChaptersDoc(json)
            } catch {
              // Tolerated; episode keeps whatever inline chapters it had.
            }
          }),
        ),
      )
      return Promise.all(drafts.map((d) => toDraft(d, creatorId, 'podcast')))
    }
    case 'rss': {
      if (!channel.feedUrl) return []
      const xml = await fetcher(channel.feedUrl)
      return Promise.all(parseRssFeed(xml).map((d) => toDraft(d, creatorId, 'rss')))
    }
  }
}
