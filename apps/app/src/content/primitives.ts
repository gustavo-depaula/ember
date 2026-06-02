// Primitive vocabulary — the small fixed set of renderable nodes the
// PracticeFlow renderer dispatches on. Today's ~25-variant RenderedSection
// will collapse onto these once the engine + sources are migrated.
//
// Sources output Primitives (or Primitive[]). Authors compose Primitives in
// flow JSON, with `Include` as the one node that defers to a ContentSource.

import type {
  BilingualRichText,
  BilingualText,
  PickerStyle,
  RenderedSection,
} from '@ember/content-engine'

type LiturgicalColor = 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'

// — Leaf primitives —

export type TextPrimitive = {
  type: 'text'
  text: BilingualText
  voice?: 'priest' | 'people' | 'all'
  style?: 'normal' | 'italic'
}

export type HeadingPrimitive = {
  type: 'heading'
  text: BilingualText
  size?: 'h1' | 'h2'
}

export type RubricPrimitive = {
  type: 'rubric'
  text: BilingualText
}

export type DividerPrimitive = {
  type: 'divider'
}

export type VersesPrimitive = {
  type: 'verses'
  header?: BilingualText
  items: {
    num?: string | number
    text: BilingualText
    // 'v'/'r' tag explicit role for versicle/response pairs — the renderer
    // shouldn't have to sniff at the num field to figure it out.
    role?: 'v' | 'r'
  }[]
  style?: 'numbered' | 'vr'
  fallback?: boolean
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

// Block-level element produced by a reader-kind source (already parsed —
// the source does the HTML→structured-tree work once, and SQLite caches
// the result, so the renderer never reparses).
//
// Semantic kinds (question, heading, subheading, paragraph-number) are
// detected by the source after the raw HTML walk, so the renderer can
// dispatch to a styled component per role instead of squinting at <b>/<p>
// classes. Anything the classifier doesn't recognize stays a plain
// 'paragraph' — a safe fallback that still renders as body prose.
//
// `structural: true` tags interstitial content that *introduces* the next
// item (chapter/section/part divider + intro quote between Q&As of the
// Compendium). The renderer can opt to hide structural blocks when the
// user wants the answers without the source-document chrome.
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

// — Container primitive — one shape, behavior discriminator drives UX —

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
  | {
      kind: 'choice-rich-text'
      label: BilingualText
      overrideKey: string
      selectedId?: string
      pickerStyle?: PickerStyle
      hideLabel?: boolean
      precedingResponse?: BilingualText
      options: ChoiceRichTextOption[]
    }

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

export type ChoiceRichTextOption = {
  id: string
  label: BilingualText
  body: BilingualRichText
  citation?: BilingualText
  summary?: BilingualText
  introduction?: BilingualText
  conclusion?: BilingualText
  response?: BilingualRichText
  excerpt?: BilingualText
}

export type ContainerPrimitive = {
  type: 'container'
  behavior: ContainerBehavior
  // Container-with-options uses behavior.options[].children; container-with-
  // group/collapsible/color-scope/prayer uses this top-level children list.
  children?: Primitive[]
}

// — Interaction primitive — gathers all stateful UI under one kind —

export type InteractionPrimitive =
  | {
      type: 'interaction'
      kind: 'proper'
      slot: string
      form: 'of' | 'ef'
      description: BilingualText
    }
  | {
      type: 'interaction'
      kind: 'offering'
      mode: 'intercessory' | 'thanksgiving' | 'both'
      default: 'pinned' | 'all-active' | 'user-pick'
      show: 'list' | 'count' | 'silent'
      label?: BilingualText
    }
  | {
      type: 'interaction'
      kind: 'capture-movement'
      movement: 'intention' | 'thanksgiving'
      prompt: BilingualText
      multi: boolean
      defaultCadence?: 'perpetual' | 'goal' | 'bounded'
    }
  | {
      type: 'interaction'
      kind: 'capture-resolution'
      level: 'daily'
      forward: 'current' | 'next'
      prompt: BilingualText
      window: { starts_at: number; ends_at: number }
      prefill?: { resolution_id: string; text: string }
    }
  | {
      type: 'interaction'
      kind: 'review-resolution'
      mode: 'review' | 'checkin' | 'show'
      target: 'active-daily' | 'pending-daily'
      resolution?: { id: string; text: string; level: 'daily' }
      prompt?: BilingualText
      outcomes: Array<'kept' | 'partial' | 'broken'>
      allowNotes: boolean
    }

// — Union —

export type Primitive =
  | TextPrimitive
  | HeadingPrimitive
  | RubricPrimitive
  | DividerPrimitive
  | VersesPrimitive
  | ImagePrimitive
  | GalleryPrimitive
  | HolyCardPrimitive
  | ProsePrimitive
  | CalloutPrimitive
  | ContainerPrimitive
  | InteractionPrimitive

// — Include: what authors write when they want data from a ContentSource —

export type Include = {
  type: 'include'
  source: string
  params: Record<string, unknown>
}

// — Author-visible flow node: a primitive or a content source reference. —

export type FlowNode = Primitive | Include
