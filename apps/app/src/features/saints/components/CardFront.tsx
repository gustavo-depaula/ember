import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { Text, View, YStack } from 'tamagui'
import type { SaintEntry } from '../data/catalog'
import { cardFrame, cardInk } from './cardFrame'
import { HolographicOverlay } from './HolographicOverlay'

export function CardFront({
  saint,
  cardWidth,
  cardHeight,
  rotateX,
  rotateY,
  isActive,
}: {
  saint: SaintEntry
  cardWidth: number
  cardHeight: number
  rotateX: SharedValue<number>
  rotateY: SharedValue<number>
  isActive: SharedValue<number>
}) {
  // No generated card yet — show the illuminated frame dimmed, the saint named
  // but the portrait still veiled: a reverent "not yet revealed" front, not a
  // locked grey box.
  if (!saint.cardImage) {
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
        <Image source={cardFrame} style={styles.silhouette} contentFit="fill" />
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          alignItems="center"
          justifyContent="center"
          paddingHorizontal={cardWidth * 0.15}
        >
          <Text fontFamily="$heading" fontSize="$5" color={cardInk.name} textAlign="center">
            {saint.name}
          </Text>
        </YStack>
      </View>
    )
  }

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
      <Image source={saint.cardImage} style={styles.image} contentFit="cover" />
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

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  silhouette: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
})
