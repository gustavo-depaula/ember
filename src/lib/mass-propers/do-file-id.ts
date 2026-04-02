/**
 * Maps a date to its Divinum Officium Tempora/Sancti file ID.
 *
 * The naming convention mirrors the EF liturgical calendar:
 *   Adv{1-4}-{0-6}     Advent
 *   Nat{29-31,02-05}    Christmastide fixed days
 *   Nat{1-2}-0          Sundays in Christmastide
 *   Epi{1-6}-0          Sundays after Epiphany
 *   Quadp{1-3}-{0-6}    Septuagesimatide
 *   Quad{1-6}-{0-6}     Lent (Quadragesima)
 *   Pasc{0-7}-{0-6}     Eastertide
 *   Pent{01-24}-{0-6}   Post-Pentecost (Ordinary Time)
 *
 * Day-of-week: 0=Sunday, 6=Saturday
 */
import { addDays, differenceInCalendarDays } from 'date-fns'

import {
  computeEaster,
  getAshWednesday,
  getFirstSundayOfAdvent,
  getSeptuagesimaSunday,
  normalizeDate,
} from '@/lib/liturgical'

function daysSince(from: Date, to: Date): number {
  return differenceInCalendarDays(normalizeDate(to), normalizeDate(from))
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

export function getDoTemporaId(date: Date): string | undefined {
  const d = normalizeDate(date)
  const year = d.getFullYear()
  const month = d.getMonth()
  const day = d.getDate()
  const dow = d.getDay()

  const easter = computeEaster(year)
  const ashWed = getAshWednesday(year)
  const septuagesima = getSeptuagesimaSunday(year)
  const adventStart = getFirstSundayOfAdvent(year)
  const pentecost = addDays(easter, 49)
  const trinitySunday = addDays(easter, 56)

  // ── Advent ──
  // Starts 1st Sunday of Advent, ends Dec 24
  if (month >= 10) {
    const advDays = daysSince(adventStart, d)
    if (advDays >= 0 && month === 11 && day <= 24) {
      const week = Math.floor(advDays / 7) + 1
      return `Adv${week}-${dow}`
    }
    if (advDays >= 0 && month === 10) {
      const week = Math.floor(advDays / 7) + 1
      return `Adv${week}-${dow}`
    }
  }

  // ── Christmas / Nativity (Dec 25 - Jan 13) ──
  if (month === 11 && day >= 25) {
    if (day === 25) return undefined // Christmas itself is a Sancti entry (12-25)
    if (dow === 0) return 'Nat1-0' // Sunday after Christmas
    if (day >= 29) return `Nat${day}`
    return undefined
  }
  if (month === 0 && day <= 13) {
    if (day === 1) return undefined // Circumcision is Sancti 01-01
    if (day >= 2 && day <= 5) return `Nat0${day}`
    if (day === 6) return undefined // Epiphany is Sancti 01-06
    if (dow === 0 && day >= 7) return 'Nat2-0' // 2nd Sunday after Christmas
    return undefined
  }

  // ── Epiphanytide (Jan 14 - Septuagesima) ──
  const epiDays = daysSince(septuagesima, d)
  if (month === 0 && day >= 14 && epiDays < 0) {
    if (dow !== 0) return undefined // Only Sundays have propers in Epiphanytide
    // Count Sundays after Epiphany (Jan 6)
    const jan6 = new Date(year, 0, 6)
    const firstSunAfterEpi = addDays(jan6, jan6.getDay() === 0 ? 7 : 7 - jan6.getDay())
    const weeksSince = Math.floor(daysSince(firstSunAfterEpi, d) / 7) + 1
    if (weeksSince >= 1 && weeksSince <= 6) return `Epi${weeksSince}-0`
    return undefined
  }

  // ── Septuagesimatide ──
  if (epiDays >= 0 && daysSince(ashWed, d) < 0) {
    const week = Math.floor(daysSince(septuagesima, d) / 7) + 1
    return `Quadp${week}-${dow}`
  }

  // ── Lent (Ash Wednesday - Holy Saturday) ──
  const lentDays = daysSince(ashWed, d)
  if (lentDays >= 0 && daysSince(easter, d) < 0) {
    // Ash Wednesday is day 0, first Sunday of Lent is day 4
    // Week 1 starts at the first Sunday of Lent
    if (lentDays < 4) {
      // Days between Ash Wednesday and first Sunday
      return `Quadp3-${dow}` // These are the last days of Quinquagesima week
    }
    const firstSundayOfLent = addDays(ashWed, 4)
    const quadDays = daysSince(firstSundayOfLent, d)
    const week = Math.floor(quadDays / 7) + 1
    return `Quad${week}-${dow}`
  }

  // ── Eastertide (Easter - Saturday after Pentecost) ──
  const easterDays = daysSince(easter, d)
  if (easterDays >= 0 && easterDays <= 55) {
    const week = Math.floor(easterDays / 7)
    return `Pasc${week}-${dow}`
  }

  // ── Post-Pentecost / Ordinary Time ──
  const pentDays = daysSince(trinitySunday, d)
  if (pentDays >= 0) {
    const week = Math.floor(pentDays / 7) + 1
    return `Pent${pad2(week)}-${dow}`
  }

  // Pentecost week (Trinity octave)
  const pentecostDays = daysSince(pentecost, d)
  if (pentecostDays >= 0) {
    return `Pent01-${dow}`
  }

  return undefined
}

export function getDoSanctiId(date: Date): string {
  const d = normalizeDate(date)
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}
