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
import { fetchCreatorDrafts } from './fetcher'

const here = dirname(fileURLToPath(import.meta.url))
const podcastFixture = readFileSync(join(here, '__fixtures__/podcast.xml'), 'utf-8')
const youtubeFixture = readFileSync(join(here, '__fixtures__/youtube.xml'), 'utf-8')
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

const fakeFetcher = async (url: string): Promise<string> => {
  if (url.includes('feed.xml')) return podcastFixture
  if (url.includes('youtube.com/feeds')) return youtubeFixture
  if (url.includes('blog.xml')) return blogFixture
  throw new Error(`unexpected URL ${url}`)
}

describe('fetchCreatorDrafts', () => {
  it('parses all three channel kinds and returns items in one merged list', async () => {
    const { items } = await fetchCreatorDrafts(manifest, { fetcher: fakeFetcher })
    const kinds = new Set(items.map((d) => d.channelKind))
    expect(kinds).toEqual(new Set(['podcast', 'youtube', 'rss']))
    // 2 podcast + 2 youtube + 2 rss
    expect(items).toHaveLength(6)
    // Item id is deterministic from creator + guid.
    expect(items.every((d) => d.itemId.startsWith('creator/test-creator::'))).toBe(true)
  })

  it('surfaces the channel-level image from the podcast feed', async () => {
    const { channelImage } = await fetchCreatorDrafts(manifest, { fetcher: fakeFetcher })
    // Pulled from <channel><itunes:image href="…show.jpg"/></channel> in the fixture.
    expect(channelImage).toBe('https://example.org/img/show.jpg')
  })

  it('preserves chapter markers parsed from descriptions', async () => {
    const { items } = await fetchCreatorDrafts(manifest, { fetcher: fakeFetcher })
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
    const { items, channelImage } = await fetchCreatorDrafts(minimal, { fetcher: fakeFetcher })
    expect(items).toEqual([])
    expect(channelImage).toBeUndefined()
  })
})
