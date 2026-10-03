import { eachDayOfInterval, format, subDays } from 'date-fns'
import { useMemo } from 'react'

import { bareId, getEntry, isMetaId } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useEventStore } from '@/db/events'
import { isBackfill, prayedIdOf } from '@/features/plan-of-life'
import { useToday } from '@/hooks/useToday'

/**
 * The practices prayed most often over the last `days` days, most first (ties
 * to the most recently prayed) — or, with `order: 'recent'`, the ones prayed
 * last, newest first. Counts every completion — from the plan or
 * prayed on its own — against the practice it prayed, by bare id, and skips
 * practices without a catalog entry, the hidden examples and `exclude`.
 */
export function useMostPrayed({
  days,
  limit,
  exclude = [],
  order = 'count',
}: {
  days: number
  limit: number
  exclude?: string[]
  order?: 'count' | 'recent'
}): { id: string; entry: CatalogEntry; last: number }[] {
  const catalogVersion = useCatalogVersion()
  const today = useToday()
  const dates = eachDayOfInterval({ start: subDays(today, days - 1), end: today }).map((d) =>
    format(d, 'yyyy-MM-dd'),
  )
  const datesKey = dates.join(',')
  const completions = useEventStore((s) => s.completions)
  const byDate = useEventStore((s) => s.completionsByDate)
  const practices = useEventStore((s) => s.practices)
  const slots = useEventStore((s) => s.slots)
  const excludeKey = exclude.join(',')

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion re-derives as manifests warm; datesKey and excludeKey stand for dates and exclude
  return useMemo(() => {
    const state = { completions, completionsByDate: byDate, practices, slots }
    const tally = new Map<string, { count: number; last: number }>()
    // Only the window's days, through the by-date index — not all of history.
    const inWindow = dates.flatMap((d) => [...(byDate.get(d) ?? [])])
    for (const c of inWindow.flatMap((id) => completions.get(id) ?? [])) {
      if (isBackfill(c)) continue
      // The plan keys some practices by canonical id; the catalog lookup below wants the bare one.
      const id = bareId(prayedIdOf(c, state))
      const t = tally.get(id) ?? { count: 0, last: 0 }
      tally.set(id, { count: t.count + 1, last: Math.max(t.last, c.completed_at) })
    }
    const ranked = [...tally.entries()]
      .filter(([id]) => !exclude.includes(id) && !isMetaId(id))
      .sort(([, a], [, b]) =>
        order === 'recent' ? b.last - a.last : b.count - a.count || b.last - a.last,
      )
    const top: { id: string; entry: CatalogEntry; last: number }[] = []
    for (const [id, { last }] of ranked) {
      if (top.length === limit) break
      const entry = getEntry(`practice/${id}`)
      if (entry) top.push({ id, entry, last })
    }
    return top
  }, [completions, byDate, practices, slots, datesKey, limit, excludeKey, order, catalogVersion])
}
