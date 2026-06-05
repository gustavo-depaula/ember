import { getLiturgicalYear, getSundayCycle, getWeekdayCycle } from '@ember/liturgical'
import type { Celebration, CycleId } from './types'

/**
 * Pick the lectionary cycle for the day's principal celebration.
 *
 * Each formulary keys its `readings` under exactly one scheme: A/B/C for
 * Sunday-cycle lectionaries (Sundays + solemnities/feasts of the Lord, which
 * keep the Sunday cycle even when they fall on a weekday — Corpus Christi
 * Thursday, Sacred Heart Friday, Ascension Thursday), I/II for Ordinary Time
 * weekdays, or `default` for fixed feasts whose readings don't vary by year.
 * Inspecting the formulary's actual keys lets a Thursday solemnity surface its
 * Sunday-cycle readings instead of falling through to the weekday cycle slot
 * (which doesn't exist on that formulary, leaving every reading blank).
 *
 * Date → celebration → tempore-id resolution lives in `@ember/liturgical`
 * (`ofTemporeIds` / `resolveOfDay`); this package only fetches the propers for
 * the celebration the resolver selects.
 */
export function pickCycle(date: Date, principal?: Celebration): CycleId {
  const litYear = getLiturgicalYear(date)
  const readings = principal?.primary.readings as Record<string, unknown> | undefined
  const keys = readings ? Object.keys(readings) : []
  if (keys.includes('default')) return 'default'
  if (keys.some((k) => k === 'A' || k === 'B' || k === 'C')) return getSundayCycle(litYear)
  if (keys.some((k) => k === 'I' || k === 'II')) return getWeekdayCycle(litYear)
  return date.getDay() === 0 ? getSundayCycle(litYear) : getWeekdayCycle(litYear)
}
