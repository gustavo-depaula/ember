// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import type { ComponentProps } from 'react'
import { Text, YStack } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'
import { hyphenate } from '@/lib/hyphenate'

export function PrayerText(props: ComponentProps<typeof Text>) {
  const style = useReadingStyle()
  return <Text selectable color="$color" {...style} {...props} />
}

export function PrayerLines({
  text,
  fontWeight,
  language,
}: {
  text: string
  fontWeight?: ComponentProps<typeof Text>['fontWeight']
  language?: string
}) {
  return (
    <YStack gap="$xs">
      {text.split('\n').map((line, i) => (
        <PrayerText key={`${i}`} fontWeight={fontWeight}>
          {hyphenate(line, language)}
        </PrayerText>
      ))}
    </YStack>
  )
}
