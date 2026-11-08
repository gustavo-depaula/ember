import { describe, expect, it } from 'vitest'
import { assembleMass } from '../mass/assemble'
import { createFsLoader } from '../node/fsLoader'
import { contentDo, hasFixtures } from '../node/testFixtures'
import { efVersion } from '../versions'
import { dayHeading, massesOf } from './heading'

describe('massesOf', () => {
  it("reads a day's several Masses from its Rule", () => {
    expect(
      massesOf('Gloria\nCredo\ncelebranda aut missa prima aut missa secunda aut missa tertia'),
    ).toEqual(['missa prima', 'missa secunda', 'missa tertia'])
    expect(massesOf('ex C9\nmultiple3\nSequentia')).toEqual(['1', '2', '3'])
    expect(massesOf('Gloria\nCredo')).toBeUndefined()
  })
})

describe.skipIf(!hasFixtures)('dayHeading', () => {
  const loader = createFsLoader(contentDo)
  const heading = async (month: number, day: number, missanumber?: number) =>
    dayHeading(
      (
        await assembleMass({
          loader,
          day,
          month,
          year: 2026,
          version: efVersion,
          lang2: 'Portugues',
          fallbackLang: 'Latin',
          missanumber,
        })
      ).day,
      { lang2: 'Portugues' },
    )

  it('names a Sunday after Pentecost that takes a resumed Sunday after Epiphany, in its 1960 class', async () => {
    expect(await heading(11, 8)).toEqual({
      name: { la: 'Dominica V quæ superfuit Post Epiphaniam' },
      rank: 'II. classis',
      commemorations: [],
    })
  })

  it('names a saint in both languages, with the day it commemorates', async () => {
    const h = await heading(11, 10)
    expect(h.name).toEqual({
      la: 'S. Andreæ Avellini Confessoris',
      vernacular: 'S. André Avelino, Confessor',
    })
    expect(h.rank).toBe('III. classis')
    expect(h.commemorations.map((c) => c.vernacular)).toEqual([
      'S. S. Mártires Trifão, Respício e Ninfa',
    ])
  })

  it('names Christmas by the day, not by the Mass read, and offers its three Masses', async () => {
    const h = await heading(12, 25, 2)
    expect(h.name.la).toBe('In Nativitate Domini')
    expect(h.masses).toEqual(['missa prima', 'missa secunda', 'missa tertia'])
  })
})
