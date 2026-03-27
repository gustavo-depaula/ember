import { Pressable } from 'react-native'
import { Text, View } from 'tamagui'

import { availableTranslations } from '@/lib/bolls'
import { usePreferencesStore } from '@/stores/preferencesStore'

export function TranslationPill() {
  const translation = usePreferencesStore((s) => s.translation)
  const setTranslation = usePreferencesStore((s) => s.setTranslation)

  function cycle() {
    const currentIndex = availableTranslations.findIndex((t) => t.code === translation)
    const nextIndex = (currentIndex + 1) % availableTranslations.length
    setTranslation(availableTranslations[nextIndex].code)
  }

  return (
    <Pressable onPress={cycle}>
      <View
        backgroundColor="$backgroundSurface"
        borderRadius="$full"
        paddingHorizontal="$md"
        paddingVertical="$xs"
      >
        <Text fontFamily="$heading" fontSize="$1" color="$accent">
          {translation}
        </Text>
      </View>
    </Pressable>
  )
}
