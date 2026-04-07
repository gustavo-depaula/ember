// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import type { ComponentProps } from 'react'
import { Text, YStack } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'

export function PrayerText(props: ComponentProps<typeof Text>) {
  const style = useReadingStyle()
  return <Text selectable color="$color" {...style} {...props} />
}

export function PrayerLines({
  text,
  fontWeight,
}: {
  text: string
  fontWeight?: ComponentProps<typeof Text>['fontWeight']
}) {
  return (
    <YStack gap="$xs">
      {text.split('\n').map((line, i) => (
        <PrayerText key={`${i}`} fontWeight={fontWeight}>
          {line}
        </PrayerText>
      ))}
    </YStack>
  )
}
