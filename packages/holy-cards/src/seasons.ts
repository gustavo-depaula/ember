import {
  computeEaster,
  getAshWednesday,
  getBaptismOfTheLord,
  getFirstSundayOfAdvent,
} from '@ember/liturgical'
import { addDays, toIso } from './dates'
import type { IsoDate, Season } from './types'

export type SeasonWindow = { season: Season; key: string; start: IsoDate; end: IsoDate }

/**
 * The seasons that begin in civil year `year`, on the same boundaries as
 * `getOfLiturgicalPosition` (and so `resolveOfDay`). Lent runs to Holy
 * Wednesday — Palm Sunday is its last Sunday — and the Triduum is its own card.
 */
export function seasonsStartingIn(year: number): SeasonWindow[] {
  const easter = toIso(computeEaster(year))
  const ashWednesday = toIso(getAshWednesday(year))
  const pentecost = addDays(easter, 49)
  const advent = toIso(getFirstSundayOfAdvent(year))
  const window = (season: Season, start: IsoDate, end: IsoDate): SeasonWindow => ({
    season,
    key: `${season}-${year}`,
    start,
    end,
  })
  return [
    window('ordinary1', addDays(toIso(getBaptismOfTheLord(year)), 1), addDays(ashWednesday, -1)),
    window('lent', ashWednesday, addDays(easter, -4)),
    window('easter', easter, pentecost),
    window('ordinary2', addDays(pentecost, 1), addDays(advent, -1)),
    window('advent', advent, `${year}-12-24`),
    window('christmas', `${year}-12-25`, toIso(getBaptismOfTheLord(year + 1))),
  ]
}

/** The three days of the Triduum in `year`: Holy Thursday, Good Friday, the Easter Vigil. */
export function triduum(year: number): IsoDate[] {
  const easter = toIso(computeEaster(year))
  return [addDays(easter, -3), addDays(easter, -2), addDays(easter, -1)]
}

/** The Third Sunday of Advent in civil year `year`. */
export function gaudete(year: number): IsoDate {
  return addDays(toIso(getFirstSundayOfAdvent(year)), 14)
}

/** The Fourth Sunday of Lent in `year`. */
export function laetare(year: number): IsoDate {
  return addDays(toIso(getAshWednesday(year)), 25)
}
