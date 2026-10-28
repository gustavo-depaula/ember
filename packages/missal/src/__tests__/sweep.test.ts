import { describe, expect, it } from 'vitest'
import { resolveOfDay } from '../calendar/resolve'
import { addDays } from '../calendar/temporal'
import { assembleMass } from '../mass'
import { blocksIn, plain } from '../text'
import type { Lang, Part } from '../types'
import { calendar, corpus } from './corpus'

// Three liturgical cycles, every day, every celebration and Mass offered.
const from = new Date(2025, 0, 1, 12)
const to = new Date(2027, 11, 31, 12)
const driverLangs: Lang[] = ['la', 'en-US', 'pt-BR']

// Rites that are not a Mass with the usual parts.
const special = new Set(['tempore.holy-week.good-friday', 'tempore.holy-week.easter-vigil'])

describe('every day of 2025-2027 assembles a whole Mass', () => {
  for (const regions of [undefined, ['brazil']]) {
    it(`in ${regions ?? 'the General Calendar'}`, async () => {
      const holes = new Map<string, string>()
      const note = (key: string, where: string) => {
        if (!holes.has(key)) holes.set(key, where)
      }
      for (let date = from; date <= to; date = addDays(date, 1)) {
        const day = resolveOfDay(date, calendar, { regions })
        expect(day.celebrations.length).toBeGreaterThan(0)
        for (const celebration of day.celebrations) {
          for (const mass of celebration.masses) {
            const plan = await assembleMass(day, celebration, mass, corpus)
            const where = `${date.toISOString().slice(0, 10)} ${mass.formulary ?? mass.lectionary}`
            if (special.has(mass.formulary ?? '')) continue
            const required: Part[] = [
              'collect',
              'prayerOverOfferings',
              'postcommunion',
              'gospel',
              'firstReading',
              'psalm',
            ]
            for (const part of required) {
              const option = plan.parts[part]?.[0]
              if (!option) {
                note(`${mass.formulary ?? mass.lectionary} has no ${part}`, where)
                continue
              }
              // A regional proper exists in one language; elsewhere all three.
              if (
                option.from.split('.').length > 2 &&
                option.source === 'proper' &&
                celebration.kind === 'sanctoral' &&
                !calendar.formularies[option.from]?.title.la
              )
                continue
              for (const lang of driverLangs) {
                const text = option.items.map((item) => plain(blocksIn(item, lang))).join('')
                if (text.length < 10) note(`${option.from} ${part} empty in ${lang}`, where)
              }
            }
            const preface = plan.prefaces.length > 0 || (plan.parts.preface?.length ?? 0) > 0
            if (!preface) note(`${mass.formulary ?? mass.lectionary} has no preface`, where)
          }
        }
      }
      // What is left are passages the corpus lacks in a language; the
      // snapshot is that list, so a new hole or a filled one shows up here.
      expect([...holes].map(([hole, where]) => `${hole} (${where})`)).toMatchSnapshot()
    })
  }
})
