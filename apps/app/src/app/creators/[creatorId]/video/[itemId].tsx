import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, ExternalLink } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { openExternalUrl } from '@/config/links'
import { getFeedItem } from '@/db/repositories/feedItems'
import { RichDescription } from '@/features/creators/components/RichDescription'
import { YouTubePlayer } from '@/features/creators/video/YouTubePlayer'

export default function VideoDetail() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ itemId: string }>()
  const itemId = params.itemId ?? ''

  const { data: item } = useQuery({
    queryKey: ['feed-item', itemId],
    queryFn: () => getFeedItem(itemId),
    enabled: !!itemId,
  })

  const [embedError, setEmbedError] = useState<number | undefined>(undefined)

  if (!item) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$lg">
          <Text fontFamily="$body" color="$colorSecondary">
            {t('creators.notFound')}
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  const videoId = item.guid
  const webUrl = item.webUrl ?? `https://www.youtube.com/watch?v=${videoId}`
  const date = new Intl.DateTimeFormat(i18n.language || 'en-US', { dateStyle: 'long' }).format(
    new Date(item.publishedAt),
  )
  const hasDescription = !!item.summary?.trim()

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

        {embedError === undefined ? (
          <YouTubePlayer videoId={videoId} onError={setEmbedError} />
        ) : (
          <YStack
            backgroundColor="$backgroundSurface"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            padding="$lg"
            gap="$sm"
            alignItems="center"
          >
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
              {t('creators.videoEmbedFailed')}
            </Text>
            <AnimatedPressable
              onPress={() => openExternalUrl(webUrl)}
              accessibilityRole="link"
              accessibilityLabel={t('creators.openOnYoutube')}
            >
              <XStack
                gap="$sm"
                alignItems="center"
                paddingHorizontal="$md"
                paddingVertical="$sm"
                borderRadius="$md"
                backgroundColor="$accentSubtle"
              >
                <ExternalLink size={16} color={theme.accent.val} />
                <Text fontFamily="$heading" fontSize="$2" color="$accent">
                  {t('creators.openOnYoutube')}
                </Text>
              </XStack>
            </AnimatedPressable>
          </YStack>
        )}

        <YStack gap="$xs" paddingHorizontal="$md">
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {item.title}
          </Text>
          <XStack gap="$md" alignItems="center" flexWrap="wrap">
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {date}
            </Text>
            <AnimatedPressable
              onPress={() => openExternalUrl(webUrl)}
              accessibilityRole="link"
              accessibilityLabel={t('creators.openOnYoutube')}
            >
              <XStack gap="$xs" alignItems="center">
                <ExternalLink size={14} color={theme.accent.val} />
                <Text fontFamily="$heading" fontSize="$1" color="$accent">
                  {t('creators.openOnYoutube')}
                </Text>
              </XStack>
            </AnimatedPressable>
          </XStack>
        </YStack>

        {hasDescription && (
          <YStack flex={1}>
            <RichDescription html={item.summary ?? ''} />
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
