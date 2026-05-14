import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { useActiveResolution } from '@/features/resolutions'
import { lightTap } from '@/lib/haptics'

/**
 * Home-screen surface for today's daily resolution. Renders nothing when
 * the user has no active daily resolution — keeps the home page clean for
 * fresh installs and days the user hasn't set one. Tap routes to /plan
 * where the user can check in or revise via the Resolutions panel.
 */
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
      <YStack gap={2} paddingHorizontal="$md" paddingVertical="$xs" alignItems="center">
        <XStack gap="$xs" alignItems="baseline">
          <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={1}>
            {t('home.resolutionLabel').toUpperCase()}
          </Text>
        </XStack>
        <Text
          fontFamily="$body"
          fontSize="$3"
          color="$color"
          textAlign="center"
          fontStyle="italic"
          numberOfLines={2}
        >
          {resolution.text}
        </Text>
      </YStack>
    </Pressable>
  )
}
