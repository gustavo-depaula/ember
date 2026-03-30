import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  advancePracticeTrack,
  ensurePracticeTracks,
  getTracksForPractice,
  setPracticeTrackIndex,
} from '@/db/repositories'
import { getCccParagraphs } from '@/lib/catechism'
import { getChapter } from '@/lib/content'

import type { PsalmRef } from './psalter'

// --- Practice reading track hooks ---

export function useTracksForPractice(practiceId: string | undefined) {
  return useQuery({
    queryKey: ['practiceTracks', practiceId],
    queryFn: () => getTracksForPractice(practiceId!),
    enabled: !!practiceId,
  })
}

export function useAdvanceTrack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      practiceId,
      trackName,
      entryCount,
    }: {
      practiceId: string
      trackName: string
      entryCount: number
    }) => {
      await advancePracticeTrack(practiceId, trackName, entryCount)
    },
    onSuccess: (_data, { practiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['practiceTracks', practiceId] })
    },
  })
}

export function useSetTrackIndex() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      practiceId,
      trackName,
      index,
    }: {
      practiceId: string
      trackName: string
      index: number
    }) => {
      await setPracticeTrackIndex(practiceId, trackName, index)
    },
    onSuccess: (_data, { practiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['practiceTracks', practiceId] })
    },
  })
}

export { ensurePracticeTracks }

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
