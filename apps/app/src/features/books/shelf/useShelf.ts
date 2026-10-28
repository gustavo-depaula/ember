import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getEntriesByKind, isMetaId } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { localizeContent } from '@/lib/i18n'
import { type ShelfAuthor, type ShelfBook, shelfAuthors, shelfBook } from './catalog'

export type Shelf = {
  books: ShelfBook[]
  authors: ShelfAuthor[]
  authorById: Map<string, ShelfAuthor>
}

/** Every book and author in the catalog, localized, re-derived as the catalog warms. */
export function useShelf(): Shelf {
  const { i18n } = useTranslation()
  const catalogVersion = useCatalogVersion()
  const lang = i18n.language

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  return useMemo(() => {
    const books = getEntriesByKind('book')
      .filter(([id]) => !isMetaId(id))
      .map(([id, entry]) => shelfBook(id, entry, lang, localizeContent))
    const authors = shelfAuthors(getEntriesByKind('author'), books, localizeContent)
    return { books, authors, authorById: new Map(authors.map((a) => [a.id, a])) }
  }, [catalogVersion, lang])
}
