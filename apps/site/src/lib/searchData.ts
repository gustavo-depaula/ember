import { buildSearchIndex } from '@/features/practices/searchCatalog'
import type { IndexEntry } from '@/features/practices/searchScore'
import { normalizeForSearch, searchWords } from '@/lib/search'
import { href } from '~/routes'
import { listBibleBooks } from './bible'
import { listEntries, tileFor } from './catalog'
import { bootCorpus } from './corpus'
import { type Locale, withLocale } from './locale'
import { saintsCatalog } from './saints'

/** One searchable page beyond the app's own three kinds: a saint, a Bible book, a reading. */
export type ExtraEntry = {
  kind: 'saint' | 'bible' | 'reading'
  title: string
  words: string[]
  sub?: string
  url: string
}

export type SearchData = {
  /** The app's index (practices, collections, books), each result with its page. */
  catalog: (IndexEntry & { url: string })[]
  extra: ExtraEntry[]
}

const words = (text: string) => searchWords(normalizeForSearch(text))

export async function buildSearchData(locale: Locale): Promise<SearchData> {
  await bootCorpus()
  const [saints, books] = await Promise.all([saintsCatalog(locale), listBibleBooks(locale)])
  return withLocale(locale, () => {
    const catalog = buildSearchIndex().map((entry) => {
      const { kind, id } = entry.result
      const url =
        kind === 'practice'
          ? href.prayer(locale, id)
          : kind === 'book'
            ? href.book(locale, id)
            : href.collection(locale, id)
      // Descriptions make the index several times larger for a weak signal.
      return { ...entry, description: undefined, url }
    })
    const extra: ExtraEntry[] = [
      ...saints.saints.map((saint) => ({
        kind: 'saint' as const,
        title: saint.name,
        words: words(saint.name),
        sub: saint.feastLabel,
        url: href.saint(locale, saint.id),
      })),
      ...books.map((book) => ({
        kind: 'bible' as const,
        title: book.title,
        words: words(`${book.title} ${book.douayName ?? ''}`),
        sub: book.douayName,
        url: href.bibleBook('en-US', book.id),
      })),
      ...listEntries('chapter').flatMap(([id]) => {
        const tile = tileFor(id, locale)
        return tile
          ? [
              {
                kind: 'reading' as const,
                title: tile.title,
                words: words(tile.title),
                sub: tile.subtitle,
                url: tile.href,
              },
            ]
          : []
      }),
    ]
    return { catalog, extra }
  })
}
