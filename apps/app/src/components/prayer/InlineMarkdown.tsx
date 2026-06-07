import { Fragment } from 'react'
import { Text as RNText } from 'react-native'

import { bodyFont } from '@/config/fonts'

import { parseInline } from './parseMarkdown'

/**
 * Inline markdown renderer for short text fields that live inside a parent
 * `<Text>` wrapper (annotation rows, todo notes, compact metadata). Renders
 * only inline emphasis (bold, italic, bold-italic) — block-level constructs
 * pass through as plain text. Inherits font size and color from the parent;
 * swaps the concrete font face for emphasis since RN's Text drops inherited
 * fontWeight/fontStyle when fontFamily is set.
 */
function bodyFace(weight: 400 | 700, italic: boolean): string {
  const variants = bodyFont.face?.[weight]
  return (italic ? variants?.italic : variants?.normal) ?? bodyFont.family
}

export function InlineMarkdown({ source }: { source: string }) {
  const nodes = parseInline(source)
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'bold':
            // biome-ignore lint/suspicious/noArrayIndexKey: parsed nodes never reorder
            return (
              <RNText key={i} style={{ fontFamily: bodyFace(700, false) }}>
                {node.text}
              </RNText>
            )
          case 'italic':
            // biome-ignore lint/suspicious/noArrayIndexKey: parsed nodes never reorder
            return (
              <RNText key={i} style={{ fontFamily: bodyFace(400, true) }}>
                {node.text}
              </RNText>
            )
          case 'bolditalic':
            // biome-ignore lint/suspicious/noArrayIndexKey: parsed nodes never reorder
            return (
              <RNText key={i} style={{ fontFamily: bodyFace(700, true) }}>
                {node.text}
              </RNText>
            )
          default:
            // biome-ignore lint/suspicious/noArrayIndexKey: parsed nodes never reorder
            return <Fragment key={i}>{node.text}</Fragment>
        }
      })}
    </>
  )
}
