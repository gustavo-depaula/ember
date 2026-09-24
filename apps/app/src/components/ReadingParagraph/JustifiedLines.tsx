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

// Everything about a segment that changes the lines the breaker builds. Only
// text and metrics: `render` and `onPress` change how a line is drawn, not
// where it breaks.
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

  // The platform reports the lines it actually laid the paragraph out on, and
  // `fitToPlatform` narrows the measure when there are more of them than the
  // model has — caught here, at measure time, before anything is drawn.
  const modelLineCount = lines?.length ?? 0
  const onTextLayout = useCallback(
    (e: { nativeEvent: { lines: ReadonlyArray<unknown> } }) => {
      // Read the count HERE, not inside the updater below: React Native pools
      // synthetic events, so by the time an updater runs — in the render phase,
      // after this handler has returned — `nativeEvent` has been nullified.
      const platformLines = e.nativeEvent.lines.length
      setFit((prev) => fitToPlatform(prev, modelKey, platformLines, modelLineCount))
    },
    [modelLineCount, modelKey],
  )

  // The fallback's line count isn't known, so its last line is guarded after
  // the fact — see `useLastLineGuard`.
  const lineHeight = typeof textProps.lineHeight === 'number' ? textProps.lineHeight : undefined
  const fallbackGuard = useLastLineGuard(`${modelKey}|${lineHeight}`)

  // onLayout gives us the measure the breaker needs. Functional update so the
  // callback doesn't close over `width` and change identity every render.
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

  // Every line is one `lineHeight` tall, so the paragraph's height is known
  // before it is laid out, and the pixel `useLastLineGuard` explains can be
  // added up front — otherwise the platform would report the clipped paragraph
  // one line short, and `onTextLayout` would narrow a measure that was right.
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
                // The whole trick: a lone space, drawn in its own run's face,
                // widened by exactly what the breaker allotted this gap. Never
                // pressable — the gap belongs to the line, not to the element.
                <Text
                  style={{
                    ...drawStyle(faces, piece.spaceAfter),
                    // The run's own tracking is part of the width the breaker
                    // priced this space at, so the flex adds ON TOP of it
                    // rather than replacing it.
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
