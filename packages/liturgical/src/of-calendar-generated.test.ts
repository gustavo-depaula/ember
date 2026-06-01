import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildYearCalendar, getCelebrationsForDate } from './calendar-builder'
import type { LiturgicalEntry } from './calendar-types'

// The OF calendar generated from the canonical ember-extra data
// (scripts/build-of-calendar.mjs), replacing the hand-authored entries.json.
const entries: LiturgicalEntry[] = JSON.parse(
  readFileSync(new URL('../../../content/liturgical/of-calendar.json', import.meta.url), 'utf-8'),
)

const calendar2026 = buildYearCalendar({ year: 2026, form: 'of', entries })

describe('OF calendar generated from ember-extra', () => {
  it('Holy Trinity (solemnity) outranks the Visitation (feast) on 2026-05-31', () => {
    const day = getCelebrationsForDate(calendar2026, new Date(2026, 4, 31))
    expect(day?.principal?.entry.id).toBe('tempore.solemnity.most-holy-trinity')
    // The Visitation still resolves on the day, but as a non-principal celebration.
    expect(day?.celebrations.some((c) => c.entry.id === 'sanctorale.05-31')).toBe(true)
  })

  it('Mary, Mother of the Church appears on the Monday after Pentecost (2026-05-25)', () => {
    const day = getCelebrationsForDate(calendar2026, new Date(2026, 4, 25))
    expect(day?.celebrations.some((c) => c.entry.id === 'sanctorale.movable.05-35')).toBe(true)
    expect(day?.principal?.entry.id).toBe('sanctorale.movable.05-35')
  })
})
