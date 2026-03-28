import { useLocalSearchParams } from 'expo-router'
import { PracticeFlow } from '@/features/practices/components/PracticeFlow'

export default function PrayScreen() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>()
  return <PracticeFlow practiceId={practiceId ?? ''} />
}
