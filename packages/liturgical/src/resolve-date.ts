import { addDays, startOfDay } from 'date-fns'

import type { LiturgicalAnchor } from './calendar-types'
import {
  ascensionOffset,
  baptismOfTheLord,
  corpusChristiOffset,
  epiphany,
  holyFamily,
  type Transfers,
  universalTransfers,
} from './of-temporal'
import {
  computeEaster,
  getAshWednesday,
  getFirstSundayOfAdvent,
  getSeptuagesimaSunday,
} from './season'

// The year's anchor dates. Epiphany, the Baptism of the Lord, the Ascension
// and Corpus Christi fall where `transfers` keeps them; without it, where the
// General Calendar does.
export function computeAnchors(
  year: number,
  transfers: Transfers = universalTransfers,
): Record<LiturgicalAnchor, Date> {
  const easter = computeEaster(year)
  const ashWednesday = getAshWednesday(year)
  const advent1 = getFirstSundayOfAdvent(year)

  return {
    easter,
    pentecost: addDays(easter, 49),
    ascension: addDays(easter, ascensionOffset(transfers)),
    trinity_sunday: addDays(easter, 56),
    corpus_christi: addDays(easter, corpusChristiOffset(transfers)),
    sacred_heart: addDays(easter, 68),

    advent_1: advent1,
    advent_2: addDays(advent1, 7),
    advent_3: addDays(advent1, 14),
    advent_4: addDays(advent1, 21),

    lent_1: addDays(ashWednesday, 4),
    lent_2: addDays(ashWednesday, 11),
    lent_3: addDays(ashWednesday, 18),
    lent_4: addDays(ashWednesday, 25),
    lent_5: addDays(ashWednesday, 32),

    palm_sunday: addDays(easter, -7),
    holy_thursday: addDays(easter, -3),
    good_friday: addDays(easter, -2),
    holy_saturday: addDays(easter, -1),

    ash_wednesday: ashWednesday,
    septuagesima: getSeptuagesimaSunday(year),
    sexagesima: addDays(easter, -56),
    quinquagesima: addDays(easter, -49),

    christ_the_king: addDays(advent1, -7),
    christmas: new Date(year, 11, 25),
    holy_family: startOfDay(holyFamily(year)),
    epiphany: startOfDay(epiphany(year, transfers)),
    baptism_of_the_lord: startOfDay(baptismOfTheLord(year, transfers)),
  }
}
