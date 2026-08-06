// biome-ignore-all lint/suspicious/noArrayIndexKey: parsed inline nodes never reorder
import { Fragment } from 'react'
import { Platform, Text as RNText, type TextStyle } from 'react-native'

import { bodyFont } from '@/config/fonts'
import { hyphenate } from '@/lib/hyphenate'

import { type InlineNode, parseInline } from './parseMarkdown'

// React Native Web's Text base class is `{ color: rgb(0,0,0); font: 14px
// -apple-system, … }` — and the `font` *shorthand* resets every font property
// it doesn't name. So a span that sets only `fontFamily` keeps the reset: 14px,
// `line-height: normal`, black, whatever size and ink and leading it was nested
// in. Emphasis inside 19px prayer text rendered at 14px; inside a burgundy
// rubric it rendered black.
//
// Re-inherit everything the span is not deliberately overriding. Native nested
// <Text> inherits correctly, so this is web-only, and the CSS keyword is not in
// React Native's style types — hence the cast.
const inheritFromParent = (
  Platform.OS === 'web' ? { color: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' } : {}
) as TextStyle

// React Native's Text ignores inherited fontWeight/fontStyle when fontFamily is
// set, so nested emphasis must resolve a concrete font face. EB Garamond ships
// dedicated bold/italic faces; other reading fonts load only Regular, so fall
// back to synthetic weight/style on the base family.
export function emphasisStyle(baseFamily: string, weight: 400 | 700, italic: boolean): TextStyle {
  if (baseFamily.startsWith('EBGaramond')) {
    const variants = bodyFont.face?.[weight]
    return {
      ...inheritFromParent,
      fontFamily: (italic ? variants?.italic : variants?.normal) ?? baseFamily,
    }
  }
  return {
    ...inheritFromParent,
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

// Emphasis inside a run that is *already* italic. `*x*` cannot be more italic,
// so it flips to roman — the classic typographic answer, and the only one that
// reads at rubric size. Bold keeps the slant and adds weight; `***x***` is bold
// flipped, for the same reason `*x*` is.
//
// Every face is named outright and every node states `fontStyle: 'normal'`: the
// chosen EB Garamond face already carries the slant it needs, so leaving the
// parent's italic in play would slant a true italic a second time (web inherits
// it as CSS) or be dropped entirely (React Native ignores an inherited style
// once `fontFamily` is set).
const italicRunFaces = {
  italic: bodyFont.face?.[400]?.normal,
  bold: bodyFont.face?.[700]?.italic,
  bolditalic: bodyFont.face?.[700]?.normal,
} as const

/**
 * Inline markdown for the rubric register — burgundy italic instruction text.
 * Same `*italic*` / `**bold**` / `***both***` vocabulary authors already use in
 * prayer bodies, resolved against an italic baseline instead of an upright one.
 *
 * Lives here rather than in `Typography` because a styled component can't map a
 * string to spans; call it as the child of `<Typography variant="rubric">`.
 */
export function InlineMarkdownRubric({ source }: { source: string }) {
  return (
    <>
      {parseInline(source).map((node, i) => {
        const face = node.type === 'text' ? undefined : italicRunFaces[node.type]
        if (!face) return <Fragment key={i}>{node.text}</Fragment>
        return (
          <RNText key={i} style={{ ...inheritFromParent, fontFamily: face, fontStyle: 'normal' }}>
            {node.text}
          </RNText>
        )
      })}
    </>
  )
}
