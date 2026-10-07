// The day of the Liturgy of the Hours, as the Brazilian edition keeps it.
//
// The year itself (season, week, the movable solemnities of the Lord) is
// reckoned once for the whole Ordinary Form, in `temporalDay`. What is added
// here is the office's own: the week of the psalter, the saints of the
// Brazilian breviary's calendar, and which of two celebrations keeps a day.

import {
  addDays,
  daysBetween,
  easterSunday,
  firstSundayOfAdvent,
  type OfSeason as Season,
  sundayCycle,
  type TemporalDay,
  type Transfers,
  temporalDay,
  weekdayCycle,
} from '@ember/liturgical'

export type Rank = 'solemnity' | 'feast' | 'memorial'

export interface CelebrationEntry {
  title: string
  rank: Rank
  // A memorial that must be kept; in Lent every memorial is optional.
  obligatory?: boolean
  // The office is the weekday's with the saint's own parts set into it.
  montage?: boolean
  // "Do Comum dos pastores": where the parts the saint lacks are taken from.
  common?: string
}

export interface LothCalendar {
  celebrations: Record<string, CelebrationEntry>
  // 'MM-DD' -> celebration id
  fixed: Record<string, string>
}

export interface Celebration extends CelebrationEntry {
  id: string
}

export interface LothDay {
  date: Date
  season: Season
  // The week of the season; 0 for the days after Ash Wednesday and Holy Week.
  week: number
  weekday: number
  // 0 on the days that have no psalter of their own (the Easter octave).
  psalterWeek: number
  cycle: 'A' | 'B' | 'C'
  // The two-year cycle of the Office of Readings.
  readingsYear: 'I' | 'II'
  // The celebration that falls on the day and is kept, if any. A Sunday or a
  // weekday of a season is not one.
  celebration?: Celebration
}

// Brazil keeps Epiphany and the Ascension on Sunday, Corpus Christi on Thursday.
export const brazilTransfers: Transfers = {
  epiphany: 'sunday',
  ascension: 'sunday',
  corpusChristi: 'thursday',
}

export const ids = {
  saturdayOfMary: 'sanctorale.saint-mary-on-saturday',
  ashWednesday: 'tempore.lent.ash-wednesday',
  palmSunday: 'tempore.holy-week.palm-sunday',
  lordsSupper: 'tempore.holy-week.lords-supper',
  goodFriday: 'tempore.holy-week.good-friday',
  holySaturday: 'tempore.holy-week.holy-saturday',
  easterSunday: 'tempore.easter.easter-sunday',
  secondSundayOfEaster: 'tempore.easter.week-2.sunday',
  ascension: 'tempore.easter.ascension',
  pentecost: 'tempore.easter.pentecost',
  motherOfTheChurch: 'sanctorale.mary-mother-of-the-church',
  trinity: 'tempore.solemnity.most-holy-trinity',
  corpusChristi: 'tempore.solemnity.corpus-christi',
  sacredHeart: 'tempore.solemnity.sacred-heart-of-jesus',
  immaculateHeart: 'sanctorale.immaculate-heart-of-mary',
  christTheKing: 'tempore.solemnity.christ-the-king',
  epiphany: 'tempore.christmas.epiphany',
  baptism: 'tempore.christmas.baptism-of-the-lord',
  holyFamily: 'tempore.christmas.holy-family',
  christmas: 'tempore.christmas.nativity-day',
  motherOfGod: 'tempore.christmas.mary-mother-of-god',
  joseph: 'sanctorale.03-19',
  annunciation: 'sanctorale.03-25',
  johnTheBaptist: 'sanctorale.06-24',
  peterAndPaul: 'sanctorale.06-29',
  assumption: 'sanctorale.08-15',
  allSaints: 'sanctorale.11-01',
  allSouls: 'sanctorale.11-02',
  aparecida: 'sanctorale.10-12.brazil',
  presentation: 'sanctorale.02-02',
  transfiguration: 'sanctorale.08-06',
  exaltation: 'sanctorale.09-14',
  lateran: 'sanctorale.11-09',
  immaculateConception: 'sanctorale.12-08',
} as const

const at = (year: number, month: number, day: number) => new Date(year, month - 1, day, 12)
const mmdd = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** The Sunday on or after `date`. */
const sundayFrom = (date: Date) => addDays(date, (7 - date.getDay()) % 7)

// The feasts of the Lord that take the place of a Sunday of Ordinary Time.
const feastsOverSunday = new Set<string>([
  ids.presentation,
  ids.transfiguration,
  ids.exaltation,
  ids.lateran,
  ids.holyFamily,
  ids.baptism,
])

const yearCache = new WeakMap<LothCalendar, Map<number, Map<string, string>>>()

/**
 * The celebrations of one civil year by date, the movable ones placed and the
 * impeded ones moved. Where two fall on one day the later rule here wins,
 * which is the order of precedence.
 */
function celebrationsOfYear(calendar: LothCalendar, year: number): Map<string, string> {
  let years = yearCache.get(calendar)
  if (!years) {
    years = new Map()
    yearCache.set(calendar, years)
  }
  const cached = years.get(year)
  if (cached) return cached

  const byDay = new Map<string, string>(Object.entries(calendar.fixed))
  const put = (date: Date, id: string) => byDay.set(mmdd(date), id)
  const easter = easterSunday(year)
  const fromEaster = (date: Date) => daysBetween(easter, date)

  // Brazil keeps these three solemnities on a Sunday.
  const moved = [ids.peterAndPaul, ids.assumption, ids.allSaints, ids.joseph, ids.annunciation]
  for (const [day, id] of [...byDay]) if (moved.includes(id as never)) byDay.delete(day)

  const joseph = at(year, 3, 19)
  put(joseph.getDay() === 0 ? addDays(joseph, -1) : joseph, ids.joseph)

  const annunciation = at(year, 3, 25)
  const a = fromEaster(annunciation)
  put(
    a >= -7 && a <= 7
      ? addDays(easter, 8)
      : annunciation.getDay() === 0
        ? addDays(annunciation, 1)
        : annunciation,
    ids.annunciation,
  )

  put(addDays(easter, -46), ids.ashWednesday)
  put(addDays(easter, -7), ids.palmSunday)
  put(addDays(easter, -3), ids.lordsSupper)
  put(addDays(easter, -2), ids.goodFriday)
  put(addDays(easter, -1), ids.holySaturday)
  put(easter, ids.easterSunday)
  put(addDays(easter, 7), ids.secondSundayOfEaster)
  put(addDays(easter, 42), ids.ascension)
  put(addDays(easter, 49), ids.pentecost)
  put(addDays(easter, 50), ids.motherOfTheChurch)
  put(addDays(easter, 56), ids.trinity)
  put(addDays(easter, 60), ids.corpusChristi)
  const sacredHeart = addDays(easter, 68)
  put(sacredHeart, ids.sacredHeart)
  // The Sacred Heart on 24 June sends the Baptist back a day.
  if (mmdd(sacredHeart) === '06-24') put(at(year, 6, 23), ids.johnTheBaptist)
  const immaculateHeart = addDays(easter, 69)
  if (!['06-24', '05-31'].includes(mmdd(immaculateHeart))) put(immaculateHeart, ids.immaculateHeart)

  const peter = at(year, 6, 29)
  put(peter.getDay() === 1 ? addDays(peter, -1) : sundayFrom(peter), ids.peterAndPaul)
  put(sundayFrom(at(year, 8, 15)), ids.assumption)
  const allSaints = at(year, 11, 1)
  put(allSaints.getDay() === 6 ? allSaints : sundayFrom(allSaints), ids.allSaints)

  years.set(year, byDay)
  return byDay
}

// The psalter runs on from Advent through Christmas time: the fourth week
// until the Saturday after the Fourth Sunday of Advent, then the first again.
function psalterWeek(day: TemporalDay, date: Date): number {
  const cycle = (week: number) => ((week - 1) % 4) + 1
  switch (day.season) {
    case 'holy-week':
      return 2
    case 'lent':
      return day.week === 0 ? 4 : cycle(day.week)
    case 'easter':
      if (day.key === 'easter-sunday') return 1
      return day.week === 1 || day.key === 'pentecost' ? 0 : cycle(day.week)
    case 'christmas': {
      if (day.key === 'baptism-of-the-lord') return 0
      // Epiphany on 8 January would open a third week that has no days.
      if (day.key === 'epiphany') return 2
      const adventYear = date.getMonth() === 11 ? date.getFullYear() : date.getFullYear() - 1
      const fourthSunday = addDays(firstSundayOfAdvent(adventYear), 21)
      return cycle(4 + Math.floor(daysBetween(fourthSunday, date) / 7))
    }
    default:
      return cycle(day.week)
  }
}

export function lothDay(date: Date, calendar: LothCalendar): LothDay {
  const temporal = temporalDay(date, brazilTransfers)
  const { season, week, weekday } = temporal
  const year = date.getFullYear()
  const easter = easterSunday(year)
  const fromEaster = daysBetween(easter, date)

  const temporalId = (() => {
    switch (temporal.key) {
      case 'epiphany':
        return ids.epiphany
      case 'baptism-of-the-lord':
        return ids.baptism
      case 'holy-family':
        return ids.holyFamily
      case 'christ-the-king':
        return ids.christTheKing
      default:
        return undefined
    }
  })()
  const id = temporalId ?? celebrationsOfYear(calendar, year).get(mmdd(date))
  const entry = id ? calendar.celebrations[id] : undefined

  // Monday to Wednesday of Holy Week and the days of the Easter octave admit
  // no other celebration.
  const closed = (fromEaster > -7 && fromEaster < -3) || (fromEaster > 0 && fromEaster < 7)
  const kept = (() => {
    if (!id || !entry || closed) return false
    if (entry.rank === 'solemnity') return true
    if (entry.rank === 'feast') return weekday !== 0 || feastsOverSunday.has(id)
    return weekday !== 0
  })()

  const saturdayOfMary =
    !kept && season === 'ordinary-time' && weekday === 6 && !id
      ? calendar.celebrations[ids.saturdayOfMary]
      : undefined

  const celebration: Celebration | undefined = (() => {
    if (kept && id && entry) {
      return {
        id,
        ...entry,
        ...(entry.rank === 'memorial' && season === 'lent' ? { obligatory: false } : {}),
      }
    }
    if (saturdayOfMary) return { id: ids.saturdayOfMary, ...saturdayOfMary }
    return undefined
  })()

  return {
    date,
    season,
    week,
    weekday,
    psalterWeek: psalterWeek(temporal, date),
    cycle: sundayCycle(date),
    readingsYear: weekdayCycle(date),
    ...(celebration ? { celebration } : {}),
  }
}
