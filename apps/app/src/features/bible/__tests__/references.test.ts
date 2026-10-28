import { describe, expect, it } from 'vitest'

import { type MassReading, readingsForVerse, summaLabel, versesLabel } from '../references'

describe('readingsForVerse', () => {
  const readings: MassReading[] = [
    { from: 1, to: 6, day: 'sanctorale.01-21', part: 'psalm' },
    { from: 1, to: 38, day: 'tempore.lent.week-4.sunday', part: 'gospel', cycle: 'A' },
    { from: 1, to: 41, day: 'tempore.lent.week-4.sunday', part: 'gospel', cycle: 'A' },
    { from: 1, to: 12, day: 'sanctorale.11-01', part: 'gospel' },
    { from: 1, to: 12, day: 'tempore.ordinary-time.week-10.monday', part: 'gospel' },
    { from: 20, to: 30, day: 'tempore.ordinary-time.week-10.tuesday', part: 'gospel' },
  ]

  it('lists a day once when it offers a longer and a shorter form', () => {
    const sundays = readingsForVerse(readings, 3).filter((r) => r.day.endsWith('.sunday'))
    expect(sundays).toHaveLength(1)
  })

  it('puts Sundays first, then weekdays, then saints, a psalm last', () => {
    expect(readingsForVerse(readings, 3).map((r) => r.day)).toEqual([
      'tempore.lent.week-4.sunday',
      'tempore.ordinary-time.week-10.monday',
      'sanctorale.11-01',
      'sanctorale.01-21',
    ])
  })

  it('leaves out a reading that stops short of the verse', () => {
    expect(readingsForVerse(readings, 40).map((r) => r.day)).toEqual(['tempore.lent.week-4.sunday'])
    expect(readingsForVerse(readings, 50)).toEqual([])
  })
})

describe('summaLabel', () => {
  it('names the part, question and article as the Summa is cited', () => {
    expect(summaLabel('ss-q017-a06')).toBe('II-II, q. 17, a. 6')
    expect(summaLabel('fp-q001-pr')).toBe('I, q. 1')
    expect(summaLabel('tp-q083-a04')).toBe('III, q. 83, a. 4')
  })
})

describe('versesLabel', () => {
  it('writes a run of verses the way it is cited', () => {
    expect(versesLabel(['john', 3, 16, 16])).toBe('3:16')
    expect(versesLabel(['john', 3, 16, 18])).toBe('3:16–18')
    expect(versesLabel(['wisdom', 11, 23, 999])).toBe('11:23 ff.')
    expect(versesLabel(['matthew', 5, 1, 999])).toBe('5')
  })
})
