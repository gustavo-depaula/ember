import { useLocalSearchParams } from 'expo-router'
import { PracticeFlow } from '@/features/practices/components/PracticeFlow'

export default function PrayScreen() {
  const { practiceId, programDay } = useLocalSearchParams<{
    practiceId: string
    programDay?: string
  }>()
  const parsedProgramDay = programDay !== undefined ? Number(programDay) : undefined
  return <PracticeFlow practiceId={practiceId ?? ''} programDay={parsedProgramDay} />
}
