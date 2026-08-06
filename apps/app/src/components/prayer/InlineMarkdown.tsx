// biome-ignore-all lint/suspicious/noArrayIndexKey: parsed inline nodes never reorder
import { Fragment } from 'react'
import { Platform, Text as RNText, type TextStyle } from 'react-native'

import { bodyFont } from '@/config/fonts'
import { hyphenate } from '@/lib/hyphenate'
import type { TextStyleName } from '@/lib/typography/fontMetrics'

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
  return { ...inheritFromParent, ...faceProps(baseFamily, weight, italic) }
}

/**
 * Family/weight/style for a face, with no inheritance keys — safe on a root
 * `<Text>` that has no text parent to inherit from.
 *
 * `fontStyle` is always stated, and which value depends on where the slant
 * comes from. EB Garamond ships real italics registered as their own families,
 * so the FACE carries the slant and `fontStyle` must be `normal`: asking for
 * `italic` on top makes the browser shear a true italic a second time. The
 * other reading fonts load Regular only, so there the slant has to come from
 * `fontStyle` and a synthetic oblique is the best available. Either way an
 * upright face says `normal` outright, which is what lets roman emphasis show
 * through an italic block instead of inheriting its slant.
 */
export function faceProps(baseFamily: string, weight: 400 | 700, italic: boolean): TextStyle {
  if (baseFamily.startsWith('EBGaramond')) {
    const variants = bodyFont.face?.[weight]
    return {
      fontFamily: (italic ? variants?.italic : variants?.normal) ?? baseFamily,
      fontStyle: 'normal',
    }
  }
  return {
    fontFamily: baseFamily,
    fontStyle: italic ? 'italic' : 'normal',
    ...(weight === 700 ? { fontWeight: '700' } : {}),
  }
}

const styleParts: Record<TextStyleName, { bold: boolean; italic: boolean }> = {
  regular: { bold: false, italic: false },
  bold: { bold: true, italic: false },
  italic: { bold: false, italic: true },
  boldItalic: { bold: true, italic: true },
}

const styleNamed = (bold: boolean, italic: boolean): TextStyleName =>
  bold ? (italic ? 'boldItalic' : 'bold') : italic ? 'italic' : 'regular'

/**
 * The face an inline node takes over the face its block is already set in.
 *
 * Emphasis is a *change* of face, not a fixed one. In upright text `*x*` slants.
 * In text that is already italic — a meditation, a rubric — it cannot slant
 * further, so it flips to roman: the standing typographic convention for
 * emphasis inside italics, and the only rendering that is actually visible.
 * `**x**` adds weight and leaves the slant where it found it.
 *
 * One rule for both registers, and the single source of truth for the two
 * things that must never disagree — the face the justifier measures and the
 * face the renderer draws.
 */
export function composeStyle(node: InlineNode['type'], base: TextStyleName): TextStyleName {
  const { bold, italic } = styleParts[base]
  if (node === 'bold') return styleNamed(true, italic)
  if (node === 'italic') return styleNamed(bold, !italic)
  if (node === 'bolditalic') return styleNamed(true, !italic)
  return base
}

/** A `TextStyleName` as the concrete face that renders it, inside a text run. */
export function styleToFace(baseFamily: string, style: TextStyleName): TextStyle {
  const { bold, italic } = styleParts[style]
  return emphasisStyle(baseFamily, bold ? 700 : 400, italic)
}

/**
 * The same face for a block's own `<Text>`, without the inheritance keys.
 *
 * Naming it is not cosmetic. Left to `fontStyle: 'italic'` over a roman family,
 * a meditation renders as a synthetic shear of the roman — whose advances are
 * the ROMAN advances, so a justifier measuring the real italic table would
 * break lines that then re-wrap on screen. Saying which face is in play is what
 * keeps measurement and rendering the same thing, and it gets true italics
 * where the family has them.
 */
export function blockFace(baseFamily: string, style: TextStyleName): TextStyle {
  const { bold, italic } = styleParts[style]
  return faceProps(baseFamily, bold ? 700 : 400, italic)
}

export function InlineText({
  nodes,
  baseFamily,
  base = 'regular',
}: {
  nodes: InlineNode[]
  baseFamily: string
  /** The face the enclosing block is set in — a meditation is italic throughout. */
  base?: TextStyleName
}) {
  return (
    <>
      {nodes.map((node, i) => {
        const style = composeStyle(node.type, base)
        // A node that resolves to the block's own face needs no override; the
        // parent already draws it.
        if (style === base) return <Fragment key={i}>{node.text}</Fragment>
        return (
          <RNText key={i} style={styleToFace(baseFamily, style)}>
            {node.text}
          </RNText>
        )
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
  base = 'regular',
}: {
  text: string
  baseFamily: string
  language?: string
  base?: TextStyleName
}) {
  const nodes = parseInline(text).map((n) => ({ ...n, text: hyphenate(n.text, language) }))
  return <InlineText nodes={nodes} baseFamily={baseFamily} base={base} />
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

/**
 * Inline markdown for the rubric register — burgundy italic instruction text.
 * Same `*italic*` / `**bold**` / `***both***` vocabulary authors already use in
 * prayer bodies; it is `InlineText` over an italic base, so the flip to roman
 * comes from the one rule rather than a second copy of it.
 *
 * Lives here rather than in `Typography` because a styled component can't map a
 * string to spans; call it as the child of `<Typography variant="rubric">`.
 */
export function InlineMarkdownRubric({ source }: { source: string }) {
  return <InlineText nodes={parseInline(source)} baseFamily={bodyFont.family ?? ''} base="italic" />
}
