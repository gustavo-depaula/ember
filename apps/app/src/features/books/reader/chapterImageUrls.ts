import type { BookEntry } from '@/content/manifestTypes'
import { blobPath } from '@/content/store'
import { hearthUrl } from '@/lib/hearth'

/**
 * Build a {chapter-relative image path → absolute URL} map for every image
 * declared in a book's manifest. Markdown chapters reference images as either
 * `images/<rel>` or `../images/<rel>`, so we register both keys per image.
 *
 * The returned URLs point at the public Hearth blob endpoint. Offline support
 * for pinned books is Phase 2 (would need an async resolver that prefers the
 * local cache via `blobUri(hash)`).
 */
export function chapterImageUrls(book: BookEntry): Map<string, string> {
  const out = new Map<string, string>()
  for (const img of book.images ?? []) {
    const url = hearthUrl(blobPath(img.hash))
    out.set(`images/${img.rel}`, url)
    out.set(`../images/${img.rel}`, url)
  }
  return out
}
