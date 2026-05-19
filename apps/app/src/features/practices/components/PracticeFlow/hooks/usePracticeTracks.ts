import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { loadPracticeData, loadPracticeTracks } from '@/content/resolver'
import { ensurePracticeCursors, useCursorsForPractice } from '@/features/divine-office'

export function usePracticeTracks(practiceId: string) {
  const cycleDataQuery = useQuery({
    queryKey: ['practice-data', practiceId],
    queryFn: async () => (await loadPracticeData(practiceId)) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const trackDefsQuery = useQuery({
    queryKey: ['practice-tracks', practiceId],
    queryFn: async () => (await loadPracticeTracks(practiceId)) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const cycleData = cycleDataQuery.data ?? undefined
  const trackDefs = trackDefsQuery.data ?? undefined

  const cursorRows = useCursorsForPractice(trackDefs ? practiceId : undefined)

  useEffect(() => {
    if (trackDefs) {
      ensurePracticeCursors(practiceId, Object.keys(trackDefs))
    }
  }, [practiceId, trackDefs])

  const trackState = useMemo(() => {
    if (!cursorRows) return undefined
    const state: Record<string, { current_index: number }> = {}
    for (const cursor of cursorRows) {
      const trackName = cursor.id.split('/').pop()
      if (trackName) {
        const position = JSON.parse(cursor.position)
        state[trackName] = { current_index: position.index ?? 0 }
      }
    }
    return state
  }, [cursorRows])

  return { cycleData, trackDefs, trackState }
}
