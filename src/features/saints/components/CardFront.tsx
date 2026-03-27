import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { View } from 'tamagui'
import type { Saint } from '../data/saints'
import { HolographicOverlay } from './HolographicOverlay'

export function CardFront({
  saint,
  cardWidth,
  cardHeight,
  rotateX,
  rotateY,
  isActive,
}: {
  saint: Saint
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
      <Image source={saint.image} style={styles.image} contentFit="cover" />
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
