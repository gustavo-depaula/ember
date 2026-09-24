// biome-ignore-all lint/suspicious/noArrayIndexKey: a paragraph's segments are positional and never reorder
import { Fragment, useMemo } from 'react'
import type { TextStyle } from 'react-native'
import { Text } from 'tamagui'

import { hyphenate } from '@/lib/hyphenate'
import type { TextStyleName } from '@/lib/typography/fontMetrics'
import type { Appearance, StyledSegment } from '@/lib/typography/justifyText'
import { styleToFace } from '../prayer/InlineMarkdown'

export type Faces = Record<TextStyleName, TextStyle | undefined>

/**
 * Emphasis resolves to a concrete font face, because React Native ignores
 * inherited fontWeight/fontStyle once fontFamily is set. Built once per family
 * so runs share style identities instead of minting one apiece.
 *
 * Only the block's own face is left to the parent. Every other style names its
 * face outright — including `regular`, which inside an italic block is a
 * deliberate flip back to roman and cannot be had by inheriting.
 */
export function useFaces(baseFamily: string, base: TextStyleName): Faces {
  return useMemo(() => {
    const resolved = (style: TextStyleName) =>
      style === base ? undefined : styleToFace(baseFamily, style)
    return {
      regular: resolved('regular'),
      bold: resolved('bold'),
      italic: resolved('italic'),
      boldItalic: resolved('boldItalic'),
    }
  }, [baseFamily, base])
}

/**
 * A run's full drawing style: its face, the size it was measured at when that
 * differs from the paragraph's, and whatever draw-only props it declared.
 * Order matters — `render` is last so a caller's colour wins, and it is
 * documented never to carry a metric-bearing property.
 *
 * The justified lines and the ragged rendering both draw through this, which is
 * what keeps the face the breaker measured and the face the reader sees the
 * same thing on either path.
 */
export function drawStyle(faces: Faces, look: Appearance): TextStyle | undefined {
  const face = faces[look.style]
  if (!face && !look.render && look.fontSizePx === undefined && look.letterSpacing === undefined)
    return undefined
  return {
    ...face,
    ...(look.fontSizePx === undefined ? undefined : { fontSize: look.fontSizePx }),
    ...(look.letterSpacing === undefined ? undefined : { letterSpacing: look.letterSpacing }),
    ...look.render,
  }
}

/**
 * The segments as ordinary wrapped text — what renders wherever the line model
 * isn't available (the first frame before `onLayout`, a face whose width can't
 * be known, a paragraph the breaker declined) and whenever the reader asks for
 * ragged right. Derived from the same segments the breaker is handed, so
 * emphasis, marks and tap targets survive exactly where justification gives up.
 *
 * The platform does the breaking here, so it is handed soft hyphens: long words
 * soft-wrap in the content's own language instead of leaving a gaping line.
 * An atom — a citation, a verse number — is never hyphenated.
 */
export function SegmentRuns({
  segments,
  faces,
  language,
}: {
  segments: StyledSegment[]
  faces: Faces
  language: string
}) {
  return (
    <>
      {segments.map((segment, i) => {
        const text = segment.atomic ? segment.text : hyphenate(segment.text, language)
        const style = drawStyle(faces, segment)
        if (!style && !segment.onPress) return <Fragment key={i}>{text}</Fragment>
        return (
          <Text key={i} style={style} onPress={segment.onPress}>
            {text}
          </Text>
        )
      })}
    </>
  )
}
