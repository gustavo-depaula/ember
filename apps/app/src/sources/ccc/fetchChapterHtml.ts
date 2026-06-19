/**
 * Fetch + convert one CCC chapter to reader HTML from vatican.va.
 *  - Portuguese: a single chapter page → one fetch.
 *  - English: several IntraText pages covering the chapter's paragraph range
 *    (resolved from the static index), fetched with bounded concurrency and
 *    concatenated in reading order.
 */

import { fetchVaticanPage } from '../vatican/fetchPage'
import { enPagesForRange } from './enPages'
import { pageToBookHtml, trimToRange } from './parse'
import { cccLeaf, ptUrlForChapter } from './structure'

const EN_CONCURRENCY = 6

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length)
  let next = 0
  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

export async function fetchCccChapterHtml(chapterId: string, lang: string): Promise<string> {
  const leaf = cccLeaf(chapterId)
  if (!leaf) throw new Error(`ccc: unknown chapter "${chapterId}"`)

  if (lang === 'pt-BR') {
    const url = ptUrlForChapter(chapterId)
    if (!url) throw new Error(`ccc: no pt-BR page for "${chapterId}"`)
    const html = pageToBookHtml(await fetchVaticanPage(url), 'pt-BR')
    if (!html) throw new Error(`ccc: empty pt-BR chapter "${chapterId}"`)
    return html
  }

  const pages = enPagesForRange(leaf.from, leaf.to)
  if (pages.length === 0)
    throw new Error(`ccc: no en-US pages for "${chapterId}" (§${leaf.from}-${leaf.to})`)
  const parts = await mapPool(pages, EN_CONCURRENCY, async (url) =>
    pageToBookHtml(await fetchVaticanPage(url), 'en-US'),
  )
  // Pages straddle chapter boundaries; trim leaked neighbour paragraphs.
  const html = trimToRange(parts.filter(Boolean).join('\n'), leaf.from, leaf.to)
  if (!html) throw new Error(`ccc: empty en-US chapter "${chapterId}"`)
  return html
}
