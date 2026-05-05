import type { BilingualText } from '@ember/content-engine'
import { Text, View, XStack, YStack } from 'tamagui'

/**
 * Major-division header for the Mass: a centered uppercase title set
 * between thin horizontal rules. Used for the four big parts (Initial
 * Rites, Liturgy of the Word, Liturgy of the Eucharist, Concluding
 * Rites) — distinct from `heading`, which is reserved for everyday
 * sub-section labels (Antífona, Glória, Credo, …).
 */
export function SectionMarker({ title }: { title: BilingualText }) {
  return (
    <YStack alignItems="center" gap="$xs" marginVertical="$lg">
      <XStack alignItems="center" gap="$sm" width="100%">
        <View flex={1} height={1} backgroundColor="$borderColor" />
        <Text
          fontFamily="$heading"
          fontSize="$3"
          color="$colorBurgundy"
          letterSpacing={2}
          textTransform="uppercase"
          textAlign="center"
          flexShrink={0}
        >
          {title.primary}
        </Text>
        <View flex={1} height={1} backgroundColor="$borderColor" />
      </XStack>
    </YStack>
  )
}
