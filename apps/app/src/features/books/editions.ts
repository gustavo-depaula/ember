/**
 * A book's editions: the texts a reader can choose between. Each is one of
 * the book's `languages`. A second translation in one language carries a
 * BCP 47 private-use tag (`en-US-x-pusey`), so chapters, search indexes and
 * the catalog key it exactly like a language; anything that needs the
 * language itself (stemmer, hyphenation, TOC-title fallback) takes
 * `baseLanguage`. The label comes from the edition's `sources` entry.
 */

export type BookEdition = {
  id: string
  language: string
  /** Translator or edition, set when it distinguishes the text ("E. B. Pusey (1838)"). */
  label?: string
}

export function baseLanguage(edition: string): string {
  return edition.split('-x-')[0] ?? edition
}

export function bookEditions(book: {
  languages?: string[]
  sources?: { language: string; label?: string }[]
}): BookEdition[] {
  const langs = book.languages ?? []
  const labels = new Map((book.sources ?? []).map((s) => [s.language, s.label]))
  return langs.map((id) => {
    const language = baseLanguage(id)
    // A label only tells texts apart; a language with one text shows none.
    const shared = langs.filter((l) => baseLanguage(l) === language).length > 1
    return { id, language, label: shared ? labels.get(id) : undefined }
  })
}

/** The edition to read: the one chosen for this book while the book still has
 *  it, else the reader's content language, else the book's first. */
export function resolveEdition(
  langs: readonly string[],
  chosen: string | undefined,
  contentLanguage: string,
): string {
  if (chosen && langs.includes(chosen)) return chosen
  return langs.includes(contentLanguage) ? contentLanguage : (langs[0] ?? 'en-US')
}

export function editionPreferenceKey(bookId: string): string {
  return `book-edition:${bookId}`
}
