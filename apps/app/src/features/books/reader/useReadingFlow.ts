import { useMemo } from 'react'

import type { BookEntry } from '@/content/manifestTypes'
import { flattenReadingFlow, type ReadingNode } from './bookContent'

/**
 * The reading flow for (book, lang) — every paginated page in DFS preorder,
 * chapter leaves plus any Part/Section group node that carries a body for this
 * language — plus a membership set of its ids for the TOC sheet.
 *
 * Computed from the resident BookEntry (its `.chapters` is populated
 * synchronously) so it's ready before the async session resolves.
 * `openBookSession` rebuilds the identical flow to keep foliate indices
 * aligned; the inputs here and there must stay in sync.
 */
export function useReadingFlow(entry: BookEntry | undefined, lang: string) {
  // Depend on the precise fields flattenReadingFlow reads (toc + chapters), not
  // the whole entry — a query refetch returning a fresh object identity then
  // doesn't re-walk a 12k-node TOC when its contents are unchanged.
  const toc = entry?.toc
  const chapters = entry?.chapters
  const flow = useMemo<ReadingNode[]>(
    () => (toc && chapters ? flattenReadingFlow(toc, { chapters }, lang) : []),
    [toc, chapters, lang],
  )
  const readableIds = useMemo(() => new Set(flow.map((n) => n.id)), [flow])
  return { flow, readableIds }
}
