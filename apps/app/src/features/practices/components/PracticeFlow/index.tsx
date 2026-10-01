import { useEventStore } from '@/db/events'
import { usePracticeCompletion } from './hooks/usePracticeCompletion'
import { usePracticeContent } from './hooks/usePracticeContent'
import { useSelectOverrides } from './hooks/useSelectOverrides'
import { PracticeFlowView } from './PracticeFlowView'

export function PracticeFlow({
  practiceId,
  programDay: programDayProp,
  slotKey,
  readOnly = false,
  dayDate,
}: {
  practiceId: string
  programDay?: number
  slotKey?: string
  readOnly?: boolean
  dayDate?: string
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
    dayDate,
  )

  return (
    <PracticeFlowView
      practiceId={practiceId}
      programDayProp={programDayProp}
      readOnly={readOnly}
      contentQuery={contentQuery}
      completion={completion}
      onSelectOverride={handleSelectOverride}
    />
  )
}
