import { type ComponentProps, Fragment, useMemo, useState } from 'react'
import { Text } from 'tamagui'

import type { ReadingFontId } from '@/config/readingFonts'
import { justifyText } from '@/lib/typography/justifyText'

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
  text,
  fontFamilyId,
  fontSizePx,
  language,
  enabled = true,
  ...textProps
}: {
  text: string
  fontFamilyId: ReadingFontId
  fontSizePx: number
  language?: string
  /** When false, renders plain wrapped text (e.g. the reader's "left" mode). */
  enabled?: boolean
} & ComponentProps<typeof Text>) {
  const [width, setWidth] = useState(0)

  const lines = useMemo(() => {
    if (!enabled || !width) return undefined
    // A pixel of headroom. Our widths are exact against the font tables, but
    // the platform rounds when it rasterizes — and a line that ends up one
    // sub-pixel too wide does not just look wrong, it wraps, pushing a word
    // onto a line the breaker never planned.
    return justifyText({
      text,
      widthPx: width - 1,
      fontSizePx,
      fontFamilyId,
      language,
    })
  }, [enabled, width, text, fontSizePx, fontFamilyId, language])

  // onLayout gives us the measure the breaker needs; until it fires (and if
  // justification declines) this is just a normal Text.
  const onLayout = (e: { nativeEvent: { layout: { width: number } } }) => {
    const w = e.nativeEvent.layout.width
    if (w && Math.abs(w - width) > 0.5) setWidth(w)
  }

  if (!lines?.length) {
    return (
      <Text {...textProps} onLayout={onLayout}>
        {text}
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
          {line.words.map((word, w) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: same
            <Fragment key={w}>
              <Text>{word}</Text>
              {w < line.words.length - 1 && (
                // The whole trick: a lone space widened to the width the
                // breaker chose for this line.
                <Text style={{ letterSpacing: line.extraSpacePx }}> </Text>
              )}
            </Fragment>
          ))}
          {line.hyphenated && <Text>-</Text>}
          {i < lines.length - 1 && <Text>{'\n'}</Text>}
        </Fragment>
      ))}
    </Text>
  )
}
