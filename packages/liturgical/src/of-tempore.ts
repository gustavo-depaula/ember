import { addDays, getDate, getMonth, isSameDay, subDays } from 'date-fns'
import { getOfLiturgicalPosition, type OfSeason } from './of-position'
import { computeEaster, getFirstSundayOfAdvent } from './season'

/**
 * Map a date to its OF tempore (temporal-cycle) Mass-formulary id(s) — canonical
 * ember-extra ids such as `tempore.ordinary-time.week-9.sunday` or
 * `tempore.solemnity.most-holy-trinity`.
 *
 * Most days yield one id. Holy Thursday yields two (chrism + Lord's Supper);
 * Christmas Day yields four (vigil/night/dawn/day); Dec 24 yields the ferial +
 * the nativity vigil. The first id is the principal one.
 *
 * This is the single source of the temporal id mapping, owned by the calendar
 * (it was previously duplicated inside `@ember/mass`).
 */
export function ofTemporeIds(date: Date): string[] {
  const month = getMonth(date) + 1
  const day = getDate(date)

  // ── Movable solemnities (override the season-week-weekday id) ──
  const easter = computeEaster(date.getFullYear())
  if (isSameDay(date, addDays(easter, 56))) return ['tempore.solemnity.most-holy-trinity']
  if (isSameDay(date, addDays(easter, 60))) return ['tempore.solemnity.corpus-christi']
  // Brazil's transferred Corpus Christi (Sunday after Trinity, Easter + 63)
  // resolves to the same formulary.
  if (isSameDay(date, addDays(easter, 63))) return ['tempore.solemnity.corpus-christi']
  if (isSameDay(date, addDays(easter, 68))) return ['tempore.solemnity.sacred-heart-of-jesus']
  const advent1 = getFirstSundayOfAdvent(date.getFullYear())
  if (isSameDay(date, subDays(advent1, 7))) return ['tempore.solemnity.christ-the-king']

  // ── Late Advent / Christmas Octave / Epiphany season (date-keyed) ──
  const christmasSeasonId = christmasSeasonIdFor(date)
  if (christmasSeasonId === null) return [] // sanctoral takes over (Dec 26-28)
  if (christmasSeasonId) return [christmasSeasonId]

  // ── Holy Week (detected by liturgical position, not date) ──
  const position = getOfLiturgicalPosition(date)
  if (position.season === 'holy-week') {
    const wd = weekdayNames[date.getDay()]
    if (wd === 'thursday') {
      return ['tempore.holy-week.chrism-mass', 'tempore.holy-week.lords-supper']
    }
    if (wd === 'friday') return ['tempore.holy-week.good-friday']
    if (wd === 'saturday') return ['tempore.holy-week.easter-vigil']
    if (wd === 'sunday') return ['tempore.holy-week.palm-sunday']
    if (wd === 'monday' || wd === 'tuesday' || wd === 'wednesday') {
      return [`tempore.holy-week.${wd}`]
    }
  }

  // ── Christmas Day: vigil / night / dawn / day ──
  if (month === 12 && day === 25) {
    return [
      'tempore.christmas.nativity-vigil',
      'tempore.christmas.nativity-night',
      'tempore.christmas.nativity-dawn',
      'tempore.christmas.nativity-day',
    ]
  }
  // Dec 24: the ferial (or 4th Sunday of Advent) morning Mass + the Nativity vigil.
  if (month === 12 && day === 24) {
    const ids: string[] = []
    ids.push(date.getDay() === 0 ? 'tempore.advent.week-4.sunday' : 'tempore.advent.dec-24')
    ids.push('tempore.christmas.nativity-vigil')
    return ids
  }

  // ── General season + week + weekday ──
  const wd = weekdayNames[date.getDay()]
  const season = SEASON_MAP[position.season]
  if (position.week > 0) return [`tempore.${season}.week-${position.week}.${wd}`]
  return [`tempore.${season}.${wd}`]
}

const weekdayNames = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

// ember-extra uses 'ordinary-time'; @ember/liturgical's OfSeason uses 'ordinary'.
const SEASON_MAP: Record<OfSeason, string> = {
  advent: 'advent',
  christmas: 'christmas',
  lent: 'lent',
  'holy-week': 'holy-week',
  easter: 'easter',
  ordinary: 'ordinary-time',
}

/**
 * Christmas-season tempore id for a date in Dec 17 – mid-January, `null` when a
 * sanctoral day takes over (Dec 26-28), or `undefined` outside the window.
 *
 * Epiphany (Brazil rule): the Sunday between Jan 2 and Jan 8. Baptism of the
 * Lord: the next Sunday, or the Monday after when Epiphany is Jan 7/8. Holy
 * Family: the Sunday between Dec 26 and Dec 31, else Friday Dec 30.
 */
function christmasSeasonIdFor(date: Date): string | null | undefined {
  const month = getMonth(date) + 1
  const day = getDate(date)
  const dow = date.getDay()
  const year = date.getFullYear()

  if (month === 12) {
    if (day >= 17 && day <= 23) return `tempore.advent.dec-${day}`
    if (day >= 26 && day <= 31) {
      const holyFamily = computeHolyFamily(year)
      if (isSameDay(date, holyFamily)) return 'tempore.christmas.holy-family'
      if (day === 26 || day === 27 || day === 28) return null
      if (day === 29) return 'tempore.christmas.dec-29'
      if (day === 30) return 'tempore.christmas.dec-30'
      if (day === 31) return 'tempore.christmas.dec-31'
    }
    return undefined
  }

  if (month === 1) {
    if (day === 1) return 'tempore.christmas.mary-mother-of-god'
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
      if (date > epiphany && date < baptismDate) {
        const wd = weekdayNames[dow]
        if (wd !== 'sunday') return `tempore.christmas.after-epiphany.${wd}`
      }
      return undefined
    }
  }

  return undefined
}

function computeHolyFamily(year: number): Date {
  for (let day = 26; day <= 31; day++) {
    const candidate = new Date(year, 11, day)
    if (candidate.getDay() === 0) return candidate
  }
  return new Date(year, 11, 30)
}

function firstSundayInJanuaryRange(year: number, from: number, to: number): Date {
  for (let day = from; day <= to; day++) {
    const candidate = new Date(year, 0, day)
    if (candidate.getDay() === 0) return candidate
  }
  return new Date(year, 0, to)
}
