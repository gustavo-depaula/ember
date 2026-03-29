// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { Text, YStack } from 'tamagui'
import { PrayerText } from '../PrayerText'

export function CanticleBlock({
  title,
  subtitle,
  source,
  text,
}: {
  title: string
  subtitle: string
  source: string
  text: string
}) {
  const lines = text.split('\n')
  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$3" color="$colorBurgundy" letterSpacing={0.5}>
        {title}
      </Text>
      {(subtitle || source) && (
        <Text fontFamily="$body" fontSize="$1" color="$colorMutedBlue">
          {subtitle}
          {subtitle && source ? ` (${source})` : source}
        </Text>
      )}
      {lines.map((line, i) => (
        <PrayerText key={`${i}-${line.slice(0, 20)}`}>{line}</PrayerText>
      ))}
    </YStack>
  )
}
