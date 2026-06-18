import type { ImageSource } from 'expo-image'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import i18n, { localizeContent } from '@/lib/i18n'
import { type SaintOfDayIndex, useSaintOfDayIndex } from '../useSaintOfDayIndex'
import { type Saint, saints } from './saints'

// A single saint as it appears in the gallery and the encounter. Display strings
// are pre-localized for the active language (the hook recomputes on language
// change), so card components stay dumb renderers.
export type SaintEntry = {
  id: string
  name: string
  /** Month/day of the feast — the calendar spine. */
  feast?: { month: number; day: number }
  /** Localized "October 1" style label, derived from `feast`. */
  feastLabel?: string
  /** Pictorial Lives chapter id powering the encounter's Life slot. */
  lifeChapter?: string
  reflection?: string
  /** Present only for saints with a generated holy card — the collected ones. */
  cardImage?: ImageSource
  patronOf?: string
  prayerExcerpt?: string
}

// The hand-illustrated cards (the collected ones) carry no structured date in
// their i18n strings, so their feast lives here. Two angels share Sept 29 — a
// date legitimately holds more than one saint.
const bespokeFeast: Record<string, { month: number; day: number }> = {
  therese: { month: 10, day: 1 },
  joseph: { month: 3, day: 19 },
  michael_archangel: { month: 9, day: 29 },
  gabriel_archangel: { month: 9, day: 29 },
  peter: { month: 6, day: 29 },
  john_evangelist: { month: 12, day: 27 },
  john_of_the_cross: { month: 12, day: 14 },
  teresa: { month: 10, day: 15 },
  philomena: { month: 8, day: 11 },
  gianna: { month: 4, day: 28 },
  luke: { month: 10, day: 18 },
  fatima: { month: 5, day: 13 },
  moses_the_black: { month: 8, day: 28 },
  holy_innocents: { month: 12, day: 28 },
  paul: { month: 6, day: 29 },
  john_baptist: { month: 6, day: 24 },
  anne: { month: 7, day: 26 },
  anthony_padua: { month: 6, day: 13 },
  francis_assisi: { month: 10, day: 4 },
  thomas_aquinas: { month: 1, day: 28 },
  augustine: { month: 8, day: 28 },
  jerome: { month: 9, day: 30 },
  ambrose: { month: 12, day: 7 },
  gregory_great: { month: 9, day: 3 },
  john_chrysostom: { month: 9, day: 13 },
  athanasius: { month: 5, day: 2 },
  dominic: { month: 8, day: 8 },
  immaculate_conception: { month: 12, day: 8 },
  assumption: { month: 8, day: 15 },
  annunciation: { month: 3, day: 25 },
  nativity_bvm: { month: 9, day: 8 },
  visitation: { month: 5, day: 31 },
  presentation_bvm: { month: 11, day: 21 },
  nativity_christ: { month: 12, day: 25 },
  epiphany: { month: 1, day: 6 },
  transfiguration: { month: 8, day: 6 },
  exaltation_cross: { month: 9, day: 14 },
  guardian_angels: { month: 10, day: 2 },
  benedict: { month: 7, day: 11 },
  patrick: { month: 3, day: 17 },
  nicholas: { month: 12, day: 6 },
  catherine_siena: { month: 4, day: 29 },
  mary_magdalene: { month: 7, day: 22 },
  monica: { month: 8, day: 27 },
  cecilia: { month: 11, day: 22 },
  agnes: { month: 1, day: 21 },
  ignatius_loyola: { month: 7, day: 31 },
  francis_xavier: { month: 12, day: 3 },
  lucy: { month: 12, day: 13 },
  sebastian: { month: 1, day: 20 },
  george: { month: 4, day: 23 },
  vincent_de_paul: { month: 9, day: 27 },
  alphonsus_liguori: { month: 8, day: 1 },
  bernard_clairvaux: { month: 8, day: 20 },
  bonaventure: { month: 7, day: 15 },
  charles_borromeo: { month: 11, day: 4 },
  philip_neri: { month: 5, day: 26 },
  aloysius_gonzaga: { month: 6, day: 21 },
  rose_lima: { month: 8, day: 23 },
  elizabeth_hungary: { month: 11, day: 17 },
  clare_assisi: { month: 8, day: 11 },
  bridget_sweden: { month: 7, day: 23 },
  margaret_mary: { month: 10, day: 16 },
  stephen: { month: 12, day: 26 },
  mark: { month: 4, day: 25 },
  matthew: { month: 9, day: 21 },
  andrew: { month: 11, day: 30 },
  james_greater: { month: 7, day: 25 },
  bartholomew: { month: 8, day: 24 },
  thomas_apostle: { month: 7, day: 3 },
  matthias: { month: 5, day: 14 },
  simon_jude: { month: 10, day: 28 },
  barnabas: { month: 6, day: 11 },
  philip_james: { month: 5, day: 3 },
}

function dateKey(month: number, day: number): string {
  return `${month}-${day}`
}

// Static — the bespoke feast dates never change, so the membership set is built
// once rather than on every catalog rebuild.
const bespokeDates = new Set(Object.values(bespokeFeast).map((f) => dateKey(f.month, f.day)))

function feastLabel(month: number, day: number, lang: string): string {
  // Year is arbitrary — only month + day are formatted.
  return new Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric' }).format(
    new Date(2001, month - 1, day),
  )
}

// Temporary: until art exists across the full sanctoral, the gallery shows only
// saints that have a generated holy card. Flip to `true` to reveal the index
// silhouettes (uncollected entries) again.
const includeUncollected = false

type CatalogResult = {
  saints: SaintEntry[]
  byId: Record<string, SaintEntry>
  total: number
  collectedCount: number
}

// The hand-illustrated saints (from saints.ts) are synchronous and render
// immediately. The 366-day Pictorial Lives index warms in async from Hearth and
// only enriches things — it hands each bespoke card the life for its feast day,
// and (when uncollected silhouettes are shown) contributes the rest of the
// calendar. So the catalog must build with `index` still undefined, or the
// gallery would flash empty on first visit and "reload" when the index lands.
function build(
  index: SaintOfDayIndex | undefined,
  t: (key: string) => string,
  lang: string,
): CatalogResult {
  const inheritedLife: Record<string, { lifeChapter: string; reflection?: string }> = {}

  const indexEntries: SaintEntry[] = []
  for (const [mmdd, entry] of Object.entries(index ?? {})) {
    const month = Number.parseInt(mmdd.slice(0, 2), 10)
    const day = Number.parseInt(mmdd.slice(3, 5), 10)
    const key = dateKey(month, day)
    const reflection = entry.reflection ? localizeContent(entry.reflection) : undefined
    if (bespokeDates.has(key)) {
      // A bespoke card owns this day — hand its life to the card and drop the
      // plain index entry so the wall doesn't show a silhouette beside the art.
      inheritedLife[key] = { lifeChapter: entry.chapter, reflection }
      continue
    }
    indexEntries.push({
      id: entry.chapter,
      name: localizeContent(entry.name),
      feast: { month, day },
      feastLabel: feastLabel(month, day, lang),
      lifeChapter: entry.chapter,
      reflection,
    })
  }

  const bespokeEntries: SaintEntry[] = saints.map((s: Saint) => {
    const feast = bespokeFeast[s.id]
    const life = feast ? inheritedLife[dateKey(feast.month, feast.day)] : undefined
    return {
      id: s.id,
      name: t(s.nameKey),
      feast,
      feastLabel: feast ? feastLabel(feast.month, feast.day, lang) : t(s.feastDayKey),
      lifeChapter: life?.lifeChapter,
      reflection: life?.reflection,
      cardImage: s.image,
      patronOf: t(s.patronOfKey),
      prayerExcerpt: t(s.prayerExcerptKey),
    }
  })

  const merged = [...bespokeEntries, ...indexEntries].sort(byFeastThenName)
  const all = includeUncollected ? merged : merged.filter((e) => e.cardImage)
  const byId: Record<string, SaintEntry> = {}
  for (const e of all) byId[e.id] = e

  return {
    saints: all,
    byId,
    total: all.length,
    collectedCount: bespokeEntries.length,
  }
}

function byFeastThenName(a: SaintEntry, b: SaintEntry): number {
  const am = a.feast?.month ?? 13
  const bm = b.feast?.month ?? 13
  if (am !== bm) return am - bm
  const ad = a.feast?.day ?? 32
  const bd = b.feast?.day ?? 32
  if (ad !== bd) return ad - bd
  return a.name.localeCompare(b.name)
}

/**
 * The unified saints catalog — the hand-illustrated cards render immediately;
 * the Pictorial Lives index warms in from Hearth and enriches each card's life
 * (and, when shown, the uncollected silhouettes).
 */
export function useSaintsCatalog(): CatalogResult {
  const { t } = useTranslation()
  const index = useSaintOfDayIndex()
  const lang = i18n.language || 'en-US'

  // biome-ignore lint/correctness/useExhaustiveDependencies: t is stable per language; lang captures locale changes.
  return useMemo(() => build(index, t, lang), [index, lang])
}
