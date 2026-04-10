// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder

import type { BilingualText } from '@ember/content-engine'
import { Text, XStack, YStack } from 'tamagui'
import { PrayerText } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'

export function ResponseBlock({ verses }: { verses: { v: BilingualText; r: BilingualText }[] }) {
  return (
    <YStack gap="$sm">
      {verses.map((verse, i) => (
        <YStack key={`vr-${i}`}>
          <XStack gap={4} alignItems="baseline" accessibilityLabel={`Versicle: ${verse.v.primary}`}>
            <Text fontFamily="$body" fontSize="$1" color="$colorBurgundy" width={18} aria-hidden>
              ℣.
            </Text>
            <YStack flex={1}>
              <BilingualBlock content={verse.v} renderText={(t) => <PrayerText>{t}</PrayerText>} />
            </YStack>
          </XStack>
          <XStack gap={4} alignItems="baseline" accessibilityLabel={`Response: ${verse.r.primary}`}>
            <Text
              fontFamily="$body"
              fontSize="$1"
              color="$accent"
              fontWeight="600"
              width={18}
              aria-hidden
            >
              ℟.
            </Text>
            <YStack flex={1}>
              <BilingualBlock
                content={verse.r}
                renderText={(t) => <PrayerText fontWeight="600">{t}</PrayerText>}
              />
            </YStack>
          </XStack>
        </YStack>
      ))}
    </YStack>
  )
}
