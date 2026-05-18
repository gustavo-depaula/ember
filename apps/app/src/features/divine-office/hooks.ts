import { useMutation } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { useEventStore } from '@/db/events'
import { advanceIndex, ensureCursor, setIndex } from '@/db/repositories'
import type { Cursor } from '@/db/schema'

// --- Cursor hooks (replaces practice reading tracks) ---

export function useCursorsForPractice(practiceId: string | undefined): Cursor[] {
  return useEventStore(
    useShallow((s) => {
      if (!practiceId) return []
      const prefix = `${practiceId}/`
      const result: Cursor[] = []
      for (const [id, cursor] of s.cursors) {
        if (id.startsWith(prefix)) result.push(cursor)
      }
      return result
    }),
  )
}

export function useAdvanceCursor() {
  return useMutation({
    mutationFn: ({ cursorId, entryCount }: { cursorId: string; entryCount: number }) =>
      advanceIndex(cursorId, entryCount),
  })
}

export function useSetCursorIndex() {
  return useMutation({
    mutationFn: ({ cursorId, index }: { cursorId: string; index: number }) =>
      setIndex(cursorId, index),
  })
}

export async function ensurePracticeCursors(
  practiceId: string,
  trackNames: string[],
): Promise<void> {
  for (const trackName of trackNames) {
    await ensureCursor(`${practiceId}/${trackName}`, '{"index":0}')
  }
}

export type { PsalmSlot } from '@/components/PsalmodyBlock'
