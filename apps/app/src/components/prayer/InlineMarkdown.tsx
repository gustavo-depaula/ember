// biome-ignore-all lint/suspicious/noArrayIndexKey: parsed inline nodes never reorder
import { Fragment } from 'react'
import { Text as RNText, type TextStyle } from 'react-native'

import { bodyFont } from '@/config/fonts'
import { hyphenate } from '@/lib/hyphenate'

import { type InlineNode, parseInline } from './parseMarkdown'

// React Native's Text ignores inherited fontWeight/fontStyle when fontFamily is
// set, so nested emphasis must resolve a concrete font face. EB Garamond ships
// dedicated bold/italic faces; other reading fonts load only Regular, so fall
// back to synthetic weight/style on the base family.
export function emphasisStyle(baseFamily: string, weight: 400 | 700, italic: boolean): TextStyle {
  if (baseFamily.startsWith('EBGaramond')) {
    const variants = bodyFont.face?.[weight]
    return { fontFamily: (italic ? variants?.italic : variants?.normal) ?? baseFamily }
  }
  return {
    fontFamily: baseFamily,
    ...(weight === 700 ? { fontWeight: '700' } : {}),
    ...(italic ? { fontStyle: 'italic' } : {}),
  }
}

export function InlineText({ nodes, baseFamily }: { nodes: InlineNode[]; baseFamily: string }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'bold':
            return (
              <RNText key={i} style={emphasisStyle(baseFamily, 700, false)}>
                {node.text}
              </RNText>
            )
          case 'italic':
            return (
              <RNText key={i} style={emphasisStyle(baseFamily, 400, true)}>
                {node.text}
              </RNText>
            )
          case 'bolditalic':
            return (
              <RNText key={i} style={emphasisStyle(baseFamily, 700, true)}>
                {node.text}
              </RNText>
            )
          default:
            return <Fragment key={i}>{node.text}</Fragment>
        }
      })}
    </>
  )
}

// Inline markdown for a single line of prayer text. Parses `*italic*` /
// `**bold**` / `***bolditalic***`, then hyphenates each segment so long words
// soft-wrap at the same boundaries as in plain text.
export function InlineMarkdownLine({
  text,
  baseFamily,
  language,
}: {
  text: string
  baseFamily: string
  language?: string
}) {
  const nodes = parseInline(text).map((n) => ({ ...n, text: hyphenate(n.text, language) }))
  return <InlineText nodes={nodes} baseFamily={baseFamily} />
}

/**
 * Inline markdown renderer for short text fields that live inside a parent
 * `<Text>` wrapper (annotation rows, todo notes, compact metadata). Renders
 * only inline emphasis (bold, italic, bold-italic) — block-level constructs
 * pass through as plain text. Inherits font size and color from the parent.
 */
export function InlineMarkdown({ source }: { source: string }) {
  const nodes = parseInline(source)
  return <InlineText nodes={nodes} baseFamily={bodyFont.family ?? ''} />
}
