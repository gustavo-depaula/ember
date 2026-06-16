// biome-ignore-all lint/suspicious/noArrayIndexKey: parsed inline runs never reorder
import { Fragment } from 'react'
import { Text as RNText } from 'react-native'
import { Text } from 'tamagui'

import type { useReadingStyle } from '@/hooks/useReadingStyle'
import { hyphenate } from '@/lib/hyphenate'

// Divinum Officium leaves its own inline markup in the assembled text (the
// engine deliberately doesn't flatten it — rendering is the app's job). One
// line of that markup tokenizes into styled runs:
//   /:X:/   small rubric-toned inline — psalm verse numbers (24:1), the Ps 118
//           Hebrew-letter headings, and inline directions like (genuflectitur).
//           DO renders these as <FONT SIZE=1 COLOR=red>.
//   *       the mediant pause that bisects every psalm verse
//   † ‡     flexa / genuflection-cross pointing marks
//   %…%     small caps (divine names)
// Anything else is body text.
export type DoRunKind = 'body' | 'mark' | 'mediant' | 'point' | 'smallcaps'
export type DoRun = { kind: DoRunKind; text: string }

const tokenRe = /\/:(.*?):\/|%(.+?)%|([*†‡])/g

export function parseDoInline(line: string): DoRun[] {
  const runs: DoRun[] = []
  let last = 0
  for (const m of line.matchAll(tokenRe)) {
    const idx = m.index ?? 0
    if (idx > last) runs.push({ kind: 'body', text: line.slice(last, idx) })
    if (m[1] !== undefined) runs.push({ kind: 'mark', text: m[1] })
    else if (m[2] !== undefined) runs.push({ kind: 'smallcaps', text: m[2] })
    else runs.push({ kind: m[3] === '*' ? 'mediant' : 'point', text: m[3] })
    last = idx + m[0].length
  }
  if (last < line.length) runs.push({ kind: 'body', text: line.slice(last) })
  return runs.length > 0 ? runs : [{ kind: 'body', text: line }]
}

// The single place to tune DO inline typography. `color` is a theme token;
// `scale` shrinks the run relative to body size (verse numbers ride small).
// `body` and `smallcaps` render differently and are handled outside this map.
const runStyle: Partial<Record<DoRunKind, { color: string; scale?: number }>> = {
  mark: { color: '$colorBurgundy', scale: 0.72 },
  point: { color: '$colorBurgundy' },
  mediant: { color: '$colorSecondary' },
}

// Renders one line of DO markup. `reading` is threaded in from PrayerLines so
// the hook runs once per block, not once per line.
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
