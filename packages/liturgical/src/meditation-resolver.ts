import { addDays, differenceInCalendarDays } from 'date-fns'

import { getEfLiturgicalPosition } from './ef-position'
import { computeEaster, normalizeDate } from './season'

// ── Types ──

export type MeditationEntry = {
  primary: string
  secondary?: string
}

export type LiturgicalMeditationMap = {
  temporal: Record<string, MeditationEntry>
  fixedDates: Record<string, MeditationEntry>
  feasts: Record<string, MeditationEntry>
  novenas: Record<string, MeditationEntry>
  appendix: Record<string, MeditationEntry>
  reserves: string[]
}

export type ResolvedMeditation = {
  temporal?: { chapterId: string; secondary?: string }
  feast?: { chapterId: string; secondary?: string }
  source: 'temporal' | 'fixed-date' | 'feast' | 'novena'
}

// ── Helpers ──

function formatDateKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}-${d}`
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

// ── Main resolver ──

export function resolveLiturgicalMeditation(
  date: Date,
  map: LiturgicalMeditationMap,
): ResolvedMeditation {
  const dateKey = formatDateKey(date)

  // Step 1: Resolve the temporal meditation

  // 1a. Check fixed dates (Dec 16-31, Jan 1-10, etc.)
  const fixedEntry = map.fixedDates[dateKey]
  let temporal: ResolvedMeditation['temporal']
  let source: ResolvedMeditation['source'] = 'temporal'

  if (fixedEntry) {
    temporal = { chapterId: fixedEntry.primary, secondary: fixedEntry.secondary }
    source = 'fixed-date'
  } else {
    // 1b. Check novenas (these replace temporal on their days)
    const christmasDay = getChristmasNovenaDay(date)
    if (christmasDay !== undefined) {
      const novenaEntry = map.novenas[`christmas/${christmasDay}`]
      if (novenaEntry) {
        temporal = { chapterId: novenaEntry.primary, secondary: novenaEntry.secondary }
        source = 'novena'
      }
    }

    if (!temporal) {
      const holySpiritDay = getHolySpiritNovenaDay(date)
      if (holySpiritDay !== undefined) {
        const novenaEntry = map.novenas[`holy-spirit/${holySpiritDay}`]
        if (novenaEntry) {
          temporal = { chapterId: novenaEntry.primary, secondary: novenaEntry.secondary }
          source = 'novena'
        }
      }
    }

    if (!temporal) {
      const sacredHeartDay = getSacredHeartNovenaDay(date)
      if (sacredHeartDay !== undefined) {
        const novenaEntry = map.novenas[`sacred-heart/${sacredHeartDay}`]
        if (novenaEntry) {
          temporal = { chapterId: novenaEntry.primary, secondary: novenaEntry.secondary }
          source = 'novena'
        }
      }
    }

    // 1c. Fall back to temporal cycle
    if (!temporal) {
      const pos = getEfLiturgicalPosition(date)
      const temporalEntry = map.temporal[pos.key]
      if (temporalEntry) {
        temporal = { chapterId: temporalEntry.primary, secondary: temporalEntry.secondary }
      }
    }
  }

  // Step 2: Check for feast day
  // Movable feasts take precedence over fixed-date feasts
  let feast: ResolvedMeditation['feast']

  if (isSundayBeforeJun24(date)) {
    const entry = map.feasts['movable/sunday-before-jun-24']
    if (entry) feast = { chapterId: entry.primary, secondary: entry.secondary }
  }
  if (!feast && is3rdSundayOfJuly(date)) {
    const entry = map.feasts['movable/3rd-sunday-july']
    if (entry) feast = { chapterId: entry.primary, secondary: entry.secondary }
  }

  // Fixed-date feasts
  if (!feast) {
    const feastEntry = map.feasts[dateKey]
    if (feastEntry) {
      feast = { chapterId: feastEntry.primary, secondary: feastEntry.secondary }
    }
  }

  return { temporal, feast, source }
}
