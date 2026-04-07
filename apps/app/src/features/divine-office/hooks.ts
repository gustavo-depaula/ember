import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import { advanceIndex, ensureCursor, getCursorsWithPrefix, setIndex } from '@/db/repositories'
import { getCccParagraphs } from '@/lib/catechism'
import { getChapter } from '@/lib/content'

import type { PsalmRef } from './psalter'

// --- Cursor hooks (replaces practice reading tracks) ---

export function useCursorsForPractice(practiceId: string | undefined) {
  return useQuery({
    queryKey: ['cursors', practiceId],
    queryFn: () => getCursorsWithPrefix(`${practiceId}/`),
    enabled: !!practiceId,
  })
}

export function useAdvanceCursor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ cursorId, entryCount }: { cursorId: string; entryCount: number }) => {
      await advanceIndex(cursorId, entryCount)
    },
    onSuccess: (_data, { cursorId }) => {
      const prefix = cursorId.split('/').slice(0, -1).join('/')
      queryClient.invalidateQueries({ queryKey: ['cursors', prefix] })
    },
  })
}

export function useSetCursorIndex() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ cursorId, index }: { cursorId: string; index: number }) => {
      await setIndex(cursorId, index)
    },
    onSuccess: (_data, { cursorId }) => {
      const prefix = cursorId.split('/').slice(0, -1).join('/')
      queryClient.invalidateQueries({ queryKey: ['cursors', prefix] })
    },
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
            (v) => v.verse >= ref.verseRange![0] && v.verse <= ref.verseRange![1],
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
