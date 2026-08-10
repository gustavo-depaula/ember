import {
  type ComponentProps,
  Fragment,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { Text } from 'tamagui'

import { getFontFamily, type ReadingFontId } from '@/config/readingFonts'
import type { TextStyleName } from '@/lib/typography/fontMetrics'
import type { Appearance, StyledSegment } from '@/lib/typography/justifyText'
import { justifyText } from '@/lib/typography/justifyText'
import { styleToFace } from './prayer/InlineMarkdown'

/**
 * Knuth–Plass justified text on native.
 *
 * React Native has no `wordSpacing`, so the flex has to be carried by the one
 * lever it does expose: `letterSpacing` adds space AFTER each character, so a
 * nested `<Text>` holding a single space renders at `spaceAdvance +
 * letterSpacing`. Everything stays inside one parent `<Text>`, which keeps it
 * a single selectable, copyable run.
 *
 * Whenever the line model isn't available — the first frame before `onLayout`
 * measures, a face whose width can't be known, a paragraph the breaker
 * declined — it renders `fallback` instead. That has to be a real rendering of
 * the same text rather than a flattened string, or emphasis would disappear
 * exactly where justification gives up.
 *
 * See `docs/design/typography-justification.md`.
 */
export function JustifiedText({
  source,
  fontFamilyId,
  fontSizePx,
  language,
  baseStyle = 'regular',
  fallback,
  ...textProps
}: {
  source: StyledSegment[]
  fontFamilyId: ReadingFontId
  fontSizePx: number
  language?: string
  /** The face the block is set in; the parent `<Text>` already draws it. */
  baseStyle?: TextStyleName
  /** Rendered whenever the text can't be justified. */
  fallback: ReactNode
} & ComponentProps<typeof Text>) {
  const [width, setWidth] = useState(0)

  const lines = useMemo(() => {
    if (!width) return undefined
    // A pixel of headroom, because a line that ends up even a sub-pixel too
    // wide does not merely look wrong — it wraps, pushing a word onto a line
    // the breaker never planned.
    return justifyText({ source, widthPx: width - 1, fontSizePx, fontFamilyId, language })
  }, [width, source, fontSizePx, fontFamilyId, language])

  // Emphasis resolves to a concrete font face, because React Native ignores
  // inherited fontWeight/fontStyle once fontFamily is set. Built once per
  // family so pieces share style identities instead of minting one apiece.
  //
  // Only the block's own face is left to the parent. Every other style names
  // its face outright — including `regular`, which inside an italic block is a
  // deliberate flip back to roman and cannot be had by inheriting.
  const faces = useMemo(() => {
    const family = getFontFamily(fontFamilyId)
    const resolved = (style: TextStyleName) =>
      style === baseStyle ? undefined : styleToFace(family, style)
    return {
      regular: resolved('regular'),
      bold: resolved('bold'),
      italic: resolved('italic'),
      boldItalic: resolved('boldItalic'),
    } satisfies Record<TextStyleName, object | undefined>
  }, [fontFamilyId, baseStyle])

  // A run's full drawing style: its face, the size it was measured at when that
  // differs from the paragraph's, and whatever draw-only props it declared.
  // Order matters — `render` is last so a caller's colour wins, and it is
  // documented never to carry a metric-bearing property.
  const drawOf = (look: Appearance) => ({
    ...faces[look.style],
    ...(look.fontSizePx === undefined ? undefined : { fontSize: look.fontSizePx }),
    ...(look.letterSpacing === undefined ? undefined : { letterSpacing: look.letterSpacing }),
    ...look.render,
  })

  // onLayout gives us the measure the breaker needs. Functional update so the
  // callback doesn't close over `width` and change identity every render.
  const onLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    const w = e.nativeEvent.layout.width
    if (w) setWidth((prev) => (Math.abs(w - prev) > 0.5 ? w : prev))
  }, [])

  if (!lines?.length) {
    return (
      <Text {...textProps} onLayout={onLayout}>
        {fallback}
      </Text>
    )
  }

  return (
    // allowFontScaling would resize the text out from under metrics computed
    // at `fontSizePx`, so every line would be mis-measured.
    <Text {...textProps} onLayout={onLayout} allowFontScaling={false}>
      {lines.map((line, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: line list is positional and regenerated wholesale
        <Fragment key={i}>
          {line.pieces.map((piece, p) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: same
            <Fragment key={p}>
              {/* `onPress` rides on the piece, so a cross-reference the breaker
                  split across two lines stays tappable on both halves. */}
              <Text style={drawOf(piece)} onPress={piece.onPress}>
                {piece.text}
              </Text>
              {piece.spaceAfter && (
                // The whole trick: a lone space, drawn in its own run's face,
                // widened by exactly what the breaker allotted this gap. Never
                // pressable — the gap belongs to the line, not to the element.
                <Text
                  style={{
                    ...drawOf(piece.spaceAfter),
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
          {line.hyphenated && <Text style={drawOf(line.pieces[line.pieces.length - 1])}>-</Text>}
          {i < lines.length - 1 && <Text>{'\n'}</Text>}
        </Fragment>
      ))}
    </Text>
  )
}
