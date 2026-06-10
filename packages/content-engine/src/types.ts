// See docs/features/features-overview.md for the full spec

export type ContentLanguage = 'en-US' | 'pt-BR' | 'la'

export type BilingualText = {
  primary: string
  secondary?: string
  secondaryMissing?: boolean
}

export type LocalizedText = { 'en-US'?: string; 'pt-BR'?: string }
export type LocalizedContent = { 'en-US'?: string; 'pt-BR'?: string; la?: string }

// --- Cycle Data (practice-owned static data files) ---

export type CycleData = {
  indexBy: 'day-of-month' | 'day-of-week' | 'fixed' | 'program-day'
  contextKey?: string
  entries: Record<string, unknown[]>
}

// Dynamic prose content injected at runtime (e.g., liturgical meditation text)
export type ResolvedProse = Record<string, LocalizedContent>

// --- Lectio Tracks (practice-owned reading plans) ---

export type LectioTrackDef = {
  source: 'bible' | 'catechism'
  label: LocalizedText
  entries: string[]
}

// --- Flow Definition (JSON input) ---

export type RepeatEntry = Record<string, string | LocalizedText | undefined>

export type ResolveStep = {
  data: string
  source?: string
  dataType?: string
  calendar?: 'ef' | 'of'
  strategy: string
  as: string
  book?: string
}

/**
 * Load step — registry-based data resolution. The `source` field names a
 * registered DataSource (see packages/content-engine/src/data-sources.ts).
 * Any additional fields are passed as args to `source.load(args, ctx)`.
 * The result is bound to FlowContext.flowData[as].
 *
 * Processed by resolveFlowAsync (async; sources may fetch from disk).
 */
export type LoadStep = {
  as: string
  source: string
  [arg: string]: unknown
}

export type FlowDefinition = {
  flowVersion?: '1'
  data?: Record<string, RepeatEntry[]>
  resolve?: ResolveStep[]
  load?: LoadStep[]
  sections: FlowSection[]
  fragments?: Record<string, FlowSection[]>
  // Paths to additional fragment files (relative to the flow file's
  // directory). Each file is a partial FlowDefinition whose `fragments`
  // map is merged into this flow's. Lets large practices split their
  // fragment library across multiple files instead of one giant flow.json.
  fragmentSources?: string[]
}

export type FlowSection = { lang?: string } & (
  | { type: 'rubric'; text: LocalizedText }
  | { type: 'divider' }
  | {
      type: 'heading'
      // Either a literal `text` or a `from` path resolved against the
      // FlowContext (e.g. `celebration.primary.title`) — `from` reads a
      // LocalizedText shape and localizes via ec.localize.
      text?: LocalizedText
      from?: string
    }
  | { type: 'image'; src: string; caption?: LocalizedText; attribution?: LocalizedText }
  // `defaultOpen: true` renders the embedded prayer expanded on first paint
  // (still tappable to collapse). Use when the prayer isn't reliably known by
  // heart and the text being on the page matters — Te Deum, Anima Christi,
  // litanies, Marian antiphons, the Leonine St. Michael, the *En ego*, etc.
  // Default collapsed is right for Hail Mary, Sign of the Cross, Glory Be.
  | { type: 'prayer'; ref: string; defaultOpen?: boolean }
  | { type: 'prayer'; speaker?: 'priest' | 'people' | 'all'; inline: LocalizedContent }
  | { type: 'prayer'; title: LocalizedText; sections: FlowSection[]; defaultOpen?: boolean }
  | { type: 'hymn'; ref: string }
  | { type: 'hymn'; inline: LocalizedContent }
  | { type: 'canticle'; ref: string }
  | {
      type: 'canticle'
      inline: { title: LocalizedText; subtitle?: LocalizedText; text: LocalizedContent }
    }
  | { type: 'meditation'; text: LocalizedText }
  | { type: 'response'; verses: { v: LocalizedText; r: LocalizedText }[] }
  | { type: 'subheading'; text: LocalizedText }
  | { type: 'proper'; slot: string; form: 'of' | 'ef'; description: LocalizedText }
  | {
      type: 'options'
      label: LocalizedText
      // 'chips' (default) — tight horizontal toggle, body unfolds beneath.
      // 'cards' — vertical card list with each option's excerpt visible
      //          alongside the title; useful when option bodies are long
      //          (Eucharistic Prayers, prefaces) and the user wants to
      //          identify the right one at a glance during Mass.
      pickerStyle?: PickerStyle
      options: { id: string; label: LocalizedText; lang?: string; sections: FlowSection[] }[]
    }
  | {
      type: 'options'
      label: LocalizedText
      from: string
      sections: FlowSection[]
    }
  | {
      type: 'repeat'
      count: number
      sections: FlowSection[]
    }
  | {
      type: 'repeat'
      count?: number
      from: string
      sections: FlowSection[]
    }
  | { type: 'cycle'; data: string; sections: FlowSection[] }
  | { type: 'lectio'; track: string }
  | { type: 'lectio'; reference: string }
  | {
      // Generic extension point: invoke a registered content producer at
      // render time. The flow engine passes it through unchanged — async
      // resolution lives in the renderer (TanStack Query keyed by ref).
      type: 'include'
      ref: string
      params?: Record<string, unknown>
    }
  | { type: 'prose'; file: string }
  | {
      type: 'prose'
      book: string
      chapter: string
      langPolicy?: 'active-language' | 'fallback-content-language' | 'book-default'
    }
  | {
      type: 'select'
      on?: string | string[]
      as?: string
      label?: LocalizedText
      map?: Record<string, string>
      default?: string
      options: {
        id: string
        label: LocalizedText
        sections?: FlowSection[]
      }[]
    }
  | {
      type: 'select'
      from: string
      as: string
      idFrom?: string
      labelFrom?: string
      label?: LocalizedText
      hideIfSingle?: boolean
      default?: string
      body: FlowSection[]
    }
  | {
      // Grouped images — one of three layouts. `carousel` (default) is the
      // peek-and-snap browser; `stack` is a vertical figure list; `row` is
      // side-by-side composition that auto-promotes to bleed-and-swipe when
      // items don't fit. `weights` only applies in `row` mode; if present,
      // its length must match items.length. Per-item fields are all optional;
      // `alt` is the a11y label (not rendered).
      type: 'gallery'
      display?: 'carousel' | 'stack' | 'row'
      weights?: number[]
      caption?: LocalizedText
      items: {
        src: string
        alt?: LocalizedText
        title?: LocalizedText
        attribution?: LocalizedText
        caption?: LocalizedText
      }[]
    }
  | {
      type: 'holy-card'
      image: string
      title?: LocalizedText
      attribution?: LocalizedText
      prayer?: LocalizedText
    }
  | { type: 'fragment'; ref: string }
  | { type: 'call'; ref: string; args?: Record<string, unknown> }
  | {
      // Wraps a body of sections that should collapse together. With
      // `skipIfEmpty: true`, the group emits nothing when its children resolve
      // to only structural primitives (subheading / divider / heading) —
      // useful for a chrome-only section like the Examen's Verificatio that
      // should disappear entirely when its `review-resolution skip_if_none`
      // has no resolution to surface.
      type: 'group'
      sections: FlowSection[]
      skipIfEmpty?: boolean
    }
  | {
      // Wraps a body and propagates a liturgical-vestment color through
      // React context to descendants. SectionMarker rules + OptionCard
      // selected borders pick it up as a fallback when they don't set
      // their own color, so the day's identity threads through the page
      // without every primitive needing to declare colorFrom.
      type: 'liturgical-color-scope'
      from: string
      sections: FlowSection[]
    }
  | {
      // Typographic break for major Mass divisions (Initial Rites,
      // Liturgy of the Word, etc.). Renders as a centered uppercase
      // title between thin horizontal rules — the missal-page-break
      // feel. Distinct from `heading`, which is reserved for normal
      // sub-section labels (Antífona de Entrada, Glória, Credo, …).
      // Optional `colorFrom` dotted path resolves a liturgical-color
      // string and tints the rules in the day's vestment color
      // (subtle, low-opacity); skip the tint if the path resolves to
      // an unknown color.
      type: 'section-marker'
      title: LocalizedText
      colorFrom?: string
    }
  | {
      // Collapsible group — title is always visible; sections reveal on tap.
      // Use for dense explanatory rubric blocks and silent priest prayers
      // (Preparação das Oferendas, etc.) that overwhelm the audible flow.
      // Defaults to collapsed; set `defaultOpen: true` to start expanded.
      // `defaultOpenFrom` (dotted path against FlowContext) overrides
      // `defaultOpen` when the resolved value coerces to a boolean — used
      // to gate the Gloria's open/closed state on `celebration.primary.includeGloria`.
      type: 'collapsible'
      title: LocalizedText
      defaultOpen?: boolean
      defaultOpenFrom?: string
      sections: FlowSection[]
    }
  | {
      // Renders a colored swatch + localized label for the liturgical color
      // at `from`. `from` is a dotted path resolved against FlowContext
      // (e.g. `celebration.primary.liturgicalColor`). Renderer draws a small
      // dot in the actual color (white/red/green/violet/rose/black).
      type: 'liturgical-color'
      from: string
    }
  | {
      // Hero block at the top of the day's body: liturgical-color dot
      // inline with a large title, plus subtle rank + cycle metadata
      // beneath. `from` points at a celebration object (like
      // `celebration` or `celebration.primary`) and the renderer pulls
      // title / rank / liturgicalColor itself; cycle comes from `cycleFrom`
      // (typically `day.cycle`).
      type: 'celebration-banner'
      from: string
      cycleFrom?: string
    }
  | {
      type: 'offering'
      mode: 'intercessory' | 'thanksgiving' | 'both'
      default?: 'pinned' | 'all-active' | 'user-pick'
      show?: 'list' | 'count' | 'silent'
      label?: LocalizedText
      scope?: 'practice' | 'section'
    }
  | {
      type: 'capture-movement'
      kind: 'intention' | 'thanksgiving'
      prompt: LocalizedText
      multi?: boolean
      defaults?: { cadence?: 'perpetual' | 'goal' | 'bounded' }
    }
  | {
      type: 'capture-resolution'
      level: 'daily'
      for?: 'current' | 'next'
      prompt: LocalizedText
    }
  | {
      type: 'review-resolution'
      mode?: 'review' | 'checkin' | 'show'
      target: 'active-daily' | 'pending-daily'
      prompt?: LocalizedText
      outcomes?: Array<'kept' | 'partial' | 'broken'>
      allow_notes?: boolean
      skip_if_none?: boolean
    }
  | {
      // Per-slot picker over a celebration's primary + alternates formularies.
      // Reads `<celebrationPath>.primary[slot]` and each `<celebrationPath>.alternates[i][slot]`,
      // filters out empty slots, renders a chip toggle + the selected source's
      // typed segments. See packages/mass-of for the celebration shape.
      type: 'choice-rich-text'
      label: LocalizedText
      slot: string
      celebration?: string
      default?: string
      // Don't preselect any option on first load — render the picker with
      // no card highlighted and no body. The user has to tap a card to
      // pick one. Persists via selectOverrides once chosen.
      defaultBlank?: boolean
      citation?: string
      pickerStyle?: PickerStyle
      // Suppress the renderer-derived heading when an outer `subheading` already names the slot.
      hideLabel?: boolean
      // Static people's response rendered between the slot's `introduction`
      // and `body`. Used on the Gospel slot, where the missal places the
      // people's "Glory to you, O Lord." response immediately after the
      // priest's "✠ A reading from the holy Gospel..." announcement.
      // The slot's own `response` field still renders after `conclusion`
      // (the post-body "Praise to you, Lord Jesus Christ" response).
      precedingResponse?: LocalizedText
    }
)

// --- Rendered Sections (engine output, consumed by renderer) ---

export type RenderedSection =
  | { type: 'rubric'; label: BilingualText }
  | { type: 'divider' }
  | { type: 'heading'; text: BilingualText }
  | { type: 'image'; src: string; caption?: BilingualText; attribution?: BilingualText }
  | {
      type: 'prayer'
      title: BilingualText
      text: BilingualText
      count?: number
      speaker?: 'priest' | 'people' | 'all'
      sections?: RenderedSection[]
      defaultOpen?: boolean
    }
  | { type: 'hymn'; title: BilingualText; text: BilingualText }
  | {
      type: 'canticle'
      title: BilingualText
      subtitle: BilingualText
      source: BilingualText
      text: BilingualText
    }
  | { type: 'meditation'; text: BilingualText }
  | {
      type: 'section-marker'
      title: BilingualText
      color?: 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'
    }
  | {
      type: 'collapsible'
      title: BilingualText
      defaultOpen: boolean
      sections: RenderedSection[]
    }
  | {
      type: 'liturgical-color'
      color: 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'
      label: BilingualText
    }
  | {
      type: 'liturgical-color-scope'
      color: 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'
      sections: RenderedSection[]
    }
  | {
      type: 'celebration-banner'
      title: BilingualText
      color?: 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'
      // Localized labels — engine builds these from rank + cycle ids.
      rank?: BilingualText
      cycle?: BilingualText
    }
  | { type: 'response'; verses: { v: BilingualText; r: BilingualText }[] }
  | { type: 'subheading'; text: BilingualText }
  | { type: 'proper'; slot: string; form: 'of' | 'ef'; description: BilingualText }
  | {
      type: 'options'
      label: BilingualText
      pickerStyle?: PickerStyle
      options: {
        id: string
        label: BilingualText
        sections: RenderedSection[]
        excerpt?: BilingualText
      }[]
    }
  | {
      type: 'select'
      label: BilingualText
      overrideKey: string
      selectedId: string
      options: { id: string; label: BilingualText; sections: RenderedSection[] }[]
    }
  | { type: 'include'; ref: string; params?: Record<string, unknown>; trackId?: string }
  | { type: 'prose'; text: BilingualText }
  | {
      type: 'gallery'
      display?: 'carousel' | 'stack' | 'row'
      weights?: number[]
      caption?: BilingualText
      items: {
        src: string
        alt?: BilingualText
        title?: BilingualText
        attribution?: BilingualText
        caption?: BilingualText
      }[]
    }
  | {
      type: 'holy-card'
      image: string
      title?: BilingualText
      attribution?: BilingualText
      prayer?: BilingualText
    }
  | {
      type: 'rendered-offering'
      mode: 'intercessory' | 'thanksgiving' | 'both'
      default: 'pinned' | 'all-active' | 'user-pick'
      show: 'list' | 'count' | 'silent'
      label?: BilingualText
    }
  | {
      type: 'rendered-capture-movement'
      kind: 'intention' | 'thanksgiving'
      prompt: BilingualText
      multi: boolean
      defaultCadence?: 'perpetual' | 'goal' | 'bounded'
    }
  | {
      type: 'rendered-capture-resolution'
      level: 'daily'
      forward: 'current' | 'next'
      prompt: BilingualText
      window: { starts_at: number; ends_at: number }
      prefill?: { resolution_id: string; text: string }
    }
  | {
      type: 'rendered-review-resolution'
      mode: 'review' | 'checkin' | 'show'
      target: 'active-daily' | 'pending-daily'
      resolution?: {
        id: string
        text: string
        level: 'daily'
      }
      prompt?: BilingualText
      outcomes: Array<'kept' | 'partial' | 'broken'>
      allow_notes: boolean
    }
  | {
      // Per-slot picker rendered as a chip toggle + the selected source's typed
      // rich-text segments. The renderer (ProperSlot) draws the chips, the
      // selected option's body, and any citation. Selection persists via
      // overrideKey in selectOverrides.
      type: 'choice-rich-text'
      label: BilingualText
      overrideKey: string
      selectedId?: string
      pickerStyle?: PickerStyle
      hideLabel?: boolean
      precedingResponse?: BilingualText
      options: {
        id: string
        label: BilingualText
        body: BilingualRichText
        citation?: BilingualText
        summary?: BilingualText
        introduction?: BilingualText
        conclusion?: BilingualText
        response?: BilingualRichText
        excerpt?: BilingualText
      }[]
    }

export type RichTextSegmentType =
  | 'text'
  | 'rubric'
  | 'reference'
  | 'italic'
  | 'response'
  | 'signOfCross'
  | 'dropCap'

export type RichTextSegment = {
  type: RichTextSegmentType
  text: string
}

export type RichTextLine = RichTextSegment[]

export type BilingualRichText = {
  primary: RichTextLine[]
  secondary?: RichTextLine[]
}

export type PickerStyle = 'chips' | 'cards'
