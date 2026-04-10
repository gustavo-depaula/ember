import { Pressable } from 'react-native'
import { Text, View, XStack } from 'tamagui'

import { getTranslationLanguage } from '@/lib/bolls'
import { usePreferencesStore } from '@/stores/preferencesStore'

export function LanguageBadge({ code }: { code: string }) {
  return (
    <View
      width={32}
      height={32}
      borderRadius={8}
      backgroundColor="$backgroundSurface"
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <Text fontFamily="$heading" fontSize="$1" color="$accent">
        {code}
      </Text>
    </View>
  )
}

export function TranslationBadge({ onPress }: { onPress: () => void }) {
  const translation = usePreferencesStore((s) => s.translation)
  const language = getTranslationLanguage(translation)

  return (
    <Pressable onPress={onPress}>
      <XStack alignItems="center" gap="$sm">
        <LanguageBadge code={language} />
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          {translation}
        </Text>
      </XStack>
    </Pressable>
  )
}
