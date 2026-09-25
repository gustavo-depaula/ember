import { useLocalSearchParams, useRouter } from 'expo-router'

import { SaintCardViewer } from '@/features/saints/components'

// Full-screen saint-card viewer. A grid card (saints/index) morphs into this
// route via Link.AppleZoom; `index` carries the tapped saint's id, which the
// viewer locates within the wall's current display order.
export default function SaintViewerScreen() {
  const router = useRouter()
  const { index } = useLocalSearchParams<{ index: string }>()

  return <SaintCardViewer initialId={index ?? ''} onClose={() => router.back()} />
}
