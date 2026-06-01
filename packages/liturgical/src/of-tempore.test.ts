import { describe, expect, it } from 'vitest'
import { ofTemporeIds } from './of-tempore'

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day)

describe('ofTemporeIds', () => {
  it('movable solemnities (2026)', () => {
    expect(ofTemporeIds(d(2026, 5, 31))).toEqual(['tempore.solemnity.most-holy-trinity'])
    expect(ofTemporeIds(d(2026, 6, 4))).toEqual(['tempore.solemnity.corpus-christi']) // Thu, Easter+60
    expect(ofTemporeIds(d(2026, 6, 12))).toEqual(['tempore.solemnity.sacred-heart-of-jesus']) // Easter+68
    expect(ofTemporeIds(d(2026, 11, 22))).toEqual(['tempore.solemnity.christ-the-king'])
  })

  it('Christmas Day yields the four Masses', () => {
    expect(ofTemporeIds(d(2026, 12, 25))).toEqual([
      'tempore.christmas.nativity-vigil',
      'tempore.christmas.nativity-night',
      'tempore.christmas.nativity-dawn',
      'tempore.christmas.nativity-day',
    ])
  })

  it('Holy Thursday yields chrism + Lord’s Supper (2026)', () => {
    // Easter 2026 = Apr 5; Holy Thursday = Apr 2.
    expect(ofTemporeIds(d(2026, 4, 2))).toEqual([
      'tempore.holy-week.chrism-mass',
      'tempore.holy-week.lords-supper',
    ])
  })

  it('Dec 26-28 yield no temporal id (sanctoral takes over)', () => {
    expect(ofTemporeIds(d(2026, 12, 26))).toEqual([])
    expect(ofTemporeIds(d(2026, 12, 28))).toEqual([])
  })

  it('an ordinary weekday maps to season/week/weekday', () => {
    // 2026-06-09 Tuesday, Ordinary Time week 10.
    const ids = ofTemporeIds(d(2026, 6, 9))
    expect(ids).toHaveLength(1)
    expect(ids[0]).toMatch(/^tempore\.ordinary-time\.week-\d+\.tuesday$/)
  })

  it('an Advent Sunday maps under advent', () => {
    // 2026-11-29 is the 1st Sunday of Advent.
    expect(ofTemporeIds(d(2026, 11, 29))).toEqual(['tempore.advent.week-1.sunday'])
  })
})
