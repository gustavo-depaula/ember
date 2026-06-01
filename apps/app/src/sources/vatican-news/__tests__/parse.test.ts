import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { ProseBlock } from '@/content/primitives'
import { compactCitation, splitCitation } from '../gospel'
import { paragraphText, parseSection } from '../parse'
import { dayUrl, type Lang } from '../url'

function loadFixture(lang: Lang): string {
  const slug = lang === 'en-US' ? 'en' : 'pt'
  return readFileSync(join(__dirname, 'fixtures', `wotd-${slug}.html`), 'utf-8')
}

const allText = (blocks: ProseBlock[]): string => blocks.map(paragraphText).join('\n')

describe('parseSection — pope reflection', () => {
  it('extracts the English reflection, ignoring readings/gospel', () => {
    const blocks = parseSection(loadFixture('en-US'), 'en-US', 'pope')
    expect(blocks.length).toBeGreaterThan(0)
    const text = allText(blocks)
    expect(text).toContain('Solemnity of the Most Holy Trinity')
    expect(text).toContain('Pope Francis, Angelus')
    expect(text).not.toContain('Moses went up Mount Sinai') // reading
    expect(text).not.toContain('God so loved the world') // gospel
  })

  it('extracts the Portuguese reflection and decodes entities', () => {
    const blocks = parseSection(loadFixture('pt-BR'), 'pt-BR', 'pope')
    const text = allText(blocks)
    expect(text).toContain('comunhão')
    expect(text).toContain('Papa Francisco')
    expect(text).not.toMatch(/&[a-z]+;/)
  })
})

describe('parseSection — gospel', () => {
  it('extracts the gospel block (citation + passage), ignoring reflection', () => {
    const blocks = parseSection(loadFixture('en-US'), 'en-US', 'gospel')
    expect(blocks.length).toBeGreaterThanOrEqual(2)
    // First paragraph is the citation; the rest is the passage.
    expect(paragraphText(blocks[0])).toMatch(/Gospel according to\s+John\s+3:16-18/)
    const passage = blocks.slice(1).map(paragraphText).join('\n')
    expect(passage).toContain('God so loved the world')
    expect(passage).not.toContain('Most Holy Trinity') // reflection
  })

  it('extracts the Portuguese gospel block', () => {
    const blocks = parseSection(loadFixture('pt-BR'), 'pt-BR', 'gospel')
    expect(blocks.length).toBeGreaterThanOrEqual(1)
    expect(allText(blocks)).not.toMatch(/&[a-z]+;/)
  })

  it('throws when the requested language heading is absent', () => {
    expect(() => parseSection(loadFixture('en-US'), 'pt-BR', 'pope')).toThrow()
  })
})

describe('splitCitation — citation vs passage', () => {
  it('EN: citation rides inline in the first paragraph', () => {
    const { citation, body } = splitCitation(parseSection(loadFixture('en-US'), 'en-US', 'gospel'))
    expect(citation).toMatch(/Gospel according to\s+John\s+3:16-18/)
    expect(body.map(paragraphText).join('\n')).toContain('God so loved the world')
    // The verse reference must not leak into the passage.
    expect(body.map(paragraphText).join('\n')).not.toMatch(/^\s*3:16-18\s*$/m)
  })

  it('PT: folds the standalone verse-reference paragraph into the citation', () => {
    const blocks = parseSection(loadFixture('pt-BR'), 'pt-BR', 'gospel')
    // The PT page splits "…segundo João" and "3,16-18" across two <p>s.
    expect(paragraphText(blocks[1])).toBe('3,16-18')
    const { citation, body } = splitCitation(blocks)
    expect(citation).toContain('segundo João')
    expect(citation).toContain('3,16-18')
    expect(paragraphText(body[0])).toContain('Deus amou tanto o mundo')
    // "3,16-18" must not appear as its own passage paragraph.
    expect(body.some((b) => paragraphText(b) === '3,16-18')).toBe(false)
  })
})

describe('compactCitation', () => {
  it('reduces the full incipit to "Book ref"', () => {
    expect(compactCitation('Proclamação do Evangelho de Jesus Cristo segundo João 3,16-18')).toBe(
      'João 3,16-18',
    )
    expect(compactCitation('From the Gospel according to John 3:16-18')).toBe('John 3:16-18')
  })

  it('passes through when the tail is not a reference, and undefined', () => {
    expect(compactCitation('A reading')).toBe('A reading')
    expect(compactCitation(undefined)).toBeUndefined()
  })
})

describe('dayUrl', () => {
  it('builds the dated per-language URL with zero-padding', () => {
    const date = new Date(2026, 4, 31)
    expect(dayUrl('en-US', date)).toBe(
      'https://www.vaticannews.va/en/word-of-the-day/2026/05/31.html',
    )
    expect(dayUrl('pt-BR', new Date(2026, 0, 5))).toBe(
      'https://www.vaticannews.va/pt/palavra-do-dia/2026/01/05.html',
    )
  })
})
