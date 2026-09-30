import { type ReactNode, useState } from 'react'
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
} from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import { FeatureBlock, type FeatureBlockData } from './FeatureBlock'

const gap = 12
// Cards take ~70% of the column so the next one shows by a third — the swipe
// affordance — and every card, Pray now included, keeps the same portrait shape.
const cardShare = 0.7
const cardAspect = 1.36

/**
 * The editorial hero: feature blocks running to the screen's edges, with the
 * next card peeking; a swipe scrolls freely and settles on a card. ✠ fleurons track position (no auto-advance — these are
 * editorial features you swipe, not a ticker).
 */
export function FeaturedCarousel({
  blocks,
  leading,
}: {
  blocks: FeatureBlockData[]
  /** Cards ahead of the blocks, in order: waiting holy cards, then Pray now. */
  leading?: ReactNode[]
}) {
  const [containerW, setContainerW] = useState(0)
  const [active, setActive] = useState(0)

  const heads = (leading ?? []).filter(Boolean)
  const count = blocks.length + heads.length
  if (count === 0) return null

  const cardW = Math.round(containerW * cardShare)
  const cardH = Math.round(cardW * cardAspect)
  const interval = cardW + gap

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w !== containerW) setContainerW(w)
  }

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActive(Math.round(e.nativeEvent.contentOffset.x / interval))
  }

  return (
    <YStack gap="$sm" onLayout={onLayout}>
      {/* Unmeasured, a card sizes to its content and its cover draws huge for a
          frame; hold the row back until the column's width is known. */}
      {cardW > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          // A fling glides across several cards at the normal rate, then comes
          // to rest on the nearest one.
          snapToInterval={interval}
          // Bleeds to the screen's edges like `CardRow`; the padding keeps each
          // resting card on the page's left margin.
          style={{ marginHorizontal: -24 }}
          contentContainerStyle={{ gap, paddingHorizontal: 24 }}
          onMomentumScrollEnd={onMomentumEnd}
        >
          {heads.map((head, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed slots, never reordered
            <View key={i} width={cardW} height={cardH}>
              {head}
            </View>
          ))}
          {blocks.map(({ key, ...block }) => (
            <View key={key} width={cardW} height={cardH}>
              <FeatureBlock {...block} />
            </View>
          ))}
        </ScrollView>
      )}
      {count > 1 && (
        <XStack
          alignSelf="center"
          gap="$sm"
          aria-hidden
          importantForAccessibility="no-hide-descendants"
        >
          {Array.from({ length: count }, (_, i) => (
            <Text
              // biome-ignore lint/suspicious/noArrayIndexKey: position markers
              key={i}
              fontFamily="$heading"
              fontSize="$2"
              color={i === active ? '$accent' : '$accentSubtle'}
            >
              ✠
            </Text>
          ))}
        </XStack>
      )}
    </YStack>
  )
}
