import { type ComponentProps, Fragment, useMemo, useState } from 'react'
import { Text } from 'tamagui'

import type { ReadingFontId } from '@/config/readingFonts'
import type { JustifiedPiece, StyledSegment } from '@/lib/typography/justifyText'
import { justifyText } from '@/lib/typography/justifyText'
import { emphasisStyle } from './prayer/InlineMarkdown'

/**
 * Knuth–Plass justified text on native.
 *
 * React Native has no `wordSpacing`, so the flex has to be carried by the one
 * lever it does expose: `letterSpacing` adds space AFTER each character, so a
 * nested `<Text>` holding a single space renders at `spaceAdvance +
 * letterSpacing`. Everything stays inside one parent `<Text>`, which keeps it
 * a single selectable, copyable run.
 *
 * Falls back to ordinary wrapped text whenever the line model isn't available
 * — an unmeasured container, a font without metrics, or a paragraph the
 * breaker declined. Justification is a refinement; the words always render.
 *
 * See `docs/design/typography-justification.md` § Part 6.
 */
export function JustifiedText({
  source,
  baseFamily,
  fontFamilyId,
  fontSizePx,
  language,
  enabled = true,
  ...textProps
}: {
  /** Plain text, or styled segments when the line carries inline emphasis. */
  source: string | StyledSegment[]
  /** Concrete font family name, for resolving emphasis faces. */
  baseFamily: string
  fontFamilyId: ReadingFontId
  fontSizePx: number
  language?: string
  /** When false, renders plain wrapped text (e.g. the reader's "left" mode). */
  enabled?: boolean
} & ComponentProps<typeof Text>) {
  const [width, setWidth] = useState(0)

  const plain = useMemo(
    () => (typeof source === 'string' ? source : source.map((seg) => seg.text).join('')),
    [source],
  )

  const lines = useMemo(() => {
    if (!enabled || !width) return undefined
    // Headroom, because a line that ends up even a sub-pixel too wide does
    // not merely look wrong — it wraps, pushing a word onto a line the breaker
    // never planned. Two sources of drift: the platform rounds when it
    // rasterizes, and the metrics ignore kerning (measured at 0.72px mean /
    // 2.03px worst on real lines). 1.5px covers both; the cost is that a line
    // may sit a hair short of the margin, which is the far cheaper defect.
    return justifyText({
      source,
      widthPx: width - 1.5,
      fontSizePx,
      fontFamilyId,
      language,
    })
  }, [enabled, width, source, fontSizePx, fontFamilyId, language])

  // onLayout gives us the measure the breaker needs; until it fires (and if
  // justification declines) this is just a normal Text.
  const onLayout = (e: { nativeEvent: { layout: { width: number } } }) => {
    const w = e.nativeEvent.layout.width
    if (w && Math.abs(w - width) > 0.5) setWidth(w)
  }

  if (!lines?.length) {
    return (
      <Text {...textProps} onLayout={onLayout}>
        {plain}
      </Text>
    )
  }

  // Emphasis resolves to a concrete font face, because React Native ignores
  // inherited fontWeight/fontStyle once fontFamily is set.
  const faceFor = (style: JustifiedPiece['style']) =>
    style === 'regular'
      ? undefined
      : emphasisStyle(
          baseFamily,
          style === 'bold' || style === 'boldItalic' ? 700 : 400,
          style === 'italic' || style === 'boldItalic',
        )

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
              <Text style={faceFor(piece.style)}>{piece.text}</Text>
              {piece.spaceAfter && (
                // The whole trick: a lone space, drawn in its own run's face,
                // widened by exactly what the breaker allotted this gap.
                <Text
                  style={{
                    ...faceFor(piece.spaceAfter.style),
                    letterSpacing: piece.spaceAfter.extraPx,
                  }}
                >
                  {' '}
                </Text>
              )}
            </Fragment>
          ))}
          {line.hyphenated && (
            <Text style={faceFor(line.pieces.at(-1)?.style ?? 'regular')}>-</Text>
          )}
          {i < lines.length - 1 && <Text>{'\n'}</Text>}
        </Fragment>
      ))}
    </Text>
  )
}
