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
 * Built once per family so runs share style identities. Only the block's own
 * face is left to the parent; `regular` inside an italic block is a flip back
 * to roman and must be named, not inherited.
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
 * Both the justified and the ragged path draw through this, so the face the
 * breaker measured is the face on screen. `render` goes last so a caller's
 * colour wins; it never carries a metric-bearing property.
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
 * The segments as platform-wrapped text, wherever the line model isn't
 * available or the reader chose ragged right. Soft hyphens let long words wrap
 * in the content's language; an atom (citation, verse number) never hyphenates.
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
