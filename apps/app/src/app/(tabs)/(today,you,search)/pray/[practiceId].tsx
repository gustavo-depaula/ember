import { useLocalSearchParams } from 'expo-router'
import { PracticeFlow } from '@/features/practices/components/PracticeFlow'

export default function PrayScreen() {
  const { practiceId, programDay, slotKey } = useLocalSearchParams<{
    practiceId: string
    programDay?: string
    slotKey?: string
  }>()
  const parsedProgramDay = programDay !== undefined ? Number(programDay) : undefined
  return (
    // Keyed so switching variant in place (setParams) starts the flow fresh.
    <PracticeFlow
      key={practiceId}
      practiceId={practiceId ?? ''}
      programDay={parsedProgramDay}
      slotKey={slotKey}
    />
  )
}
