import { Image } from 'expo-image'
import { Text, View, YStack } from 'tamagui'
import type { SaintEntry } from '../data/catalog'
import { cardFrame, cardInk as ink } from './cardFrame'

export function CardBack({
  saint,
  cardWidth,
  cardHeight,
}: {
  saint: SaintEntry
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
      <Image
        source={cardFrame}
        style={{ width: cardWidth, height: cardHeight }}
        contentFit="fill"
      />

      {/* Text sits within the frame's inner panel, distributed between the
          arch (cross) and the bottom flourish (invocation). */}
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

        {/* Centered between the cross and the invocation, so short cards stay
            balanced and longer ones fill the space naturally. */}
        <YStack alignItems="center" gap="$lg" width="100%">
          <YStack alignItems="center" gap="$xs">
            {saint.feastLabel && (
              <Text fontFamily="$body" fontSize="$2" color={ink.meta} textAlign="center">
                {saint.feastLabel}
              </Text>
            )}

            <Text fontFamily="$heading" fontSize="$5" color={ink.name} textAlign="center">
              {saint.name}
            </Text>
          </YStack>

          {saint.patronOf && (
            <Text
              fontFamily="$body"
              fontSize="$2"
              color={ink.meta}
              textAlign="center"
              fontStyle="italic"
            >
              {saint.patronOf}
            </Text>
          )}

          {saint.prayerExcerpt && (
            <Text
              fontFamily="$body"
              fontSize="$3"
              color={ink.prayer}
              textAlign="center"
              fontStyle="italic"
            >
              &ldquo;{saint.prayerExcerpt}&rdquo;
            </Text>
          )}
        </YStack>

        <Text
          fontFamily="$heading"
          fontSize="$2"
          color={ink.name}
          textAlign="center"
          letterSpacing={2}
        >
          Ora pro nobis
        </Text>
      </YStack>
    </View>
  )
}
