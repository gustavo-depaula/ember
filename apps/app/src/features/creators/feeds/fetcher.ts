/**
 * Public feed-fetcher entrypoint. Iterates a creator's channels, dispatches to
 * the right parser, and upserts the result into `feed_items`.
 *
 * Foreground-only refresh, debounced 30 minutes per creator unless `force` is
 * passed (used by pull-to-refresh and "first follow").
 */

import type { CreatorChannel, CreatorManifest } from '@/content/manifestTypes'
import { loadCreator } from '@/content/resolver'
import { setCreatorImage } from '@/db/repositories/creatorMeta'
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

/**
 * Native bypasses CORS, so we hit feed URLs directly. On web in dev we route
 * through a public CORS proxy so the dev experience works without backend
 * infra; production web should use an Ember-owned edge proxy (TODO: deploy a
 * Cloudflare Worker at feeds.ember.dpgu.me and point this at it).
 */
function feedUrl(url: string): string {
  // biome-ignore lint/correctness/noNodejsModules: Platform check is runtime.
  const Platform = require('react-native').Platform as { OS: string }
  if (Platform.OS !== 'web') return url
  if (!__DEV__) return url
  return `https://corsproxy.io/?${encodeURIComponent(url)}`
}

const defaultFetcher: Fetcher = async (url) => {
  const res = await fetch(feedUrl(url))
  if (!res.ok) throw new Error(`feed ${url}: ${res.status}`)
  return res.text()
}

const defaultJsonFetcher = async (url: string): Promise<unknown> => {
  const res = await fetch(feedUrl(url))
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

export type CreatorDraftsResult = {
  items: FeedItemDraft[]
  /** First channel-level image found across the creator's channels (podcast/RSS). */
  channelImage?: string
}

/**
 * Pure: fetch + parse all channels for a creator manifest. No DB writes, no
 * debounce — exposed so tests can drive the parsing pipeline without touching
 * SQLite (which transitively imports React Native and breaks vitest).
 */
export async function fetchCreatorDrafts(
  manifest: CreatorManifest,
  opts: Pick<RefreshOptions, 'fetcher' | 'jsonFetcher'> = {},
): Promise<CreatorDraftsResult> {
  const fetcher = opts.fetcher ?? defaultFetcher
  const jsonFetcher = opts.jsonFetcher ?? defaultJsonFetcher
  const creatorId = manifest.id
  const items: FeedItemDraft[] = []
  const channelImages: string[] = []
  await Promise.all(
    manifest.channels.map((channel) =>
      limiter(async () => {
        const result = await fetchChannel(channel, creatorId, fetcher, jsonFetcher)
        items.push(...result.drafts)
        if (result.channelImage) channelImages.push(result.channelImage)
      }),
    ),
  )
  return { items, channelImage: channelImages[0] }
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
  const { items, channelImage } = await fetchCreatorDrafts(manifest, opts)
  if (items.length > 0) {
    await upsertFeedItems(items)
    await pruneOlderThan(creatorId, KEEP_PER_CREATOR)
  }
  if (channelImage) {
    await setCreatorImage(creatorId, channelImage)
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

type ChannelFetchResult = { drafts: FeedItemDraft[]; channelImage?: string }

async function fetchChannel(
  channel: CreatorChannel,
  creatorId: string,
  fetcher: Fetcher,
  jsonFetcher: (url: string) => Promise<unknown>,
): Promise<ChannelFetchResult> {
  switch (channel.kind) {
    case 'youtube': {
      if (!channel.channelId) return { drafts: [] }
      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`
      const xml = await fetcher(url)
      const drafts = await Promise.all(
        parseYoutubeFeed(xml).map((d) => toDraft(d, creatorId, 'youtube')),
      )
      return { drafts }
    }
    case 'podcast': {
      if (!channel.feedUrl) return { drafts: [] }
      const xml = await fetcher(channel.feedUrl)
      const { items: parsed, channelImage } = parsePodcastFeed(xml)
      // Resolve podcast:chapters JSON URLs (best-effort) — share the limiter
      // so a 200-episode feed doesn't fan out into 200 concurrent requests.
      await Promise.all(
        parsed.map((d) =>
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
      const drafts = await Promise.all(parsed.map((d) => toDraft(d, creatorId, 'podcast')))
      return { drafts, channelImage }
    }
    case 'rss': {
      if (!channel.feedUrl) return { drafts: [] }
      const xml = await fetcher(channel.feedUrl)
      const { items: parsed, channelImage } = parseRssFeed(xml)
      const drafts = await Promise.all(parsed.map((d) => toDraft(d, creatorId, 'rss')))
      return { drafts, channelImage }
    }
  }
}
