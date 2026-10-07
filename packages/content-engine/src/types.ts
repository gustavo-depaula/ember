export type ContentLanguage = 'en-US' | 'pt-BR' | 'la'

export type BilingualText = {
  primary: string
  secondary?: string
  secondaryMissing?: boolean
}

export type LocalizedText = { 'en-US'?: string; 'pt-BR'?: string }
export type LocalizedContent = { 'en-US'?: string; 'pt-BR'?: string; la?: string }

export type CycleData = {
  indexBy: 'day-of-month' | 'day-of-week' | 'fixed' | 'program-day'
  contextKey?: string
  entries: Record<string, unknown[]>
}

// Dynamic prose content injected at runtime (e.g., liturgical meditation text)
export type ResolvedProse = Record<string, LocalizedContent>

export type LectioTrackDef = {
  source: 'bible' | 'catechism'
  label: LocalizedText
  entries: string[]
}

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

// Adding a section type? Also register it in scripts/validate-flows.ts
// (KNOWN_SECTION_TYPES) and the workshop flow editor (FlowNodeForm, FlowTree,
// FlowPreview) — each keeps its own list and otherwise errors or renders `[type]`.
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
  // `bare: true` drops the reference framing entirely — no title, no
  // toggle — so the prayer reads as part of the flow's own text. Use when the
  // flow already names it (a heading right above).
  | { type: 'prayer'; ref: string; defaultOpen?: boolean; bare?: boolean }
  | { type: 'prayer'; speaker?: 'priest' | 'people' | 'all'; inline: LocalizedContent }
  | { type: 'prayer'; title: LocalizedText; sections: FlowSection[]; defaultOpen?: boolean }
  | { type: 'hymn'; ref: string }
  | { type: 'hymn'; inline: LocalizedContent; title?: string | LocalizedContent }
  | { type: 'canticle'; ref: string }
  | {
      type: 'canticle'
      inline: { title: LocalizedText; subtitle?: LocalizedText; text: LocalizedContent }
    }
  | { type: 'meditation'; text: LocalizedText }
  // A psalm stitched from verses drawn out of many places in Scripture (a
  // cento) — St Francis' offices are built this way, so every line carries its
  // own reference. `ref` is localized because the book abbreviation differs by
  // language (Ps. / Sl), and it renders subordinate to the prayed text rather
  // than sharing its weight.
  | { type: 'psalm'; verses: { ref?: LocalizedText; text: LocalizedContent }[] }
  // A line may stand alone: a lone ℟. Amen., or a Kyrie whose third ℣ follows
  // the ℟ with no answer of its own.
  | { type: 'response'; verses: { v?: LocalizedText; r?: LocalizedText }[] }
  // An antiphon framing a psalm or canticle, set with the breviary's red "Ant."
  | { type: 'antiphon'; text: LocalizedText }
  | { type: 'subheading'; text: LocalizedText }
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
      // Generic extension point: invoke a registered content producer. The
      // engine passes it through unchanged; the app resolves it asynchronously
      // in preprocessFlow.
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
      // A plan slot may fix this choice (keyed by `as`), making the slot that
      // option — "Prime" rather than "Roman Breviary". Top-level selects only.
      pin?: boolean
      label?: LocalizedText
      map?: Record<string, string>
      default?: string
      pickerStyle?: PickerStyle
      options: {
        id: string
        label: LocalizedText
        excerpt?: LocalizedText
        // `false` keeps an option out of a pinnable select's slot choices —
        // the breviary's votive office is its own office, not one more hour.
        pin?: boolean
        // When a plan slot pinned to this option is set by default ("07:00").
        time?: string
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
      // useful for a chrome-only section that should disappear entirely when
      // its one conditional block emits nothing.
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
      // Typographic break for major Mass divisions (Initial Rites, Liturgy of
      // the Word, …); `heading` is for ordinary sub-section labels. `colorFrom`
      // tints the rules in the day's vestment color, untinted when unknown.
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
)

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
  | { type: 'psalm'; verses: { ref?: BilingualText; text: BilingualText }[] }
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
  | { type: 'response'; verses: { v?: BilingualText; r?: BilingualText }[] }
  | { type: 'antiphon'; text: BilingualText }
  | { type: 'subheading'; text: BilingualText }
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
      pickerStyle?: PickerStyle
      options: {
        id: string
        label: BilingualText
        excerpt?: BilingualText
        sections: RenderedSection[]
      }[]
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

export type PickerStyle = 'chips' | 'cards'
