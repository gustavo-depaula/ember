import { useLocalSearchParams } from 'expo-router'
import { PracticeFlow } from '@/features/practices/components/PracticeFlow'

export default function PrayScreen() {
  const { practiceId, hour } = useLocalSearchParams<{ practiceId: string; hour?: string }>()
  return <PracticeFlow practiceId={practiceId ?? ''} hourId={hour} />
}
