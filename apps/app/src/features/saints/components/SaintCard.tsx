import type { Copy } from '@ember/holy-cards'
import { useEffect, useState } from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { View } from 'tamagui'
import type { SaintEntry } from '../data/catalog'
import { CardBack } from './CardBack'
import { CardFront } from './CardFront'
import { CopySheets } from './CopySheets'
import { useCardGestures } from './useCardGestures'

/** A full-size holy card's width on a screen `screenWidth` wide (it stands 2:3). */
export function saintCardWidth(screenWidth: number) {
  return Math.min(screenWidth - 48, 340)
}

const dealDuration = 260

/**
 * A saint's holy card: sealed until a copy is held, then the card with its
 * other copies stacked beneath. Each copy has its own back; flicking the back
 * sideways deals the top copy under the stack and turns up the next one's.
 */
export function SaintCard({ saint, copies }: { saint: SaintEntry; copies: Copy[] }) {
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = saintCardWidth(screenWidth)
  const cardHeight = cardWidth * 1.5
  const [top, setTop] = useState(0)
  const dealX = useSharedValue(0)
  const sealed = copies.length === 0
  const copy = sealed ? undefined : copies[top % copies.length]
  const beneath = copies.length > 1 ? copies[(top + 1) % copies.length] : undefined

  // The dealt back has left the card; bring the (now top) copy back in place
  // only once React shows it, so the old back never flashes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on each deal
  useEffect(() => {
    dealX.value = 0
  }, [top, dealX])

  const deal = (direction: number) => {
    'worklet'
    if (copies.length < 2) return
    dealX.value = withTiming(
      direction * cardWidth * 1.2,
      { duration: dealDuration, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setTop)(top + 1)
      },
    )
  }

  const { gesture, rotateX, rotateY, isActive, flipRotation } = useCardGestures({
    cardWidth,
    cardHeight,
    onFlick: deal,
  })

  // Each face gets its own full transform chain — no nested 3D transforms.
  // This prevents iOS from rasterizing text at low resolution. The stacked
  // copies ride inside each face, in its plane, so a tilted card never
  // intersects them (iOS depth-sorts a tilted layer against flat siblings).
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flipRotation.value < 90 ? 1 : 0,
    transform: [
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${flipRotation.value + rotateY.value}deg` },
    ],
  }))

  const backStyle = useAnimatedStyle(() => ({
    opacity: flipRotation.value >= 90 ? 1 : 0,
    transform: [
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${flipRotation.value + rotateY.value + 180}deg` },
    ],
  }))

  const dealtStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dealX.value }, { rotate: `${dealX.value / 40}deg` }],
  }))

  const sheets = (
    <CopySheets count={copies.length} width={cardWidth} height={cardHeight} radius={12} />
  )

  return (
    <View alignItems="center" justifyContent="center">
      <GestureDetector gesture={gesture}>
        <Animated.View style={{ width: cardWidth, height: cardHeight }}>
          <Animated.View style={[styles.face, backStyle]}>
            {sheets}
            {beneath && (
              <CardBack
                saint={saint}
                copy={beneath}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
              />
            )}
            <Animated.View style={[styles.face, dealtStyle]}>
              <CardBack saint={saint} copy={copy} cardWidth={cardWidth} cardHeight={cardHeight} />
            </Animated.View>
          </Animated.View>
          <Animated.View style={[styles.face, frontStyle]}>
            {sheets}
            <CardFront
              saint={saint}
              sealed={sealed}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              rotateX={rotateX}
              rotateY={rotateY}
              isActive={isActive}
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})
