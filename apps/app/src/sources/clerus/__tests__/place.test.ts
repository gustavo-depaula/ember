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

describe('parseClerusPlace, the other ways a page is set', () => {
  // The last section of Evangelii nuntiandi: its note is "135. …", called as
  // "(135)", and the page's footer follows it.
  const last = parseClerusPlace(
    decodeWindows1252(
      new Uint8Array(readFileSync(join(__dirname, '../__fixtures__/evangelii-nuntiandi.htm'))),
    ),
    'gd',
  )

  it('stops before a note set as a numbered line, and before the footer', () => {
    const text = last.join(' ')
    expect(text).toMatch(/PAULUS PP\. VI$/)
    expect(text).not.toMatch(/Ph 1,3-4|Evangelii nuntiandi PT/)
  })

  it('drops a call set in brackets', () => {
    expect(last.join(' ')).toMatch(/ternura de Cristo Jesus"\. Dado em Roma/)
  })

  it('reads past a heading set inside a section, to the next numbered one', () => {
    const page =
      '<a name=ab><b>7</b> First.[12]<br><br><a Name=q><h2><a href=s.htm#q>A heading</a></h2>Second.' +
      '<br><br>[12] A note.<br><br><a name=ac><b>8</b> Next.'
    expect(parseClerusPlace(page, 'ab')).toEqual(['First.', 'Second.'])
  })

  it('drops bare calls wherever the documents set them', () => {
    const page =
      '<a name=ab><b>7</b> Se Cristo « se uniu a cada homem », 115 a Igreja vive. 116 Se este Corpo, ' +
      'como disse Paulo de Tarso46, tem 12 apóstolos e 3 pessoas.<br><br><a name=ac><b>8</b> Next.'
    expect(parseClerusPlace(page, 'ab')).toEqual([
      'Se Cristo « se uniu a cada homem », a Igreja vive. Se este Corpo, como disse Paulo de Tarso, tem 12 apóstolos e 3 pessoas.',
    ])
  })

  it('keeps a numbered line that no call in the text points to', () => {
    const page =
      '<a name=ab><b>7</b> Three things:<br><br> 1. The first.<br><br><a name=ac><b>8</b> Next.'
    expect(parseClerusPlace(page, 'ab')).toEqual(['Three things:', '1. The first.'])
  })
})
