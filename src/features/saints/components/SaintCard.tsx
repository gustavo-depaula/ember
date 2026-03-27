import { StyleSheet, useWindowDimensions } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { View } from 'tamagui'
import type { Saint } from '../data/saints'
import { CardBack } from './CardBack'
import { CardFront } from './CardFront'
import { useCardGestures } from './useCardGestures'

const maxCardWidth = 340

export function SaintCard({ saint }: { saint: Saint }) {
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = Math.min(screenWidth - 48, maxCardWidth)
  const cardHeight = cardWidth * 1.5

  const { gesture, rotateX, rotateY, isActive, flipRotation } = useCardGestures({
    cardWidth,
    cardHeight,
  })

  // Each face gets its own full transform chain — no nested 3D transforms.
  // This prevents iOS from rasterizing text at low resolution.
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

  return (
    <View alignItems="center" justifyContent="center">
      <GestureDetector gesture={gesture}>
        <Animated.View style={{ width: cardWidth, height: cardHeight }}>
          <Animated.View style={[styles.face, backStyle]}>
            <CardBack saint={saint} cardWidth={cardWidth} cardHeight={cardHeight} />
          </Animated.View>
          <Animated.View style={[styles.face, frontStyle]}>
            <CardFront
              saint={saint}
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
