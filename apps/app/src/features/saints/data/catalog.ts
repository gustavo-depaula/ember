import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { useHolyCards } from '../useHolyCards'
import { buildSaintsCatalog, type SaintsCatalog } from './saintsCatalog'

export {
  type AlbumShelf,
  albumShelves,
  type ContentShelf,
  type SaintEntry,
} from './saintsCatalog'

/**
 * The saints with a holy card, localized and in calendar order. Data-only:
 * adding a card means shipping a Hearth blob + image, not an app release.
 */
export function useSaintsCatalog(): SaintsCatalog {
  // Subscribe to language changes so localized strings recompute.
  useTranslation()
  const cards = useHolyCards()
  const lang = i18n.language || 'en-US'

  return useMemo(() => buildSaintsCatalog(cards, lang), [cards, lang])
}
