import type { Copy } from '@ember/holy-cards'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View, YStack } from 'tamagui'
import type { SaintEntry } from '../data/catalog'
import { howWon } from '../redeem/envelopeText'
import { cardFrame, cardInk as ink } from './cardFrame'

/**
 * A card's back: the saint, and the condition this copy was received under —
 * or, while none is held, how the card is received.
 */
export function CardBack({
  saint,
  copy,
  cardWidth,
  cardHeight,
}: {
  saint: SaintEntry
  copy: Copy | undefined
  cardWidth: number
  cardHeight: number
}) {
  const { t } = useTranslation()
  const condition = (() => {
    if (copy) return howWon({ door: copy.door, date: copy.won }, t)
    if (saint.feastLabel) return t('saints.sealedHow', { date: saint.feastLabel })
    return undefined
  })()
  const [room, setRoom] = useState<number>()
  // The scale holds for what it was fitted to; anything else starts over at full size.
  const key = `${saint.id}|${saint.name}|${copy?.door}|${copy?.won}|${cardWidth}|${cardHeight}`
  const [fitted, setFitted] = useState({ key, fit: 1 })
  const fit = fitted.key === key ? fitted.fit : 1
  const [measured, setMeasured] = useState<{ key: string; fit: number; height: number }>()
  useEffect(() => {
    if (room === undefined || measured?.key !== key || measured.fit !== fit) return
    if (measured.height <= room + 0.5) return
    // Wrapped text's height falls about with the square of its size.
    setFitted({ key, fit: fit * Math.min(0.97, Math.sqrt(room / measured.height)) })
  }, [room, measured, key, fit])

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
            balanced and longer ones fill the space. The block measures itself
            against that room and shrinks its type until it fits: a long name
            with a long prayer must still sit inside the frame. */}
        <View
          flex={1}
          alignSelf="stretch"
          justifyContent="center"
          onLayout={(e) => setRoom(e.nativeEvent.layout.height)}
        >
          <YStack
            alignItems="center"
            gap={24 * fit}
            width="100%"
            onLayout={(e) => setMeasured({ key, fit, height: e.nativeEvent.layout.height })}
          >
            <YStack alignItems="center" gap={4 * fit}>
              {saint.feastLabel && (
                <Text
                  fontFamily="$body"
                  fontSize={16 * fit}
                  lineHeight={23 * fit}
                  color={ink.meta}
                  textAlign="center"
                >
                  {saint.feastLabel}
                </Text>
              )}

              <Text
                fontFamily="$heading"
                fontSize={28 * fit}
                lineHeight={34 * fit}
                color={ink.name}
                textAlign="center"
              >
                {saint.name}
              </Text>
            </YStack>

            {saint.patronOf && (
              <Text
                fontFamily="$body"
                fontSize={16 * fit}
                lineHeight={23 * fit}
                color={ink.meta}
                textAlign="center"
                fontStyle="italic"
              >
                {saint.patronOf}
              </Text>
            )}

            {/* The prayer is part of the card: kept for the one who holds it. */}
            {copy && saint.prayerExcerpt && (
              <Text
                fontFamily="$body"
                fontSize={19 * fit}
                lineHeight={27 * fit}
                color={ink.prayer}
                textAlign="center"
                fontStyle="italic"
              >
                &ldquo;{saint.prayerExcerpt}&rdquo;
              </Text>
            )}

            {condition && (
              <Text
                fontFamily="$body"
                fontSize={14 * fit}
                lineHeight={20 * fit}
                color={ink.meta}
                textAlign="center"
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {condition}
              </Text>
            )}
          </YStack>
        </View>

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
