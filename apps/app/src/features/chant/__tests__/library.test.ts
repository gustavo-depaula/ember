import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { beforeAll, describe, expect, it } from 'vitest'

import { setCatalog } from '@/content/contentIndex'
import { type ChantBook, loadChantBook } from '../chants'
import {
  antiphonaleId,
  chantDays,
  chantEntries,
  gradualeId,
  placesOfChants,
  searchChants,
  sectionOfDay,
} from '../library'

let graduale: ChantBook
let antiphonale: ChantBook

// The built corpus: the books, and the Divinum Officium files the calendar is read from.
beforeAll(async () => {
  const corpus = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../../_site/hearth/v2',
  )
  setCatalog(JSON.parse(readFileSync(resolve(corpus, 'catalog.json'), 'utf8')))
  graduale = (await loadChantBook(gradualeId)) as ChantBook
  antiphonale = (await loadChantBook(antiphonaleId)) as ChantBook
})

async function pageOf(book: () => ChantBook, y: number, m: number, d: number) {
  const [day] = await chantDays(new Date(y, m - 1, d), 1)
  return sectionOfDay(book(), day)?.id
}

describe('sectionOfDay', () => {
  it('opens a Sunday at its own Mass', async () => {
    expect(await pageOf(() => graduale, 2026, 11, 29)).toBe('tempora-adv1-0')
  })

  it('opens a saint at the feast the 1960 calendar keeps', async () => {
    expect(await pageOf(() => graduale, 2026, 11, 11)).toBe('sancti-11-11')
  })

  it('opens Christmas Day at its third Mass', async () => {
    expect(await pageOf(() => graduale, 2026, 12, 25)).toBe('sancti-12-25m3')
  })

  it('opens a weekday with no propers of its own at the Sunday it repeats', async () => {
    // Thursday 5 November 2026: a feria after Pentecost, which sings the Sunday's Mass.
    expect(await pageOf(() => graduale, 2026, 11, 5)).toMatch(/^tempora-pent2\d-0$/)
  })

  it('opens an Advent weekday of the Office at its own antiphons', async () => {
    // Tuesday 1 December 2026, a weekday of Advent: its own Benedictus and Magnificat.
    expect(await pageOf(() => antiphonale, 2026, 12, 1)).toBe('tempora-adv1-2')
  })
})

describe('placesOfChants', () => {
  it('names every Mass a chant is sung at', () => {
    const places = placesOfChants([graduale]).get('chant/of-ave-maria-et-benedictus-843') ?? []
    expect(places.map((p) => p.section.id)).toContain('tempora-adv4-0')
  })
})

describe('searchChants', () => {
  const ids = (entries: ReturnType<typeof chantEntries>) => entries.map((e) => e.id)

  it('finds a chant by its incipit, ligatures and accents aside', () => {
    expect(ids(searchChants('rorate caeli', chantEntries(), undefined))).toContain(
      'chant/in-rorate-caeli-caeli-79',
    )
  })

  it('finds a chant by words it sings past its incipit', async () => {
    const texts = JSON.parse(
      readFileSync(
        resolve(
          dirname(fileURLToPath(import.meta.url)),
          '../../../../../../_site/hearth/v2/catalog.json',
        ),
        'utf8',
      ),
    ) as { items: Record<string, { hash: string }> }
    const { getJson } = await import('@/content/store')
    const words = await getJson<Record<string, string>>(texts.items['chant-text/all'].hash)
    // The Introit of the first Sunday of Advent goes on: "… non erubescam".
    expect(ids(searchChants('non erubescam', chantEntries(), words))).toContain(
      'chant/in-ad-te-levavi-132',
    )
  })
})
