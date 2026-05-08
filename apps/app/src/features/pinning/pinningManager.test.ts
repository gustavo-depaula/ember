/**
 * Tests for the per-kind blob walker. Pure logic; the network/DB pieces are
 * mocked — we only exercise that the walker traverses every reference shape
 * defined by the manifest types.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { rememberManifestBody, resetContentIndex, setCatalog } from '@/content/contentIndex'
import type {
  BookItemManifest,
  ChapterItemManifest,
  CollectionItemManifest,
  LangSplitItemManifest,
  PracticeItemManifest,
} from '@/content/manifestTypes'

vi.mock('@/content/store', () => ({
  prefetch: vi.fn(),
  getJson: vi.fn(),
}))
vi.mock('@/db/repositories/preferences', () => ({
  getPreference: vi.fn().mockResolvedValue(undefined),
  setPreference: vi.fn().mockResolvedValue(undefined),
}))

import { prefetch as prefetchMock } from '@/content/store'
import { isPinned, pinItem, pinnedHashes, resetPinned, unpinItem } from './pinningManager'

beforeEach(() => {
  resetContentIndex()
  resetPinned()
  vi.mocked(prefetchMock).mockReset().mockResolvedValue(undefined)
})

describe('pinning — collectBlobsFor (via pinItem)', () => {
  function setup() {
    setCatalog({
      version: 2,
      generated: '',
      items: {
        'prayer/our-father': { kind: 'prayer', hash: 'p-of', size: 100 },
        'practice/rosary': { kind: 'practice', hash: 'p-rosary', size: 200 },
        'chapter/intro': { kind: 'chapter', hash: 'c-intro', size: 300 },
        'book/foo': { kind: 'book', hash: 'b-foo', size: 400 },
        'mass/of/easter': { kind: 'mass', hash: 'm-easter', size: 500 },
        'collection/marian': { kind: 'collection', hash: 'col-marian', size: 50 },
      },
    })
  }

  it('practice — gathers flow + fragments + data + tracks + perDay + images', async () => {
    setup()
    rememberManifestBody('p-rosary', {
      id: 'practice/rosary',
      flowHash: { hash: 'flow', size: 1 },
      fragments: [{ id: 'a', hash: 'frag-a', size: 1 }],
      dataHashes: [{ name: 'd', hash: 'data-d', size: 1 }],
      trackHashes: [{ name: 't', hash: 'track-t', size: 1 }],
      perDay: { '1': { hash: 'day-1', size: 1 } },
      images: [{ rel: 'i', hash: 'img-1', size: 1, mime: 'image/webp' }],
    } as unknown as PracticeItemManifest)

    await pinItem('practice/rosary')

    const passed = vi.mocked(prefetchMock).mock.calls[0][0].map((e: any) => e.hash)
    expect(passed.sort()).toEqual(
      ['p-rosary', 'flow', 'frag-a', 'data-d', 'track-t', 'day-1', 'img-1'].sort(),
    )
    expect(isPinned('practice/rosary')).toBe(true)
  })

  it('chapter — gathers content + per-language prose', async () => {
    setup()
    rememberManifestBody('c-intro', {
      id: 'chapter/intro',
      title: { 'en-US': 'Intro' },
      contentHash: { hash: 'content', size: 1 },
      prose: [
        { file: 'a', lang: 'en-US', hash: 'prose-en', size: 1 },
        { file: 'a', lang: 'pt-BR', hash: 'prose-pt', size: 1 },
      ],
    } as unknown as ChapterItemManifest)

    await pinItem('chapter/intro')
    const passed = vi.mocked(prefetchMock).mock.calls[0][0].map((e: any) => e.hash)
    expect(passed.sort()).toEqual(['c-intro', 'content', 'prose-en', 'prose-pt'].sort())
  })

  it('book — gathers style + every (chapter, lang) blob + images', async () => {
    setup()
    rememberManifestBody('b-foo', {
      id: 'book/foo',
      name: { 'en-US': 'Foo' },
      style: { hash: 'css', size: 1 },
      chapters: {
        'ch-1': { 'en-US': { hash: 'ch1-en', size: 1 } },
        'ch-2': { 'en-US': { hash: 'ch2-en', size: 1 }, 'pt-BR': { hash: 'ch2-pt', size: 1 } },
      },
      images: [{ rel: 'i', hash: 'img', size: 1, mime: 'image/webp' }],
    } as unknown as BookItemManifest)

    await pinItem('book/foo')
    const passed = vi.mocked(prefetchMock).mock.calls[0][0].map((e: any) => e.hash)
    expect(passed.sort()).toEqual(['b-foo', 'css', 'ch1-en', 'ch2-en', 'ch2-pt', 'img'].sort())
  })

  it('mass — gathers shape + every per-language blob', async () => {
    setup()
    rememberManifestBody('m-easter', {
      id: 'mass/of/easter',
      shape: { hash: 'shape', size: 1 },
      langs: {
        la: { hash: 'la', size: 1 },
        en: { hash: 'en', size: 1 },
        'pt-BR': { hash: 'pt', size: 1 },
      },
    } as unknown as LangSplitItemManifest)

    await pinItem('mass/of/easter')
    const passed = vi.mocked(prefetchMock).mock.calls[0][0].map((e: any) => e.hash)
    expect(passed.sort()).toEqual(['m-easter', 'shape', 'la', 'en', 'pt'].sort())
  })

  it('collection — recursively walks referenced items', async () => {
    setup()
    rememberManifestBody('col-marian', {
      id: 'collection/marian',
      items: [{ ref: 'practice/rosary' }, { ref: 'prayer/our-father' }],
    } as unknown as CollectionItemManifest)
    rememberManifestBody('p-rosary', {
      id: 'practice/rosary',
      flowHash: { hash: 'flow', size: 1 },
    } as unknown as PracticeItemManifest)

    await pinItem('collection/marian')
    const passed = vi.mocked(prefetchMock).mock.calls[0][0].map((e: any) => e.hash)
    expect(passed.sort()).toEqual(['col-marian', 'p-rosary', 'flow', 'p-of'].sort())
  })

  it('throws on unknown id', async () => {
    setup()
    await expect(pinItem('practice/nope')).rejects.toThrow(/unknown/i)
  })

  it('pinnedHashes unions across pinned items', async () => {
    setup()
    rememberManifestBody('p-rosary', {
      id: 'practice/rosary',
      flowHash: { hash: 'shared-flow', size: 1 },
    } as unknown as PracticeItemManifest)

    await pinItem('practice/rosary')
    await pinItem('prayer/our-father')

    const hashes = await pinnedHashes()
    expect(hashes.has('p-rosary')).toBe(true)
    expect(hashes.has('shared-flow')).toBe(true)
    expect(hashes.has('p-of')).toBe(true)
  })

  it('unpinItem removes from pinned list (but does NOT delete blobs)', async () => {
    setup()
    rememberManifestBody('p-of', { id: 'prayer/our-father', title: {}, body: [] })
    await pinItem('prayer/our-father')
    expect(isPinned('prayer/our-father')).toBe(true)
    await unpinItem('prayer/our-father')
    expect(isPinned('prayer/our-father')).toBe(false)
  })
})
