import { StyleSheet } from 'react-native'
import Animated, { interpolate, type SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { View } from 'tamagui'

const maxTilt = 15

export function HolographicOverlay({
  cardWidth,
  cardHeight,
  rotateX,
  rotateY,
  isActive,
}: {
  cardWidth: number
  cardHeight: number
  rotateX: SharedValue<number>
  rotateY: SharedValue<number>
  isActive: SharedValue<number>
}) {
  const streakWidth = cardWidth * 0.4
  const streakHeight = cardHeight * 2

  const streakStyle = useAnimatedStyle(() => {
    const tx = interpolate(rotateY.value, [-maxTilt, maxTilt], [-cardWidth, cardWidth])
    const ty = interpolate(
      rotateX.value,
      [-maxTilt, maxTilt],
      [cardHeight * 0.5, -cardHeight * 0.5],
    )

    return {
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: '25deg' }],
      opacity: isActive.value * 0.6,
    }
  })

  // Iridescent color strips offset from main streak
  const goldStyle = useAnimatedStyle(() => {
    const tx = interpolate(rotateY.value, [-maxTilt, maxTilt], [-cardWidth * 0.9, cardWidth * 0.9])
    const ty = interpolate(
      rotateX.value,
      [-maxTilt, maxTilt],
      [cardHeight * 0.4, -cardHeight * 0.4],
    )

    return {
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: '25deg' }],
      opacity: isActive.value * 0.5,
    }
  })

  const roseStyle = useAnimatedStyle(() => {
    const tx = interpolate(rotateY.value, [-maxTilt, maxTilt], [-cardWidth * 1.1, cardWidth * 1.1])
    const ty = interpolate(
      rotateX.value,
      [-maxTilt, maxTilt],
      [cardHeight * 0.6, -cardHeight * 0.6],
    )

    return {
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: '25deg' }],
      opacity: isActive.value * 0.4,
    }
  })

  const blueStyle = useAnimatedStyle(() => {
    const tx = interpolate(rotateY.value, [-maxTilt, maxTilt], [-cardWidth * 1.2, cardWidth * 1.2])
    const ty = interpolate(
      rotateX.value,
      [-maxTilt, maxTilt],
      [cardHeight * 0.7, -cardHeight * 0.7],
    )

    return {
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: '25deg' }],
      opacity: isActive.value * 0.35,
    }
  })

  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      pointerEvents="none"
    >
      {/* Main white light streak */}
      <Animated.View
        style={[styles.streak, { width: streakWidth, height: streakHeight }, streakStyle]}
      />
      {/* Gold iridescent strip */}
      <Animated.View
        style={[
          styles.streak,
          styles.gold,
          { width: streakWidth * 0.3, height: streakHeight },
          goldStyle,
        ]}
      />
      {/* Rose iridescent strip */}
      <Animated.View
        style={[
          styles.streak,
          styles.rose,
          { width: streakWidth * 0.25, height: streakHeight },
          roseStyle,
        ]}
      />
      {/* Blue iridescent strip */}
      <Animated.View
        style={[
          styles.streak,
          styles.blue,
          { width: streakWidth * 0.25, height: streakHeight },
          blueStyle,
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  streak: {
    position: 'absolute',
    top: '-50%',
    left: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
  },
  gold: {
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
    left: '20%',
  },
  rose: {
    backgroundColor: 'rgba(196, 112, 126, 0.10)',
    left: '45%',
  },
  blue: {
    backgroundColor: 'rgba(61, 90, 128, 0.10)',
    left: '55%',
  },
})
