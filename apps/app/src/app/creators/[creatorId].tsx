import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { Mic2 } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { openExternalUrl } from '@/config/links'
import { bareId } from '@/content/contentIndex'
import type { CreatorChannel, CreatorChannelKind } from '@/content/manifestTypes'
import { loadCreator } from '@/content/resolver'
import { getCreatorImage } from '@/db/repositories/creatorMeta'
import { getCreatorAvatarUrl, getFeedItemsByCreator } from '@/db/repositories/feedItems'
import { FeedItemList } from '@/features/creators/components/FeedItemList'
import { FeedItemListSkeleton } from '@/features/creators/components/FeedItemListSkeleton'
import { refreshCreator } from '@/features/creators/feeds/fetcher'
import { useFollow, useIsFollowed, useUnfollow } from '@/features/creators/hooks'
import { localizeContent } from '@/lib/i18n'

const TAB_LABEL_KEY: Record<CreatorChannelKind, string> = {
  podcast: 'creators.tab.listen',
  youtube: 'creators.tab.watch',
  rss: 'creators.tab.read',
}

type YoutubeSubFilter = 'all' | 'videos' | 'shorts'
const YOUTUBE_SUB_FILTERS: YoutubeSubFilter[] = ['videos', 'shorts', 'all']
const YOUTUBE_SUB_LABEL_KEY: Record<YoutubeSubFilter, string> = {
  videos: 'creators.youtubeFilter.videos',
  shorts: 'creators.youtubeFilter.shorts',
  all: 'creators.youtubeFilter.all',
}

const ARTWORK_SIZE = 220

export default function CreatorProfile() {
  const { t } = useTranslation()
  const theme = useTheme()
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
  const [ytSubFilter, setYtSubFilter] = useState<YoutubeSubFilter>('videos')

  const qc = useQueryClient()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['feed-items', creatorId],
    queryFn: () => getFeedItemsByCreator(creatorId, 50),
    enabled: !!manifest,
  })

  const { data: avatarUrl } = useQuery({
    queryKey: ['creator-avatar', creatorId],
    queryFn: async () => {
      const channelImage = await getCreatorImage(creatorId)
      if (channelImage) return channelImage
      return await getCreatorAvatarUrl(creatorId)
    },
    enabled: !!manifest,
    staleTime: 5 * 60 * 1000,
  })

  const isFollowed = useIsFollowed(creatorId)
  const followMut = useFollow(creatorId)
  const unfollowMut = useUnfollow(creatorId)

  const refreshMut = useMutation({
    mutationFn: (opts?: { force?: boolean }) => refreshCreator(creatorId, opts),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed-items', creatorId] }),
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh once when the manifest resolves; creatorId change unmounts this screen via the router.
  useEffect(() => {
    if (!manifest) return
    refreshMut.mutate(undefined)
  }, [manifest])

  async function handlePullToRefresh() {
    await refreshMut.mutateAsync({ force: true }).catch(() => {
      // Error is already surfaced via refreshMut.isError below.
    })
  }

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

  const visibleItems = (() => {
    if (!effectiveKind) return items
    if (effectiveKind === 'youtube') {
      if (ytSubFilter === 'videos') return items.filter((i) => i.channelKind === 'youtube')
      if (ytSubFilter === 'shorts') return items.filter((i) => i.channelKind === 'youtube-short')
      return items.filter((i) => i.channelKind === 'youtube' || i.channelKind === 'youtube-short')
    }
    return items.filter((i) => i.channelKind === effectiveKind)
  })()
  const hasShorts = items.some((i) => i.channelKind === 'youtube-short')

  const name = localizeContent(manifest.name)

  return (
    <ScreenLayout
      padded={false}
      refreshing={refreshMut.isPending}
      onRefresh={handlePullToRefresh}
    >
      <YStack paddingTop="$lg" gap="$xl">
        {/* Hero — large square artwork, title, byline, follow */}
        <YStack alignItems="center" gap="$md" paddingHorizontal="$lg">
          <YStack
            width={ARTWORK_SIZE}
            height={ARTWORK_SIZE}
            borderRadius="$xl"
            overflow="hidden"
            backgroundColor="$accentSubtle"
            alignItems="center"
            justifyContent="center"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.18}
            shadowRadius={16}
          >
            {avatarUrl ? (
              <Image
                source={avatarUrl}
                style={{ width: ARTWORK_SIZE, height: ARTWORK_SIZE }}
                contentFit="cover"
                transition={250}
                accessibilityLabel={name}
              />
            ) : (
              <Mic2 size={72} color={theme.accent.val} />
            )}
          </YStack>

          <Text
            fontFamily="$display"
            fontSize="$5"
            color="$color"
            textAlign="center"
            paddingHorizontal="$md"
            marginTop="$xs"
          >
            {name}
          </Text>

          {manifest.byline && (
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color="$colorSecondary"
              letterSpacing={1.5}
              textTransform="uppercase"
              textAlign="center"
              paddingHorizontal="$md"
            >
              {localizeContent(manifest.byline)}
            </Text>
          )}

          <YStack paddingTop="$xs">
            <AnimatedPressable
              onPress={() => {
                if (isFollowed) unfollowMut.mutate()
                else followMut.mutate()
              }}
              accessibilityRole="button"
              accessibilityLabel={t(isFollowed ? 'creators.unfollow' : 'creators.follow')}
            >
              <XStack
                paddingHorizontal="$xl"
                paddingVertical="$sm"
                borderRadius={999}
                backgroundColor={isFollowed ? '$backgroundSurface' : '$accent'}
                borderWidth={1.5}
                borderColor="$accent"
                minWidth={140}
                justifyContent="center"
              >
                <Text
                  fontFamily="$heading"
                  fontSize="$2"
                  color={isFollowed ? '$accent' : 'white'}
                  letterSpacing={1}
                >
                  {t(isFollowed ? 'creators.following' : 'creators.follow')}
                </Text>
              </XStack>
            </AnimatedPressable>
          </YStack>
        </YStack>

        {/* Bio */}
        <Text
          fontFamily="$body"
          fontSize="$2"
          color="$color"
          paddingHorizontal="$lg"
          lineHeight={24}
        >
          {localizeContent(manifest.bio)}
        </Text>

        {/* Channel tabs */}
        {channelTabs.length > 1 && (
          <XStack gap="$sm" paddingHorizontal="$lg">
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
                    borderRadius={999}
                    backgroundColor={active ? '$accent' : '$backgroundSurface'}
                    borderWidth={1}
                    borderColor={active ? '$accent' : '$borderColor'}
                  >
                    <Text
                      fontFamily="$heading"
                      fontSize="$1"
                      color={active ? 'white' : '$color'}
                      letterSpacing={1}
                    >
                      {label}
                    </Text>
                  </YStack>
                </AnimatedPressable>
              )
            })}
          </XStack>
        )}

        {/* YouTube sub-filter */}
        {effectiveKind === 'youtube' && hasShorts && (
          <XStack gap="$xs" paddingHorizontal="$lg">
            {YOUTUBE_SUB_FILTERS.map((f) => {
              const label = t(YOUTUBE_SUB_LABEL_KEY[f])
              const active = ytSubFilter === f
              return (
                <AnimatedPressable
                  key={f}
                  onPress={() => setYtSubFilter(f)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                >
                  <YStack
                    paddingHorizontal="$md"
                    paddingVertical={6}
                    borderRadius={999}
                    backgroundColor={active ? '$accentSubtle' : 'transparent'}
                    borderWidth={1}
                    borderColor={active ? '$accent' : '$borderColor'}
                  >
                    <Text
                      fontFamily="$heading"
                      fontSize="$1"
                      color={active ? '$accent' : '$colorSecondary'}
                      letterSpacing={1}
                    >
                      {label}
                    </Text>
                  </YStack>
                </AnimatedPressable>
              )
            })}
          </XStack>
        )}

        {/* Refresh error */}
        {refreshMut.isError && (
          <YStack
            marginHorizontal="$lg"
            backgroundColor="$backgroundSurface"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$colorBurgundy"
            padding="$md"
          >
            <Text fontFamily="$heading" fontSize="$1" color="$colorBurgundy">
              {t('creators.refreshFailed')}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" marginTop={4}>
              {refreshMut.error instanceof Error
                ? refreshMut.error.message
                : String(refreshMut.error)}
            </Text>
          </YStack>
        )}

        {/* Episode list */}
        {isLoading || (refreshMut.isPending && items.length === 0) ? (
          <YStack paddingHorizontal="$lg">
            <FeedItemListSkeleton count={5} />
          </YStack>
        ) : (
          <FeedItemList items={visibleItems} />
        )}

        {/* Website link footer */}
        {manifest.links?.website && (
          <YStack alignItems="center" paddingHorizontal="$lg" paddingBottom="$lg">
            <AnimatedPressable
              onPress={() => openExternalUrl(manifest.links?.website)}
              accessibilityRole="link"
              accessibilityLabel={t('creators.openWebsite')}
            >
              <Text
                fontFamily="$heading"
                fontSize="$1"
                color="$accent"
                letterSpacing={1.5}
                textTransform="uppercase"
              >
                {t('creators.openWebsite')}
              </Text>
            </AnimatedPressable>
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
