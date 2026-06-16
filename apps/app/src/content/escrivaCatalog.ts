/**
 * Runtime registration of St. Josemaría Escrivá's works as *external* books —
 * present in the catalog and reader but never stored in Hearth.
 *
 *  - `registerEscrivaCatalog()` (sync, no network) seeds the catalog entries +
 *    the collection so tiles appear instantly, and installs the manifest
 *    resolver so an unwarmed book builds on demand.
 *  - `warmEscrivaBooks()` builds each `BookEntry` (toc + external chapter refs)
 *    from the API in the background, caching it in SQLite for instant relaunch.
 *  - `loadEscrivaChapterHtml()` is the on-demand chapter loader used by the
 *    reader's external-ref branch (cache-or-fetch).
 */

import {
  getEscrivaBookEntry,
  getEscrivaChapterHtml,
  putEscrivaBookEntry,
  putEscrivaChapterHtml,
} from '@/db/repositories/escrivaContent'
import { fetchChapterHtml, fetchChapterList, fetchPointRanges } from '@/lib/escriva'
import { registerLocalEntries, rememberManifestBody, setManifestBodyResolver } from './contentIndex'
import {
  type EscrivaWork,
  escrivaAuthor,
  escrivaBookHashPrefix,
  escrivaCollection,
  escrivaCollectionHash,
  escrivaCollectionId,
  escrivaHomepage,
  escrivaProducerId,
  escrivaWorkBySlug,
  escrivaWorkLanguages,
  escrivaWorks,
} from './escrivaWorks'
import type { BookEntry, CatalogEntry, TocNode } from './manifestTypes'
import type { LocalizedText } from './types'

function bookHash(slug: string): string {
  return `${escrivaBookHashPrefix}${slug}`
}

/** Seed catalog entries (sync) + install the on-demand manifest resolver. */
export function registerEscrivaCatalog(): void {
  const entries: Record<string, CatalogEntry> = {}

  for (const work of escrivaWorks) {
    entries[`book/${work.slug}`] = {
      kind: 'book',
      hash: bookHash(work.slug),
      size: 0,
      langs: escrivaWorkLanguages(work),
      name: work.name,
      author: escrivaAuthor,
      description: work.description,
    }
  }

  entries[escrivaCollectionId] = {
    kind: 'collection',
    hash: escrivaCollectionHash,
    size: 0,
    langs: escrivaCollection.languages,
    name: escrivaCollection.name,
    description: escrivaCollection.description,
    icon: escrivaCollection.icon,
    itemCount: escrivaWorks.length,
  }

  rememberManifestBody(escrivaCollectionHash, escrivaCollection)
  registerLocalEntries(entries)

  setManifestBodyResolver(async (hash) => {
    if (!hash.startsWith(escrivaBookHashPrefix)) return undefined
    return ensureEscrivaBookEntry(hash.slice(escrivaBookHashPrefix.length))
  })
}

const inflightBookBuilds = new Map<string, Promise<BookEntry | undefined>>()

/**
 * Build (or load from cache) the external `BookEntry` for one work: fetch each
 * language's chapter list, zip them by ordinal into a shared TOC, and point each
 * chapter ref at the API url whose body the reader fetches on open. Remembered
 * in-memory so synchronous resolvers (`getBookEntry`) see it thereafter.
 */
export async function ensureEscrivaBookEntry(slug: string): Promise<BookEntry | undefined> {
  const work = escrivaWorkBySlug(slug)
  if (!work) return undefined

  const cached = await getEscrivaBookEntry(slug)
  if (cached) {
    rememberManifestBody(bookHash(slug), cached)
    return cached
  }

  const existing = inflightBookBuilds.get(slug)
  if (existing) return existing

  const build = (async () => {
    const entry = await buildBookEntry(work)
    rememberManifestBody(bookHash(slug), entry)
    await putEscrivaBookEntry(slug, entry)
    return entry
  })().finally(() => inflightBookBuilds.delete(slug))

  inflightBookBuilds.set(slug, build)
  return build
}

async function buildBookEntry(work: EscrivaWork): Promise<BookEntry> {
  const langs = escrivaWorkLanguages(work)
  const perLang = await Promise.all(
    langs.map(async (lang) => {
      const src = work.sources[lang as 'en-US' | 'pt-BR']
      if (!src) return { lang, chapters: [] }
      const chapters = await fetchChapterList(src.siteId, src.bookId, src.group)
      return { lang, chapters }
    }),
  )

  // Maxims books (The Way / Furrow / The Forge) show each chapter's point-number
  // range in the TOC. Numbers are language-agnostic, so one pass over the primary
  // language's points suffices; best-effort — a failure must not break the book.
  const primaryLang = langs[0]
  const primary = work.sources[primaryLang as 'en-US' | 'pt-BR']
  let ranges: Awaited<ReturnType<typeof fetchPointRanges>> | undefined
  if (work.maxims && primary) {
    try {
      ranges = await fetchPointRanges(primary.siteId, primary.bookId)
    } catch (err) {
      console.warn(`[escriva] point ranges ${work.slug} failed:`, err)
    }
  }
  const primaryChapters = perLang.find((p) => p.lang === primaryLang)?.chapters ?? []

  const maxLen = perLang.reduce((n, p) => Math.max(n, p.chapters.length), 0)
  const toc: TocNode[] = []
  const chapters: BookEntry['chapters'] = {}

  for (let i = 0; i < maxLen; i++) {
    const chapterId = `ch-${i}`
    const title: LocalizedText = {}
    const refs: Record<string, { type: 'external'; url: string }> = {}
    for (const { lang, chapters: list } of perLang) {
      const ch = list[i]
      if (!ch) continue
      ;(title as Record<string, string>)[lang] = ch.name
      refs[lang] = { type: 'external', url: ch.bodyUrl }
    }
    const apiId = primaryChapters[i]?.apiId
    const pointRange = apiId !== undefined ? ranges?.get(apiId) : undefined
    toc.push(pointRange ? { id: chapterId, title, pointRange } : { id: chapterId, title })
    chapters[chapterId] = refs
  }

  return {
    id: work.slug,
    name: work.name,
    author: escrivaAuthor,
    description: work.description,
    languages: langs,
    toc,
    chapters,
    source: { type: 'external', producer: escrivaProducerId, homepage: escrivaHomepage },
  }
}

/** Background warmer: build every book's manifest (cached after first run). */
export async function warmEscrivaBooks(): Promise<void> {
  await Promise.all(
    escrivaWorks.map((work) =>
      ensureEscrivaBookEntry(work.slug).catch((err) => {
        console.warn(`[escriva] warm ${work.slug} failed:`, err)
      }),
    ),
  )
}

/** Cache-or-fetch a chapter's body HTML for the reader's external-ref branch. */
export async function loadEscrivaChapterHtml(
  slug: string,
  chapterId: string,
  lang: string,
  bodyUrl: string,
): Promise<string> {
  const cached = await getEscrivaChapterHtml(slug, chapterId, lang)
  if (cached !== undefined) return cached
  const html = await fetchChapterHtml(bodyUrl)
  await putEscrivaChapterHtml(slug, chapterId, lang, html)
  return html
}
