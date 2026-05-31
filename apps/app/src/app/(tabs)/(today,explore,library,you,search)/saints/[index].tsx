import { useLocalSearchParams, useRouter } from 'expo-router'

import { SaintCardViewer } from '@/features/saints/components'

// Full-screen saint-card viewer. A grid card (saints/index) morphs into this
// route via Link.AppleZoom; `index` is the card to open first.
export default function SaintViewerScreen() {
  const router = useRouter()
  const { index } = useLocalSearchParams<{ index: string }>()
  const initialIndex = Math.max(0, Number.parseInt(index ?? '0', 10) || 0)

  return <SaintCardViewer initialIndex={initialIndex} onClose={() => router.back()} />
}
