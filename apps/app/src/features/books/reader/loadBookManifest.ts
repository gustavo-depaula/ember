import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { BookEntry } from '@/content/manifestTypes'
import { getJson, getText } from '@/content/store'

export type LoadedBookManifest = {
  manifest: BookEntry
  /** Shared book stylesheet from `book.style`, empty string if not present or fetch fails. */
  css: string
}

/**
 * Fetch a book's manifest + shared stylesheet. Uses the warmed in-memory copy
 * if present (deferred-warm path); otherwise fetches the JSON blob.
 */
export async function loadBookManifest(bookId: string): Promise<LoadedBookManifest | undefined> {
  const corpusId = bookId.startsWith('book/') ? bookId : `book/${bookId}`
  const entry = getEntry(corpusId)
  if (!entry) return undefined
  const manifest =
    getRememberedManifest<BookEntry>(entry.hash) ?? (await getJson<BookEntry>(entry.hash))
  const css = manifest.style ? await getText(manifest.style.hash).catch(() => '') : ''
  return { manifest, css }
}
