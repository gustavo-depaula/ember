import type { BookEntry, BookVersion, TocNode } from '@/content/manifestTypes'

/**
 * A book's editions: the texts a reader can choose between. A book has a
 * main text (its top-level `toc`, `languages`, `chapters`) and may have other
 * versions — an older translation with its own structure and TOC, in
 * `versions`. An edition is one language of one of them. The label comes
 * from that text's `sources` entry.
 */

export type BookEdition = {
  /** `pt-BR` for the main text, `npnf:en-US` for a version's. */
  id: string
  /** The version; undefined for the main text. */
  version?: string
  language: string
  /** Translator or edition, set when it tells apart texts in one language. */
  label?: string
}

export function editionId(version: string | undefined, language: string): string {
  return version ? `${version}:${language}` : language
}

export function bookEditions(
  book: Pick<BookEntry, 'languages' | 'sources' | 'versions'>,
): BookEdition[] {
  const texts: { version?: string; languages: string[]; sources?: BookEntry['sources'] }[] = [
    { languages: book.languages ?? [], sources: book.sources },
    ...(book.versions ?? []).map((v) => ({
      version: v.id,
      languages: v.languages,
      sources: v.sources,
    })),
  ]
  const perLanguage = new Map<string, number>()
  for (const text of texts) {
    for (const language of text.languages)
      perLanguage.set(language, (perLanguage.get(language) ?? 0) + 1)
  }
  return texts.flatMap(({ version, languages, sources }) => {
    const labels = new Map((sources ?? []).map((s) => [s.language, s.label]))
    return languages.map((language) => ({
      id: editionId(version, language),
      version,
      language,
      // A label only tells texts apart; a language with one text shows none.
      label: (perLanguage.get(language) ?? 0) > 1 ? labels.get(language) : undefined,
    }))
  })
}

/** The edition to read: the one chosen for this book while the book still has
 *  it, else the main text in the reader's content language, else the first. */
export function resolveEdition(
  editions: readonly BookEdition[],
  chosen: string | undefined,
  contentLanguage: string,
): BookEdition | undefined {
  return (
    editions.find((e) => e.id === chosen) ??
    editions.find((e) => !e.version && e.language === contentLanguage) ??
    editions[0]
  )
}

/** The book as one version presents it: that version's TOC, chapters,
 *  languages and search indexes over the book's own metadata. */
export function versionView(book: BookEntry, version: string | undefined): BookEntry {
  const v: BookVersion | undefined = version
    ? book.versions?.find((x) => x.id === version)
    : undefined
  if (!v) return book
  return {
    ...book,
    toc: v.toc,
    chapters: v.chapters,
    languages: v.languages,
    sources: v.sources,
    searchIndex: v.searchIndex,
    anchors: undefined,
  }
}

/** Where a version's reading state (position, bookmarks, highlights,
 *  finished chapters) is kept: its chapters are not the main text's. */
export function readingKey(bookId: string, version: string | undefined): string {
  return version ? `${bookId}~${version}` : bookId
}

/** The book and version a reading key names. */
export function parseReadingKey(key: string): { bookId: string; version?: string } {
  const [bookId = key, version] = key.split('~')
  return { bookId, version }
}

export function editionPreferenceKey(bookId: string): string {
  return `book-edition:${bookId}`
}

function preorder(nodes: TocNode[], out: TocNode[] = []): TocNode[] {
  for (const node of nodes) {
    out.push(node)
    if (node.children) preorder(node.children, out)
  }
  return out
}

/**
 * The node of `to` corresponding to `fromNodeId` in `from` — where switching
 * text lands. A version's node names its main-text counterpart in `match`;
 * a node without one takes the nearest earlier node's (a chapter of a Book
 * lands on that Book). Undefined when nothing corresponds.
 */
export function matchingNode(
  book: BookEntry,
  from: string | undefined,
  fromNodeId: string,
  to: string | undefined,
): string | undefined {
  const nodes = preorder(versionView(book, from).toc ?? [])
  const at = nodes.findIndex((n) => n.id === fromNodeId)
  if (at < 0) return undefined
  const main = (n: TocNode) => (from ? n.match : n.id)
  const anchor = nodes
    .slice(0, at + 1)
    .reverse()
    .map(main)
    .find((id) => id !== undefined)
  if (!anchor) return undefined
  if (!to) return anchor
  return preorder(versionView(book, to).toc ?? []).find((n) => n.match === anchor)?.id
}
