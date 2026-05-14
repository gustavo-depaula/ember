/**
 * Integration tests for the parser-dispatch path. Drives the pure
 * `fetchCreatorDrafts` to avoid pulling in the SQLite/React-Native chain.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'

// Stub the DB repo + resolver: importing the real modules would transitively
// pull in expo-sqlite + react-native, which vitest can't parse.
vi.mock('@/db/repositories/feedItems', () => ({
  deriveItemId: async (creatorId: string, guid: string) => `${creatorId}::${guid}`,
}))
vi.mock('@/db/repositories/creatorMeta', () => ({
  setCreatorImage: vi.fn().mockResolvedValue(undefined),
  getCreatorImage: vi.fn().mockResolvedValue(null),
}))
vi.mock('@/content/resolver', () => ({ loadCreator: () => undefined }))

import type { CreatorManifest } from '@/content/manifestTypes'
import { fetchCreatorDrafts, type PrebuiltCreatorMeta } from './fetcher'

// Default to the live-fallback path: tests inject explicit prebuilt only
// where they're asserting that behavior. (Without this, the default loader
// would try to dynamic-import @/lib/hearth which transitively touches the
// SQLite cache repo and breaks the test env.)
const noPrebuilt = async () => null

const here = dirname(fileURLToPath(import.meta.url))
const podcastFixture = readFileSync(join(here, '__fixtures__/podcast.xml'), 'utf-8')
const youtubeFixture = readFileSync(join(here, '__fixtures__/youtube.xml'), 'utf-8')
const youtubeShortsFixture = readFileSync(join(here, '__fixtures__/youtube-shorts.xml'), 'utf-8')
const blogFixture = readFileSync(join(here, '__fixtures__/blog-rss.xml'), 'utf-8')

const manifest: CreatorManifest = {
  id: 'creator/test-creator',
  name: { 'en-US': 'Test' },
  bio: { 'en-US': 'Bio' },
  languages: ['en-US'],
  channels: [
    { kind: 'podcast', feedUrl: 'https://example.org/feed.xml', format: 'qa' },
    { kind: 'youtube', channelId: 'UCabc' },
    { kind: 'rss', feedUrl: 'https://example.org/blog.xml' },
  ],
}

const fakeYoutubeChannelPage = `<!doctype html><html><head>
<meta property="og:image" content="https://yt3.googleusercontent.com/avatar.jpg">
</head><body>...</body></html>`

const fakeFetcher = async (url: string): Promise<string> => {
  if (url.includes('feed.xml')) return podcastFixture
  if (url.includes('playlist_id=UUSH')) return youtubeShortsFixture
  if (url.includes('youtube.com/feeds')) return youtubeFixture
  if (url.includes('youtube.com/channel/')) return fakeYoutubeChannelPage
  if (url.includes('blog.xml')) return blogFixture
  throw new Error(`unexpected URL ${url}`)
}

describe('fetchCreatorDrafts', () => {
  it('parses all channel kinds (including youtube-short split) into one merged list', async () => {
    const { items } = await fetchCreatorDrafts(manifest, {
      fetcher: fakeFetcher,
      prebuiltLoader: noPrebuilt,
    })
    const kinds = new Set(items.map((d) => d.channelKind))
    // YouTube items from the channel_id feed are tagged 'youtube' unless their
    // videoId also appears in the UUSH playlist, in which case they're tagged
    // 'youtube-short'.
    expect(kinds).toEqual(new Set(['podcast', 'youtube', 'youtube-short', 'rss']))
    // 2 podcast + 2 youtube (channel feed dedup'd against shorts) + 2 rss.
    // The shorts fixture has 1 entry whose videoId overlaps with the channel
    // fixture, so 1 of the 2 channel items flips to 'youtube-short' and no
    // duplicate is added.
    expect(items).toHaveLength(6)
    expect(items.every((d) => d.itemId.startsWith('creator/test-creator::'))).toBe(true)
  })

  it('tags items as youtube-short when their videoId is in the UUSH playlist', async () => {
    let channelHits = 0
    let uushHits = 0
    const counting: typeof fakeFetcher = async (url) => {
      if (url.includes('channel_id=')) channelHits++
      if (url.includes('playlist_id=UUSH')) uushHits++
      return fakeFetcher(url)
    }
    const { items } = await fetchCreatorDrafts(manifest, {
      fetcher: counting,
      prebuiltLoader: noPrebuilt,
    })
    expect(channelHits).toBe(1)
    expect(uushHits).toBe(1)
    const videos = items.filter((d) => d.channelKind === 'youtube')
    const shorts = items.filter((d) => d.channelKind === 'youtube-short')
    expect(videos.map((d) => d.guid)).toEqual(['dQw4w9WgXcQ'])
    expect(shorts.map((d) => d.guid)).toEqual(['abcDEFghi12'])
  })

  it('still surfaces channel items when UUSH is empty (channels with no shorts)', async () => {
    const noShorts: typeof fakeFetcher = async (url) => {
      if (url.includes('playlist_id=UUSH')) return ''
      return fakeFetcher(url)
    }
    const { items } = await fetchCreatorDrafts(manifest, {
      fetcher: noShorts,
      prebuiltLoader: noPrebuilt,
    })
    const shorts = items.filter((d) => d.channelKind === 'youtube-short')
    const videos = items.filter((d) => d.channelKind === 'youtube')
    expect(shorts).toHaveLength(0)
    expect(videos).toHaveLength(2)
  })

  it('surfaces the channel-level image from the podcast feed', async () => {
    const { channelImage } = await fetchCreatorDrafts(manifest, {
      fetcher: fakeFetcher,
      prebuiltLoader: noPrebuilt,
    })
    // The podcast channel image (or the scraped YouTube og:image) wins —
    // first non-empty channelImage across all channels. With both available,
    // the assertion is just "we got *some* stable channel image".
    expect(channelImage).toBeDefined()
    expect(channelImage).toMatch(/^https?:\/\//)
  })

  it('scrapes the YouTube channel page og:image when only a YouTube channel exists', async () => {
    const ytOnly: CreatorManifest = {
      id: 'creator/yt-only',
      name: { 'en-US': 'YT' },
      bio: { 'en-US': 'YT' },
      languages: ['en-US'],
      channels: [{ kind: 'youtube', channelId: 'UCabc' }],
    }
    const { channelImage } = await fetchCreatorDrafts(ytOnly, {
      fetcher: fakeFetcher,
      prebuiltLoader: noPrebuilt,
    })
    expect(channelImage).toBe('https://yt3.googleusercontent.com/avatar.jpg')
  })

  it('preserves chapter markers parsed from descriptions', async () => {
    const { items } = await fetchCreatorDrafts(manifest, {
      fetcher: fakeFetcher,
      prebuiltLoader: noPrebuilt,
    })
    const withChapters = items.filter((d) => d.chapters?.length)
    // The PPR-style podcast fixture episode + the YouTube fixture entry both expose chapters.
    expect(withChapters.length).toBeGreaterThanOrEqual(2)
    const ppr = items.find((d) => d.title === 'Posso comungar em pecado mortal?')
    expect(ppr?.chapters?.[0]).toEqual({ tStart: 0, title: 'Introdução' })
    expect(ppr?.chapters?.[1]).toEqual({
      tStart: 150,
      title: 'Pergunta 1: Posso comungar em pecado mortal?',
    })
  })

  it('uses prebuilt creator-meta to classify shorts without UUSH / probe / og:image', async () => {
    // Prebuilt explicitly marks one of the two YouTube fixture videos as a
    // Short. The fetcher should respect that and skip the og:image scrape,
    // UUSH playlist fetch, and HEAD probe entirely.
    let uushHits = 0
    let channelPageHits = 0
    const counting: typeof fakeFetcher = async (url) => {
      if (url.includes('playlist_id=UUSH')) uushHits++
      if (url.includes('youtube.com/channel/')) channelPageHits++
      return fakeFetcher(url)
    }
    const prebuilt: PrebuiltCreatorMeta = {
      creatorId: 'creator/test-creator',
      generatedAt: '2026-05-14T00:00:00Z',
      channelImage: 'https://prebuilt.example/avatar.jpg',
      shortVideoIds: ['abcDEFghi12'],
    }
    const { items, channelImage } = await fetchCreatorDrafts(manifest, {
      fetcher: counting,
      prebuiltLoader: async (id) => (id === 'creator/test-creator' ? prebuilt : null),
    })
    // No live YouTube discovery work happened:
    expect(uushHits).toBe(0)
    expect(channelPageHits).toBe(0)
    // Items classified per the prebuilt shorts list:
    const yt = items.filter((d) => d.channelKind === 'youtube').map((d) => d.guid)
    const sh = items.filter((d) => d.channelKind === 'youtube-short').map((d) => d.guid)
    expect(yt).toEqual(['dQw4w9WgXcQ'])
    expect(sh).toEqual(['abcDEFghi12'])
    // Channel image comes straight from prebuilt — and since prebuilt is the
    // first non-null collected, it wins over any podcast channel image too.
    expect(channelImage).toBe('https://prebuilt.example/avatar.jpg')
  })

  it('skips channels without the required URL/id', async () => {
    const minimal: CreatorManifest = {
      id: 'creator/minimal',
      name: { 'en-US': 'M' },
      bio: { 'en-US': 'M' },
      languages: ['en-US'],
      channels: [
        { kind: 'podcast' }, // missing feedUrl
        { kind: 'youtube' }, // missing channelId
      ],
    }
    const { items, channelImage } = await fetchCreatorDrafts(minimal, {
      fetcher: fakeFetcher,
      prebuiltLoader: noPrebuilt,
    })
    expect(items).toEqual([])
    expect(channelImage).toBeUndefined()
  })
})
