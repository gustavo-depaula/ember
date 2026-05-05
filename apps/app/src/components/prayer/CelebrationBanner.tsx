import type { BilingualText } from '@ember/content-engine'
import { Text, XStack, YStack } from 'tamagui'
import { LiturgicalColorDot } from './LiturgicalColorDot'

/**
 * Hero block at the top of the day's body — large title with a
 * liturgical-color dot inline, plus rank + cycle as a subtle subtitle.
 * Reads like the upper-left corner of a missal page.
 */
export function CelebrationBanner({
  title,
  color,
  rank,
  cycle,
}: {
  title: BilingualText
  color?: string
  rank?: BilingualText
  cycle?: BilingualText
}) {
  const subtitle = [rank?.primary, cycle?.primary].filter((s): s is string => !!s).join(' · ')

  return (
    <YStack gap="$xxs" marginBottom="$sm">
      <XStack alignItems="center" gap="$sm">
        {color && <LiturgicalColorDot color={color} size={14} />}
        <Text
          fontFamily="$heading"
          fontSize="$5"
          color="$colorBurgundy"
          letterSpacing={0.3}
          flexShrink={1}
        >
          {title.primary}
        </Text>
      </XStack>
      {subtitle && (
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color="$colorSecondary"
          letterSpacing={1}
          textTransform="uppercase"
          paddingLeft={color ? 22 : 0}
        >
          {subtitle}
        </Text>
      )}
    </YStack>
  )
}
