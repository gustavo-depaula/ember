import { describe, expect, it } from 'vitest'
import {
  sundayCycle,
  type Transfers,
  temporalDay,
  universalTransfers,
  weekdayCycle,
} from '../calendar/temporal'
import reference from './reference-calendar.json'

// The calendar the corpus was first checked against: what its source selected
// for every date of 2020-2040. The source never decided whether Epiphany, the
// Ascension and Corpus Christi are moved to a Sunday: it listed both, so on
// those days the resolver's choice must be one of the listed.
type Golden = {
  cycle: string
  weekdayCycle: string
  mass: Record<string, string>
  readings: Record<string, string>
}
const days = Object.entries(reference as unknown as Record<string, Golden>)

const allSunday: Transfers = { epiphany: 'sunday', ascension: 'sunday', corpusChristi: 'sunday' }

function dateOf(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

describe('temporal cycle against the reference calendar', () => {
  it('names the same lectionary cycles', () => {
    for (const [iso, golden] of days) {
      const date = dateOf(iso)
      expect([iso, sundayCycle(date), weekdayCycle(date)]).toEqual([
        iso,
        golden.cycle,
        golden.weekdayCycle,
      ])
    }
  })

  for (const [label, transfers] of [
    ['universal', universalTransfers],
    ['moved to Sunday', allSunday],
  ] as const) {
    it(`selects a formulary and readings the reference offers (${label})`, () => {
      const wrong: string[] = []
      for (const [iso, golden] of days) {
        const mass = temporalDay(dateOf(iso), transfers).masses[0]
        // 26-28 December: the reference has no temporal Mass either.
        if (!mass) continue
        const formularies = Object.values(golden.mass)
        const readings = Object.values(golden.readings)
        if (mass.formulary && !formularies.includes(mass.formulary)) {
          wrong.push(`${iso} formulary ${mass.formulary} not in ${formularies}`)
        }
        if (!readings.includes(mass.lectionary)) {
          wrong.push(`${iso} readings ${mass.lectionary} not in ${readings}`)
        }
      }
      expect(wrong).toEqual([])
    })
  }

  it("agrees with the reference's default wherever it decides", () => {
    const wrong: string[] = []
    for (const [iso, golden] of days) {
      const day = temporalDay(dateOf(iso))
      const mass = day.masses[0]
      // The reference defaults these two Thursdays to the weekday and offers the
      // solemnity as the alternative; the universal calendar keeps them.
      if (!mass || day.key === 'ascension' || day.key === 'corpus-christi') continue
      if (mass.lectionary !== golden.readings.dia) {
        wrong.push(`${iso} ${mass.lectionary} != ${golden.readings.dia}`)
      }
    }
    expect(wrong).toEqual([])
  })
})
