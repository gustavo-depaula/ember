import { useLocalSearchParams } from 'expo-router'
import { PracticeFlow } from '@/features/practices/components/PracticeFlow'
import { ViewedDayContext } from '@/hooks/useToday'

export default function PrayScreen() {
  const { practiceId, programDay, slotKey, read, dayDate } = useLocalSearchParams<{
    practiceId: string
    programDay?: string
    slotKey?: string
    // Opened to read ahead, not to pray: no Amen, so nothing is logged.
    read?: string
    // The day prayed for, when not today: a missed program day prayed late, or
    // the day Today's scrubber had moved to. The page is that day's, and its
    // Amen logs that date.
    dayDate?: string
  }>()
  const parsedProgramDay = programDay !== undefined ? Number(programDay) : undefined
  return (
    <ViewedDayContext.Provider value={dayDate}>
      {/* Keyed so switching variant in place (setParams) starts the flow fresh. */}
      <PracticeFlow
        key={practiceId}
        practiceId={practiceId ?? ''}
        programDay={parsedProgramDay}
        slotKey={slotKey}
        readOnly={read === '1'}
        dayDate={dayDate}
      />
    </ViewedDayContext.Provider>
  )
}
