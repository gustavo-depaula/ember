// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder

import type { BilingualText } from '@ember/content-engine'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'
import { PrayerText } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'

export function ResponseBlock({ verses }: { verses: { v: BilingualText; r: BilingualText }[] }) {
  const { t } = useTranslation()
  return (
    <YStack gap="$sm">
      {verses.map((verse, i) => (
        <YStack key={`vr-${i}`}>
          <XStack
            gap={4}
            alignItems="baseline"
            accessibilityLabel={t('a11y.versicle', { text: verse.v.primary })}
          >
            <Text fontFamily="$body" fontSize="$1" color="$colorBurgundy" width={18} aria-hidden>
              ℣.
            </Text>
            <YStack flex={1}>
              <BilingualBlock
                content={verse.v}
                renderText={(text) => <PrayerText>{text}</PrayerText>}
              />
            </YStack>
          </XStack>
          <XStack
            gap={4}
            alignItems="baseline"
            accessibilityLabel={t('a11y.response', { text: verse.r.primary })}
          >
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
                renderText={(text) => <PrayerText fontWeight="600">{text}</PrayerText>}
              />
            </YStack>
          </XStack>
        </YStack>
      ))}
    </YStack>
  )
}
