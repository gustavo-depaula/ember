import { describe, expect, it } from 'vitest'

import { ordinaryOfDay, type RankedDay } from '../ordinary'

// Days as `resolveDay` gives them for the 1962 calendar; the Mass each is sung
// to is the one whose heading in the Kyriale names that kind of day.
const days: Array<[string, RankedDay, string]> = [
  [
    'the first Sunday of Advent',
    { winner: 'Tempora/Adv1-0.txt', rank: 6.9, week: 'Adv1', weekday: 0, commune: '' },
    'mass-xvii',
  ],
  [
    'a Sunday after Pentecost',
    { winner: 'Tempora/Pent21-0.txt', rank: 5, week: 'Pent21', weekday: 0, commune: '' },
    'mass-xi',
  ],
  [
    'a Sunday after Easter',
    { winner: 'Tempora/Pasc2-0.txt', rank: 5, week: 'Pasc2', weekday: 0, commune: '' },
    'mass-i',
  ],
  [
    'the Immaculate Conception',
    {
      winner: 'Sancti/12-08.txt',
      rank: 6.01,
      week: 'Adv2',
      weekday: 2,
      commune: 'Commune/C11.txt',
    },
    'mass-ix',
  ],
  [
    'Our Lady on Saturday',
    {
      winner: 'Commune/C10b.txt',
      rank: 1.3,
      week: 'Nat2',
      weekday: 6,
      commune: 'Commune/C10b.txt',
    },
    'mass-x',
  ],
  [
    'Saints Peter and Paul',
    { winner: 'Sancti/06-29.txt', rank: 6, week: 'Pent06', weekday: 2, commune: 'Commune/C1.txt' },
    'mass-ii',
  ],
  [
    'Saint Stephen',
    {
      winner: 'Sancti/12-26.txt',
      rank: 5.4,
      week: 'Nat26',
      weekday: 6,
      commune: 'Commune/C2a.txt',
    },
    'mass-iv',
  ],
  [
    'a feast of the III class',
    { winner: 'Sancti/10-14.txt', rank: 3, week: 'Pent20', weekday: 3, commune: 'Commune/C2b.txt' },
    'mass-xii',
  ],
  [
    'a feria of Lent',
    { winner: 'Tempora/Quad3-3.txt', rank: 3.9, week: 'Quad3', weekday: 3, commune: '' },
    'mass-xviii',
  ],
  [
    'a feria after Pentecost',
    { winner: 'Tempora/Pent20-4.txt', rank: 1, week: 'Pent20', weekday: 4, commune: '' },
    'mass-xvi',
  ],
  [
    'Septuagesima Sunday, which is not yet Lent',
    { winner: 'Tempora/Quadp1-0.txt', rank: 5, week: 'Quadp1', weekday: 0, commune: '' },
    'mass-xi',
  ],
]

describe('ordinaryOfDay', () => {
  it.each(days)('sings %s to its Mass of the Kyriale', (_, day, mass) => {
    expect(ordinaryOfDay(day)).toBe(mass)
  })
})
