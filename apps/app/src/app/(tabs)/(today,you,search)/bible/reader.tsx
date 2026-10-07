import { useLocalSearchParams } from 'expo-router'

import { BibleReader } from '@/features/bible'

export default function BibleReaderScreen() {
  const { drawer } = useLocalSearchParams<{ drawer?: string }>()
  return <BibleReader initialDrawerOpen={drawer === 'open'} />
}
