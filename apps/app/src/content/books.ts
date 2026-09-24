/**
 * The one place a book id becomes a manifest and a chapter id becomes text.
 * Both the practice engine (book-backed meditations) and the reader session
 * resolve through here, so canonicalization, residency, external-producer
 * dispatch and image lookup can't drift between the two paths.
 *
 * Book manifests are not warmed at boot. `loadBook` / `loadBooks` fetch on
 * demand and remember the body, after which `getResidentBook` answers
 * synchronously — the engine's sync hooks (chapter titles, book languages)
 * rely on the engine calling `prepareBooks` (wired to `loadBooks`) first.
 */

import { canonicalize, ensureManifestBody, getEntry, getRememberedManifest } from './contentIndex'
import type { BookEntry, CatalogEntry } from './manifestTypes'
import { getText } from './store'

/**
 * Fetches an external book's already-HTML chapter body from its third-party
 * site (caching on-device). Keyed by the book's `source.producer`; each
 * external catalog registers its own at boot.
 */
export type ChapterProducer = (
  bookId: string,
  chapterId: string,
  lang: string,
  url: string,
) => Promise<string>

const producers = new Map<string, ChapterProducer>()

export function registerChapterProducer(producerId: string, load: ChapterProducer): void {
  producers.set(producerId, load)
}

/** The catalog hit for a book (title / languages / hash) — no manifest body. */
export function getBookCatalogEntry(bookId: string): CatalogEntry | undefined {
  const canonical = canonicalize(bookId, 'book')
  const entry = canonical ? getEntry(canonical) : undefined
  return entry?.kind === 'book' ? entry : undefined
}

/** The manifest if already loaded; undefined otherwise (never fetches). */
export function getResidentBook(bookId: string): BookEntry | undefined {
  const entry = getBookCatalogEntry(bookId)
  return entry ? getRememberedManifest<BookEntry>(entry.hash) : undefined
}

/** Resolve a book manifest, fetching on demand and remembering it for sync reads. */
export async function loadBook(bookId: string): Promise<BookEntry | undefined> {
  const entry = getBookCatalogEntry(bookId)
  return entry ? ensureManifestBody<BookEntry>(entry.hash) : undefined
}

/** Make every listed book resident. Unknown ids are skipped. */
export async function loadBooks(bookIds: readonly string[]): Promise<void> {
  await Promise.all([...new Set(bookIds)].map(loadBook))
}

export type ChapterSource = { text: string; format: 'markdown' | 'html' }

/**
 * A chapter's body as authored: bundled chapters read the hashed blob
 * (markdown unless flagged `html`); external chapters come from the book's
 * producer, already HTML. Undefined when the book has no body for this
 * chapter in `lang`.
 */
export async function loadChapterSource(
  book: BookEntry,
  chapterId: string,
  lang: string,
): Promise<ChapterSource | undefined> {
  const ref = book.chapters?.[chapterId]?.[lang]
  if (!ref) return undefined
  if ('type' in ref) {
    const producerId = book.source?.producer ?? ''
    const load = producers.get(producerId)
    if (!load) {
      throw new Error(`No chapter producer "${producerId}" registered (book ${book.id})`)
    }
    return { text: await load(book.id, chapterId, lang, ref.url), format: 'html' }
  }
  return { text: await getText(ref.hash), format: ref.format === 'html' ? 'html' : 'markdown' }
}

export type BookImage = { hash: string; mime: string }

/**
 * The manifest image a chapter's `src` points at. Authors write the same image
 * as `images/<rel>`, `./images/<rel>` or `../images/<rel>`; all resolve alike.
 */
export function findBookImage(book: BookEntry, src: string): BookImage | undefined {
  const rel = /^(?:\.\.?\/)*images\/(.+)$/.exec(src)?.[1]
  return rel ? imageIndex(book).get(rel) : undefined
}

const imageIndexes = new WeakMap<BookEntry, Map<string, BookImage>>()

// Illustrated books carry thousands of images; index them once per manifest.
function imageIndex(book: BookEntry): Map<string, BookImage> {
  let index = imageIndexes.get(book)
  if (!index) {
    index = new Map((book.images ?? []).map((im) => [im.rel, { hash: im.hash, mime: im.mime }]))
    imageIndexes.set(book, index)
  }
  return index
}

/** `corpus://<hash>.<ext>` — what useResolvedImageUri resolves lazily per platform. */
export function corpusImageUri(image: BookImage): string {
  const ext = (image.mime?.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg')
  return `corpus://${image.hash}.${ext}`
}

/**
 * Chapter text for the practice engine: the authored body, with markdown image
 * links (`![alt](../images/<rel>)`) rewritten to `corpus://` URIs so the flow
 * renderer can load them. Fetches the book manifest if it isn't resident.
 */
export async function loadBookChapterText(
  bookId: string,
  chapterId: string,
  lang: string,
): Promise<string | undefined> {
  const book = await loadBook(bookId)
  if (!book) return undefined
  const source = await loadChapterSource(book, chapterId, lang)
  if (!source) return undefined
  if (source.format === 'html' || !book.images?.length) return source.text
  return source.text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    const image = findBookImage(book, src)
    return image ? `![${alt}](${corpusImageUri(image)})` : match
  })
}
