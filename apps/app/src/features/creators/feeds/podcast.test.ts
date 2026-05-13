import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parsePodcastFeed } from './podcast'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = readFileSync(join(here, '__fixtures__/podcast.xml'), 'utf-8')

describe('parsePodcastFeed', () => {
  it('parses two episodes with iTunes/CDATA and chapter markers', () => {
    const { items, channelImage } = parsePodcastFeed(fixture)
    expect(items).toHaveLength(2)
    expect(channelImage).toBe('https://example.org/img/show.jpg')

    const [first, second] = items
    expect(first.guid).toBe('episode-001')
    expect(first.title).toBe('Posso comungar em pecado mortal?')
    expect(first.mediaUrl).toBe('https://example.org/audio/ep-001.mp3')
    expect(first.imageUrl).toBe('https://example.org/img/show.jpg')
    expect(first.durationS).toBe(18 * 60 + 42)
    expect(first.publishedAt).toBe(Date.parse('Mon, 04 May 2026 09:00:00 +0000'))
    expect(first.chapters).toEqual([
      { tStart: 0, title: 'Introdução' },
      { tStart: 150, title: 'Pergunta 1: Posso comungar em pecado mortal?' },
      { tStart: 942, title: 'Pergunta 2: Como confessar pecados esquecidos?' },
      { tStart: 1080, title: 'Encerramento' },
    ])

    expect(second.guid).toBe('episode-002')
    // iTunes:duration in plain seconds.
    expect(second.durationS).toBe(1842)
    // Description without chapter markers → no chapters.
    expect(second.chapters).toBeUndefined()
  })

  it('returns empty result on malformed XML', () => {
    expect(parsePodcastFeed('not-xml')).toEqual({ items: [] })
  })

  it('returns empty result for non-RSS root', () => {
    expect(parsePodcastFeed('<feed/>')).toEqual({ items: [] })
  })
})
