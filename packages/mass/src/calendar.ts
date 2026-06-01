import { getLiturgicalYear, getSundayCycle, getWeekdayCycle } from '@ember/liturgical'
import type { CycleId } from './types'

/**
 * Pick the lectionary cycle for a date. Sunday → A/B/C; weekday → I/II;
 * fixed feasts use 'default' (we don't track those at this layer).
 *
 * Date → celebration → tempore-id resolution lives in `@ember/liturgical`
 * (`ofTemporeIds` / `resolveOfDay`); this package only fetches the propers for
 * the celebration the resolver selects.
 */
export function pickCycle(date: Date): CycleId {
  const litYear = getLiturgicalYear(date)
  const isSunday = date.getDay() === 0
  return isSunday ? getSundayCycle(litYear) : getWeekdayCycle(litYear)
}
