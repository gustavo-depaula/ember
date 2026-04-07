import type { BilingualText } from '@ember/content-engine'
import { Text, YStack } from 'tamagui'
import { PrayerLines } from '../PrayerText'
import { BilingualBlock } from './BilingualBlock'

export function CanticleBlock({
  title,
  subtitle,
  source,
  text,
}: {
  title: BilingualText
  subtitle: BilingualText
  source: BilingualText
  text: BilingualText
}) {
  return (
    <YStack gap="$sm">
      <BilingualBlock
        content={title}
        renderText={(t) => (
          <Text fontFamily="$heading" fontSize="$3" color="$colorBurgundy" letterSpacing={0.5}>
            {t}
          </Text>
        )}
      />
      {(subtitle.primary || source.primary) && (
        <Text fontFamily="$body" fontSize="$1" color="$colorMutedBlue">
          {subtitle.primary}
          {subtitle.primary && source.primary ? ` (${source.primary})` : source.primary}
        </Text>
      )}
      <BilingualBlock content={text} renderText={(t) => <PrayerLines text={t} />} />
    </YStack>
  )
}
