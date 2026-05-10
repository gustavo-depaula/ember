import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageHeader, PrayerSpinner, ScreenLayout } from '@/components'
import { openExternalUrl } from '@/config/links'
import { bareId } from '@/content/contentIndex'
import type { CreatorChannel, CreatorChannelKind } from '@/content/manifestTypes'
import { loadCreator } from '@/content/resolver'
import { getFeedItemsByCreator } from '@/db/repositories/feedItems'
import { FeedItemList } from '@/features/creators/components/FeedItemList'
import { refreshCreator } from '@/features/creators/feeds/fetcher'
import { useFollow, useIsFollowed, useUnfollow } from '@/features/creators/hooks'
import { localizeContent } from '@/lib/i18n'

const TAB_LABEL_KEY: Record<CreatorChannelKind, string> = {
  podcast: 'creators.tab.listen',
  youtube: 'creators.tab.watch',
  rss: 'creators.tab.read',
}

export default function CreatorProfile() {
  const { t } = useTranslation()
  const params = useLocalSearchParams<{ creatorId: string }>()
  const creatorId = `creator/${bareId(params.creatorId ?? '')}`

  const manifest = useMemo(() => loadCreator(creatorId), [creatorId])

  const channelTabs = useMemo(() => {
    if (!manifest) return []
    const seen = new Set<CreatorChannelKind>()
    return manifest.channels.filter((c) => {
      if (seen.has(c.kind)) return false
      seen.add(c.kind)
      return true
    })
  }, [manifest])

  const [activeKind, setActiveKind] = useState<CreatorChannelKind | undefined>(undefined)
  const effectiveKind = activeKind ?? channelTabs[0]?.kind

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['feed-items', creatorId],
    queryFn: () => getFeedItemsByCreator(creatorId, 50),
    enabled: !!manifest,
  })

  const isFollowed = useIsFollowed(creatorId)
  const followMut = useFollow(creatorId)
  const unfollowMut = useUnfollow(creatorId)

  useEffect(() => {
    if (!manifest) return
    void refreshCreator(creatorId).catch(() => {})
  }, [creatorId, manifest])

  if (!manifest) {
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

  const visibleItems = effectiveKind ? items.filter((i) => i.channelKind === effectiveKind) : items

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={localizeContent(manifest.name)} />

        {manifest.byline && (
          <Text
            fontFamily="$body"
            fontSize="$2"
            color="$colorSecondary"
            textAlign="center"
            paddingHorizontal="$md"
          >
            {localizeContent(manifest.byline)}
          </Text>
        )}

        <YStack alignItems="center">
          <AnimatedPressable
            onPress={() => {
              if (isFollowed) unfollowMut.mutate()
              else followMut.mutate()
            }}
            accessibilityRole="button"
            accessibilityLabel={t(isFollowed ? 'creators.unfollow' : 'creators.follow')}
          >
            <YStack
              paddingHorizontal="$lg"
              paddingVertical="$sm"
              borderRadius={999}
              backgroundColor={isFollowed ? '$accentSubtle' : '$accent'}
              borderWidth={1}
              borderColor="$accent"
            >
              <Text fontFamily="$heading" fontSize="$2" color={isFollowed ? '$accent' : 'white'}>
                {t(isFollowed ? 'creators.following' : 'creators.follow')}
              </Text>
            </YStack>
          </AnimatedPressable>
        </YStack>

        <Text
          fontFamily="$body"
          fontSize="$2"
          color="$color"
          paddingHorizontal="$md"
          lineHeight={22}
        >
          {localizeContent(manifest.bio)}
        </Text>

        {channelTabs.length > 1 && (
          <XStack gap="$sm" paddingHorizontal="$md">
            {channelTabs.map((c: CreatorChannel) => {
              const label = t(TAB_LABEL_KEY[c.kind])
              const active = effectiveKind === c.kind
              return (
                <AnimatedPressable
                  key={c.kind}
                  onPress={() => setActiveKind(c.kind)}
                  accessibilityRole="tab"
                  accessibilityLabel={label}
                >
                  <YStack
                    paddingHorizontal="$md"
                    paddingVertical="$sm"
                    borderRadius="$md"
                    backgroundColor={active ? '$accentSubtle' : 'transparent'}
                    borderWidth={1}
                    borderColor={active ? '$accent' : '$borderColor'}
                  >
                    <Text fontFamily="$heading" fontSize="$1" color={active ? '$accent' : '$color'}>
                      {label}
                    </Text>
                  </YStack>
                </AnimatedPressable>
              )
            })}
          </XStack>
        )}

        <YStack paddingHorizontal="$md">
          {isLoading ? (
            <YStack alignItems="center" padding="$lg">
              <PrayerSpinner size={20} />
            </YStack>
          ) : (
            <FeedItemList items={visibleItems} />
          )}
        </YStack>

        {manifest.links?.website && (
          <YStack alignItems="center" paddingHorizontal="$md">
            <AnimatedPressable
              onPress={() => openExternalUrl(manifest.links?.website)}
              accessibilityRole="link"
              accessibilityLabel={t('creators.openWebsite')}
            >
              <Text fontFamily="$heading" fontSize="$1" color="$accent">
                {t('creators.openWebsite')}
              </Text>
            </AnimatedPressable>
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
