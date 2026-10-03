import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'
import { Text, View, YStack } from 'tamagui'
import type { SaintEntry } from '../data/catalog'
import { useCopies } from '../data/collection'
import { CopySheets } from './CopySheets'
import { cardInk } from './cardFrame'

// One gallery tile: the holy card when a copy is held (its other copies
// stacked beneath), otherwise its uncoloured sepia print with the saint named
// at the foot — the card is there, waiting for its colour; never a locked box. `showLabel`
// adds the saint's name beneath the card (wrapping, never on top of the art).
export function SaintCardTile({
  saint,
  width,
  showLabel = false,
}: {
  saint: SaintEntry
  width: number
  showLabel?: boolean
}) {
  const copies = useCopies(saint.id).length
  const collected = copies > 0

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
          // Low: a wall fills in hundreds of these, and an opened card's art must not queue behind them.
          <Image source={saint.cardThumb} priority="low" style={styles.fill} contentFit="cover" />
        ) : (
          <>
            <Image
              source={saint.printThumb}
              priority="low"
              style={styles.fill}
              contentFit="cover"
            />
            {/* On the parchment band the print fades into at its foot. */}
            <View
              position="absolute"
              left={0}
              right={0}
              bottom={0}
              height="20%"
              alignItems="center"
              justifyContent="center"
              paddingHorizontal="8%"
            >
              {/* Sized to the tile and shrunk to two lines, so a long name ("The Circumcision of Our Lord") stays on the band. */}
              <Text
                fontFamily="$heading"
                fontSize={Math.min(13, width * 0.1)}
                color={cardInk.name}
                textAlign="center"
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
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
})
