import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { Text, View, YStack } from 'tamagui'
import type { Saint } from '../data/saints'

const frame = require('../../../../assets/textures/card_back_frame.webp')

// The illuminated frame is a fixed cream-and-gold raster, so the back stays
// light in both themes and the text uses hand-picked ink colors that read on
// parchment rather than theme tokens.
const ink = {
  name: '#6E521F',
  meta: '#8A6A3B',
  prayer: '#43361F',
}

export function CardBack({
  saint,
  cardWidth,
  cardHeight,
}: {
  saint: Saint
  cardWidth: number
  cardHeight: number
}) {
  const { t } = useTranslation()

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
            <Text fontFamily="$body" fontSize="$2" color={ink.meta} textAlign="center">
              {t(saint.feastDayKey)}
            </Text>

            <Text fontFamily="$heading" fontSize="$5" color={ink.name} textAlign="center">
              {t(saint.nameKey)}
            </Text>
          </YStack>

          <Text
            fontFamily="$body"
            fontSize="$2"
            color={ink.meta}
            textAlign="center"
            fontStyle="italic"
          >
            {t(saint.patronOfKey)}
          </Text>

          <Text
            fontFamily="$body"
            fontSize="$3"
            color={ink.prayer}
            textAlign="center"
            fontStyle="italic"
          >
            &ldquo;{t(saint.prayerExcerptKey)}&rdquo;
          </Text>
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
