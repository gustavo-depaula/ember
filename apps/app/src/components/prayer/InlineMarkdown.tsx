// biome-ignore-all lint/suspicious/noArrayIndexKey: parsed inline nodes never reorder
import { Fragment } from 'react'
import { Platform, Text as RNText, type TextStyle } from 'react-native'

import { bodyFont } from '@/config/fonts'
import type { TextStyleName } from '@/lib/typography/fontMetrics'

import { type InlineNode, parseInline } from './parseMarkdown'

// react-native-web's Text base class sets the `font` shorthand (14px, black),
// which resets every font property a nested span doesn't name — emphasis inside
// 19px burgundy text rendered 14px black. Re-inherit what the span doesn't
// override. Native nested <Text> inherits correctly; the cast is because
// `inherit` isn't in RN's style types.
const inheritFromParent = (
  Platform.OS === 'web' ? { color: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' } : {}
) as TextStyle

/**
 * EB Garamond's italics are separate families, so the face carries the slant
 * and `fontStyle` must be `normal` — `italic` on top makes the browser shear a
 * true italic twice. Other reading fonts load Regular only and need a synthetic
 * `fontStyle: 'italic'`. An upright face always states `normal` so roman
 * emphasis doesn't inherit an italic block's slant.
 */
function faceProps(baseFamily: string, weight: 400 | 700, italic: boolean): TextStyle {
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
 * Emphasis is a change of face: `*x*` slants upright text and flips italic text
 * (a meditation, a rubric) to roman; `**x**` adds weight and keeps the slant.
 * Single source of truth for the face the justifier measures and the renderer
 * draws — they must never disagree.
 */
export function composeStyle(node: InlineNode['type'], base: TextStyleName): TextStyleName {
  const { bold, italic } = styleParts[base]
  if (node === 'bold') return styleNamed(true, italic)
  if (node === 'italic') return styleNamed(bold, !italic)
  if (node === 'bolditalic') return styleNamed(true, !italic)
  return base
}

// React Native's Text ignores inherited fontWeight/fontStyle when fontFamily is
// set, so nested emphasis must resolve a concrete face.
export function styleToFace(baseFamily: string, style: TextStyleName): TextStyle {
  const { bold, italic } = styleParts[style]
  return { ...inheritFromParent, ...faceProps(baseFamily, bold ? 700 : 400, italic) }
}

/**
 * A block's own face, without inheritance keys. A synthetic shear of the roman
 * keeps roman advances, so a justifier measuring the real italic would break
 * lines that re-wrap on screen; naming the face keeps them in agreement.
 */
export function blockFace(baseFamily: string, style: TextStyleName): TextStyle {
  const { bold, italic } = styleParts[style]
  return faceProps(baseFamily, bold ? 700 : 400, italic)
}

function InlineText({
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

/**
 * For short text inside a parent `<Text>`: renders inline emphasis only and
 * inherits size and color from the parent.
 */
export function InlineMarkdown({ source }: { source: string }) {
  const nodes = parseInline(source)
  return <InlineText nodes={nodes} baseFamily={bodyFont.family ?? ''} />
}

/**
 * Inline markdown over an italic base, as the child of
 * `<Typography variant="rubric">` — a styled component can't map a string to
 * spans.
 */
export function InlineMarkdownRubric({ source }: { source: string }) {
  return <InlineText nodes={parseInline(source)} baseFamily={bodyFont.family ?? ''} base="italic" />
}
