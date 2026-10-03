import { Image, type ImageProps } from 'expo-image'
import { StyleSheet } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { Text, View, YStack } from 'tamagui'
import type { SaintEntry } from '../data/catalog'
import { cardInk } from './cardFrame'
import { HolographicOverlay } from './HolographicOverlay'

export function CardFront({
  saint,
  sealed,
  cardWidth,
  cardHeight,
  rotateX,
  rotateY,
  isActive,
  priority,
}: {
  saint: SaintEntry
  /** No copy held yet: the art stays veiled until an envelope is opened. */
  sealed: boolean
  cardWidth: number
  cardHeight: number
  rotateX: SharedValue<number>
  rotateY: SharedValue<number>
  isActive: SharedValue<number>
  priority: ImageProps['priority']
}) {
  // Not held yet — the card as an uncoloured print, the saint named on the
  // parchment at its foot: there, but waiting for its colour.
  if (sealed) {
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
        <Image
          source={saint.printImage}
          placeholder={saint.printThumb}
          placeholderContentFit="cover"
          priority={priority}
          style={styles.image}
          contentFit="cover"
        />
        <YStack
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          height="20%"
          alignItems="center"
          justifyContent="center"
          paddingHorizontal={cardWidth * 0.1}
        >
          <Text
            fontFamily="$heading"
            fontSize={cardWidth * 0.06}
            color={cardInk.name}
            textAlign="center"
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
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
      {/* The tile's small copy is already cached, and holds the place while the full card loads. */}
      <Image
        source={saint.cardImage}
        placeholder={saint.cardThumb}
        placeholderContentFit="cover"
        priority={priority}
        style={styles.image}
        contentFit="cover"
      />
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
})
