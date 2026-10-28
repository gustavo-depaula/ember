import { describe, expect, it } from 'vitest'
import { ids, lothDay } from '../day'
import { officeOf } from '../office'
import { calendar, on } from './corpus'

const day = (iso: string) => lothDay(on(iso), calendar)
const kept = (iso: string) => day(iso).celebration?.id

describe('the Brazilian calendar', () => {
  it('keeps Saints Peter and Paul, the Assumption and All Saints on a Sunday', () => {
    // 29 June 2026 is a Monday: the Sunday before. Otherwise the Sunday after.
    expect(kept('2026-06-28')).toBe(ids.peterAndPaul)
    expect(kept('2026-06-29')).toBeUndefined()
    expect(kept('2027-07-04')).toBe(ids.peterAndPaul)
    expect(kept('2026-08-16')).toBe(ids.assumption)
    expect(kept('2026-08-15')).toBe(ids.saturdayOfMary)
    expect(kept('2027-11-07')).toBe(ids.allSaints)
    // On a Saturday All Saints stays, so that All Souls keeps the Sunday.
    expect(kept('2025-11-01')).toBe(ids.allSaints)
    expect(kept('2025-11-02')).toBe(ids.allSouls)
  })

  it('moves Saint Joseph and the Annunciation off a Sunday and out of Holy Week', () => {
    // 19 March 2028 is a Sunday of Lent: the Monday after.
    expect(kept('2028-03-18')).not.toBe(ids.joseph)
    expect(kept('2028-03-19')).toBeUndefined()
    expect(kept('2028-03-20')).toBe(ids.joseph)
    // 19 March 2035 is the Monday of Holy Week: the Saturday before Palm Sunday.
    expect(kept('2035-03-17')).toBe(ids.joseph)
    expect(kept('2035-03-19')).toBeUndefined()
    // 25 March 2027 is Holy Thursday: the Monday after the Easter octave.
    expect(kept('2027-03-25')).toBe(ids.lordsSupper)
    expect(kept('2027-04-05')).toBe(ids.annunciation)
  })

  it('sends the Baptist back a day when the Sacred Heart takes 24 June', () => {
    expect(kept('2022-06-24')).toBe(ids.sacredHeart)
    expect(kept('2022-06-23')).toBe(ids.johnTheBaptist)
  })

  it('keeps the Immaculate Conception on a Sunday of Advent', () => {
    expect(kept('2024-12-08')).toBe(ids.immaculateConception)
  })

  it('keeps no saint on a Sunday, in Holy Week or in the Easter octave', () => {
    // Saint Francis of Assisi, 4 October 2026, a Sunday.
    expect(kept('2026-10-04')).toBeUndefined()
    // Saint Isidore, 4 April 2023, Tuesday of Holy Week.
    expect(kept('2023-04-04')).toBeUndefined()
    // Saint Mark, 25 April 2025, Friday of the Easter octave.
    expect(kept('2025-04-25')).toBeUndefined()
  })

  it('lets a feast of the Lord take a Sunday of Ordinary Time, and no other feast', () => {
    expect(kept('2025-09-14')).toBe(ids.exaltation)
    expect(kept('2025-11-09')).toBe(ids.lateran)
    // Saint Matthew, 21 September 2025, a Sunday.
    expect(kept('2025-09-21')).toBeUndefined()
  })

  it('makes every memorial optional in Lent', () => {
    // Saints Perpetua and Felicity, obligatory outside Lent.
    expect(day('2026-03-07').celebration).toMatchObject({ rank: 'memorial', obligatory: false })
    expect(day('2026-10-07').celebration).toMatchObject({ rank: 'memorial', obligatory: true })
  })

  it('keeps Saint Mary on a free Saturday of Ordinary Time', () => {
    expect(kept('2026-10-10')).toBe(ids.saturdayOfMary)
    // Not in Advent.
    expect(kept('2026-12-05')).toBeUndefined()
  })

  it('runs the psalter on from Advent through Christmas time', () => {
    // Christmas 2026 is a Friday: the fourth week ends that Saturday.
    expect(day('2026-12-25').psalterWeek).toBe(4)
    expect(day('2026-12-27').psalterWeek).toBe(1)
    expect(day('2027-01-03').psalterWeek).toBe(2)
    expect(day('2027-01-10').psalterWeek).toBe(0)
    expect(day('2027-01-11').psalterWeek).toBe(1)
  })

  it('counts the psalter by the week of the season', () => {
    expect(day('2026-10-06').psalterWeek).toBe(3)
    expect(day('2026-02-19').psalterWeek).toBe(4)
    expect(day('2026-03-31').psalterWeek).toBe(2)
    expect(day('2026-04-07').psalterWeek).toBe(0)
  })
})

describe('whose office an evening is', () => {
  const office = (iso: string, hour: 'vespers' | 'compline') => officeOf(on(iso), hour, calendar)

  it('gives Saturday evening to the Sunday, from the psalter', () => {
    const vespers = office('2026-10-10', 'vespers')
    expect(vespers).toMatchObject({ sundayEve: true, firstVespers: false })
    expect(vespers.celebration).toBeUndefined()
    // Night Prayer that Saturday is still the Saturday's.
    expect(office('2026-10-10', 'compline').sundayEve).toBe(false)
  })

  it('gives the eve of a solemnity its first Vespers and the Night Prayer after them', () => {
    for (const hour of ['vespers', 'compline'] as const) {
      expect(office('2026-10-11', hour)).toMatchObject({
        firstVespers: true,
        celebration: { id: ids.aparecida },
      })
    }
  })

  it('leaves a Sunday its second Vespers on the eve of an ordinary solemnity', () => {
    // 8 December 2025 is a Monday.
    expect(office('2025-12-07', 'vespers').firstVespers).toBe(false)
  })

  it('gives no first Vespers to Ash Wednesday, the Triduum or All Souls', () => {
    expect(office('2026-02-17', 'vespers').firstVespers).toBe(false)
    expect(office('2026-04-01', 'vespers').firstVespers).toBe(false)
    expect(office('2026-11-01', 'vespers').firstVespers).toBe(false)
  })

  it('opens Advent on the Saturday evening before', () => {
    const vespers = office('2026-11-28', 'vespers')
    expect(vespers).toMatchObject({ firstVespers: true })
    expect(vespers.day.season).toBe('advent')
    expect(office('2026-11-28', 'compline').adventEve).toBe(true)
  })

  it('goes by date from 17 December through Christmas time', () => {
    expect(office('2026-12-19', 'vespers').dateKey).toBe('12-20')
    expect(office('2026-12-05', 'vespers').dateKey).toBeUndefined()
    // The evening and the night before a Sunday that is the 17th are that Sunday's.
    expect(office('2028-12-16', 'vespers').dateKey).toBe('12-17')
    expect(office('2028-12-16', 'compline').dateKey).toBe('12-17')
    expect(office('2026-10-06', 'vespers').dateKey).toBeUndefined()
  })
})
