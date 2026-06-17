import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'
import { Text, View, YStack } from 'tamagui'
import type { SaintEntry } from '../data/catalog'
import { isCollected } from '../data/collection'
import { cardFrame, cardInk } from './cardFrame'

// One gallery tile: the holy card when collected, otherwise the dimmed frame
// "silhouette" with the saint named — a reverent "not yet revealed", never a
// locked grey box. `showLabel` adds the saint's name beneath the card (wrapping,
// never on top of the art); the live strip omits it.
export function SaintCardTile({
  saint,
  width,
  showLabel = false,
}: {
  saint: SaintEntry
  width: number
  showLabel?: boolean
}) {
  const collected = isCollected(saint)

  return (
    <YStack width={width} gap="$xs">
      <View
        width={width}
        height={width * 1.5}
        borderRadius="$md"
        overflow="hidden"
        borderWidth={1.5}
        borderColor={collected ? '$accent' : '$borderColor'}
      >
        {collected ? (
          <Image source={saint.cardImage} style={styles.fill} contentFit="cover" />
        ) : (
          <>
            <Image source={cardFrame} style={styles.silhouette} contentFit="cover" />
            <View
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              alignItems="center"
              justifyContent="center"
              paddingHorizontal="15%"
            >
              <Text fontFamily="$heading" fontSize="$1" color={cardInk.name} textAlign="center">
                {saint.name}
              </Text>
            </View>
          </>
        )}
      </View>

      {showLabel && collected && (
        <Text fontFamily="$heading" fontSize="$1" color="$color" textAlign="center">
          {saint.name}
        </Text>
      )}
    </YStack>
  )
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  silhouette: { width: '100%', height: '100%', opacity: 0.45 },
})
