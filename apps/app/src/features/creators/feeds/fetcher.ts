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

/** Last *successful* refresh per creator. Failures do not record here, so a
 *  transient network error doesn't lock the creator out of retries. */
const lastRefreshedAt = new Map<string, number>()
/** Currently-running refreshes — prevents the directory's mass-refresh on
 *  mount from firing the same creator twice if a re-render happens. */
const inFlight = new Set<string>()
/** Per-creator channel-level concurrency (used for podcast:chapters fan-out
 *  inside a single creator). */
const limiter = createLimiter(4)
/** Cross-creator concurrency. 20 simultaneous refreshes from the directory
 *  mount overwhelmed some podcast hosts (Anchor/Podbean/Fireside) which then
 *  threw, leaving the creator debounce-locked. Capping refreshCreator()
 *  itself keeps the system polite. */
const creatorLimiter = createLimiter(4)

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
  /** Inject the prebuilt-meta loader for tests. */
  prebuiltLoader?: (creatorId: string) => Promise<PrebuiltCreatorMeta | null>
}

export type CreatorDraftsResult = {
  items: FeedItemDraft[]
  /** First channel-level image found across the creator's channels (podcast/RSS). */
  channelImage?: string
}

/**
 * Shape of `<hearth>/creator-meta/<slug>.json`, written by
 * `scripts/build-creator-meta.py` on every Pages deploy. When present, the
 * client short-circuits the expensive per-device YouTube discovery
 * (`og:image` scrape, UUSH playlist fetch, HEAD-probes of ambiguous items)
 * and uses these values directly.
 */
export type PrebuiltCreatorMeta = {
  creatorId: string
  generatedAt: string
  channelImage: string | null
  shortVideoIds: string[]
}

async function defaultPrebuiltLoader(creatorId: string): Promise<PrebuiltCreatorMeta | null> {
  try {
    // Lazy import: @/lib/hearth transitively pulls in expo-sqlite via the
    // cache repo, which vitest/jsdom can't parse. Tests inject their own
    // prebuiltLoader (typically returning null) so this branch is dead in
    // the test harness.
    const { hearthUrl } = await import('@/lib/hearth')
    const slug = creatorId.replace(/^creator\//, '')
    const res = await fetch(hearthUrl(`creator-meta/${slug}.json`))
    if (!res.ok) return null
    return (await res.json()) as PrebuiltCreatorMeta
  } catch {
    return null
  }
}

/**
 * Pure: fetch + parse all channels for a creator manifest. No DB writes, no
 * debounce — exposed so tests can drive the parsing pipeline without touching
 * SQLite (which transitively imports React Native and breaks vitest).
 */
export async function fetchCreatorDrafts(
  manifest: CreatorManifest,
  opts: Pick<RefreshOptions, 'fetcher' | 'jsonFetcher' | 'prebuiltLoader'> = {},
): Promise<CreatorDraftsResult> {
  const fetcher = opts.fetcher ?? defaultFetcher
  const jsonFetcher = opts.jsonFetcher ?? defaultJsonFetcher
  const prebuiltLoader = opts.prebuiltLoader ?? defaultPrebuiltLoader
  const creatorId = manifest.id
  // Try the prebuilt meta first. It's a single static JSON fetch from the
  // corpus; when present, the YouTube branch can skip its og:image scrape,
  // UUSH fetch, and per-video HEAD-probes entirely.
  const prebuilt = await prebuiltLoader(creatorId)
  const items: FeedItemDraft[] = []
  const channelImages: string[] = []
  if (prebuilt?.channelImage) channelImages.push(prebuilt.channelImage)
  await Promise.all(
    manifest.channels.map((channel) =>
      limiter(async () => {
        const result = await fetchChannel(channel, creatorId, fetcher, jsonFetcher, prebuilt)
        items.push(...result.drafts)
        if (result.channelImage) channelImages.push(result.channelImage)
      }),
    ),
  )
  return { items, channelImage: channelImages[0] }
}

export async function refreshCreator(creatorId: string, opts: RefreshOptions = {}): Promise<void> {
  // Dedupe overlapping calls — the directory's mass-refresh + a profile
  // mount can fire the same creator twice in quick succession.
  if (inFlight.has(creatorId)) return
  if (!opts.force) {
    const last = lastRefreshedAt.get(creatorId)
    if (last !== undefined && Date.now() - last < REFRESH_DEBOUNCE_MS) return
  }
  const manifest = loadCreator(creatorId)
  if (!manifest) return
  inFlight.add(creatorId)
  try {
    await creatorLimiter(async () => {
      const { items, channelImage } = await fetchCreatorDrafts(manifest, opts)
      if (items.length > 0) {
        await upsertFeedItems(items)
        await pruneOlderThan(creatorId, KEEP_PER_CREATOR)
      }
      if (channelImage) {
        await setCreatorImage(creatorId, channelImage)
      }
      // Only mark a successful refresh — a thrown fetch leaves the debounce
      // open so the next attempt can retry, instead of permanently locking
      // the creator out for 30 minutes after a transient blip.
      lastRefreshedAt.set(creatorId, Date.now())
    })
    if (postRefresh) await postRefresh(creatorId)
  } finally {
    inFlight.delete(creatorId)
  }
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
  channelKind: FeedItemDraft['channelKind'],
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

/**
 * No-API-key path to a YouTube channel's avatar URL: fetch the channel page
 * and read `<meta property="og:image" content="…">`. The Atom feed doesn't
 * carry channel imagery; the Data API would, but requires a key + quota.
 * Best-effort — any failure falls back to undefined so refresh keeps working.
 */
async function fetchYoutubeChannelImage(
  channelId: string,
  fetcher: Fetcher,
): Promise<string | undefined> {
  try {
    const html = await fetcher(`https://www.youtube.com/channel/${channelId}`)
    const match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    return match?.[1]
  } catch {
    return undefined
  }
}

/**
 * HEAD `/shorts/<videoId>` to determine whether a given video is a Short.
 * - 200 → it's a Short (the page renders the Shorts viewer)
 * - 303 → it's a regular video (YouTube redirects to /watch?v=…)
 *
 * Used to recover the shorts/non-shorts split for items that appear in the
 * channel feed but not in UUSH (UUSH only surfaces ~15 recent shorts; a
 * creator who alternates shorts and long-form may have shorts in their
 * channel feed that are too old for UUSH's first page).
 *
 * Best-effort: any network error returns false so we don't accidentally
 * over-tag on flaky networks. The probe runs per ambiguous item, so the
 * fetcher's existing rate-limiter caps the concurrency.
 */
async function probeIsYouTubeShort(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      method: 'HEAD',
      redirect: 'manual',
    })
    // status 0 (opaqueredirect) and 303 both mean "not a Short". 200 = Short.
    return res.status === 200
  } catch {
    return false
  }
}

async function fetchChannel(
  channel: CreatorChannel,
  creatorId: string,
  fetcher: Fetcher,
  jsonFetcher: (url: string) => Promise<unknown>,
  prebuilt: PrebuiltCreatorMeta | null,
): Promise<ChannelFetchResult> {
  switch (channel.kind) {
    case 'youtube': {
      if (!channel.channelId) return { drafts: [] }
      const channelUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`

      // When the prebuilt meta is available (the hourly CI run wrote it),
      // we trust its shortVideoIds list authoritatively — it was computed
      // by HEAD-probing every video in the channel feed from a clean IP
      // with no rate-limit risk. Skip the per-device UUSH fetch, og:image
      // scrape, and probe entirely; just fetch the channel feed for the
      // current list of items. (The channel image was already pushed by
      // fetchCreatorDrafts from prebuilt, so we don't return it here.)
      if (prebuilt) {
        const channelXml = await fetcher(channelUrl).catch(() => '')
        const channelParsed = channelXml ? parseYoutubeFeed(channelXml) : []
        const prebuiltShorts = new Set(prebuilt.shortVideoIds)
        const drafts = await Promise.all(
          channelParsed.map((d) =>
            toDraft(d, creatorId, prebuiltShorts.has(d.videoId) ? 'youtube-short' : 'youtube'),
          ),
        )
        return { drafts }
      }

      // Live fallback for creators added between CI runs (no prebuilt
      // file yet): the same discovery the build script does, on-device.
      // UUSH only surfaces the most recent ~15 shorts, so we also HEAD-
      // probe channel-feed items that aren't in UUSH to catch older
      // shorts. The og:image scrape provides a channel image since the
      // Atom feed has none.
      const rest = channel.channelId.replace(/^UC/, '')
      const shortsUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=UUSH${rest}`
      const [channelXml, shortsXml, channelImage] = await Promise.all([
        fetcher(channelUrl).catch(() => ''),
        fetcher(shortsUrl).catch(() => ''),
        fetchYoutubeChannelImage(channel.channelId, fetcher),
      ])
      const shortsParsed = shortsXml ? parseYoutubeFeed(shortsXml) : []
      const shortIds = new Set(shortsParsed.map((d) => d.videoId))
      const channelParsed = channelXml ? parseYoutubeFeed(channelXml) : []

      const ambiguous = channelParsed.filter((d) => !shortIds.has(d.videoId))
      const probed = await Promise.all(
        ambiguous.map((d) =>
          limiter(async () => ({
            videoId: d.videoId,
            isShort: await probeIsYouTubeShort(d.videoId),
          })),
        ),
      )
      for (const p of probed) {
        if (p.isShort) shortIds.add(p.videoId)
      }

      const channelIds = new Set(channelParsed.map((d) => d.videoId))
      const drafts: FeedItemDraft[] = []
      for (const d of channelParsed) {
        const kind: FeedItemDraft['channelKind'] = shortIds.has(d.videoId)
          ? 'youtube-short'
          : 'youtube'
        drafts.push(await toDraft(d, creatorId, kind))
      }
      for (const d of shortsParsed) {
        if (channelIds.has(d.videoId)) continue
        drafts.push(await toDraft(d, creatorId, 'youtube-short'))
      }
      return { drafts, channelImage }
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
