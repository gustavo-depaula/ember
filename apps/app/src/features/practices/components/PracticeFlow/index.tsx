import { useEffect } from 'react'

import { useEventStore } from '@/db/events'
import { askForReviewIfDue, notePrayerOpenDay } from '@/lib/storeReview'
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
  useReviewOnClose(readOnly)
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

// Long enough that the prayer was likely prayed, not just looked into.
const prayedOpenMs = 30_000

/**
 * A prayer kept open a while counts as a day prayed for the store rating, and
 * leaving it is the moment to ask: many people never tap Amen, so the ask
 * after an Amen alone would rarely come.
 */
function useReviewOnClose(readOnly: boolean) {
  useEffect(() => {
    if (readOnly) return
    const openedAt = Date.now()
    return () => {
      if (Date.now() - openedAt < prayedOpenMs) return
      // After the pop, so the rating sheet rises over the screen beneath
      // rather than over the prayer that was just closed.
      setTimeout(() => {
        void notePrayerOpenDay().then(() => askForReviewIfDue(2))
      }, 1200)
    }
  }, [readOnly])
}
