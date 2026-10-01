import { useQuery } from '@tanstack/react-query'

import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { PracticeManifest } from '@/content/manifestTypes'
import { getJson } from '@/content/store'
import type { LocalizedText } from '@/content/types'
import { useCatalogVersion } from '@/content/useCatalogVersion'

// A single bespoke holy card — the hand-illustrated, collected saints. The
// `id` doubles as the image stem (`saints/{id}.webp`). All display strings are
// localized; the feast is the calendar spine the gallery sorts and groups by.
// Seasons, Ember Days, parts of the Mass and liturgical objects have no fixed
// date: they carry no feast and name the gallery section they belong to (`kind`).
// The card names its own Pictorial Lives chapter and Mass formulary rather than
// leaving them to its date: the book keeps the pre-1969 calendar and a date can
// hold several celebrations, so the same day often belongs to someone else.
export type HolyCard = {
  id: string
  feast?: { month: number; day: number }
  /** For a card with no feast: its gallery section, and its place in it. */
  kind?: HolyCardKind
  order?: number
  name: LocalizedText
  patronOf?: LocalizedText
  prayerExcerpt?: LocalizedText
  /** Pictorial Lives chapter telling this saint's life. */
  lifeChapter?: string
  /** That chapter's closing reflection, copied in at corpus build. */
  reflection?: LocalizedText
  /** Id of the OF Mass formulary proper to the feast: its collect shows on the card, and Mass on it gives the card. */
  proper?: string
  /** Two or three sentences introducing the saint, read before praying to open the card. */
  intro?: LocalizedText
}

/** The gallery sections of the cards with no fixed date, in the order they show. */
export const holyCardKinds = ['moveable', 'rosary', 'season', 'mass', 'object', 'devotion'] as const
export type HolyCardKind = (typeof holyCardKinds)[number]

type HolyCardsData = {
  version: number
  cards: HolyCard[]
  // Apart from `cards`, which apps released before these cards read expecting a feast on each.
  undated?: HolyCard[]
}

const DATA_NAME = 'holy-cards'

/**
 * The bespoke holy-card catalog and the pool of starter cards offered on first
 * open. Served on the saint-of-the-day practice (the cards as one small blob,
 * fetched once on demand), so new cards ship through Hearth (data + image)
 * rather than an app release. Undefined while the catalog warms or the blob is
 * in flight.
 */
export function useHolyCardCatalog(): { cards: HolyCard[]; starters: string[] } | undefined {
  const catalogVersion = useCatalogVersion()
  const { data } = useQuery({
    queryKey: ['holy-cards', catalogVersion],
    queryFn: async () => {
      const entry = getEntry('practice/saint-of-the-day')
      // null, not undefined: Query v5 rejects undefined data while the catalog warms.
      if (!entry) return null
      const manifest = getRememberedManifest<PracticeManifest>(entry.hash)
      const ref = manifest?.dataHashes?.find((d) => d.name === DATA_NAME)
      if (!ref) return null
      const parsed = await getJson<HolyCardsData>(ref.hash)
      if (!parsed) return null
      return {
        cards: [...parsed.cards, ...(parsed.undated ?? [])],
        starters: manifest?.holyCardStarters ?? [],
      }
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}

/** The bespoke holy cards — name, feast, patron, and prayer for every hand-illustrated saint. */
export function useHolyCards(): HolyCard[] | undefined {
  return useHolyCardCatalog()?.cards
}
