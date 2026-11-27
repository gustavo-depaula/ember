import { useCallback, useEffect, useMemo, useRef } from 'react'

import { normalizeForSearch } from '@/lib/search'
import { type Counts, track } from '@/lib/usage'

// What a search counts: the words someone settled on, how much they found, the
// first few results shown and the one they opened. Typing passes through every
// prefix of a word on its way ("r", "ro", "ros"…), and a pause mid-word is not
// a search, so a query waits until the next one is neither a longer nor a
// shorter form of it, or until it is opened or left, and only then is counted.

type Scope = Counts['search']['scope']
export type Shown = { results: number; top: string[] }

const shownTop = 5
const longest = 60

/** The query as it is counted, or undefined for one that is too short to mean
 * anything or looks like something personal: an address, a phone number. */
export function cleanQuery(raw: string): string | undefined {
  const q = normalizeForSearch(raw).slice(0, longest).trim()
  if (q.length < 2) return undefined
  if (/@|https?:|www\./.test(q)) return undefined
  if ((q.match(/\d/g)?.length ?? 0) >= 5) return undefined
  return q
}

const related = (a: string, b: string) => a.startsWith(b) || b.startsWith(a)

export function searchCounter(scope: Scope, emit: (props: Counts['search']) => void) {
  let pending: { q: string; shown: Shown } | undefined
  const props = (q: string, shown: Shown, opened?: string, at?: number): Counts['search'] => {
    const top = shown.top.slice(0, shownTop).join(',')
    return {
      scope,
      q,
      results: String(shown.results),
      ...(top ? { top } : {}),
      ...(opened ? { opened, at: String(at) } : {}),
    }
  }
  const flush = () => {
    if (pending) emit(props(pending.q, pending.shown))
    pending = undefined
  }
  return {
    /** The results for `raw` are on screen and typing has paused. */
    settle(raw: string, shown: Shown) {
      const q = cleanQuery(raw)
      if (!q) return
      if (pending && !related(pending.q, q)) flush()
      pending = { q, shown }
    },
    /** A result was opened: `position` counts from 1. */
    open(raw: string, shown: Shown, id: string, position: number) {
      const q = cleanQuery(raw)
      if (pending && (!q || !related(pending.q, q))) flush()
      pending = undefined
      if (q) emit(props(q, shown, id, position))
    },
    /** The search was cleared or left. */
    end: flush,
  }
}

/**
 * Counts a search box: settles `query` after a pause, ends with the screen. Call
 * `opened` with a result's id and its place in the list as it is tapped. While
 * `ready` is false the results are still on their way and nothing settles.
 */
export function useSearchUsage(scope: Scope, query: string, ids: string[], ready = true) {
  const counter = useMemo(() => searchCounter(scope, (props) => track('search', props)), [scope])
  useEffect(() => counter.end, [counter])
  const shown = useRef<Shown>({ results: 0, top: [] })
  shown.current = { results: ids.length, top: ids.slice(0, shownTop) }
  const typed = useRef(query)
  typed.current = query
  const key = `${query}\n${ids.slice(0, shownTop).join(',')}\n${ids.length}`
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` names what settles; the rest is read through refs.
  useEffect(() => {
    if (!ready) return
    if (!query.trim()) {
      counter.end()
      return
    }
    const timer = setTimeout(() => counter.settle(query, shown.current), 1200)
    return () => clearTimeout(timer)
  }, [key, counter, ready])
  // Stable, so memoized result rows keep their memo.
  return useCallback(
    (id: string, position: number) => counter.open(typed.current, shown.current, id, position),
    [counter],
  )
}
