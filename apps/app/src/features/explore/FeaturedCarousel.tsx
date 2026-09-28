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
 * The editorial hero: full-bleed feature blocks that snap horizontally with the
 * next card peeking. ✠ fleurons track position (no auto-advance — these are
 * editorial features you swipe, not a ticker).
 */
export function FeaturedCarousel({
  blocks,
  leading,
}: {
  blocks: FeatureBlockData[]
  leading?: ReactNode
}) {
  const [containerW, setContainerW] = useState(0)
  const [active, setActive] = useState(0)

  const count = blocks.length + (leading ? 1 : 0)
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
          snapToInterval={interval}
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={{ gap }}
          onMomentumScrollEnd={onMomentumEnd}
        >
          {leading && (
            <View width={cardW} height={cardH}>
              {leading}
            </View>
          )}
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
