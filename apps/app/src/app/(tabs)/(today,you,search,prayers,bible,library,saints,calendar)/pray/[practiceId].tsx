import { useLocalSearchParams } from 'expo-router'
import { PracticeFlow } from '@/features/practices/components/PracticeFlow'

export default function PrayScreen() {
  const { practiceId, programDay, slotKey, read, dayDate } = useLocalSearchParams<{
    practiceId: string
    programDay?: string
    slotKey?: string
    // Opened to read ahead, not to pray: no Amen, so nothing is logged.
    read?: string
    // The day prayed for, when not today: a missed program day prayed late, or
    // the day Today's scrubber had moved to. The page is that day's (the tab
    // stack provides it as the viewed day), and its Amen logs that date.
    dayDate?: string
  }>()
  const parsedProgramDay = programDay !== undefined ? Number(programDay) : undefined
  return (
    // Keyed so switching variant in place (setParams) starts the flow fresh.
    <PracticeFlow
      key={practiceId}
      practiceId={practiceId ?? ''}
      programDay={parsedProgramDay}
      slotKey={slotKey}
      readOnly={read === '1'}
      dayDate={dayDate}
    />
  )
}
