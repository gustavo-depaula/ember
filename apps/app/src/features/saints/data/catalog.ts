import type { ImageSource } from 'expo-image'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { hearthAssetUrl } from '@/lib/hearth'
import i18n, { localizeContent } from '@/lib/i18n'
import { type HolyCard, type HolyCardKind, holyCardKinds, useHolyCards } from '../useHolyCards'

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
  /** For a card with no feast: its gallery section, and its place in it. */
  kind?: HolyCardKind
  order?: number
  /** Pictorial Lives chapter id powering the encounter's Life slot. */
  lifeChapter?: string
  reflection?: string
  /** The card's art, shown once a copy is held. */
  cardImage: ImageSource
  /** The same art at tile size, for the gallery and carousels. */
  cardThumb: ImageSource
  patronOf?: string
  prayerExcerpt?: string
  /** The saint's Mass formulary ref, whose collect is the card's prayer. */
  proper?: string
  intro?: string
}

function cardImage(id: string): ImageSource {
  return { uri: hearthAssetUrl(`saints/${id}.webp`) }
}

function cardThumb(id: string): ImageSource {
  return { uri: hearthAssetUrl(`saints/thumbs/${id}.webp`) }
}

// One formatter per build: Intl constructors are slow on Hermes.
function feastLabeller(lang: string) {
  const format = new Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric' })
  // Only month + day are formatted; a leap year so 29 Feb (St. Oswald) isn't 1 Mar.
  return (month: number, day: number) => format.format(new Date(2000, month - 1, day))
}

type CatalogResult = {
  saints: SaintEntry[]
  byId: Record<string, SaintEntry>
}

// The holy cards warm in from Hearth; the catalog builds empty while they're
// in flight. A card's life is its own `lifeChapter`, never the Pictorial Lives
// chapter for its feast day: the book keeps the pre-1969 calendar, so that
// day's saint is often someone else.
function build(cards: HolyCard[] | undefined, lang: string): CatalogResult {
  const feastLabel = feastLabeller(lang)
  const saints: SaintEntry[] = (cards ?? [])
    .map((c) => ({
      id: c.id,
      name: localizeContent(c.name),
      feast: c.feast,
      feastLabel: c.feast ? feastLabel(c.feast.month, c.feast.day) : undefined,
      kind: c.kind,
      order: c.order,
      lifeChapter: c.lifeChapter,
      reflection: c.reflection ? localizeContent(c.reflection) : undefined,
      cardImage: cardImage(c.id),
      cardThumb: cardThumb(c.id),
      patronOf: c.patronOf ? localizeContent(c.patronOf) : undefined,
      prayerExcerpt: c.prayerExcerpt ? localizeContent(c.prayerExcerpt) : undefined,
      proper: c.proper,
      intro: c.intro ? localizeContent(c.intro) : undefined,
    }))
    .sort(byFeastThenName)
  return { saints, byId: Object.fromEntries(saints.map((e) => [e.id, e])) }
}

// Dated cards in calendar order, then the undated ones section by section.
function byFeastThenName(a: SaintEntry, b: SaintEntry): number {
  if (a.feast && b.feast) {
    return (
      a.feast.month - b.feast.month || a.feast.day - b.feast.day || a.name.localeCompare(b.name)
    )
  }
  if (a.feast || b.feast) return a.feast ? -1 : 1
  return (
    kindIndex(a.kind) - kindIndex(b.kind) ||
    (a.order ?? 0) - (b.order ?? 0) ||
    a.name.localeCompare(b.name)
  )
}

function kindIndex(kind: HolyCardKind | undefined): number {
  return kind ? holyCardKinds.indexOf(kind) : holyCardKinds.length
}

/**
 * The saints with a holy card, localized and in calendar order. Data-only:
 * adding a card means shipping a Hearth blob + image, not an app release.
 */
export function useSaintsCatalog(): CatalogResult {
  // Subscribe to language changes so localized strings recompute.
  useTranslation()
  const cards = useHolyCards()
  const lang = i18n.language || 'en-US'

  return useMemo(() => build(cards, lang), [cards, lang])
}
