import { computeAnchors, type Transfers } from '@ember/liturgical'
import { addDays, toIso } from './dates'
import type { IsoDate, Season } from './types'

export type SeasonWindow = { season: Season; start: IsoDate; end: IsoDate }

/**
 * The seasons that begin in civil year `year`, on the calendar's anchors. Lent
 * runs to Holy Wednesday — Palm Sunday is its last Sunday — and the Triduum is
 * its own card.
 */
export function seasonsStartingIn(year: number, transfers?: Transfers): SeasonWindow[] {
  const a = anchors(year, transfers)
  return [
    {
      season: 'ordinary1',
      start: addDays(a.baptism_of_the_lord, 1),
      end: addDays(a.ash_wednesday, -1),
    },
    { season: 'lent', start: a.ash_wednesday, end: addDays(a.holy_thursday, -1) },
    { season: 'easter', start: a.easter, end: a.pentecost },
    { season: 'ordinary2', start: addDays(a.pentecost, 1), end: addDays(a.advent_1, -1) },
    { season: 'advent', start: a.advent_1, end: addDays(a.christmas, -1) },
    {
      season: 'christmas',
      start: a.christmas,
      end: anchors(year + 1, transfers).baptism_of_the_lord,
    },
  ]
}

/** The Triduum, Gaudete and Laetare in `year`: the days each needs Mass on. */
export function feastDays(year: number) {
  const a = anchors(year)
  return {
    triduum: [a.holy_thursday, a.good_friday, a.holy_saturday],
    gaudete: [a.advent_3],
    laetare: [a.lent_4],
  }
}

function anchors(year: number, transfers?: Transfers) {
  const dates = computeAnchors(year, transfers)
  return Object.fromEntries(Object.entries(dates).map(([k, d]) => [k, toIso(d)])) as Record<
    keyof typeof dates,
    IsoDate
  >
}
