/**
 * Per-device cache of Catechism + Compendium chapter HTML scraped from
 * vatican.va. Backed by the shared `external_content` store, keyed by book id
 * (`ccc` / `compendium`) + chapter id + language. A chapter is fetched once on
 * first open, then read offline. (The BookEntry manifests are static and built
 * in memory by cccCatalog, so they aren't cached here.)
 */

import { getExternalContent, putExternalContent } from './externalContent'

const producerId = 'producer/ccc-book'
// Bump to invalidate cached chapters when the scrape/parse pipeline changes.
const producerVersion = '1'

const key = (bookId: string, chapterId: string, lang: string) => ({
  producerId,
  producerVersion,
  lang,
  cacheKey: bookId,
  paramsKey: chapterId,
})

export async function getCccChapterHtml(
  bookId: string,
  chapterId: string,
  lang: string,
): Promise<string | undefined> {
  return (await getExternalContent<string>(key(bookId, chapterId, lang)))?.payload
}

export function putCccChapterHtml(
  bookId: string,
  chapterId: string,
  lang: string,
  html: string,
): Promise<void> {
  return putExternalContent<string>(key(bookId, chapterId, lang), html)
}
