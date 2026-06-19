/**
 * Resolve CCC paragraph ranges to English vatican.va page URLs using the static
 * reading-order index (en-pages.json), so the runtime never crawls. The English
 * CCC (ENG0015) is ~374 tiny IntraText pages; a chapter spans several of them.
 */

import enPagesData from './en-pages.json'

type RawPage = [string, number | null, number | null]

const base: string = enPagesData.base
const pages = enPagesData.pages as RawPage[]

function urlFor(file: string): string {
  return `${base}${file}`
}

/**
 * English page URLs covering a chapter's paragraph range, in reading order.
 * Extends backward over the immediately-preceding structural (paragraph-less)
 * pages so the chapter's part/section/chapter heading pages are included —
 * matching the Portuguese page, which carries those headings inline.
 */
export function enPagesForRange(from: number, to: number): string[] {
  let start = -1
  let end = -1
  for (let i = 0; i < pages.length; i++) {
    const [, f, t] = pages[i]
    if (f == null || t == null) continue
    if (t >= from && f <= to) {
      if (start === -1) start = i
      end = i
    }
  }
  if (start === -1) return []
  while (start > 0 && pages[start - 1][1] == null) start--
  const out: string[] = []
  for (let i = start; i <= end; i++) out.push(urlFor(pages[i][0]))
  return out
}

/** English page URLs whose numbered paragraphs intersect [from, to] (no heading pages). */
export function enContentPagesForRange(from: number, to: number): string[] {
  const out: string[] = []
  for (const [file, f, t] of pages) {
    if (f == null || t == null) continue
    if (t >= from && f <= to) out.push(urlFor(file))
  }
  return out
}
