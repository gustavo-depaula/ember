import type { BilingualText } from '@ember/content-engine'
import { Image } from 'expo-image'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import Svg, { Line, Path } from 'react-native-svg'
import { Text, View, YStack } from 'tamagui'
import { HolographicOverlay } from '@/features/saints/components/HolographicOverlay'
import { useCardGestures } from '@/features/saints/components/useCardGestures'

const corners = {
  topLeft: require('../../../assets/textures/corner_top_left.png'),
  topRight: require('../../../assets/textures/corner_top_right.png'),
  bottomLeft: require('../../../assets/textures/corner_bottom_left.png'),
  bottomRight: require('../../../assets/textures/corner_bottom_right.png'),
}

const cornerSize = 40
const maxCardWidth = 340

function OrnamentCross({ size = 48, color = '#C9A84C' }: { size?: number; color?: string }) {
  const half = size / 2
  const arm = size * 0.15
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={`M${half - arm} ${arm} L${half + arm} ${arm} L${half + arm} ${size - arm} L${half - arm} ${size - arm} Z`}
        fill={color}
        opacity={0.8}
      />
      <Path
        d={`M${arm} ${half - arm} L${size - arm} ${half - arm} L${size - arm} ${half + arm} L${arm} ${half + arm} Z`}
        fill={color}
        opacity={0.8}
      />
      <Path
        d={`M${half} ${half - arm * 1.5} A${arm * 1.5} ${arm * 1.5} 0 1 1 ${half} ${half + arm * 1.5} A${arm * 1.5} ${arm * 1.5} 0 1 1 ${half} ${half - arm * 1.5}`}
        fill={color}
      />
      <Line
        x1={half}
        y1={0}
        x2={half}
        y2={arm * 0.6}
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        x1={0}
        y1={half}
        x2={arm * 0.6}
        y2={half}
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        x1={half}
        y1={size}
        x2={half}
        y2={size - arm * 0.6}
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        x1={size}
        y1={half}
        x2={size - arm * 0.6}
        y2={half}
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
      />
    </Svg>
  )
}

function OrnamentalDivider({ width }: { width: number }) {
  const lineWidth = width * 0.6
  return (
    <Svg width={lineWidth} height={6} viewBox={`0 0 ${lineWidth} 6`}>
      <Line x1={0} y1={3} x2={lineWidth} y2={3} stroke="#C9A84C" strokeWidth={0.5} opacity={0.4} />
      <Line
        x1={lineWidth * 0.3}
        y1={1}
        x2={lineWidth * 0.7}
        y2={1}
        stroke="#C9A84C"
        strokeWidth={0.5}
        opacity={0.3}
      />
      <Line
        x1={lineWidth * 0.3}
        y1={5}
        x2={lineWidth * 0.7}
        y2={5}
        stroke="#C9A84C"
        strokeWidth={0.5}
        opacity={0.3}
      />
    </Svg>
  )
}

function HolyCardFront({
  image,
  attribution,
  cardWidth,
  cardHeight,
  rotateX,
  rotateY,
  isActive,
}: {
  image: string
  attribution?: BilingualText
  cardWidth: number
  cardHeight: number
  rotateX: SharedValue<number>
  rotateY: SharedValue<number>
  isActive: SharedValue<number>
}) {
  return (
    <View
      position="absolute"
      top={0}
      left={0}
      width={cardWidth}
      height={cardHeight}
      borderRadius="$lg"
      overflow="hidden"
      borderWidth={2}
      borderColor="$accent"
    >
      <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
      {attribution && (
        <View
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          paddingVertical="$xs"
          paddingHorizontal="$sm"
          backgroundColor="rgba(0,0,0,0.4)"
        >
          <Text fontFamily="$body" fontSize={11} color="white" textAlign="center">
            {attribution.primary}
          </Text>
        </View>
      )}
      <HolographicOverlay
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        rotateX={rotateX}
        rotateY={rotateY}
        isActive={isActive}
      />
    </View>
  )
}

function HolyCardBack({
  title,
  prayer,
  cardWidth,
  cardHeight,
}: {
  title?: BilingualText
  prayer?: BilingualText
  cardWidth: number
  cardHeight: number
}) {
  return (
    <View
      position="absolute"
      top={0}
      left={0}
      width={cardWidth}
      height={cardHeight}
      borderRadius="$lg"
      overflow="hidden"
      borderWidth={2}
      borderColor="$accent"
      backgroundColor="$background"
    >
      {/* Corner textures */}
      <View position="absolute" top={-8} left={-8} zIndex={2}>
        <Image source={corners.topLeft} style={styles.corner} contentFit="contain" />
      </View>
      <View position="absolute" top={-8} right={-8} zIndex={2}>
        <Image source={corners.topRight} style={styles.corner} contentFit="contain" />
      </View>
      <View position="absolute" bottom={-8} left={-8} zIndex={2}>
        <Image source={corners.bottomLeft} style={styles.corner} contentFit="contain" />
      </View>
      <View position="absolute" bottom={-8} right={-8} zIndex={2}>
        <Image source={corners.bottomRight} style={styles.corner} contentFit="contain" />
      </View>

      {/* Inner border */}
      <View
        position="absolute"
        top={12}
        left={12}
        right={12}
        bottom={12}
        borderWidth={0.5}
        borderColor="$accentSubtle"
        borderRadius="$md"
      />

      {/* Content */}
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$xl" gap="$md">
        <OrnamentCross size={56} />

        <View alignItems="center" marginTop="$sm">
          <OrnamentalDivider width={cardWidth} />
        </View>

        {title && (
          <Text
            fontFamily="$heading"
            fontSize={24}
            color="$accent"
            textAlign="center"
            marginTop="$sm"
          >
            {title.primary}
          </Text>
        )}

        <View alignItems="center" marginVertical="$sm">
          <OrnamentalDivider width={cardWidth} />
        </View>

        {prayer && (
          <Text
            fontFamily="$body"
            fontSize={18}
            color="$color"
            textAlign="center"
            fontStyle="italic"
            lineHeight={26}
            paddingHorizontal="$sm"
          >
            &ldquo;{prayer.primary}&rdquo;
          </Text>
        )}
      </YStack>
    </View>
  )
}

export function HolyCardBlock({
  image,
  title,
  attribution,
  prayer,
}: {
  image: string
  title?: BilingualText
  attribution?: BilingualText
  prayer?: BilingualText
}) {
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = Math.min(screenWidth - 48, maxCardWidth)
  const cardHeight = cardWidth * 1.5

  const { gesture, rotateX, rotateY, isActive, flipRotation } = useCardGestures({
    cardWidth,
    cardHeight,
  })

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
    <View alignItems="center" justifyContent="center" paddingVertical="$md">
      <GestureDetector gesture={gesture}>
        <Animated.View style={{ width: cardWidth, height: cardHeight }}>
          <Animated.View style={[styles.face, backStyle]}>
            <HolyCardBack
              title={title}
              prayer={prayer}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          </Animated.View>
          <Animated.View style={[styles.face, frontStyle]}>
            <HolyCardFront
              image={image}
              attribution={attribution}
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
  image: {
    width: '100%',
    height: '100%',
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    width: cornerSize,
    height: cornerSize * 0.6,
  },
})
