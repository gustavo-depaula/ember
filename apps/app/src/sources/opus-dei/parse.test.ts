import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseGospelCommentary, parseMeditation } from './parse'

const fixture = (name: string) => readFileSync(join(__dirname, '__fixtures__', name), 'utf-8')

const proseText = (blocks: ReturnType<typeof parseGospelCommentary>): string =>
  blocks
    .map((b) =>
      b.kind === 'paragraph' ? b.inline.map((i) => ('text' in i ? i.text : ' ')).join('') : '',
    )
    .join('\n')

describe('parseGospelCommentary', () => {
  it('extracts the EN commentary, not the scripture passage', () => {
    const blocks = parseGospelCommentary(fixture('od-gospel.html'), 'en-US')
    const text = proseText(blocks)
    expect(blocks.length).toBeGreaterThanOrEqual(3)
    expect(text).toContain('In today’s Gospel passage')
    // the gospel passage and its labels must not leak in
    expect(text).not.toContain('You have heard that it was said')
    expect(text).not.toContain('Commentary')
    // spacing around inline <em> citations must survive
    expect(text).toContain('an eye for an eye')
    expect(text).not.toMatch(/\w,\w/) // no "behaviour,the"-style mashing
  })

  it('extracts the PT commentary', () => {
    const blocks = parseGospelCommentary(fixture('od-gospel-pt.html'), 'pt-BR')
    const text = proseText(blocks)
    expect(blocks.length).toBeGreaterThanOrEqual(2)
    expect(text).not.toContain('Comentário')
    expect(text.length).toBeGreaterThan(200)
  })
})

describe('parseMeditation', () => {
  it('extracts title, lead and sectioned EN body without footnotes', () => {
    const med = parseMeditation(fixture('od-med.html'), 'en-US')
    expect(med.title).toContain('Eleventh Week')
    expect(med.lead).toBeTruthy()
    expect(med.sections.length).toBe(3)
    expect(med.sections[0].heading).toBe('The contrast between Ahab and Naboth')
    expect(med.sections[2].heading).toBe('Christ’s justice')
    const allText = med.sections
      .flatMap((s) => s.blocks)
      .map((b) =>
        b.kind === 'paragraph' ? b.inline.map((i) => ('text' in i ? i.text : '')).join('') : '',
      )
      .join('\n')
    expect(allText).toContain('AHAB, KING of Israel')
    // boundary spaces around inline citations must survive
    expect(allText).toContain('(1 Kings 20:43)')
    expect(allText).not.toMatch(/\w,\w/)
    // footnote definitions (the "St. Ambrose, De officiis…" list) must be gone
    expect(allText).not.toContain('De officiis')
    expect(med.sections[2].blocks.at(-1)?.kind).toBe('paragraph')
  })

  it('extracts the PT meditation', () => {
    const med = parseMeditation(fixture('od-med-pt.html'), 'pt-BR')
    expect(med.title).toBeTruthy()
    expect(med.sections.length).toBe(3)
    expect(med.sections.every((s) => s.heading)).toBe(true)
  })
})
