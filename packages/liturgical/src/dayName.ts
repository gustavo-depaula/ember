import { addDays, differenceInCalendarDays } from 'date-fns'

import {
  computeEaster,
  dateBefore,
  dateOnOrAfter,
  getBaptismOfTheLord,
  getFirstSundayOfAdvent,
  type LiturgicalCalendarForm,
  normalizeDate,
} from './season'

export type Localizer = {
  t: (key: string, opts?: Record<string, unknown>) => string
}

function daysSince(from: Date, to: Date): number {
  return differenceInCalendarDays(normalizeDate(to), normalizeDate(from))
}

function weekAndDay(from: Date, to: Date): { week: number; dayOfWeek: number } {
  const days = daysSince(from, to)
  return { week: Math.floor(days / 7) + 1, dayOfWeek: to.getDay() }
}

function formatWeekday(t: Localizer['t'], from: Date, date: Date, seasonKey: string): string {
  const { week, dayOfWeek } = weekAndDay(from, date)
  const ordinal = t(`ordinal.${week}`)
  const season = t(`home.liturgicalDay.seasons.${seasonKey}`)
  if (dayOfWeek === 0) return t('home.liturgicalDay.sundayOf', { ordinal, season })
  return t('home.liturgicalDay.weekdayOf', {
    day: t(`home.liturgicalDay.days.${dayOfWeek}`),
    ordinal,
    season,
  })
}

function dayName(t: Localizer['t'], key: string): string {
  return t(`home.liturgicalDay.days.${key}`)
}

function named(t: Localizer['t'], key: string): string {
  return t(`home.liturgicalDay.named.${key}`)
}

export function getLiturgicalDayName(
  date: Date,
  form: LiturgicalCalendarForm = 'of',
  localizer: Localizer,
): string {
  const { t } = localizer

  const year = date.getFullYear()
  const d = normalizeDate(date)
  const month = d.getMonth()
  const day = d.getDate()
  const dow = d.getDay()

  const easter = computeEaster(year)
  const ashWed = addDays(easter, -46)
  const palmSunday = addDays(easter, -7)
  const firstSundayOfLent = addDays(ashWed, 4)
  const pentecost = addDays(easter, 49)
  const easterOctaveEnd = addDays(easter, 7)
  const adventStart = getFirstSundayOfAdvent(year)
  const baptism = getBaptismOfTheLord(year)

  // Fixed-date solemnities
  if (month === 11 && day === 25) return named(t, 'christmas')
  if (month === 0 && day === 1) return named(t, 'maryMotherOfGod')
  if (month === 0 && day === 6) return named(t, 'epiphany')
  if (daysSince(baptism, d) === 0) return named(t, 'baptismOfTheLord')

  // Ash Wednesday and days before First Sunday of Lent
  if (daysSince(ashWed, d) === 0) return named(t, 'ashWednesday')
  if (dateOnOrAfter(d, ashWed) && dateBefore(d, firstSundayOfLent)) {
    return t('home.liturgicalDay.afterAshWednesday', { day: dayName(t, `${dow}`) })
  }

  // Holy Week
  if (dateOnOrAfter(d, palmSunday) && dateBefore(d, easter)) {
    if (daysSince(palmSunday, d) === 0) return named(t, 'palmSunday')
    if (daysSince(easter, d) === -3) return named(t, 'holyThursday')
    if (daysSince(easter, d) === -2) return named(t, 'goodFriday')
    if (daysSince(easter, d) === -1) return named(t, 'holySaturday')
    return t('home.liturgicalDay.holyWeekDay', { day: dayName(t, `${dow}`) })
  }

  // Easter and Pentecost
  if (daysSince(easter, d) === 0) return named(t, 'easterSunday')
  if (daysSince(pentecost, d) === 0) return named(t, 'pentecost')

  // Easter Octave
  if (dateOnOrAfter(d, easter) && dateBefore(d, easterOctaveEnd)) {
    return t('home.liturgicalDay.easterOctave', { day: dayName(t, `${dow}`) })
  }

  // Christmas season: Dec 25+ (same year, after Christmas Day handled above)
  if (month === 11 && day > 25) {
    const daysAfter = day - 25
    return t('home.liturgicalDay.christmasOrdinal', { ordinal: t(`ordinal.${daysAfter + 1}`) })
  }

  // Advent
  if (dateOnOrAfter(d, adventStart) && month >= 10) {
    return formatWeekday(t, adventStart, d, 'advent')
  }

  // Christmas season: Jan 1 through Baptism of the Lord (fixed-date names handled above)
  if (dateBefore(d, addDays(baptism, 1))) {
    if (dow === 0) return t('home.liturgicalDay.sundayOfChristmas')
    const daysAfterChristmas = daysSince(new Date(year - 1, 11, 25), d)
    return t('home.liturgicalDay.christmasOrdinal', {
      ordinal: t(`ordinal.${daysAfterChristmas + 1}`),
    })
  }

  // Lent (First Sunday through day before Palm Sunday)
  if (dateOnOrAfter(d, firstSundayOfLent) && dateBefore(d, palmSunday)) {
    return formatWeekday(t, firstSundayOfLent, d, 'lent')
  }

  // Easter season (after Octave, before Pentecost)
  if (dateOnOrAfter(d, easterOctaveEnd) && dateBefore(d, pentecost)) {
    return formatWeekday(t, easter, d, 'easter')
  }

  // EF-specific seasons
  if (form === 'ef') {
    const septuagesima = addDays(easter, -63)
    const sexagesima = addDays(easter, -56)
    const quinquagesima = addDays(easter, -49)

    // Septuagesimatide
    if (dateOnOrAfter(d, septuagesima) && dateBefore(d, ashWed)) {
      if (daysSince(septuagesima, d) === 0) return named(t, 'septuagesima')
      if (daysSince(sexagesima, d) === 0) return named(t, 'sexagesima')
      if (daysSince(quinquagesima, d) === 0) return named(t, 'quinquagesima')
      return formatWeekday(t, septuagesima, d, 'septuagesima')
    }

    // Epiphanytide
    const jan14 = new Date(year, 0, 14)
    if (dateOnOrAfter(d, jan14) && dateBefore(d, septuagesima)) {
      const jan6 = new Date(year, 0, 6)
      const firstSundayAfterEpiphany = addDays(jan6, jan6.getDay() === 0 ? 7 : 7 - jan6.getDay())
      return formatWeekday(t, firstSundayAfterEpiphany, d, 'epiphany')
    }

    // Post-Pentecost
    const trinitySunday = addDays(easter, 56)
    if (dateOnOrAfter(d, trinitySunday)) {
      if (daysSince(trinitySunday, d) === 0) return named(t, 'trinitySunday')
      if (daysSince(addDays(easter, 60), d) === 0) return named(t, 'corpusChristi')
      return formatWeekday(t, trinitySunday, d, 'postPentecost')
    }

    // Pentecost Octave (EF Easter extends through Pentecost Saturday)
    if (dateOnOrAfter(d, pentecost)) {
      return t('home.liturgicalDay.pentecostWeek', { day: dayName(t, `${dow}`) })
    }
  }

  // OF Ordinary Time
  const baptismNext = addDays(baptism, 1)

  // Ordinary Time I (after Baptism, before Lent)
  if (dateOnOrAfter(d, baptismNext) && dateBefore(d, ashWed)) {
    return formatWeekday(t, baptismNext, d, 'ordinaryTime')
  }

  // Ordinary Time II (after Pentecost, before Advent)
  // Week numbering continues from where OT-I left off
  const otIWeeks = Math.floor(daysSince(baptismNext, ashWed) / 7)
  const otIIStart = addDays(pentecost, 1)
  const { week: rawWeek, dayOfWeek } = weekAndDay(otIIStart, d)
  const week = rawWeek + otIWeeks
  const ordinal = t(`ordinal.${week}`)
  const season = t('home.liturgicalDay.seasons.ordinaryTime')
  if (dayOfWeek === 0) return t('home.liturgicalDay.sundayOf', { ordinal, season })
  return t('home.liturgicalDay.weekdayOf', { day: dayName(t, `${dayOfWeek}`), ordinal, season })
}
