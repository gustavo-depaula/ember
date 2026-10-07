// Primitive vocabulary — the small fixed set of renderable nodes the
// PracticeFlow renderer dispatches on.
//
// Sources output Primitives (or Primitive[]). Authors compose Primitives in
// flow JSON, with `Include` as the one node that defers to a ContentSource.

import type { BilingualText, PickerStyle, RenderedSection } from '@ember/content-engine'

type LiturgicalColor = 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'

export type TextPrimitive = {
  type: 'text'
  text: BilingualText
  voice?: 'priest' | 'people' | 'all'
  style?: 'normal' | 'italic'
  // 'do' routes the text through the Divinum Officium inline renderer, which
  // styles verse numbers, mediant/pointing marks and small caps. Default
  // (undefined) uses the standard markdown inline renderer.
  markup?: 'do'
}

export type HeadingPrimitive = {
  type: 'heading'
  text: BilingualText
  size?: 'h1' | 'h2'
  // A small line under the heading saying where its text comes from ("do
  // Saltério do dia correspondente"), DO's braced suffix.
  note?: BilingualText
}

export type RubricPrimitive = {
  type: 'rubric'
  text: BilingualText
}

// A tappable external link (opens the in-app browser / a new tab). The renderer
// owns the open behavior, so sources never embed raw URLs as prose.
export type LinkPrimitive = {
  type: 'link'
  text: BilingualText
  href: string
}

export type DividerPrimitive = {
  type: 'divider'
}

export type VersesPrimitive = {
  type: 'verses'
  header?: BilingualText
  items: {
    num?: string | number
    // Cento citations differ by language ("Ps. 55:9" / "Sl 55,9"), so they
    // can't ride on `num`, which is a single value shared by both columns.
    ref?: BilingualText
    text: BilingualText
    // 'v'/'r' tag explicit role for versicle/response pairs — the renderer
    // shouldn't have to sniff at the num field to figure it out.
    role?: 'v' | 'r'
    // A red label set in the ℣/℟ column in their place: 'Ant.', '℟.br.',
    // 'Bênção.'. Only with style 'vr'.
    mark?: string
  }[]
  // 'cento' sets `ref` as a muted lead-in on the same line as the verse, for
  // psalms stitched from many references where a full citation ("Ps. 56:1")
  // would be too wide for the numbered style's gutter.
  style?: 'numbered' | 'vr' | 'cento'
  fallback?: boolean
  // As on TextPrimitive: the item text carries Divinum Officium inline markup.
  markup?: 'do'
}

export type ImagePrimitive = {
  type: 'image'
  src: string
  caption?: BilingualText
  attribution?: BilingualText
}

// Grouped images. `display` picks the layout:
//   carousel — snap-scroll with peek and dots (default)
//   stack    — vertical figure list
//   row      — side-by-side; renderer promotes to bleed-and-swipe when items
//              would shrink below their comfortable minimum width.
// `weights` only applies in `row` mode; if present, its length must equal
// items.length and the numbers become flex-basis ratios.
export type GalleryPrimitive = {
  type: 'gallery'
  display: 'carousel' | 'stack' | 'row'
  weights?: number[]
  caption?: BilingualText
  items: GalleryItem[]
}

export type GalleryItem = {
  src: string
  alt?: BilingualText
  title?: BilingualText
  attribution?: BilingualText
  caption?: BilingualText
}

export type HolyCardPrimitive = {
  type: 'holy-card'
  image: string
  title?: BilingualText
  attribution?: BilingualText
  prayer?: BilingualText
}

// Inline run inside a paragraph or blockquote.
export type ProseInline =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string }
  | { kind: 'ref'; ref: string; text: string }
  | { kind: 'break' }

// Block-level element produced by a reader-kind source, already parsed (and
// cached in SQLite) so the renderer never reparses. The source classifies
// semantic roles; anything it doesn't recognize stays a plain 'paragraph'.
//
// `structural: true` tags interstitial content that *introduces* the next
// item (chapter/section/part divider + intro quote between Q&As of the
// Compendium), which the renderer may hide.
export type ProseHeadingLevel = 'part' | 'chapter' | 'section' | 'article'

export type ProseBlock =
  | {
      kind: 'paragraph'
      id?: string
      className?: string
      inline: ProseInline[]
      structural?: boolean
    }
  | {
      kind: 'question'
      id: string
      number: string
      text: string
    }
  | {
      kind: 'heading'
      level: ProseHeadingLevel
      text: string
      structural?: boolean
    }
  | {
      kind: 'subheading'
      text: string
      structural?: boolean
    }
  | {
      kind: 'paragraph-number'
      text: string
      structural?: boolean
    }
  | {
      kind: 'blockquote'
      children: ProseBlock[]
      structural?: boolean
    }

export type ProsePrimitive = {
  type: 'prose'
  // Engine-emitted prose carries rich text (markdown-ish, localized).
  // Reader-kind sources emit pre-parsed `blocks` instead, so the renderer
  // is a pure walk and Vatican.va HTML never reaches the render path.
  text?: BilingualText
  blocks?: ProseBlock[]
  anchors?: Record<string, { chapter: string }>
}

export type CalloutPrimitive = {
  type: 'callout'
  variant: 'section-marker' | 'celebration-banner' | 'liturgical-color'
  title?: BilingualText
  body?: BilingualText
  color?: LiturgicalColor
  rank?: BilingualText
  cycle?: BilingualText
}

export type ContainerBehavior =
  | { kind: 'group' }
  | { kind: 'collapsible'; title: BilingualText; defaultOpen: boolean }
  | {
      kind: 'select'
      label: BilingualText
      overrideKey: string
      selectedId: string
      pickerStyle?: PickerStyle
      options: ContainerOption[]
    }
  | { kind: 'options'; label: BilingualText; pickerStyle?: PickerStyle; options: ContainerOption[] }
  | { kind: 'color-scope'; color: LiturgicalColor }
  | {
      kind: 'prayer'
      title: BilingualText
      text: BilingualText
      count?: number
      defaultOpen?: boolean
    }
  | { kind: 'liturgical-prayer'; speaker: 'priest' | 'people' | 'all'; text: BilingualText }

export type ContainerOption = {
  id: string
  label: BilingualText
  excerpt?: BilingualText
  // Preprocessed body. For `select` options, only the initially-selected
  // branch is preprocessed eagerly; the rest carry `rawSections` and are
  // preprocessed on demand (see SelectBranch).
  children: Primitive[]
  // Un-preprocessed engine output for a `select` branch, kept so non-selected
  // branches can be preprocessed lazily client-side without a full re-resolve.
  rawSections?: RenderedSection[]
}

export type ContainerPrimitive = {
  type: 'container'
  behavior: ContainerBehavior
  // Container-with-options uses behavior.options[].children; container-with-
  // group/collapsible/color-scope/prayer uses this top-level children list.
  children?: Primitive[]
}

export type Primitive =
  | TextPrimitive
  | HeadingPrimitive
  | RubricPrimitive
  | LinkPrimitive
  | DividerPrimitive
  | VersesPrimitive
  | ImagePrimitive
  | GalleryPrimitive
  | HolyCardPrimitive
  | ProsePrimitive
  | CalloutPrimitive
  | ContainerPrimitive

export type Include = {
  type: 'include'
  source: string
  params: Record<string, unknown>
}

export type FlowNode = Primitive | Include
