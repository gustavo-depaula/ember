import { useWindowDimensions } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated'
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

  const frontOpacity = useDerivedValue(() => (flipRotation.value < 90 ? 1 : 0))

  const backOpacity = useDerivedValue(() => (flipRotation.value >= 90 ? 1 : 0))

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${flipRotation.value + rotateY.value}deg` },
    ],
  }))

  const frontFaceStyle = useAnimatedStyle(() => ({
    opacity: frontOpacity.value,
  }))

  const backFaceStyle = useAnimatedStyle(() => ({
    opacity: backOpacity.value,
  }))

  return (
    <View alignItems="center" justifyContent="center">
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ width: cardWidth, height: cardHeight }, cardStyle]}>
          <Animated.View
            style={[{ position: 'absolute', top: 0, left: 0 }, backFaceStyle]}
          >
            <CardBack saint={saint} cardWidth={cardWidth} cardHeight={cardHeight} />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, frontFaceStyle]}>
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
