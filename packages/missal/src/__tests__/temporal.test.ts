import { describe, expect, it } from 'vitest'
import {
  sundayCycle,
  type Transfers,
  temporalDay,
  universalTransfers,
  weekdayCycle,
} from '../calendar/temporal'
import upstream from './upstream-calendar.json'

// What the upstream app's own calendar selects for every date of 2020-2040
// (`scripts/missal/golden.mjs`). Upstream never decides whether Epiphany, the
// Ascension and Corpus Christi are moved to a Sunday: it lists both, so on
// those days the new calendar's choice must be one of upstream's.
type Golden = {
  cycle: string
  weekdayCycle: string
  mass: Record<string, string>
  readings: Record<string, string>
}
const days = Object.entries(upstream as unknown as Record<string, Golden>)

const allSunday: Transfers = { epiphany: 'sunday', ascension: 'sunday', corpusChristi: 'sunday' }

function dateOf(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

describe('temporal cycle against the upstream calendar', () => {
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
    it(`selects a formulary and readings upstream offers (${label})`, () => {
      const wrong: string[] = []
      for (const [iso, golden] of days) {
        const mass = temporalDay(dateOf(iso), transfers).masses[0]
        // 26-28 December: upstream has no temporal Mass either.
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

  it("agrees with upstream's default wherever upstream decides", () => {
    const wrong: string[] = []
    for (const [iso, golden] of days) {
      const day = temporalDay(dateOf(iso))
      const mass = day.masses[0]
      // Upstream defaults these two Thursdays to the weekday and offers the
      // solemnity as the alternative; the universal calendar keeps them.
      if (!mass || day.key === 'ascension' || day.key === 'corpus-christi') continue
      if (mass.lectionary !== golden.readings.dia) {
        wrong.push(`${iso} ${mass.lectionary} != ${golden.readings.dia}`)
      }
    }
    expect(wrong).toEqual([])
  })
})
