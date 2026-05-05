import {
  computeEaster,
  getFirstSundayOfAdvent,
  getLiturgicalYear,
  getOfLiturgicalPosition,
  getSundayCycle,
  getWeekdayCycle,
  type OfSeason,
} from '@ember/liturgical'
import { addDays, format, getDate, getMonth, isSameDay, subDays } from 'date-fns'
import type { CycleId, EnumeratedCelebration } from './types'

const WEEKDAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

/**
 * Pick the lectionary cycle for a date. Sunday → A/B/C; weekday → I/II;
 * fixed feasts use 'default' (we don't track those at this layer).
 */
export function pickCycle(date: Date): CycleId {
  const litYear = getLiturgicalYear(date)
  const isSunday = date.getDay() === 0
  return isSunday ? getSundayCycle(litYear) : getWeekdayCycle(litYear)
}

// ember-extra uses 'ordinary-time' / 'holy-week' / 'christmas' / 'easter' /
// 'advent' / 'lent'. @ember/liturgical's OfSeason uses 'ordinary' instead of
// 'ordinary-time'. Map between them.
const SEASON_MAP: Record<OfSeason, string> = {
  advent: 'advent',
  christmas: 'christmas',
  lent: 'lent',
  'holy-week': 'holy-week',
  easter: 'easter',
  ordinary: 'ordinary-time',
}

/**
 * Map a date to its tempore formulary ID(s) using the OF liturgical position.
 *
 * Most days yield one ID. Holy Thursday returns two (chrism-mass + lords-supper).
 * Christmas Day yields the four Mass formularies (vigil / midnight / dawn / day)
 * — currently approximated as the principal one; full multi-Mass support is a
 * follow-up that depends on ember-extra's Christmas-day ID layout being mapped.
 *
 * Returns canonical ember-extra IDs; consumers should fetch these via
 * `ctx.fetchAsset('ember-extra', formularyPath(id))`.
 */
export function temporeIdsForDate(date: Date): string[] {
  const month = getMonth(date) + 1
  const day = getDate(date)

  // --- Movable solemnities (override the season-week-weekday id) ---
  // Trinity Sunday: Easter + 56 days (Sunday after Pentecost).
  // Corpus Christi: in the universal calendar, Thursday after Trinity
  //   (Easter + 60); in Brazil/many countries, the following Sunday — we
  //   surface BOTH dates (users in Brazil pick the Sunday celebration).
  // Sacred Heart of Jesus: Friday after Corpus Christi week (Easter + 68).
  // Christ the King: 34th Sunday of OT = Sunday immediately before the
  //   First Sunday of Advent (= 7 days before Advent 1).
  const easter = computeEaster(date.getFullYear())
  if (isSameDay(date, addDays(easter, 56))) return ['tempore.solemnity.most-holy-trinity']
  if (isSameDay(date, addDays(easter, 60))) return ['tempore.solemnity.corpus-christi']
  // Brazil's transferred Corpus Christi: Sunday after Trinity (= Easter + 63).
  if (isSameDay(date, addDays(easter, 63))) return ['tempore.solemnity.corpus-christi']
  if (isSameDay(date, addDays(easter, 68))) return ['tempore.solemnity.sacred-heart-of-jesus']
  const advent1 = getFirstSundayOfAdvent(date.getFullYear())
  if (isSameDay(date, subDays(advent1, 7))) return ['tempore.solemnity.christ-the-king']

  // --- Late Advent (Dec 17–23) and Christmas Octave / Epiphany season ---
  // ember-extra files these under `tempore.christmas.day-1NN` (and 8NN for
  // Baptism of the Lord), with weekday subfolders that don't match the
  // actual weekday but rather the file's storage location. Centralize all
  // the date-keyed Christmas-season logic in one place.
  const christmasSeasonId = christmasSeasonIdFor(date)
  if (christmasSeasonId === null) return [] // sanctoral takes over (Dec 26-28)
  if (christmasSeasonId) return [christmasSeasonId]

  // --- Holy Week special days (must be detected by liturgical position, not date) ---
  // The OF liturgical position object knows when we're in holy-week and which weekday.
  const position = getOfLiturgicalPosition(date)

  if (position?.season === 'holy-week') {
    const wd = WEEKDAY_NAMES[date.getDay()]
    if (wd === 'thursday') {
      // Chrism Mass (morning) + Mass of the Lord's Supper (evening) — both apply
      return ['tempore.holy-week.chrism-mass', 'tempore.holy-week.lords-supper']
    }
    if (wd === 'friday') return ['tempore.holy-week.good-friday']
    if (wd === 'saturday') return ['tempore.holy-week.easter-vigil']
    if (wd === 'sunday') return ['tempore.holy-week.palm-sunday']
    if (wd === 'monday' || wd === 'tuesday' || wd === 'wednesday') {
      return [`tempore.holy-week.${wd}`]
    }
  }

  // --- Christmas Day: vigil / midnight / dawn / day (multiple Masses) ---
  if (month === 12 && day === 25) {
    return [
      'tempore.christmas.nativity-vigil',
      'tempore.christmas.nativity-night',
      'tempore.christmas.nativity-dawn',
      'tempore.christmas.nativity-day',
    ]
  }
  // Dec 24: Vigil Mass of the Nativity is celebrated in the evening; the
  // morning Mass is the late-Advent ferial under `advent/dec-24.json`.
  // When Dec 24 is a Sunday it's the 4th Sunday of Advent + vigil.
  if (month === 12 && day === 24) {
    const ids: string[] = []
    if (date.getDay() === 0) {
      ids.push('tempore.advent.week-4.sunday')
    } else {
      ids.push('tempore.advent.dec-24')
    }
    ids.push('tempore.christmas.nativity-vigil')
    return ids
  }

  // --- General season + week + weekday ---
  if (!position) return []

  const wd = WEEKDAY_NAMES[date.getDay()]
  const season = SEASON_MAP[position.season]
  if (position.week !== undefined) {
    return [`tempore.${season}.week-${position.week}.${wd}`]
  }
  return [`tempore.${season}.${wd}`]
}

/**
 * Return the YYYY-MM-DD string for a date — used to look up sanctoral
 * formularies (filed by calendar date in ember-extra's `sanctorale/MM-DD.json`).
 */
export function sanctoralIdForDate(date: Date): string {
  return `sanctorale.${format(date, 'MM-dd')}`
}

/**
 * Return the Christmas-season tempore ID for a date in Dec 17 – mid-January,
 * or `undefined` if the date isn't in the Christmas-season window OR if it's
 * a sanctoral day that's better handled via sanctoral fold-in (Dec 26-28
 * weekdays — St Stephen / St John / Holy Innocents).
 *
 * Brazil's transferred Epiphany rule is used: Epiphany falls on the Sunday
 * between Jan 2 and Jan 8 (i.e., the first Sunday of the new year that is
 * Jan 2 or later). Baptism of the Lord is the next Sunday after Epiphany;
 * if Epiphany falls on Jan 7 or 8, Baptism shifts to the Monday immediately
 * after (no room for a separate Sunday).
 *
 * Holy Family is the Sunday between Dec 26 and Dec 31; if no such Sunday
 * exists (Christmas itself is on a Sunday), Holy Family transfers to
 * Friday Dec 30.
 */
export function christmasSeasonIdFor(date: Date): string | null | undefined {
  const month = getMonth(date) + 1
  const day = getDate(date)
  const dow = date.getDay()
  const year = date.getFullYear()

  if (month === 12) {
    // Late Advent (Dec 17–23) — date-keyed ferial propers under
    // `tempore.advent.dec-NN`. Dec 24 is handled upstream (returns the
    // Dec 24 ferial + nativity vigil together); Dec 25 is upstream too.
    if (day >= 17 && day <= 23) {
      return `tempore.advent.dec-${day}`
    }

    if (day >= 26 && day <= 31) {
      // Christmas Octave. Holy Family wins on whichever day it falls
      // (typically the Sunday between Dec 26–31, or Dec 30 when Christmas
      // itself is on a Sunday).
      const holyFamily = computeHolyFamily(year)
      if (isSameDay(date, holyFamily)) {
        return 'tempore.christmas.holy-family'
      }
      // Dec 26/27/28 are St Stephen / St John / Holy Innocents — return
      // null so the sanctoral fold-in surfaces the saint as primary.
      if (day === 26 || day === 27 || day === 28) return null
      if (day === 29) return 'tempore.christmas.dec-29'
      if (day === 30) return 'tempore.christmas.dec-30'
      if (day === 31) return 'tempore.christmas.dec-31'
    }
    return undefined
  }

  if (month === 1) {
    if (day === 1) return 'tempore.christmas.mary-mother-of-god'

    // Days Jan 2–13 (the Epiphany season window). Compute three movable
    // boundaries: 2nd Sunday after Christmas, Epiphany, Baptism.
    if (day >= 2 && day <= 13) {
      const epiphany = firstSundayInJanuaryRange(year, 2, 8)
      const secondSundayAfterChristmas = firstSundayInJanuaryRange(year, 2, 5)
      const baptismDate = epiphany.getDate() >= 7 ? addDays(epiphany, 1) : addDays(epiphany, 7)

      if (isSameDay(date, epiphany)) return 'tempore.christmas.epiphany'
      if (
        secondSundayAfterChristmas &&
        isSameDay(date, secondSundayAfterChristmas) &&
        !isSameDay(secondSundayAfterChristmas, epiphany)
      ) {
        return 'tempore.christmas.second-sunday-after-christmas'
      }
      if (isSameDay(date, baptismDate)) return 'tempore.christmas.baptism-of-the-lord'

      // Ferials of the week after Epiphany (Mon–Sat) — filed as
      // `after-epiphany/<weekday>.json`.
      if (date > epiphany && date < baptismDate) {
        const wd = WEEKDAY_NAMES[dow]
        if (wd !== 'sunday') return `tempore.christmas.after-epiphany.${wd}`
      }
      return undefined
    }
  }

  return undefined
}

/**
 * Holy Family of Jesus, Mary and Joseph: the Sunday between Dec 26 and
 * Dec 31. If Christmas itself falls on a Sunday (no Sunday in that range),
 * Holy Family is celebrated on Friday Dec 30.
 */
function computeHolyFamily(year: number): Date {
  for (let day = 26; day <= 31; day++) {
    const candidate = new Date(year, 11, day)
    if (candidate.getDay() === 0) return candidate
  }
  return new Date(year, 11, 30)
}

/**
 * First Sunday in January falling in the inclusive [from, to] day range.
 * Always returns a date — if no Sunday is in the range, returns the
 * upper bound (defensive; callers should pre-check this can't happen for
 * Epiphany-style ranges that span 7 days).
 */
function firstSundayInJanuaryRange(year: number, from: number, to: number): Date {
  for (let day = from; day <= to; day++) {
    const candidate = new Date(year, 0, day)
    if (candidate.getDay() === 0) return candidate
  }
  return new Date(year, 0, to)
}

/**
 * Enumerate today's celebrations as primary+alternates pairs. Most days
 * yield one entry. Multi-celebration days (Holy Thursday, Christmas) yield
 * multiple entries. Memorial days yield tempore-with-saint-as-alt and
 * saint-with-tempore-as-alt — letting the user pick celebration AND mix
 * slots within.
 *
 * This is the single liturgy-specific function; everything else in mass-of
 * is plumbing.
 */
export function enumerateCelebrations(date: Date): EnumeratedCelebration[] {
  const tempore = temporeIdsForDate(date)
  // Sanctoral enumeration requires querying ember-extra's calendar index for
  // saints assigned to today's date — including regional/scoped variants.
  // For now we expose only the tempore IDs; sanctoral integration depends on
  // an ember-extra calendar lookup that's part of the same task and lands
  // alongside the renderer/Mass-flow work.
  return tempore.map((id) => ({ primaryId: id, alternateIds: [] }))
}

/**
 * Given a canonical formulary ID like 'tempore.holy-week.chrism-mass',
 * return its file path within the ember-extra library.
 *
 *   tempore.holy-week.chrism-mass    → masses/tempore/holy-week/chrism-mass.json
 *   sanctorale.07-24                 → masses/sanctorale/07-24.json
 *   sanctorale.05-13.brazil          → masses/sanctorale/05-13.brazil.json
 *   common.doctors                   → masses/common/doctors.json
 *   preface.pf056                    → library/preface/pf056.json
 */
export function formularyPath(id: string): string {
  if (id.startsWith('preface.')) {
    return `library/preface/${id.slice('preface.'.length)}.json`
  }
  if (id.startsWith('eucharistic-prayer.')) {
    return `library/eucharistic-prayer/${id.slice('eucharistic-prayer.'.length)}.json`
  }
  if (id.startsWith('ordinary.')) {
    return `library/ordinary/${id.slice('ordinary.'.length)}.json`
  }
  // tempore / sanctorale / common / ritual / votive — first segment becomes
  // the masses/ subdir, remaining segments become path components.
  const [bucket, ...rest] = id.split('.')
  return `masses/${bucket}/${rest.join('/')}.json`
}
