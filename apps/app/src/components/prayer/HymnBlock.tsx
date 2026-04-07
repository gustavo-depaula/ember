import type { BilingualText } from '@ember/content-engine'
import { Text, XStack, YStack } from 'tamagui'
import { VineBar } from '../Ornament'
import { PrayerLines } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'

export function HymnBlock({ title, text }: { title: BilingualText; text: BilingualText }) {
  const estimatedHeight =
    (text.primary.split('\n').length + (text.secondary?.split('\n').length ?? 0)) * 24 + 40

  return (
    <XStack gap="$sm">
      <VineBar height={estimatedHeight} />
      <YStack gap="$md" flex={1}>
        <BilingualBlock
          content={title}
          renderText={(t) => (
            <Text fontFamily="$heading" fontSize="$3" color="$colorBurgundy" letterSpacing={0.5}>
              {t}
            </Text>
          )}
        />
        <BilingualBlock content={text} renderText={(t) => <PrayerLines text={t} />} />
      </YStack>
    </XStack>
  )
}
