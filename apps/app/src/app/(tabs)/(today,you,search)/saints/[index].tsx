import {
  type NativeStackNavigationProp,
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router'
import { useEffect, useState } from 'react'
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
  // `arrived`: replacing the redeem screen, whose page this already shows.
  const { index, arrived } = useLocalSearchParams<{ index: string; arrived?: string }>()
  const { t } = useTranslation()
  // The swap in is unanimated, but a screen leaves by the animation it holds
  // then: once it has landed it takes the slide back, or closing would cut.
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, undefined>>>()
  const [landed, setLanded] = useState(!arrived)
  useEffect(
    () =>
      navigation.addListener('transitionEnd', (e) => {
        if (!e.data.closing) setLanded(true)
      }),
    [navigation],
  )

  return (
    <>
      <Stack.Screen
        options={{
          title: t('saints.title'),
          animation: landed ? 'slide_from_bottom' : 'none',
        }}
      />
      <SaintCardViewer initialId={index ?? ''} onClose={() => router.back()} />
    </>
  )
}
