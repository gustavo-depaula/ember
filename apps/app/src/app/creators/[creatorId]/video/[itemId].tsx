import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { YouTubePlayer } from '@/features/creators/video/YouTubePlayer'

export default function VideoDetail() {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ videoId: string }>()
  const videoId = params.videoId ?? ''

  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} paddingVertical="$lg" gap="$md">
        <Pressable
          onPress={() => router.back()}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel={t('creators.back')}
        >
          <ChevronLeft size={26} color={theme.accent.val} />
        </Pressable>
        {videoId ? (
          <YouTubePlayer videoId={videoId} />
        ) : (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text fontFamily="$body" color="$colorSecondary">
              {t('creators.notFound')}
            </Text>
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
