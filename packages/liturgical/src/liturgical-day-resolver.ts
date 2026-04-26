import { addDays, differenceInCalendarDays } from 'date-fns'

import { getEfLiturgicalPosition } from './ef-position'
import { computeEaster, normalizeDate } from './season'

// ── Types ──

export type DayMapEntry = {
  primary: string
  secondary?: string
}

export type LiturgicalDayMap = {
  temporal: Record<string, DayMapEntry>
  fixedDates: Record<string, DayMapEntry>
  feasts: Record<string, DayMapEntry>
  novenas: Record<string, DayMapEntry>
  weekdaysOfMonths?: Record<string, DayMapEntry>
  reserves: string[]
}

export type ResolvedDayEntry = {
  id: string
  category: 'feast' | 'temporal' | 'additional'
}

// ── Helpers ──

function formatDateKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}-${d}`
}

const ordinalLabels = ['1st', '2nd', '3rd', '4th', '5th'] as const
const weekdayLabels = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const
const monthLabels = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const

function getWeekdayOfMonthKey(date: Date): string {
  const ordinalIndex = Math.floor((date.getDate() - 1) / 7)
  const ordinal = ordinalLabels[ordinalIndex]
  const weekday = weekdayLabels[date.getDay()]
  const month = monthLabels[date.getMonth()]
  return `${ordinal}-${weekday}-of-${month}`
}

function getReserveFallbackChapter(date: Date, map: LiturgicalDayMap): string | undefined {
  if (map.reserves.length === 0) return undefined
  const yearStart = new Date(date.getFullYear(), 0, 1)
  const dayOfYear = differenceInCalendarDays(normalizeDate(date), normalizeDate(yearStart))
  const index = ((dayOfYear % map.reserves.length) + map.reserves.length) % map.reserves.length
  return map.reserves[index]
}

/**
 * Compute which day of the Holy Spirit Novena this is (if any).
 * The novena runs for 9 days from the Friday after Ascension through the Saturday before Pentecost.
 * In the EF calendar: Ascension = Easter+39 (Thursday), novena starts Easter+40 (Friday).
 */
function getHolySpiritNovenaDay(date: Date): number | undefined {
  const year = date.getFullYear()
  const easter = computeEaster(year)
  const novenaStart = addDays(easter, 40) // Friday after Ascension
  const diff = differenceInCalendarDays(normalizeDate(date), normalizeDate(novenaStart))
  if (diff >= 0 && diff < 9) return diff + 1
  return undefined
}

/**
 * Compute which day of the Sacred Heart Novena this is (if any).
 * Runs 9 days ending the day before Sacred Heart feast (Easter+68).
 * So it starts on Easter+59 through Easter+67.
 */
function getSacredHeartNovenaDay(date: Date): number | undefined {
  const year = date.getFullYear()
  const easter = computeEaster(year)
  const novenaStart = addDays(easter, 59)
  const diff = differenceInCalendarDays(normalizeDate(date), normalizeDate(novenaStart))
  if (diff >= 0 && diff < 9) return diff + 1
  return undefined
}

/**
 * Compute which day of the Christmas Novena this is (if any).
 * Dec 16-24 = days 1-9.
 */
function getChristmasNovenaDay(date: Date): number | undefined {
  if (date.getMonth() === 11 && date.getDate() >= 16 && date.getDate() <= 24) {
    return date.getDate() - 15
  }
  return undefined
}

/**
 * Check if date is the Sunday before June 24.
 */
function isSundayBeforeJun24(date: Date): boolean {
  if (date.getDay() !== 0) return false
  const year = date.getFullYear()
  const jun24 = new Date(year, 5, 24)
  const diff = differenceInCalendarDays(normalizeDate(jun24), normalizeDate(date))
  return diff > 0 && diff <= 7
}

/**
 * Check if date is the 3rd Sunday of July.
 */
function is3rdSundayOfJuly(date: Date): boolean {
  if (date.getDay() !== 0) return false
  if (date.getMonth() !== 6) return false
  const dayOfMonth = date.getDate()
  return dayOfMonth >= 15 && dayOfMonth <= 21
}

/**
 * Check if date is the last Sunday of October (EF feast of Christ the King).
 */
function isLastSundayOfOctober(date: Date): boolean {
  if (date.getDay() !== 0) return false
  if (date.getMonth() !== 9) return false
  const dayOfMonth = date.getDate()
  return dayOfMonth >= 25 && dayOfMonth <= 31
}

function expandEntry(
  entry: DayMapEntry | undefined,
  category: ResolvedDayEntry['category'],
): ResolvedDayEntry[] {
  if (!entry) return []
  const result: ResolvedDayEntry[] = [{ id: entry.primary, category }]
  if (entry.secondary) result.push({ id: entry.secondary, category })
  return result
}

// ── Main resolver ──

export function resolveLiturgicalDay(date: Date, map: LiturgicalDayMap): ResolvedDayEntry[] {
  const dateKey = formatDateKey(date)

  // Step 1: Resolve the temporal entry

  const fixedEntry = map.fixedDates[dateKey]
  let temporalEntry: DayMapEntry | undefined

  // 1a. Check novenas (these replace temporal on their days)
  const christmasDay = getChristmasNovenaDay(date)
  if (christmasDay !== undefined) {
    temporalEntry = map.novenas[`christmas/${christmasDay}`]
  }

  if (!temporalEntry) {
    const holySpiritDay = getHolySpiritNovenaDay(date)
    if (holySpiritDay !== undefined) {
      temporalEntry = map.novenas[`holy-spirit/${holySpiritDay}`]
    }
  }

  if (!temporalEntry) {
    const sacredHeartDay = getSacredHeartNovenaDay(date)
    if (sacredHeartDay !== undefined) {
      temporalEntry = map.novenas[`sacred-heart/${sacredHeartDay}`]
    }
  }

  // 1b. Fall back to temporal cycle
  if (!temporalEntry) {
    const pos = getEfLiturgicalPosition(date)
    temporalEntry = map.temporal[pos.key]
  }

  // 1c. Last-resort fallback from reserve pool for uncovered calendar holes.
  if (!temporalEntry) {
    const reserve = getReserveFallbackChapter(date, map)
    if (reserve) temporalEntry = { primary: reserve }
  }

  // 1d. If temporal is still missing, use fixed-date content as fallback.
  if (!temporalEntry && fixedEntry) {
    temporalEntry = fixedEntry
  }

  // Step 2: Check for feast day
  // Movable feasts take precedence over fixed-date feasts
  let feastEntry: DayMapEntry | undefined

  if (isSundayBeforeJun24(date)) {
    feastEntry = map.feasts['movable/sunday-before-jun-24']
  }
  if (!feastEntry && is3rdSundayOfJuly(date)) {
    feastEntry = map.feasts['movable/3rd-sunday-july']
  }
  if (!feastEntry && isLastSundayOfOctober(date)) {
    feastEntry = map.feasts['movable/last-sunday-october']
  }
  if (!feastEntry) {
    feastEntry = map.feasts[dateKey]
  }

  // Step 3: Collect additional entries (deduplicated against temporal)
  const additionalEntries: DayMapEntry[] = []
  const pushAdditional = (entry: DayMapEntry | undefined): void => {
    if (!entry) return
    if (
      temporalEntry &&
      temporalEntry.primary === entry.primary &&
      temporalEntry.secondary === entry.secondary
    )
      return
    if (
      additionalEntries.some(
        (existing) => existing.primary === entry.primary && existing.secondary === entry.secondary,
      )
    )
      return
    additionalEntries.push(entry)
  }

  pushAdditional(fixedEntry)

  const weekdayOfMonthKey = getWeekdayOfMonthKey(date)
  pushAdditional(map.weekdaysOfMonths?.[weekdayOfMonthKey])

  // Build flat array: feast first, then temporal, then additional
  return [
    ...expandEntry(feastEntry, 'feast'),
    ...expandEntry(temporalEntry, 'temporal'),
    ...additionalEntries.flatMap((e) => expandEntry(e, 'additional')),
  ]
}
