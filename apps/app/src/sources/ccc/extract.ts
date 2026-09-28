/**
 * Extract a contiguous run of numbered CCC paragraphs from vatican.va, for
 * producer/ccc-chapter.
 */

import { fetchVaticanPage } from '../vatican/fetchPage'
import { enContentPagesForRange } from './enPages'
import { type CccParagraph, extractParagraphs, type Lang, pageToBookHtml } from './parse'
import { cccLeaves, ptUrlForChapter } from './structure'

export type { CccParagraph } from './parse'

async function paragraphsFromPages(urls: string[], lang: Lang): Promise<CccParagraph[]> {
  const out: CccParagraph[] = []
  for (const url of urls)
    out.push(...extractParagraphs(pageToBookHtml(await fetchVaticanPage(url), lang)))
  return out
}

// vatican.va page URLs whose paragraphs intersect [start, end].
function pagesForRange(start: number, end: number, lang: Lang): string[] {
  if (lang === 'en-US') return enContentPagesForRange(start, end)
  return cccLeaves
    .filter((l) => l.to >= start && l.from <= end)
    .map((l) => ptUrlForChapter(l.id))
    .filter((u): u is string => !!u)
}

export async function fetchParagraphs(
  start: number,
  count: number,
  lang: Lang,
): Promise<CccParagraph[]> {
  const end = start + count - 1
  const paras = await paragraphsFromPages(pagesForRange(start, end, lang), lang)

  const seen = new Set<number>()
  const out: CccParagraph[] = []
  for (const p of paras) {
    if (p.number >= start && p.number <= end && !seen.has(p.number)) {
      seen.add(p.number)
      out.push(p)
    }
  }
  return out.sort((a, b) => a.number - b.number)
}
