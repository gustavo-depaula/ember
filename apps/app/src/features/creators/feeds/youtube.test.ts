import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseYoutubeFeed } from './youtube'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = readFileSync(join(here, '__fixtures__/youtube.xml'), 'utf-8')

describe('parseYoutubeFeed', () => {
  it('parses two entries from the public Atom feed', () => {
    const drafts = parseYoutubeFeed(fixture)
    expect(drafts).toHaveLength(2)
    const [first, second] = drafts

    expect(first.videoId).toBe('dQw4w9WgXcQ')
    expect(first.guid).toBe('dQw4w9WgXcQ')
    expect(first.title).toBe('How to read Scripture: 8 talks on Lectio Divina')
    expect(first.webUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(first.imageUrl).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
    expect(first.publishedAt).toBe(Date.parse('2026-05-01T15:00:00+00:00'))
    expect(first.chapters).toEqual([
      { tStart: 0, title: 'Intro' },
      { tStart: 330, title: 'What is Lectio' },
      { tStart: 730, title: 'Lectio in practice' },
      { tStart: 1200, title: 'Q&A' },
    ])

    expect(second.videoId).toBe('abcDEFghi12')
    expect(second.chapters).toBeUndefined()
  })
})
