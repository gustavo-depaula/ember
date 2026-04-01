import { useLocalSearchParams } from 'expo-router'
import { PracticeFlow } from '@/features/practices/components/PracticeFlow'

export default function PrayScreen() {
  const { practiceId, flow, programDay } = useLocalSearchParams<{
    practiceId: string
    flow?: string
    programDay?: string
  }>()
  const parsedProgramDay = programDay !== undefined ? Number(programDay) : undefined
  return <PracticeFlow practiceId={practiceId ?? ''} flowId={flow} programDay={parsedProgramDay} />
}
