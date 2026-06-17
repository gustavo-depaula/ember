import type { BilingualText } from '@ember/content-engine'
import { Image } from 'expo-image'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { Text, View, YStack } from 'tamagui'
import { HolographicOverlay } from '@/features/saints/components/HolographicOverlay'
import { useCardGestures } from '@/features/saints/components/useCardGestures'
import { useResolvedImageUri } from '@/hooks/useResolvedImageUri'

const frame = require('../../../assets/textures/card_back_frame.webp')

const maxCardWidth = 340

// The illuminated frame is a fixed cream-and-gold raster, so the back stays
// light in both themes and the text uses hand-picked ink colors that read on
// parchment rather than theme tokens.
const ink = {
  name: '#6E521F',
  prayer: '#43361F',
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
  const resolvedImage = useResolvedImageUri(image)

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
      <Image source={{ uri: resolvedImage }} style={styles.image} contentFit="cover" />
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
          <Text fontFamily="$body" fontSize="$1" color="white" textAlign="center">
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
    >
      <Image source={frame} style={{ width: cardWidth, height: cardHeight }} contentFit="fill" />

      {/* Text sits within the frame's inner panel, with the cross seated
          below the arch. */}
      <YStack
        position="absolute"
        top={cardHeight * 0.1}
        bottom={cardHeight * 0.2}
        left={cardWidth * 0.15}
        right={cardWidth * 0.15}
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontFamily="$heading" fontSize={26} color={ink.name} textAlign="center">
          ✠
        </Text>

        <YStack alignItems="center" gap="$md">
          {title && (
            <Text fontFamily="$heading" fontSize="$5" color={ink.name} textAlign="center">
              {title.primary}
            </Text>
          )}

          {prayer && (
            <Text
              fontFamily="$body"
              fontSize="$3"
              color={ink.prayer}
              textAlign="center"
              fontStyle="italic"
              marginTop="$sm"
            >
              &ldquo;{prayer.primary}&rdquo;
            </Text>
          )}
        </YStack>

        <View />
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
})
