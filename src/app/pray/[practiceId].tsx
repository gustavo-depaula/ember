import { useLocalSearchParams } from 'expo-router'
import { PracticeFlow } from '@/features/practices/components/PracticeFlow'

export default function PrayScreen() {
  const { practiceId, flow } = useLocalSearchParams<{ practiceId: string; flow?: string }>()
  return <PracticeFlow practiceId={practiceId ?? ''} flowId={flow} />
}
