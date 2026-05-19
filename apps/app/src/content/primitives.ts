// Primitive vocabulary — the small fixed set of renderable nodes the
// PracticeFlow renderer dispatches on. Today's ~25-variant RenderedSection
// will collapse onto these once the engine + sources are migrated.
//
// Sources output Primitives (or Primitive[]). Authors compose Primitives in
// flow JSON, with `Include` as the one node that defers to a ContentSource.

import type { BilingualRichText, BilingualText, PickerStyle } from '@ember/content-engine'

type LiturgicalColor =
  | 'white'
  | 'red'
  | 'green'
  | 'violet'
  | 'rose'
  | 'black'
  | 'gold'

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

export type HolyCardPrimitive = {
  type: 'holy-card'
  image: string
  title?: BilingualText
  attribution?: BilingualText
  prayer?: BilingualText
}

export type ProsePrimitive = {
  type: 'prose'
  // Either: rich text (markdown — what the engine emits) or raw HTML
  // (what reader-style content sources emit). Renderer picks the right block.
  text?: BilingualText
  html?: string
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
  | { kind: 'select'; label: BilingualText; overrideKey: string; selectedId: string; pickerStyle?: PickerStyle; options: ContainerOption[] }
  | { kind: 'options'; label: BilingualText; pickerStyle?: PickerStyle; options: ContainerOption[] }
  | { kind: 'color-scope'; color: LiturgicalColor }
  | { kind: 'prayer'; title: BilingualText; text: BilingualText; count?: number }
  | { kind: 'liturgical-prayer'; speaker: 'priest' | 'people' | 'all'; text: BilingualText }
  | { kind: 'choice-rich-text'; label: BilingualText; overrideKey: string; selectedId?: string; pickerStyle?: PickerStyle; hideLabel?: boolean; options: ChoiceRichTextOption[] }

export type ContainerOption = {
  id: string
  label: BilingualText
  excerpt?: BilingualText
  children: Primitive[]
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
  | { type: 'interaction'; kind: 'proper'; slot: string; form: 'of' | 'ef'; description: BilingualText }
  | { type: 'interaction'; kind: 'offering'; mode: 'intercessory' | 'thanksgiving' | 'both'; default: 'pinned' | 'all-active' | 'user-pick'; show: 'list' | 'count' | 'silent'; label?: BilingualText }
  | { type: 'interaction'; kind: 'capture-movement'; movement: 'intention' | 'thanksgiving'; prompt: BilingualText; multi: boolean; defaultCadence?: 'perpetual' | 'goal' | 'bounded' }
  | { type: 'interaction'; kind: 'capture-resolution'; level: 'daily'; forward: 'current' | 'next'; prompt: BilingualText; window: { starts_at: number; ends_at: number }; prefill?: { resolution_id: string; text: string } }
  | { type: 'interaction'; kind: 'review-resolution'; mode: 'review' | 'checkin' | 'show'; target: 'active-daily' | 'pending-daily'; resolution?: { id: string; text: string; level: 'daily' }; prompt?: BilingualText; outcomes: Array<'kept' | 'partial' | 'broken'>; allowNotes: boolean }

// — Union —

export type Primitive =
  | TextPrimitive
  | HeadingPrimitive
  | RubricPrimitive
  | DividerPrimitive
  | VersesPrimitive
  | ImagePrimitive
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
