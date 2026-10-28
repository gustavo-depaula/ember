import { describe, expect, it } from 'vitest'
import { assembleHour } from '../hour'
import { type Hour, officeOf } from '../office'
import { blockText } from '../text'
import { calendar, corpus, on } from './corpus'

// What the archive the corpus was drawn from lacks or has wrong, and the
// corpus has: each of these was read against liturgiadashoras.online, a second
// edition of the same breviary, which agrees with it.

async function antiphon(iso: string, hour: Hour) {
  const office = officeOf(on(iso), hour, calendar)
  const parts = await assembleHour(office, office.celebration ? 'celebration' : 'season', corpus)
  const text = (slot: string) =>
    parts
      .filter((part) => part.slot === slot)
      .flatMap((part) => part.blocks.map(blockText))
      .join('\n')
  expect(text('canticle-ant-end')).toBe(text('canticle-ant'))
  return { text: text('canticle-ant'), slots: parts.map((part) => part.slot) }
}

describe("the Sunday's antiphon of the Gospel canticle", () => {
  it('follows the year of the cycle in Advent, Lent and Easter', async () => {
    expect((await antiphon('2025-11-30', 'lauds')).text).toMatch(
      /^Ant\. Se o dono da casa soubesse/,
    )
    expect((await antiphon('2026-11-29', 'lauds')).text).toMatch(
      /^Ant\. Vigiai, diz Jesus, pois não sabeis/,
    )
    expect((await antiphon('2026-03-22', 'vespers')).text).toMatch(
      /^Ant\. Eu creio que és o Cristo/,
    )
    expect((await antiphon('2026-05-10', 'lauds')).text).toMatch(/^Ant\. Não vos deixo como órfãos/)
  })

  it('is the next Sunday’s on the Saturday evening', async () => {
    expect((await antiphon('2026-05-09', 'vespers')).text).toMatch(/^Ant\. Rogarei ao meu Pai/)
  })

  it('gives way at Vespers to the antiphon of the date from 17 December', async () => {
    expect((await antiphon('2025-12-20', 'vespers')).text).toMatch(/^Ant\. Ó Chave de Davi/)
    expect((await antiphon('2025-12-21', 'vespers')).text).toMatch(/^Ant\. Ó Sol nascente/)
    // The two evenings the archive has a day late.
    expect((await antiphon('2028-12-17', 'vespers')).text).toMatch(/^Ant\. Ó Sabedoria/)
    expect((await antiphon('2029-12-22', 'vespers')).text).toMatch(/^Ant\. Ó Rei das nações/)
  })

  it('is there for a Sunday the checked years never had', async () => {
    // The eighth Sunday of Ordinary Time in year B falls before Lent only with a late Easter.
    for (const iso of ['2041-03-03', '2044-02-28', '2047-02-24', '2050-02-27']) {
      const { text } = await antiphon(iso, 'lauds')
      expect(text.length).toBeGreaterThan(20)
    }
  })
})

describe('the fourth Sunday of Advent on 18-23 December', () => {
  // 22 December was a Sunday twice in the reference, both times in a year C.
  it('keeps at Lauds the antiphon of its year of the cycle, on a date met only in another', async () => {
    expect((await antiphon('2041-12-22', 'lauds')).text).toMatch(
      /^Ant\. O anjo Gabriel foi enviado/,
    )
    expect((await antiphon('2030-12-22', 'lauds')).text).toMatch(/^Ant\. Levantou-se Maria/)
  })

  it('has at Vespers the antiphon of the date all the same', async () => {
    expect((await antiphon('2041-12-22', 'vespers')).text).toMatch(/^Ant\. Ó Rei das nações/)
  })
})

describe('second Vespers of Christ the King', () => {
  it('go on past the responsory', async () => {
    const { text, slots } = await antiphon('2025-11-23', 'vespers')
    expect(text).toMatch(/^Ant\. Todo poder foi-me dado no céu e na terra/)
    expect(slots).toEqual(
      expect.arrayContaining(['canticle', 'intercessions', 'prayer', 'conclusion']),
    )
  })
})
