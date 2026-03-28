import benedictus from '@/assets/prayers/benedictus.json'
import gloryBe from '@/assets/prayers/glory-be.json'
import magnificat from '@/assets/prayers/magnificat.json'
import nuncDimittis from '@/assets/prayers/nunc-dimittis.json'
import openingVerse from '@/assets/prayers/opening-verse.json'
import ourFather from '@/assets/prayers/our-father.json'
import type { ReadingProgress } from '@/db/schema'
import type { PsalmNumbering } from '@/lib/bolls'
import i18n, { localizeAsset } from '@/lib/i18n'
import {
  cccDailyCount,
  getComplinePsalms,
  getHymnForHour,
  getMarianAntiphon,
  getPsalmsForDay,
  getTodaysReading,
  type ReadingReference,
  readingTypeForHour,
} from '@/lib/liturgical'

import type { PsalmRef } from './psalter'

// Re-export functions consumers depend on via the barrel
export {
  computeEaster,
  getHymnForHour,
  getLiturgicalSeason,
  getMarianAntiphon,
  getTodaysReading,
} from '@/lib/liturgical'
export type { ReadingReference }
export { cccDailyCount, readingTypeForHour }

export type OfficeHour = 'morning' | 'evening' | 'compline'

export type PrayerSection =
  | { type: 'rubric'; label: string }
  | { type: 'prayer'; title: string; text: string }
  | { type: 'hymn'; title: string; latin: string; english: string }
  | { type: 'psalmody'; psalms: PsalmRef[] }
  | { type: 'reading'; reference: ReadingReference }
  | { type: 'canticle'; title: string; subtitle: string; source: string; text: string }
  | { type: 'divider' }
  | { type: 'complete' }

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
    { type: 'prayer', title: openingVerse.title, text: localizeAsset(openingVerse) },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.hymn') },
    { type: 'hymn', title: hymn.title, latin: hymn.latin, english: localizeAsset(hymn) },
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
      text: localizeAsset(canticle),
    },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.ourFather') },
    { type: 'prayer', title: ourFather.title, text: localizeAsset(ourFather) },
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
    { type: 'prayer', title: openingVerse.title, text: localizeAsset(openingVerse) },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.hymn') },
    { type: 'hymn', title: hymn.title, latin: hymn.latin, english: localizeAsset(hymn) },
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
      text: localizeAsset(nuncDimittis),
    },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.closingPrayer') },
    { type: 'prayer', title: gloryBe.title, text: localizeAsset(gloryBe) },
    { type: 'divider' },
    { type: 'rubric', label: i18n.t('rubric.marianAntiphon') },
    {
      type: 'hymn',
      title: antiphon.title,
      latin: antiphon.latin,
      english: localizeAsset(antiphon),
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
