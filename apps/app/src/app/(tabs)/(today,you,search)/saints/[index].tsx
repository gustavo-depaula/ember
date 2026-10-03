import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { SaintCardViewer } from '@/features/saints/components'

// Full-screen saint-card viewer; `index` carries the tapped saint's id, which
// the viewer locates within the wall's current display order. It rises from
// the bottom as a plain push on the tab's own stack. Not a modal: iOS presents
// a transparentModal over the whole tab, so a book or collection opened from
// the page was pushed beneath it, unseen. Nor in a stack of the saints' own: a
// nested stack drops its top screen when the tab stack pops back to it, so
// going back from a prayer skipped the card.
export default function SaintViewerScreen() {
  const router = useRouter()
  const { index } = useLocalSearchParams<{ index: string }>()
  const { t } = useTranslation()

  return (
    <>
      <Stack.Screen options={{ title: t('saints.title'), animation: 'slide_from_bottom' }} />
      <SaintCardViewer initialId={index ?? ''} onClose={() => router.back()} />
    </>
  )
}
