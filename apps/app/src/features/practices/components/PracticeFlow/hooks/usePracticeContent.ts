import { type FlowContext, resolveFlowAsync } from '@ember/content-engine'
import { type UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query'
import { createEngineContext, withSpiritualThreads } from '@/content/engineContext'
import { preprocessFlow } from '@/content/preprocessFlow'
import type { Primitive } from '@/content/primitives'
import type { RenderedSection } from '@/content/types'
import { useToday } from '@/hooks/useToday'
import { getPsalmNumbering } from '@/lib/bolls'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { usePractice } from './usePractice'
import { usePracticeTracks } from './usePracticeTracks'

export type PracticeContent = {
  renderedSections: RenderedSection[]
  primitives: Primitive[]
}

// Single async query: resolve the flow, then preprocess producer-fetched data
// into a static primitive tree. Returns both stages — `renderedSections` is
// needed for findTrackIds (engine metadata is dropped during preprocess);
// `primitives` is what the renderer consumes.
//
// Pulls its sibling hooks (usePractice, usePracticeTracks, preferences, today)
// internally. React Query dedupes the useQuery calls; useToday and zustand
// selectors are idempotent under multiple subscriptions.
//
// `withSpiritualThreads(createEngineContext(...))` runs INSIDE queryFn so the
// store snapshot is fresh per resolve — same semantics as the prior effect.
//
// Select tabs are intentionally NOT an input here: the flow resolves with the
// engine's auto/default pick and materializes every select branch's structure.
// Switching a tab is handled client-side (SelectBranch) so it never re-resolves
// the whole practice. See docs/journal.md.
export function usePracticeContent(
  practiceId: string,
  programDayProp: number | undefined,
): UseQueryResult<PracticeContent> {
  const queryClient = useQueryClient()
  const { flow, programDay } = usePractice(practiceId, programDayProp)
  const { cycleData, trackDefs, trackState } = usePracticeTracks(practiceId)

  const translation = usePreferencesStore((s) => s.translation)
  const liturgicalCalendar = usePreferencesStore((s) => s.liturgicalCalendar)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const numbering = getPsalmNumbering(translation)

  const now = useToday()
  const todayKey = now.getTime()

  return useQuery({
    queryKey: [
      'practice-content',
      practiceId,
      programDay ?? null,
      contentLanguage,
      secondaryLanguage ?? null,
      translation,
      liturgicalCalendar ?? null,
      numbering,
      todayKey,
      trackDefs,
      trackState,
      cycleData,
      flow,
    ] as const,
    queryFn: async (): Promise<PracticeContent> => {
      if (!flow) return { renderedSections: [], primitives: [] }
      const context: FlowContext = {
        date: now,
        numbering,
        liturgicalCalendar,
        trackDefs,
        trackState,
        cycleData,
        programDay,
        selectOverrides: {},
      }
      const ec = withSpiritualThreads(
        createEngineContext(undefined, { contentLanguage, secondaryLanguage }),
      )
      const renderedSections = await resolveFlowAsync(flow, context, ec)
      const primitives = await preprocessFlow(renderedSections, {
        queryClient,
        prefs: { lang: contentLanguage, translation, secondary: secondaryLanguage },
        date: now,
        programDay,
      })
      return { renderedSections, primitives }
    },
    enabled: !!flow,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
