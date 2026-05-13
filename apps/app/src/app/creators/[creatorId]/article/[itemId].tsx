import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import type { CreatorChannel } from '@/content/manifestTypes'
import { loadCreator } from '@/content/resolver'
import { getFeedItem } from '@/db/repositories/feedItems'
import { ArticleReader } from '@/features/creators/articles/ArticleReader'

export default function ArticleDetail() {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ creatorId: string; itemId: string }>()
  const itemId = params.itemId ?? ''

  const { data: item } = useQuery({
    queryKey: ['feed-item', itemId],
    queryFn: () => getFeedItem(itemId),
    enabled: !!itemId,
  })

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

  const creator = loadCreator(item.creatorId)
  const channel: CreatorChannel = creator?.channels.find((c) => c.kind === 'rss') ?? {
    kind: 'rss',
  }

  return (
    <ScreenLayout scroll={false}>
      <YStack paddingTop="$lg" paddingHorizontal="$lg">
        <Pressable
          onPress={() => router.back()}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel={t('creators.back')}
        >
          <ChevronLeft size={26} color={theme.accent.val} />
        </Pressable>
      </YStack>
      <ArticleReader item={item} channel={channel} />
    </ScreenLayout>
  )
}
