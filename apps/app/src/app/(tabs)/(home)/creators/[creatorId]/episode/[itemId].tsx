import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { loadCreator } from '@/content/resolver'
import { getFeedItem } from '@/db/repositories/feedItems'
import { AudioPlayerScreen } from '@/features/creators/audio/AudioPlayerScreen'
import { pinnedMediaUri } from '@/features/creators/pinning/mediaDownload'
import { localizeContent } from '@/lib/i18n'
import { useCreatorsStore } from '@/stores/creatorsStore'

export default function EpisodeDetail() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useLocalSearchParams<{ creatorId: string; itemId: string }>()
  const itemId = params.itemId ?? ''

  const { data: item } = useQuery({
    queryKey: ['feed-item', itemId],
    queryFn: () => getFeedItem(itemId),
    enabled: !!itemId,
  })

  const nowPlayingId = useCreatorsStore((s) => s.nowPlaying?.itemId)
  const play = useCreatorsStore((s) => s.play)

  useEffect(() => {
    if (!item?.mediaUrl) return
    if (nowPlayingId === item.itemId) return
    const localUri = item.mediaHash ? pinnedMediaUri(item.mediaHash) : undefined
    const manifest = loadCreator(item.creatorId)
    const creatorName = manifest ? localizeContent(manifest.name) : undefined
    void play({
      itemId: item.itemId,
      creatorId: item.creatorId,
      title: item.title,
      creatorName,
      durationS: item.durationS,
      imageUri: item.imageUrl,
      mediaUrl: localUri ?? item.mediaUrl,
      summary: item.summary,
      webUrl: item.webUrl,
      publishedAt: item.publishedAt,
    }).catch((err) => {
      console.warn('[creators] play failed:', item.itemId, err)
    })
  }, [
    item?.itemId,
    item?.mediaUrl,
    item?.title,
    item?.durationS,
    item?.imageUrl,
    item?.creatorId,
    item?.mediaHash,
    item?.summary,
    item?.webUrl,
    item?.publishedAt,
    nowPlayingId,
    play,
  ])

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

  return <AudioPlayerScreen onBack={() => router.back()} />
}
