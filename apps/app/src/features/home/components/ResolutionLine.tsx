import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { useActiveResolution } from '@/features/resolutions'
import { lightTap } from '@/lib/haptics'

export function ResolutionLine() {
  const { t } = useTranslation()
  const router = useRouter()
  const resolution = useActiveResolution('daily')

  if (!resolution) return null

  return (
    <Pressable
      onPress={() => {
        lightTap()
        router.push('/plan')
      }}
      accessibilityRole="link"
      accessibilityLabel={t('home.resolutionTap', { text: resolution.text })}
      hitSlop={8}
    >
      <YStack alignItems="center" gap="$xs" paddingHorizontal="$lg">
        <Text
          fontFamily="$body"
          fontSize="$3"
          color="$colorSecondary"
          fontStyle="italic"
          textAlign="center"
          maxWidth={420}
          numberOfLines={3}
        >
          {resolution.text}
        </Text>
        <Text fontFamily="$script" fontSize="$1" color="$colorSecondary" textAlign="center">
          — {t('home.resolutionAttribution')}
        </Text>
      </YStack>
    </Pressable>
  )
}
