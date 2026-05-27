import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { YStack } from 'tamagui'

import { Typography } from '@/components'
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
        <Typography
          variant="whisper"
          fontSize="$3"
          textAlign="center"
          maxWidth={420}
          numberOfLines={3}
        >
          {resolution.text}
        </Typography>
        <Typography variant="whisper" fontSize="$1" textAlign="center">
          — {t('home.resolutionAttribution')}
        </Typography>
      </YStack>
    </Pressable>
  )
}
