// biome-ignore-all lint/suspicious/noArrayIndexKey: parsed inline runs never reorder
import { Fragment } from 'react'
import { Text as RNText } from 'react-native'
import { Text } from 'tamagui'

import type { useReadingStyle } from '@/hooks/useReadingStyle'
import { hyphenate } from '@/lib/hyphenate'
import { type DoRunKind, parseDoInline } from './parseDoInline'

export { type DoRun, type DoRunKind, parseDoInline } from './parseDoInline'

// `scale` is relative to body size. `body` and `smallcaps` are handled outside
// this map.
const runStyle: Partial<Record<DoRunKind, { color: string; scale?: number }>> = {
  mark: { color: '$colorBurgundy', scale: 0.72 },
  point: { color: '$colorBurgundy' },
  mediant: { color: '$colorSecondary' },
}

// `reading` is threaded in from PrayerLines so the hook runs once per block,
// not once per line.
export function DoInlineLine({
  text,
  language,
  reading,
}: {
  text: string
  language?: string
  reading: ReturnType<typeof useReadingStyle>
}) {
  const baseFamily = reading.fontFamily as unknown as string
  return (
    <>
      {parseDoInline(text).map((run, i) => {
        if (run.kind === 'smallcaps') {
          return (
            <RNText
              key={i}
              style={{ fontFamily: baseFamily, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {run.text}
            </RNText>
          )
        }
        const style = runStyle[run.kind]
        if (!style) return <Fragment key={i}>{hyphenate(run.text, language)}</Fragment>
        return (
          <Text
            key={i}
            color={style.color}
            fontSize={style.scale ? Math.round(reading.fontSize * style.scale) : undefined}
            lineHeight={style.scale ? reading.lineHeight : undefined}
          >
            {run.text}
          </Text>
        )
      })}
    </>
  )
}
