import { addDays, isAfter, isBefore, isEqual, startOfDay } from 'date-fns'
import complineHymns from '@/assets/hymns/compline.json'
import eveningHymns from '@/assets/hymns/evening.json'
import morningHymns from '@/assets/hymns/morning.json'
import benedictus from '@/assets/prayers/benedictus.json'
import gloryBe from '@/assets/prayers/glory-be.json'
import magnificat from '@/assets/prayers/magnificat.json'
import antiphonData from '@/assets/prayers/marian-antiphons.json'
import nuncDimittis from '@/assets/prayers/nunc-dimittis.json'
import openingVerse from '@/assets/prayers/opening-verse.json'
import ourFather from '@/assets/prayers/our-father.json'
import type { ReadingProgress } from '@/db/schema'
import type { PsalmNumbering } from '@/lib/bolls'
import { getDrbBooks } from '@/lib/content'
import i18n from '@/lib/i18n'

import { getComplinePsalms, getPsalmsForDay, type PsalmRef } from './psalter'

export type OfficeHour = 'morning' | 'evening' | 'compline'

export type ReadingReference =
  | { type: 'bible'; book: string; bookName: string; chapter: number }
  | { type: 'catechism'; startParagraph: number; count: number }

export type PrayerSection =
  | { type: 'rubric'; label: string }
  | { type: 'prayer'; title: string; text: string }
  | { type: 'hymn'; title: string; latin: string; english: string }
  | { type: 'psalmody'; psalms: PsalmRef[] }
  | { type: 'reading'; reference: ReadingReference }
  | { type: 'canticle'; title: string; subtitle: string; source: string; text: string }
  | { type: 'divider' }
  | { type: 'complete' }

type Antiphon = {
  id: string
  season: string
  title: string
  latin: string
  english: string
  portuguese?: string
}

function localizedText(obj: { english: string; portuguese?: string }): string {
  if (i18n.language === 'pt-BR' && obj.portuguese) return obj.portuguese
  return obj.english
}

export const cccDailyCount = 8

export const readingTypeForHour: Record<OfficeHour, 'ot' | 'nt' | 'catechism'> = {
  morning: 'ot',
  evening: 'nt',
  compline: 'catechism',
}

// --- Liturgical season ---

export function computeEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function getFirstSundayOfAdvent(year: number): Date {
  // First Sunday of Advent: the Sunday on or after November 27
  const nov27 = new Date(year, 10, 27)
  const dayOfWeek = nov27.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  return addDays(nov27, daysUntilSunday)
}

function dateOnOrBefore(date: Date, boundary: Date): boolean {
  return isBefore(date, boundary) || isEqual(startOfDay(date), startOfDay(boundary))
}

function dateOnOrAfter(date: Date, boundary: Date): boolean {
  return isAfter(date, boundary) || isEqual(startOfDay(date), startOfDay(boundary))
}

export function getLiturgicalSeason(date: Date): 'advent' | 'christmas' | 'easter' | 'ordinary' {
  const year = date.getFullYear()
  const d = startOfDay(date)

  const feb1 = new Date(year, 1, 1)
  const feb2 = new Date(year, 1, 2)
  const easter = computeEaster(year)
  const holyWednesday = addDays(easter, -4)
  const pentecost = addDays(easter, 49)
  const adventStart = getFirstSundayOfAdvent(year)

  // Advent of current year through Feb 1 of next year
  if (dateOnOrAfter(d, adventStart)) return 'advent'

  // Jan 1 through Feb 1 — still in previous year's advent/Alma Redemptoris season
  if (dateOnOrBefore(d, feb1)) return 'advent'

  // Feb 2 through Holy Wednesday
  if (dateOnOrAfter(d, feb2) && dateOnOrBefore(d, holyWednesday)) return 'christmas'

  // Easter through Pentecost
  if (dateOnOrAfter(d, easter) && dateOnOrBefore(d, pentecost)) return 'easter'

  // Everything else
  return 'ordinary'
}

// --- Content selectors ---

export function getMarianAntiphon(date: Date): Antiphon {
  const season = getLiturgicalSeason(date)
  const antiphon = antiphonData.antiphons.find((a: { season: string }) => a.season === season)
  // Fallback to Salve Regina
  return antiphon ?? antiphonData.antiphons[3]
}

const hymnsByHour = {
  morning: morningHymns.hymns,
  evening: eveningHymns.hymns,
  compline: complineHymns.hymns,
}

export function getHymnForHour(hour: OfficeHour): {
  title: string
  latin: string
  english: string
} {
  const hymns = hymnsByHour[hour]
  return hymns[0]
}

// --- Reading references ---

export function getTodaysReading(
  type: 'ot' | 'nt' | 'catechism',
  progress: ReadingProgress,
): ReadingReference {
  if (type === 'catechism') {
    return {
      type: 'catechism',
      startParagraph: progress.current_chapter,
      count: cccDailyCount,
    }
  }

  const books = getDrbBooks()
  const book = books.find((b) => b.id === progress.current_book)
  return {
    type: 'bible',
    book: progress.current_book,
    bookName: book?.name ?? progress.current_book,
    chapter: progress.current_chapter,
  }
}

// --- Section builder ---

function buildMorningEvening(
  hour: 'morning' | 'evening',
  date: Date,
  progress: ReadingProgress | null | undefined,
  numbering: PsalmNumbering,
): PrayerSection[] {
  const psalmsForDay = getPsalmsForDay(date, numbering)
  const psalms = hour === 'morning' ? psalmsForDay.morning : psalmsForDay.evening
  const hymn = getHymnForHour(hour)
  const readingType = hour === 'morning' ? 'ot' : 'nt'
  const canticle = hour === 'morning' ? benedictus : magnificat

  const sections: PrayerSection[] = [
    { type: 'rubric', label: i18n.t('rubric.openingVerse') },
    { type: 'prayer', title: openingVerse.title, text: localizedText(openingVerse) },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.hymn') },
    { type: 'hymn', title: hymn.title, latin: hymn.latin, english: localizedText(hymn) },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.psalmody') },
    { type: 'psalmody', psalms },
    { type: 'divider' },
  ]

  if (progress) {
    const reference = getTodaysReading(readingType, progress)
    sections.push(
      { type: 'rubric', label: i18n.t('rubric.scriptureReading') },
      { type: 'reading', reference },
      { type: 'divider' },
    )
  }

  sections.push(
    { type: 'rubric', label: i18n.t('rubric.canticle') },
    {
      type: 'canticle',
      title: canticle.title,
      subtitle: canticle.subtitle,
      source: canticle.source,
      text: localizedText(canticle),
    },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.ourFather') },
    { type: 'prayer', title: ourFather.title, text: localizedText(ourFather) },
    { type: 'divider' },
    { type: 'complete' },
  )

  return sections
}

function buildCompline(
  date: Date,
  progress: ReadingProgress | null | undefined,
  numbering: PsalmNumbering,
): PrayerSection[] {
  const psalms = getComplinePsalms(date, numbering)
  const hymn = getHymnForHour('compline')
  const antiphon = getMarianAntiphon(date)

  const sections: PrayerSection[] = [
    { type: 'rubric', label: i18n.t('rubric.openingVerse') },
    { type: 'prayer', title: openingVerse.title, text: localizedText(openingVerse) },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.hymn') },
    { type: 'hymn', title: hymn.title, latin: hymn.latin, english: localizedText(hymn) },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.psalmody') },
    { type: 'psalmody', psalms },
    { type: 'divider' },
  ]

  if (progress) {
    const reference = getTodaysReading('catechism', progress)
    sections.push(
      { type: 'rubric', label: i18n.t('rubric.reading') },
      { type: 'reading', reference },
      { type: 'divider' },
    )
  }

  sections.push(
    { type: 'rubric', label: i18n.t('rubric.canticle') },
    {
      type: 'canticle',
      title: nuncDimittis.title,
      subtitle: nuncDimittis.subtitle,
      source: nuncDimittis.source,
      text: localizedText(nuncDimittis),
    },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.closingPrayer') },
    { type: 'prayer', title: gloryBe.title, text: localizedText(gloryBe) },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.marianAntiphon') },
    {
      type: 'hymn',
      title: antiphon.title,
      latin: antiphon.latin,
      english: localizedText(antiphon),
    },
    { type: 'divider' },
    { type: 'complete' },
  )

  return sections
}

export function buildPrayerSections(
  hour: OfficeHour,
  date: Date,
  progress: {
    ot?: ReadingProgress | null
    nt?: ReadingProgress | null
    catechism?: ReadingProgress | null
  },
  numbering: PsalmNumbering,
): PrayerSection[] {
  if (hour === 'compline') return buildCompline(date, progress.catechism, numbering)
  const readingProgress = hour === 'morning' ? progress.ot : progress.nt
  return buildMorningEvening(hour, date, readingProgress, numbering)
}
