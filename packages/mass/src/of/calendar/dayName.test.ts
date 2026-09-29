import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getLiturgicalDayName } from '@ember/liturgical'
import type { OfCalendarStatics, SanctoralEntry, TemporalEntry } from '@ember/missal-schema'
import { addDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { resolveOfDay } from './resolve'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
const load = <T>(p: string): T =>
  JSON.parse(readFileSync(`${root}content/of/calendar/${p}`, 'utf-8'))
const statics: OfCalendarStatics = {
  temporal: load<TemporalEntry[]>('temporal.json'),
  sanctoral: load<SanctoralEntry[]>('sanctoral.json'),
}

// Names the week by its bare number, so the check reads the arithmetic, not the wording.
const t = (key: string, opts?: Record<string, unknown>) =>
  key.startsWith('ordinal') ? key.split('.')[1] : `${key}:${opts?.ordinal ?? ''}`

describe('getLiturgicalDayName', () => {
  it('numbers every Ordinary Time day as the Mass it resolves to', () => {
    const mismatches: string[] = []
    for (let d = new Date(2025, 0, 1); d < new Date(2031, 0, 1); d = addDays(d, 1)) {
      const ref = resolveOfDay(d, statics).temporalRef
      const week = ref?.match(/^tempore\.ordinary-time\.week-(\d+)\./)?.[1]
      if (!week) continue
      const name = getLiturgicalDayName(d, 'of', { t })
      if (!name.endsWith(`:${week}`)) mismatches.push(`${d.toDateString()}: ${name} ≠ week ${week}`)
    }
    expect(mismatches).toEqual([])
  })
})
