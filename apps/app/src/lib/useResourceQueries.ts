import { type UseQueryOptions, useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

export type ResourceMap<T> = {
  data: Map<string, T>
  retry: Map<string, () => void>
  isLoading: boolean
}

export function useResourceQueries<K, T>(
  keys: K[],
  keyOf: (k: K) => string,
  queryOf: (k: K) => UseQueryOptions<T>,
): ResourceMap<T> {
  // `useQueries` inference degrades on `.map(...)` inputs; the cast pins the
  // result shape so the rest of the function stays generic over `T`.
  const queries = useQueries({
    queries: keys.map(queryOf) as UseQueryOptions<T>[],
  }) as Array<{ data: T | undefined; isError: boolean; isLoading: boolean; refetch: () => void }>

  const data = useMemo(() => {
    const m = new Map<string, T>()
    for (let i = 0; i < keys.length; i++) {
      const d = queries[i]?.data
      if (d !== undefined) m.set(keyOf(keys[i]), d)
    }
    return m
  }, [keys, queries, keyOf])

  const retry = useMemo(() => {
    const m = new Map<string, () => void>()
    for (let i = 0; i < keys.length; i++) {
      const q = queries[i]
      if (q?.isError) m.set(keyOf(keys[i]), () => q.refetch())
    }
    return m
  }, [keys, queries, keyOf])

  const isLoading = queries.some((q) => q.isLoading)
  return { data, retry, isLoading }
}
