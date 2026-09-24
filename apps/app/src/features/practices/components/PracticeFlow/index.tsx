import { useEventStore } from '@/db/events'
import { useMinElapsed } from './hooks/useMinElapsed'
import { usePracticeCompletion } from './hooks/usePracticeCompletion'
import { usePracticeContent } from './hooks/usePracticeContent'
import { useSelectOverrides } from './hooks/useSelectOverrides'
import { PracticeFlowView } from './PracticeFlowView'

export function PracticeFlow({
  practiceId,
  programDay: programDayProp,
  slotKey,
}: {
  practiceId: string
  programDay?: number
  slotKey?: string
}) {
  const { selectOverrides, handleSelectOverride } = useSelectOverrides(practiceId, programDayProp)
  const pins = useEventStore((s) => (slotKey ? s.slots.get(slotKey)?.pins : undefined))
  const contentQuery = usePracticeContent(practiceId, programDayProp, pins)
  const completion = usePracticeCompletion(
    practiceId,
    programDayProp,
    contentQuery.data?.renderedSections ?? [],
    selectOverrides,
    slotKey,
  )
  const thresholdElapsed = useMinElapsed(900)

  return (
    <PracticeFlowView
      practiceId={practiceId}
      programDayProp={programDayProp}
      contentQuery={contentQuery}
      completion={completion}
      thresholdElapsed={thresholdElapsed}
      onSelectOverride={handleSelectOverride}
    />
  )
}
