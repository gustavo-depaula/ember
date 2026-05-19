import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import type { PracticeManifest } from '@/content/manifestTypes'
import { getManifest, loadFlow, loadPerDayFlow } from '@/content/resolver'
import type { FlowDefinition } from '@/content/types'
import { useProgramProgress, useSlots } from '@/features/plan-of-life'

export function usePractice(practiceId: string, programDayProp?: number) {
  const manifest = getManifest(practiceId)
  const programProgress = useProgramProgress(practiceId, manifest?.program)
  const programDay = programDayProp ?? programProgress?.programDay

  const slots = useSlots()
  const currentSlot = slots.find((s) => s.practice_id === practiceId)

  const flowQuery: UseQueryResult<FlowDefinition | null> = useQuery({
    queryKey: ['flow', practiceId, programDay ?? null],
    queryFn: async () => {
      if (!manifest) return null
      if (manifest.program?.perDayFlows && programDay !== undefined) {
        const dayFlow = await loadPerDayFlow(practiceId, programDay)
        if (dayFlow) return dayFlow
      }
      return (await loadFlow(practiceId)) ?? null
    },
    enabled: !!manifest,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const flow = flowQuery.data ?? undefined

  return {
    manifest: manifest as PracticeManifest | undefined,
    flow,
    flowQuery,
    programDay,
    programProgress,
    currentSlot,
  }
}
