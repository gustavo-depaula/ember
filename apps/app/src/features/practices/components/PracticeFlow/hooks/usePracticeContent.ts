import { type FlowContext, resolveFlowAsync } from '@ember/content-engine'
import { type UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query'
import { createEngineContext } from '@/content/engineContext'
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

// Resolves the flow, then preprocesses it into a static primitive tree.
// Returns both stages: `renderedSections` feeds findTrackIds (engine metadata
// is dropped during preprocess); `primitives` is what the renderer consumes.
//
// Select tabs are intentionally NOT an input here: the flow resolves with the
// engine's auto/default pick and materializes every select branch's structure.
// Switching a tab is handled client-side (SelectBranch) so it never re-resolves
// the whole practice.
// `pins` are the plan slot's fixed choices (`{ hour: 'Prima' }`): unlike a tab
// switch they decide what the practice *is* on open, so they do resolve.
export function usePracticeContent(
  practiceId: string,
  programDayProp: number | undefined,
  pins?: Record<string, string>,
): UseQueryResult<PracticeContent> {
  const queryClient = useQueryClient()
  const { manifest, flow, programDay } = usePractice(practiceId, programDayProp)
  const { cycleData, trackDefs, trackState } = usePracticeTracks(practiceId)

  const translation = usePreferencesStore((s) => s.translation)
  const liturgicalCalendar = usePreferencesStore((s) => s.liturgicalCalendar)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const numbering = getPsalmNumbering(translation)

  const now = useToday()
  const todayKey = now.getTime()
  // `now` is the logical day at midnight — hour-mapped selects need the real
  // clock, and keying by it re-resolves the default as the day advances.
  const clockHour = new Date().getHours()

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
      clockHour,
      trackDefs,
      trackState,
      cycleData,
      flow,
      pins ?? null,
    ] as const,
    queryFn: async (): Promise<PracticeContent> => {
      if (!flow) return { renderedSections: [], primitives: [] }
      const context: FlowContext = {
        date: now,
        now: new Date(),
        numbering,
        liturgicalCalendar,
        trackDefs,
        trackState,
        cycleData,
        programDay,
        selectOverrides: pins ?? {},
        templateVars: manifest?.vars,
      }
      const ec = createEngineContext(undefined, { contentLanguage, secondaryLanguage })
      const renderedSections = await resolveFlowAsync(flow, context, ec)
      const primitives = await preprocessFlow(renderedSections, {
        queryClient,
        prefs: { lang: contentLanguage, translation },
        date: now,
        programDay,
      })
      return { renderedSections, primitives }
    },
    enabled: !!flow,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
