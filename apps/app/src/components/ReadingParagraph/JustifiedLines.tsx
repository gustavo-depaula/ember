import {
  type ComponentProps,
  Fragment,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { type LayoutChangeEvent, Platform } from 'react-native'
import { Text } from 'tamagui'

import type { ReadingFontId } from '@/config/readingFonts'
import { lastLineSlack, useLastLineGuard } from '@/hooks/useLastLineGuard'
import { justifyText, type StyledSegment } from '@/lib/typography/justifyText'
import { breakWidth, fitToPlatform, type MeasureFit } from '@/lib/typography/measureFit'
import { drawStyle, type Faces } from './runs'

// Only text and metrics: `render` and `onPress` change how a line is drawn,
// not where it breaks.
const modelOf = (segments: StyledSegment[]) =>
  segments
    .map(
      (s) =>
        `${s.style}:${s.fontSizePx ?? ''}:${s.letterSpacing ?? ''}:${s.atomic ? 1 : 0}:${s.text}`,
    )
    .join('\u0000')

/**
 * Knuth–Plass justified text on native.
 *
 * React Native has no `wordSpacing`, so the flex has to be carried by the one
 * lever it does expose: `letterSpacing` adds space AFTER each character, so a
 * nested `<Text>` holding a single space renders at `spaceAdvance +
 * letterSpacing`. Everything stays inside one parent `<Text>`, which keeps it
 * a single selectable, copyable run.
 *
 * Whenever the line model isn't available it renders `fallback`, the same
 * segments as ordinary wrapped text.
 *
 * See `docs/design/typography-justification.md`.
 */
export function JustifiedLines({
  segments,
  faces,
  fontFamilyId,
  fontSizePx,
  language,
  fallback,
  ...textProps
}: {
  segments: StyledSegment[]
  faces: Faces
  fontFamilyId: ReadingFontId
  fontSizePx: number
  language: string
  fallback: ReactNode
} & ComponentProps<typeof Text>) {
  const [width, setWidth] = useState(0)
  const [fit, setFit] = useState<MeasureFit>()
  const text = useMemo(() => modelOf(segments), [segments])
  const modelKey = `${width}|${fontSizePx}|${fontFamilyId}|${language}|${text}`

  const lines = useMemo(() => {
    if (!width) return undefined
    const widthPx = breakWidth(fit, modelKey, width, fontSizePx)
    if (widthPx === undefined) return undefined
    return justifyText({ source: segments, widthPx, fontSizePx, fontFamilyId, language })
  }, [width, fit, modelKey, segments, fontSizePx, fontFamilyId, language])

  // `fitToPlatform` narrows the measure when the platform laid out more lines
  // than the model has.
  const modelLineCount = lines?.length ?? 0
  const onTextLayout = useCallback(
    (e: { nativeEvent: { lines: ReadonlyArray<unknown> } }) => {
      // Read the count here, not inside the updater: React Native pools
      // synthetic events, so `nativeEvent` is nullified by the time it runs.
      const platformLines = e.nativeEvent.lines.length
      setFit((prev) => fitToPlatform(prev, modelKey, platformLines, modelLineCount))
    },
    [modelLineCount, modelKey],
  )

  // The fallback's line count isn't known, so its last line is guarded after
  // the fact — see `useLastLineGuard`.
  const lineHeight = typeof textProps.lineHeight === 'number' ? textProps.lineHeight : undefined
  const fallbackGuard = useLastLineGuard(`${modelKey}|${lineHeight}`)

  // Functional update so the callback doesn't close over `width` and change
  // identity every render.
  const guardFallback = fallbackGuard.onLayout
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      guardFallback(e)
      const w = e.nativeEvent.layout.width
      if (w) setWidth((prev) => (Math.abs(w - prev) > 0.5 ? w : prev))
    },
    [guardFallback],
  )

  if (!lines?.length) {
    return (
      <Text {...textProps} minHeight={fallbackGuard.minHeight} onLayout={onLayout}>
        {fallback}
      </Text>
    )
  }

  // Height is known up front (lines × lineHeight), so add the `useLastLineGuard`
  // slack now — otherwise iOS reports the clipped paragraph one line short and
  // `onTextLayout` narrows a measure that was right.
  const minHeight =
    Platform.OS === 'ios' && lineHeight ? lines.length * lineHeight + lastLineSlack() : undefined

  return (
    // allowFontScaling would resize the text out from under metrics computed
    // at `fontSizePx`, so every line would be mis-measured.
    <Text
      {...textProps}
      minHeight={minHeight}
      onLayout={onLayout}
      onTextLayout={onTextLayout}
      allowFontScaling={false}
    >
      {lines.map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: line list is positional and regenerated wholesale
        <Fragment key={i}>
          {line.pieces.map((piece, p) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: same
            <Fragment key={p}>
              {/* `onPress` rides on the piece, so a cross-reference the breaker
                  split across two lines stays tappable on both halves. */}
              <Text style={drawStyle(faces, piece)} onPress={piece.onPress}>
                {piece.text}
              </Text>
              {piece.spaceAfter && (
                // A lone space widened by what the breaker allotted this gap.
                // Never pressable — the gap belongs to the line, not the element.
                <Text
                  style={{
                    ...drawStyle(faces, piece.spaceAfter),
                    // The breaker priced this space including the run's own
                    // tracking, so the flex adds on top of it.
                    letterSpacing: (piece.spaceAfter.letterSpacing ?? 0) + piece.spaceAfter.extraPx,
                  }}
                >
                  {' '}
                </Text>
              )}
            </Fragment>
          ))}
          {line.hyphenated && (
            <Text style={drawStyle(faces, line.pieces[line.pieces.length - 1])}>-</Text>
          )}
          {i < lines.length - 1 && <Text>{'\n'}</Text>}
        </Fragment>
      ))}
    </Text>
  )
}
