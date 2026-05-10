import { useRouter } from 'expo-router'
import { Pin, PinOff } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import type { FeedItemRow } from '@/db/repositories/feedItems'
import { usePinFeedItem, useUnpinFeedItem } from '@/features/creators/hooks'
import { useCreatorsStore } from '@/stores/creatorsStore'
import { routeFor } from './feedItemRoute'
import { KindIcon } from './KindIcon'

const SECONDS_PER_MIN = 60

function formatDuration(s: number | undefined): string | undefined {
  if (!s) return undefined
  const total = Math.round(s)
  const mins = Math.floor(total / SECONDS_PER_MIN)
  if (mins >= SECONDS_PER_MIN) {
    const hours = Math.floor(mins / SECONDS_PER_MIN)
    const m = mins % SECONDS_PER_MIN
    return `${hours}h${m.toString().padStart(2, '0')}`
  }
  return `${mins} min`
}

function PinButton({ item }: { item: FeedItemRow }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const pin = usePinFeedItem()
  const unpin = useUnpinFeedItem()
  const working = pin.isPending || unpin.isPending
  if (!item.mediaUrl) return null
  return (
    <Pressable
      onPress={() => {
        if (working) return
        if (item.pinned) unpin.mutate(item.itemId)
        else pin.mutate(item.itemId)
      }}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={t(item.pinned ? 'creators.unpin' : 'creators.pin')}
    >
      {item.pinned ? (
        <Pin size={18} color={theme.accent.val} fill={theme.accent.val} />
      ) : (
        <PinOff size={18} color={theme.colorSecondary.val} />
      )}
    </Pressable>
  )
}

export function FeedItemList({ items }: { items: FeedItemRow[] }) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const playingId = useCreatorsStore((s) => s.nowPlaying?.itemId)
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language || 'en-US', { dateStyle: 'medium' }),
    [i18n.language],
  )

  if (items.length === 0) {
    return (
      <YStack padding="$lg" alignItems="center">
        <Text fontFamily="$body" color="$colorSecondary">
          {t('creators.empty')}
        </Text>
      </YStack>
    )
  }

  return (
    <YStack gap="$xs">
      {items.map((item) => {
        const route = routeFor(item)
        const dur = formatDuration(item.durationS)
        const date = dateFmt.format(new Date(item.publishedAt))
        const isPlaying = playingId === item.itemId
        return (
          <AnimatedPressable
            key={item.itemId}
            onPress={() => router.push(route)}
            accessibilityRole="link"
            accessibilityLabel={item.title}
          >
            <XStack
              padding="$md"
              gap="$md"
              backgroundColor={isPlaying ? '$accentSubtle' : '$backgroundSurface'}
              borderRadius="$md"
              borderWidth={1}
              borderColor="$borderColor"
              alignItems="center"
            >
              <KindIcon kind={item.channelKind} size={20} />
              <YStack flex={1} gap={2}>
                <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={2}>
                  {item.title}
                </Text>
                <XStack gap="$sm">
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    {date}
                  </Text>
                  {dur && (
                    <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                      · {dur}
                    </Text>
                  )}
                </XStack>
              </YStack>
              <PinButton item={item} />
            </XStack>
          </AnimatedPressable>
        )
      })}
    </YStack>
  )
}
