import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, View, XStack } from 'tamagui'

import { findTranslation } from '@/lib/bibleTranslations'
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
  const { t } = useTranslation()
  const translation = usePreferencesStore((s) => s.translation)
  const language = findTranslation(translation)?.language ?? ''

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.selectTranslation')}
      accessibilityValue={{ text: translation }}
    >
      <XStack alignItems="center" gap="$sm">
        <LanguageBadge code={language} />
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          {translation}
        </Text>
      </XStack>
    </Pressable>
  )
}
