import { useMemo } from 'react'

import type { BookEntry, TocNode } from '@/content/manifestTypes'
import { type ReadingNode, readingFlowOf, tocForLanguage } from './bookContent'

/**
 * The book as read in `lang`: its table of contents narrowed to that language
 * (undefined when the book has none), the reading flow — every paginated page
 * in DFS preorder, chapter leaves plus any Part/Section group node that carries
 * a body for this language — and a membership set of the flow's ids for the
 * TOC sheet.
 *
 * Computed from the resident BookEntry (its `.chapters` is populated
 * synchronously) so it's ready before the async session resolves.
 * `openBookSession` rebuilds the identical flow to keep foliate indices
 * aligned; the inputs here and there must stay in sync.
 */
export function useReadingFlow(entry: BookEntry | undefined, lang: string) {
  // Depend on the precise fields the TOC and flow read (toc + chapters), not
  // the whole entry — a query refetch returning a fresh object identity then
  // doesn't re-walk a 12k-node TOC when its contents are unchanged.
  const fullToc = entry?.toc
  const chapters = entry?.chapters
  const toc = useMemo<TocNode[] | undefined>(
    () => (fullToc ? tocForLanguage(fullToc, { chapters: chapters ?? {} }, lang) : undefined),
    [fullToc, chapters, lang],
  )
  const flow = useMemo<ReadingNode[]>(
    () => (toc && chapters ? readingFlowOf(toc, { chapters }, lang) : []),
    [toc, chapters, lang],
  )
  const readableIds = useMemo(() => new Set(flow.map((n) => n.id)), [flow])
  return { toc, flow, readableIds }
}
