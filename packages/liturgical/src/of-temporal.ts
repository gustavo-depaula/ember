// The temporal cycle: a date to its place in the liturgical year and the ids
// of the Mass formulary and lectionary entry that go with it.
//
// Weekday formularies of Ordinary Time are
// the week's Sunday formulary (`tempore.ordinary-time.week-5`), while every
// day has its own lectionary entry (`tempore.ordinary-time.week-5.tuesday`).

import { computeEaster, getFirstSundayOfAdvent } from './computus'

export type OfSeason = 'advent' | 'christmas' | 'lent' | 'holy-week' | 'easter' | 'ordinary-time'

export const weekdayNames = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

// Where a region keeps the three solemnities that may move to a Sunday.
export interface Transfers {
  epiphany: 'jan-6' | 'sunday'
  ascension: 'thursday' | 'sunday'
  corpusChristi: 'thursday' | 'sunday'
}

export const universalTransfers: Transfers = {
  epiphany: 'jan-6',
  ascension: 'thursday',
  corpusChristi: 'thursday',
}

// One Mass of a celebration, by the ids of its formulary and its readings.
// Most celebrations have one; Christmas has four, a solemnity may have a vigil.
export interface MassRef {
  key: 'day' | 'vigil' | 'night' | 'dawn' | 'chrism' | 'evening'
  formulary?: string
  lectionary: string
}

export interface TemporalDay {
  season: OfSeason
  // Week of the season; 0 where the season does not count weeks (Ash Wednesday
  // week, the days of Christmas).
  week: number
  weekday: number
  // The day's named celebration, when it has one.
  key?: string
  // The default Mass first.
  masses: MassRef[]
  // A Mass of the following day that may be anticipated this evening.
  anticipated?: MassRef
}

const dayMs = 86_400_000

// Calendar days are compared at noon so a DST shift never moves one.
function at(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12)
}

export function addDays(date: Date, days: number): Date {
  return at(date.getFullYear(), date.getMonth() + 1, date.getDate() + days)
}

export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((b - a) / dayMs)
}

export function sameDay(a: Date, b: Date): boolean {
  return daysBetween(a, b) === 0
}

export function easterSunday(year: number): Date {
  const easter = computeEaster(year)
  return at(year, easter.getMonth() + 1, easter.getDate())
}

export function firstSundayOfAdvent(year: number): Date {
  const advent = getFirstSundayOfAdvent(year)
  return at(year, advent.getMonth() + 1, advent.getDate())
}

// Days from Easter Sunday to the Ascension and to Corpus Christi, where each
// is kept.
export const ascensionOffset = (transfers: Transfers) =>
  transfers.ascension === 'thursday' ? 39 : 42
export const corpusChristiOffset = (transfers: Transfers) =>
  transfers.corpusChristi === 'thursday' ? 60 : 63

export function epiphany(year: number, transfers: Transfers): Date {
  if (transfers.epiphany === 'jan-6') return at(year, 1, 6)
  // The Sunday between 2 and 8 January.
  const jan2 = at(year, 1, 2)
  return addDays(jan2, (7 - jan2.getDay()) % 7)
}

// The Sunday after 6 January; where Epiphany is kept on a Sunday that falls on
// 7 or 8 January, the Monday after it.
export function baptismOfTheLord(year: number, transfers: Transfers): Date {
  const day = epiphany(year, transfers)
  if (transfers.epiphany === 'sunday' && day.getDate() >= 7) return addDays(day, 1)
  const jan6 = at(year, 1, 6)
  return addDays(jan6, 7 - jan6.getDay())
}

// The Sunday within the octave of Christmas, or 30 December when Christmas is
// itself a Sunday.
export function holyFamily(year: number): Date {
  const christmas = at(year, 12, 25)
  return christmas.getDay() === 0 ? at(year, 12, 30) : addDays(christmas, 7 - christmas.getDay())
}

// The liturgical year a date belongs to: it turns over on the First Sunday of
// Advent and is named for the civil year it mostly falls in.
export function liturgicalYear(date: Date): number {
  const year = date.getFullYear()
  return daysBetween(firstSundayOfAdvent(year), date) >= 0 ? year + 1 : year
}

export function sundayCycle(date: Date): 'A' | 'B' | 'C' {
  // Year A is the one divisible by three with remainder 1 (2023, 2026…).
  return (['C', 'A', 'B'] as const)[liturgicalYear(date) % 3]
}

export function weekdayCycle(date: Date): 'I' | 'II' {
  return liturgicalYear(date) % 2 === 1 ? 'I' : 'II'
}

function single(id: string, formulary = id): MassRef[] {
  return [{ key: 'day', formulary, lectionary: id }]
}

function christmasTime(date: Date, transfers: Transfers): TemporalDay | undefined {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = date.getDay()
  const base = { season: 'christmas' as const, week: 0, weekday }

  if (month === 12) {
    if (day === 25) {
      return {
        ...base,
        key: 'christmas',
        masses: [
          ...single('tempore.christmas.nativity-day'),
          {
            key: 'vigil',
            formulary: 'tempore.christmas.nativity-vigil',
            lectionary: 'tempore.christmas.nativity-vigil',
          },
          {
            key: 'night',
            formulary: 'tempore.christmas.nativity-night',
            lectionary: 'tempore.christmas.nativity-night',
          },
          {
            key: 'dawn',
            formulary: 'tempore.christmas.nativity-dawn',
            lectionary: 'tempore.christmas.nativity-dawn',
          },
        ],
      }
    }
    if (day < 26) return undefined
    if (sameDay(date, holyFamily(year))) {
      return { ...base, key: 'holy-family', masses: single('tempore.christmas.holy-family') }
    }
    // 26-28 December belong to St Stephen, St John and the Holy Innocents:
    // the temporal cycle has no Mass of its own, only the octave around them.
    if (day <= 28) return { ...base, masses: [] }
    return { ...base, masses: single(`tempore.christmas.dec-${day}`) }
  }

  if (month !== 1) return undefined
  const baptism = baptismOfTheLord(year, transfers)
  if (daysBetween(baptism, date) > 0) return undefined
  if (day === 1) {
    return {
      ...base,
      key: 'mary-mother-of-god',
      masses: single('tempore.christmas.mary-mother-of-god'),
    }
  }
  if (sameDay(date, baptism)) {
    return {
      ...base,
      key: 'baptism-of-the-lord',
      masses: single('tempore.christmas.baptism-of-the-lord'),
    }
  }
  const epiphanyDay = epiphany(year, transfers)
  if (sameDay(date, epiphanyDay)) {
    return {
      ...base,
      key: 'epiphany',
      masses: [
        ...single('tempore.christmas.epiphany'),
        {
          key: 'vigil',
          formulary: 'tempore.christmas.epiphany-vigil',
          lectionary: 'tempore.christmas.epiphany',
        },
      ],
    }
  }
  if (weekday === 0) {
    return {
      ...base,
      key: 'second-sunday-after-christmas',
      masses: single('tempore.christmas.second-sunday-after-christmas'),
    }
  }
  const formulary = `tempore.christmas.weekday.${weekdayNames[weekday]}`
  // Before Epiphany the lectionary goes by date; after it, by weekday. Where
  // Epiphany stays on 6 January the days after it are 7-12 January in order.
  const afterEpiphany = daysBetween(epiphanyDay, date)
  const lectionary =
    afterEpiphany < 0
      ? `tempore.christmas.jan-${day}`
      : `tempore.christmas.after-epiphany.${
          weekdayNames[transfers.epiphany === 'jan-6' ? afterEpiphany : weekday]
        }`
  return {
    ...base,
    masses: [{ key: 'day', formulary, lectionary }],
    ...(sameDay(addDays(date, 1), epiphanyDay)
      ? {
          anticipated: {
            key: 'vigil' as const,
            formulary: 'tempore.christmas.epiphany-vigil',
            lectionary: 'tempore.christmas.epiphany',
          },
        }
      : {}),
  }
}

function ordinaryTime(date: Date, week: number): TemporalDay {
  const weekday = date.getDay()
  return {
    season: 'ordinary-time',
    week,
    weekday,
    masses: single(
      `tempore.ordinary-time.week-${week}.${weekdayNames[weekday]}`,
      `tempore.ordinary-time.week-${week}`,
    ),
  }
}

export function temporalDay(date: Date, transfers: Transfers = universalTransfers): TemporalDay {
  const year = date.getFullYear()
  const weekday = date.getDay()
  const name = weekdayNames[weekday]

  const christmas = christmasTime(date, transfers)
  if (christmas) return christmas

  const easter = easterSunday(year)
  const fromEaster = daysBetween(easter, date)
  const ashWednesday = -46

  if (fromEaster < ashWednesday) {
    // Ordinary Time after the Baptism of the Lord. Weeks run Sunday to
    // Saturday from the Sunday on or before the Baptism.
    const baptism = baptismOfTheLord(year, transfers)
    const firstSunday = addDays(baptism, -baptism.getDay())
    return ordinaryTime(date, 1 + Math.floor(daysBetween(firstSunday, date) / 7))
  }

  if (fromEaster < -7) {
    const sinceAsh = fromEaster - ashWednesday
    if (sinceAsh === 0) {
      return {
        season: 'lent',
        week: 0,
        weekday,
        key: 'ash-wednesday',
        masses: single('tempore.lent.ash-wednesday'),
      }
    }
    if (sinceAsh < 4) {
      return {
        season: 'lent',
        week: 0,
        weekday,
        masses: single(`tempore.lent.after-ash-wednesday.${name}`),
      }
    }
    const week = 1 + Math.floor((sinceAsh - 4) / 7)
    return { season: 'lent', week, weekday, masses: single(`tempore.lent.week-${week}.${name}`) }
  }

  if (fromEaster < 0) {
    const base = { season: 'holy-week' as const, week: 0, weekday }
    if (fromEaster === -7) {
      return { ...base, key: 'palm-sunday', masses: single('tempore.holy-week.palm-sunday') }
    }
    if (fromEaster === -3) {
      return {
        ...base,
        key: 'holy-thursday',
        masses: [
          {
            key: 'evening',
            formulary: 'tempore.holy-week.lords-supper',
            lectionary: 'tempore.holy-week.lords-supper',
          },
          {
            key: 'chrism',
            formulary: 'tempore.holy-week.chrism-mass',
            lectionary: 'tempore.holy-week.chrism-mass',
          },
        ],
      }
    }
    if (fromEaster === -2) {
      return { ...base, key: 'good-friday', masses: single('tempore.holy-week.good-friday') }
    }
    if (fromEaster === -1) {
      return {
        ...base,
        key: 'holy-saturday',
        masses: [
          {
            key: 'vigil',
            formulary: 'tempore.holy-week.easter-vigil',
            lectionary: 'tempore.holy-week.easter-vigil',
          },
        ],
      }
    }
    return { ...base, masses: single(`tempore.holy-week.${name}`) }
  }

  if (fromEaster <= 49) {
    const week = 1 + Math.floor(fromEaster / 7)
    const base = { season: 'easter' as const, week, weekday }
    if (fromEaster === 0) {
      return { ...base, key: 'easter-sunday', masses: single('tempore.easter.easter-sunday') }
    }
    const pentecostVigil: MassRef = {
      key: 'vigil',
      formulary: 'tempore.easter.pentecost-vigil',
      lectionary: 'tempore.easter.pentecost-vigil',
    }
    if (fromEaster === 49) {
      return {
        ...base,
        key: 'pentecost',
        masses: [...single('tempore.easter.pentecost'), pentecostVigil],
      }
    }
    const ascensionVigil: MassRef = {
      key: 'vigil',
      formulary: 'tempore.easter.ascension-vigil',
      lectionary: 'tempore.easter.ascension',
    }
    const ascension = ascensionOffset(transfers)
    if (fromEaster === ascension) {
      return {
        ...base,
        key: 'ascension',
        masses: [...single('tempore.easter.ascension'), ascensionVigil],
      }
    }
    const id = `tempore.easter.week-${week}.${name}`
    return {
      ...base,
      masses: single(id),
      ...(fromEaster === 48 ? { anticipated: pentecostVigil } : {}),
      ...(fromEaster === ascension - 1 ? { anticipated: ascensionVigil } : {}),
    }
  }

  const advent = firstSundayOfAdvent(year)
  const toAdvent = daysBetween(date, advent)
  if (toAdvent > 0) {
    // Ordinary Time after Pentecost, counted back from Advent so the last
    // week is always the thirty-fourth.
    const sunday = addDays(date, -weekday)
    const week = 35 - daysBetween(sunday, advent) / 7
    const day = ordinaryTime(date, week)
    const solemnity = (key: string, id: string): TemporalDay => ({
      ...day,
      key,
      masses: single(id),
    })
    if (fromEaster === 56) return solemnity('trinity-sunday', 'tempore.solemnity.most-holy-trinity')
    if (fromEaster === corpusChristiOffset(transfers)) {
      return solemnity('corpus-christi', 'tempore.solemnity.corpus-christi')
    }
    if (fromEaster === 68)
      return solemnity('sacred-heart', 'tempore.solemnity.sacred-heart-of-jesus')
    if (toAdvent === 7) return solemnity('christ-the-king', 'tempore.solemnity.christ-the-king')
    return day
  }

  // Advent: from 17 December the weekdays go by date.
  const week = 1 + Math.floor(-toAdvent / 7)
  const day = date.getDate()
  const late = date.getMonth() === 11 && day >= 17 && weekday !== 0
  const id = late ? `tempore.advent.dec-${day}` : `tempore.advent.week-${week}.${name}`
  return {
    season: 'advent',
    week,
    weekday,
    masses: single(id),
    ...(date.getMonth() === 11 && day === 24
      ? {
          anticipated: {
            key: 'vigil' as const,
            formulary: 'tempore.christmas.nativity-vigil',
            lectionary: 'tempore.christmas.nativity-vigil',
          },
        }
      : {}),
  }
}
