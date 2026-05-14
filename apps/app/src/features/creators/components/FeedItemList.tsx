/**
 * Apple-Podcasts-shaped episode list. Each row:
 *   - date (small caps, secondary)
 *   - title (display, 2 lines)
 *   - summary preview (body, 2 lines, secondary; HTML stripped)
 *   - bottom row: filled play pill with duration | pin icon | thumbnail (right)
 * Rows are full-bleed with a hairline separator — no per-row card border.
 */

import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Pin, PinOff, Play } from 'lucide-react-native'
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

const THUMB_SIZE = 72
const SECONDS_PER_MIN = 60

function formatDuration(s: number | undefined): string | undefined {
  if (!s) return undefined
  const total = Math.round(s)
  const mins = Math.floor(total / SECONDS_PER_MIN)
  if (mins >= SECONDS_PER_MIN) {
    const hours = Math.floor(mins / SECONDS_PER_MIN)
    const m = mins % SECONDS_PER_MIN
    return `${hours}h ${m.toString().padStart(2, '0')}m`
  }
  return `${mins} min`
}

function stripHtml(s: string | undefined): string {
  if (!s) return ''
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
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
      hitSlop={14}
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

function PlayPill({ item, onPress }: { item: FeedItemRow; onPress: () => void }) {
  const { t } = useTranslation()
  const dur = formatDuration(item.durationS)
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('creators.play')}
    >
      <XStack
        gap="$xs"
        alignItems="center"
        paddingHorizontal="$md"
        paddingVertical={7}
        borderRadius={999}
        backgroundColor="$accent"
      >
        <Play size={13} color="white" fill="white" />
        {dur && (
          <Text fontFamily="$heading" fontSize={12} color="white" letterSpacing={0.5}>
            {dur}
          </Text>
        )}
      </XStack>
    </AnimatedPressable>
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
      <YStack padding="$xl" alignItems="center">
        <Text fontFamily="$body" color="$colorSecondary" textAlign="center">
          {t('creators.noFeedItems')}
        </Text>
      </YStack>
    )
  }

  return (
    <YStack marginHorizontal={-24}>
      {items.map((item, idx) => {
        const route = routeFor(item)
        const date = dateFmt.format(new Date(item.publishedAt))
        const isPlaying = playingId === item.itemId
        const summaryText = stripHtml(item.summary)
        const open = () => router.push(route)
        return (
          <YStack
            key={item.itemId}
            paddingHorizontal="$lg"
            paddingVertical="$md"
            gap="$sm"
            backgroundColor={isPlaying ? '$accentSubtle' : '$background'}
            borderTopWidth={idx === 0 ? 0 : 1}
            borderTopColor="$borderColor"
          >
            <AnimatedPressable
              onPress={open}
              accessibilityRole="link"
              accessibilityLabel={item.title}
            >
              <XStack gap="$md" alignItems="flex-start">
                <YStack flex={1} gap={6}>
                  <Text
                    fontFamily="$heading"
                    fontSize="$1"
                    color="$colorSecondary"
                    letterSpacing={1.2}
                    textTransform="uppercase"
                  >
                    {date}
                  </Text>
                  <Text
                    fontFamily="$display"
                    fontSize="$3"
                    color="$color"
                    numberOfLines={2}
                    lineHeight={22}
                  >
                    {item.title}
                  </Text>
                  {summaryText.length > 0 && (
                    <Text
                      fontFamily="$body"
                      fontSize="$1"
                      color="$colorSecondary"
                      numberOfLines={2}
                      lineHeight={18}
                    >
                      {summaryText}
                    </Text>
                  )}
                </YStack>

                <YStack
                  width={THUMB_SIZE}
                  height={THUMB_SIZE}
                  borderRadius={10}
                  overflow="hidden"
                  backgroundColor="$accentSubtle"
                  alignItems="center"
                  justifyContent="center"
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                      contentFit="cover"
                      transition={150}
                      cachePolicy="memory-disk"
                      recyclingKey={item.itemId}
                      accessibilityLabel={item.title}
                    />
                  ) : (
                    <KindIcon kind={item.channelKind} size={24} />
                  )}
                </YStack>
              </XStack>
            </AnimatedPressable>

            <XStack gap="$md" alignItems="center" paddingTop="$xs">
              <PlayPill item={item} onPress={open} />
              <XStack alignItems="center" gap="$xs">
                <KindIcon kind={item.channelKind} size={12} />
              </XStack>
              <YStack flex={1} />
              <PinButton item={item} />
            </XStack>
          </YStack>
        )
      })}
    </YStack>
  )
}
