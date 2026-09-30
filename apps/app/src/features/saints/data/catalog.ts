import type { ImageSource } from 'expo-image'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { hearthAssetUrl } from '@/lib/hearth'
import i18n, { localizeContent } from '@/lib/i18n'
import { type HolyCard, useHolyCards } from '../useHolyCards'
import { type SaintOfDayIndex, useSaintOfDayIndex } from '../useSaintOfDayIndex'

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
  /** The saint's Mass formulary ref, whose collect is the card's prayer. */
  proper?: string
  intro?: string
}

function dateKey(month: number, day: number): string {
  return `${month}-${day}`
}

function cardImage(id: string): ImageSource {
  return { uri: hearthAssetUrl(`saints/${id}.webp`) }
}

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

// Both data sources warm in async from Hearth: the bespoke holy cards (small,
// the collected ones with art) and the 366-day Pictorial Lives index (the rest
// of the calendar + each card's life). The catalog builds with either still
// undefined, so the gallery fills in as the blobs land rather than gating on
// both. A card's life is its own `lifeChapter`, never the index's chapter for
// its feast day: the book keeps the pre-1969 calendar, so that day's saint is
// often someone else. The index contributes the plain entries (when uncollected
// silhouettes are shown).
function build(
  cards: HolyCard[] | undefined,
  index: SaintOfDayIndex | undefined,
  lang: string,
): CatalogResult {
  const bespokeDates = new Set((cards ?? []).map((c) => dateKey(c.feast.month, c.feast.day)))

  const indexEntries: SaintEntry[] = []
  for (const [mmdd, entry] of Object.entries(index ?? {})) {
    const month = Number.parseInt(mmdd.slice(0, 2), 10)
    const day = Number.parseInt(mmdd.slice(3, 5), 10)
    const key = dateKey(month, day)
    // A bespoke card owns this day: no silhouette beside the art.
    if (bespokeDates.has(key)) continue
    indexEntries.push({
      id: entry.chapter,
      name: localizeContent(entry.name),
      feast: { month, day },
      feastLabel: feastLabel(month, day, lang),
      lifeChapter: entry.chapter,
      reflection: entry.reflection ? localizeContent(entry.reflection) : undefined,
    })
  }

  const bespokeEntries: SaintEntry[] = (cards ?? []).map((c: HolyCard) => {
    const { month, day } = c.feast
    return {
      id: c.id,
      name: localizeContent(c.name),
      feast: c.feast,
      feastLabel: feastLabel(month, day, lang),
      lifeChapter: c.lifeChapter,
      reflection: c.reflection ? localizeContent(c.reflection) : undefined,
      cardImage: cardImage(c.id),
      patronOf: c.patronOf ? localizeContent(c.patronOf) : undefined,
      prayerExcerpt: c.prayerExcerpt ? localizeContent(c.prayerExcerpt) : undefined,
      proper: c.proper,
      intro: c.intro ? localizeContent(c.intro) : undefined,
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
 * The unified saints catalog. The hand-illustrated cards and the Pictorial
 * Lives index both warm in from Hearth: the index enriches each card's life
 * (and, when shown, the uncollected silhouettes). Both are data-only — adding a
 * card means shipping a Hearth blob + image, not an app release.
 */
export function useSaintsCatalog(): CatalogResult {
  // Subscribe to language changes so localized strings recompute.
  useTranslation()
  const cards = useHolyCards()
  const index = useSaintOfDayIndex()
  const lang = i18n.language || 'en-US'

  return useMemo(() => build(cards, index, lang), [cards, index, lang])
}
