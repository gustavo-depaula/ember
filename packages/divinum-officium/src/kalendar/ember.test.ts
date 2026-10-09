// emberDays against the engine: the dates it names are exactly the days the
// resolved calendar keeps as Ember days. Uses the content/do submodule data.

import { describe, expect, it } from 'vitest'
import { createFsLoader } from '../node/fsLoader'
import { contentDo, hasFixtures } from '../node/testFixtures'
import { createDirectorium } from './directorium'
import { emberDays } from './ember'
import { emberday } from './occurrence'
import { resolveDay } from './precedence'

const rubrics1960 = 'Rubrics 1960 - 1960'
const divinoAfflatu = 'Divino Afflatu - 1954'

const days = (year: number, version: string) => emberDays(year, version).flatMap((w) => w.days)

describe('emberDays', () => {
  it('1960 keeps September after the third Sunday in the month, a week later than before', () => {
    expect(emberDays(2026, rubrics1960)).toEqual([
      { season: 'lent', days: ['2026-02-25', '2026-02-27', '2026-02-28'] },
      { season: 'pentecost', days: ['2026-05-27', '2026-05-29', '2026-05-30'] },
      { season: 'september', days: ['2026-09-23', '2026-09-25', '2026-09-26'] },
      { season: 'advent', days: ['2026-12-16', '2026-12-18', '2026-12-19'] },
    ])
    expect(emberDays(2026, divinoAfflatu)[2].days).toEqual([
      '2026-09-16',
      '2026-09-18',
      '2026-09-19',
    ])
  })

  it('keeps the three days in one week when 14 September or 13 December falls midweek', () => {
    expect(days(2028, rubrics1960).slice(6)).toEqual([
      '2028-09-20',
      '2028-09-22',
      '2028-09-23',
      '2028-12-20',
      '2028-12-22',
      '2028-12-23',
    ])
  })
})

describe.skipIf(!hasFixtures)('emberDays against the resolved calendar', () => {
  const loader = createFsLoader(contentDo)

  it.each([rubrics1960, divinoAfflatu])('%s, 2020–2040', async (version) => {
    const directorium = await createDirectorium(loader)
    for (let year = 2020; year <= 2040; year++) {
      const resolved: string[] = []
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate()
        for (let day = 1; day <= daysInMonth; day++) {
          const dow = new Date(year, month - 1, day).getDay()
          if (dow !== 3 && dow !== 5 && dow !== 6) continue
          const r = await resolveDay({
            loader,
            directorium,
            day,
            month,
            year,
            version,
            hora: '',
            missa: true,
            sections: true,
          })
          if (emberday(r.state)) {
            resolved.push(
              `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            )
          }
        }
      }
      expect(resolved).toEqual(days(year, version))
    }
  }, 120_000)
})
