import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { decodeWindows1252, parseClerusPlace } from '../place'

// Two sections of Veritatis splendor as Clerus serves them, footnotes and all.
const page = decodeWindows1252(
  new Uint8Array(readFileSync(join(__dirname, '../__fixtures__/veritatis-splendor.htm'))),
)

describe('parseClerusPlace', () => {
  const section = parseClerusPlace(page, 'ge')

  it('reads the section under an anchor, in paragraphs, without its number', () => {
    expect(section[0]).toMatch(/^A grande sensibilidade, que o homem contemporâneo testemunha/)
    expect(section.length).toBeGreaterThan(1)
    expect(section[1]).toMatch(/^Não se pode negar que o homem sempre existe/)
  })

  it('stops before the footnotes and the next section', () => {
    const text = section.join(' ')
    expect(text).not.toMatch(/Commonitorium|PL 50/)
    expect(text).not.toMatch(/A consciência e a verda/)
  })

  it('drops the footnote calls from the text', () => {
    expect(section[0]).toMatch(/«normas objectivas de moralidade», válidas/)
    expect(section.join(' ')).toMatch(/hoje e para sempre»\. É Ele o «Princípio»/)
    expect(section.join(' ')).not.toMatch(/próximo\. 98/)
  })

  it('finds nothing under an anchor the page lacks', () => {
    expect(parseClerusPlace(page, 'zz9')).toEqual([])
  })
})
