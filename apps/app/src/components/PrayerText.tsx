// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import { Text, YStack } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'
import { hyphenate } from '@/lib/hyphenate'
import { ResponseMark } from './prayer/ResponseMark'

export function PrayerText(props: ComponentProps<typeof Text>) {
  const style = useReadingStyle()
  return <Text selectable userSelect="text" color="$color" {...style} {...props} />
}

export function PrayerLines({
  text,
  fontWeight,
  language,
  prefix,
}: {
  text: string
  fontWeight?: ComponentProps<typeof Text>['fontWeight']
  language?: string
  // Inline missal mark placed at the start of the first line (e.g. "℟. "
  // for people responses). Rendered through `ResponseMark` so styling
  // stays in sync with versicle/response markers across the app.
  prefix?: string
}) {
  const lines = useMemo(
    () => text.split('\n').map((line) => hyphenate(line, language)),
    [text, language],
  )

  return (
    <YStack gap="$xs">
      {lines.map((line, i) => (
        <PrayerText key={`${i}`} fontWeight={fontWeight}>
          {i === 0 && prefix && <ResponseMark value={prefix} />}
          {line}
        </PrayerText>
      ))}
    </YStack>
  )
}
