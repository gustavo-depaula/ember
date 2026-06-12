import { useMinElapsed } from './hooks/useMinElapsed'
import { usePracticeCompletion } from './hooks/usePracticeCompletion'
import { usePracticeContent } from './hooks/usePracticeContent'
import { useSelectOverrides } from './hooks/useSelectOverrides'
import { PracticeFlowView } from './PracticeFlowView'

export function PracticeFlow({
  practiceId,
  programDay: programDayProp,
  slotId,
  completionId,
}: {
  practiceId: string
  programDay?: number
  slotId?: string
  completionId?: string
}) {
  const { selectOverrides, handleSelectOverride } = useSelectOverrides(practiceId, programDayProp)
  const contentQuery = usePracticeContent(practiceId, programDayProp)
  const completion = usePracticeCompletion(
    practiceId,
    programDayProp,
    contentQuery.data?.renderedSections ?? [],
    selectOverrides,
    slotId,
    completionId,
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
