import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'
import { Text, View, YStack } from 'tamagui'
import type { SaintEntry } from '../data/catalog'
import { CopySheets } from './CopySheets'
import { cardFrame, cardInk } from './cardFrame'

// One gallery tile: the holy card when a copy is held (its other copies
// stacked beneath), otherwise the dimmed frame "silhouette" with the saint
// named — a reverent "not yet revealed", never a locked grey box. `showLabel`
// adds the saint's name beneath the card (wrapping, never on top of the art).
export function SaintCardTile({
  saint,
  width,
  copies,
  showLabel = false,
}: {
  saint: SaintEntry
  width: number
  copies: number
  showLabel?: boolean
}) {
  const collected = copies > 0 && !!saint.cardImage

  return (
    <YStack width={width} gap="$xs">
      <CopySheets count={copies} width={width} height={width * 1.5} radius={8} step={3} />
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
