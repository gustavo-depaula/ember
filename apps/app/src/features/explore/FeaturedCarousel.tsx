import { useState } from 'react'
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
} from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import { FeatureBlock, type FeatureBlockData } from './FeatureBlock'

const gap = 12
// How much of the next card peeks past the right edge — the swipe affordance.
const peek = 30

/**
 * The editorial hero: full-bleed feature blocks that snap horizontally with the
 * next card peeking. ✠ fleurons track position (no auto-advance — these are
 * editorial features you swipe, not a ticker).
 */
export function FeaturedCarousel({ blocks }: { blocks: FeatureBlockData[] }) {
  const [containerW, setContainerW] = useState(0)
  const [active, setActive] = useState(0)

  if (blocks.length === 0) return null

  const cardW = containerW > 0 ? containerW - peek : 0
  const interval = cardW + gap

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w !== containerW) setContainerW(w)
  }

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (interval === 0) return
    setActive(Math.round(e.nativeEvent.contentOffset.x / interval))
  }

  return (
    <YStack gap="$sm" onLayout={onLayout}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval || undefined}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={{ gap }}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {blocks.map(({ key, ...block }) => (
          <View key={key} width={cardW || undefined}>
            <FeatureBlock {...block} />
          </View>
        ))}
      </ScrollView>
      {blocks.length > 1 && (
        <XStack
          alignSelf="center"
          gap="$sm"
          aria-hidden
          importantForAccessibility="no-hide-descendants"
        >
          {blocks.map((b, i) => (
            <Text
              key={b.key}
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
