import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { useEventStore } from '@/db/events'
import { advanceIndex, ensureCursor, setIndex } from '@/db/repositories'
import type { Cursor } from '@/db/schema'
import { getCccParagraphs } from '@/lib/catechism'
import { getChapter } from '@/lib/content'

import type { PsalmRef } from './psalter'

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

// --- Content-loading hooks ---

import type { PsalmData } from '@/components/PsalmodyBlock'

export type { PsalmData }

export function usePsalmsForHour(psalms: PsalmRef[], translation: string) {
  const results = useQueries({
    queries: psalms.map((ref) => ({
      queryKey: ['psalm', translation, ref.psalm, ref.verseRange ?? null],
      queryFn: async (): Promise<PsalmData> => {
        const result = await getChapter(translation, 'psalms', ref.psalm)
        let verses = result.verses
        if (ref.verseRange) {
          verses = verses.filter(
            (v) => v.verse >= ref.verseRange?.[0] && v.verse <= ref.verseRange?.[1],
          )
        }
        return { ref, verses }
      },
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const data = results.map((r) => r.data).filter((d): d is PsalmData => d !== undefined)

  return { data, isLoading }
}

export function useBibleReading(
  book: string | undefined,
  chapter: number | undefined,
  translation: string,
) {
  return useQuery({
    queryKey: ['chapter', translation, book, chapter],
    queryFn: () => getChapter(translation, book as string, chapter as number),
    enabled: !!book && !!chapter,
  })
}

export function useCccReading(start: number | undefined, count: number | undefined) {
  return useQuery({
    queryKey: ['ccc', start, count],
    queryFn: () => getCccParagraphs(start as number, count as number),
    enabled: !!start && !!count,
  })
}
