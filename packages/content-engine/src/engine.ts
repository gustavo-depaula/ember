import {
  getLiturgicalDayName,
  getLiturgicalSeason,
  type LiturgicalDayMap,
  type PsalmRef,
  type ReadingReference,
  resolveLiturgicalDay,
} from '@ember/liturgical'
import { getDate, getDay } from 'date-fns'
import { getDataSource, type SourceContext } from './data-sources'
import type {
  BilingualRichText,
  BilingualText,
  ContentLanguage,
  CycleData,
  FlowDefinition,
  FlowSection,
  LectioTrackDef,
  LocalizedContent,
  LocalizedText,
  RenderedSection,
  RepeatEntry,
  ResolvedProse,
  ResolveStep,
  RichTextLine,
} from './types'

export type PrayerAsset = {
  title: LocalizedContent
  subtitle?: LocalizedContent
  source?: LocalizedContent
  body: FlowSection[]
}

export type EngineContext = {
  language: string
  contentLanguage: ContentLanguage
  localize: (text: string | { 'en-US'?: string; 'pt-BR'?: string; la?: string }) => BilingualText
  localizeUI: (text: { 'en-US'?: string; 'pt-BR'?: string }) => string
  t: (key: string, opts?: Record<string, unknown>) => string
  parsePsalmRef: (ref: number | string) => PsalmRef
  parseTrackEntry: (
    source: 'bible' | 'catechism',
    entry: string,
    bookName: (slug: string) => string,
  ) => ReadingReference[]
  prayers: Record<string, PrayerAsset>
  canticles: Record<string, PrayerAsset>
  prose: Record<string, { 'en-US'?: string; 'pt-BR'?: string }>
  getBookChapterTitle?: (book: string, chapter: string, lang: string) => string | undefined
  loadBookChapterText?: (
    book: string,
    chapter: string,
    lang: string,
  ) => LocalizedContent | undefined
  loadBookChapterTextAsync?: (
    book: string,
    chapter: string,
    lang: string,
  ) => Promise<LocalizedContent | undefined>
  getBookLanguages?: (book: string) => string[]
  /**
   * Optional asset readers used by data sources. When not supplied, fetchOwnAsset
   * falls back to FlowContext.cycleData[path] for backward compatibility with
   * the existing data declaration mechanism.
   */
  fetchAsset?: (libraryId: string, path: string) => Promise<unknown>
  fetchOwnAsset?: (path: string) => Promise<unknown>
}

export type FlowContext = {
  date: Date
  numbering?: string
  liturgicalCalendar?: string
  trackDefs?: Record<string, LectioTrackDef>
  trackState?: Record<string, { current_index: number }>
  cycleData?: Record<string, CycleData>
  programDay?: number
  templateVars?: Record<string, string>
  resolvedProse?: ResolvedProse
  // Holds both legacy iteration arrays (RepeatEntry[]) and DataSource load results (arbitrary objects).
  flowData?: Record<string, unknown>
  selectOverrides?: Record<string, string>
  fragments?: Record<string, FlowSection[]>
}

/**
 * Walk a dotted path through FlowContext data.
 *
 * Single-segment lookups try flowData → templateVars → getContextValue
 * (preserving existing behavior for `select.on: 'dayOfWeek'`, etc.).
 * Multi-segment paths walk flowData / templateVars; any segment that
 * misses returns undefined.
 */
export function resolvePath(context: FlowContext, path: string): unknown {
  if (!path.includes('.')) {
    const direct = context.flowData?.[path]
    if (direct !== undefined) return direct
    const tv = context.templateVars?.[path]
    if (tv !== undefined) return tv
    return getContextValue(context, path)
  }

  const [head, ...rest] = path.split('.')
  let value: unknown = context.flowData?.[head] ?? context.templateVars?.[head]

  for (const seg of rest) {
    if (value === null || value === undefined) return undefined
    if (typeof value !== 'object') return undefined
    value = (value as Record<string, unknown>)[seg]
  }

  return value
}

const ordinalsEn = [
  'First',
  'Second',
  'Third',
  'Fourth',
  'Fifth',
  'Sixth',
  'Seventh',
  'Eighth',
  'Ninth',
  'Tenth',
  'Eleventh',
  'Twelfth',
  'Thirteenth',
  'Fourteenth',
  'Fifteenth',
  'Sixteenth',
  'Seventeenth',
  'Eighteenth',
  'Nineteenth',
  'Twentieth',
]

const ordinalsPtBR = [
  'Primeiro',
  'Segundo',
  'Terceiro',
  'Quarto',
  'Quinto',
  'Sexto',
  'Sétimo',
  'Oitavo',
  'Nono',
  'Décimo',
  'Décimo Primeiro',
  'Décimo Segundo',
  'Décimo Terceiro',
  'Décimo Quarto',
  'Décimo Quinto',
  'Décimo Sexto',
  'Décimo Sétimo',
  'Décimo Oitavo',
  'Décimo Nono',
  'Vigésimo',
]

function getOrdinal(index: number, language: string): string {
  const ordinals = language === 'pt-BR' ? ordinalsPtBR : ordinalsEn
  return ordinals[index] ?? String(index + 1)
}

function walkVarPath(vars: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.')
  let value: unknown = vars[segments[0]]
  for (let i = 1; i < segments.length; i++) {
    if (value === null || value === undefined) return undefined
    if (typeof value !== 'object') return undefined
    value = (value as Record<string, unknown>)[segments[i]]
  }
  return value
}

function substituteTemplateVars(text: string, vars: Record<string, unknown>): string {
  return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const value = walkVarPath(vars, path)
    if (value === undefined || value === null) return match
    return typeof value === 'string' ? value : String(value)
  })
}

function deepSubstitute(obj: unknown, vars: Record<string, unknown>): unknown {
  if (typeof obj === 'string') return substituteTemplateVars(obj, vars)
  if (Array.isArray(obj)) return obj.map((item) => deepSubstitute(item, vars))
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      result[k] = deepSubstitute(v, vars)
    }
    return result
  }
  return obj
}

function substituteInFlowSection(section: FlowSection, vars: Record<string, unknown>): FlowSection {
  return deepSubstitute(section, vars) as FlowSection
}

/** Build the substitution vars from a FlowContext: flowData ∪ templateVars (templateVars wins). */
function composeVars(
  context: FlowContext,
  overlay: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...(context.flowData ?? {}),
    ...(context.templateVars ?? {}),
    ...overlay,
  }
}

function resolveEntryVars(
  entry: Record<string, string | LocalizedText | undefined>,
  ec: EngineContext,
): Record<string, string | undefined> {
  const vars: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(entry)) {
    vars[k] =
      typeof v === 'object' && v !== null && ('en-US' in v || 'pt-BR' in v)
        ? ec.localizeUI(v as LocalizedText)
        : typeof v === 'string'
          ? v
          : undefined
  }
  return vars
}

const bilingualEmpty: BilingualText = { primary: '' }

function bilingualOf(text: string): BilingualText {
  return { primary: text }
}

function resolvePrayerRef(ref: string, context: FlowContext, ec: EngineContext): RenderedSection[] {
  const asset = ec.prayers[ref]
  if (!asset) {
    return [
      {
        type: 'prayer',
        title: bilingualOf(ref),
        text: bilingualOf(`[Unknown prayer ref: ${ref}]`),
      },
    ]
  }
  // Legacy format: body was LocalizedContent before migration to FlowSection[]
  if (!Array.isArray(asset.body)) {
    return [
      {
        type: 'prayer',
        title: ec.localize(asset.title),
        text: ec.localize(asset.body as unknown as LocalizedContent),
      },
    ]
  }
  const resolved = asset.body.flatMap((s) => resolveSection(s, context, ec))
  // Single inline prayer: attach the asset title for collapsible rendering
  if (resolved.length === 1 && resolved[0].type === 'prayer') {
    return [{ ...resolved[0], title: ec.localize(asset.title) }]
  }
  // Multi-section prayer: wrap in a prayer section with nested sections
  return [
    {
      type: 'prayer',
      title: ec.localize(asset.title),
      text: bilingualEmpty,
      sections: resolved,
    },
  ]
}

function resolveCanticleRef(
  ref: string,
  context: FlowContext,
  ec: EngineContext,
): RenderedSection[] {
  const asset = ec.canticles[ref]
  if (!asset) {
    return [
      {
        type: 'canticle',
        title: bilingualOf(ref),
        subtitle: bilingualEmpty,
        source: bilingualEmpty,
        text: bilingualOf(`[Unknown canticle ref: ${ref}]`),
      },
    ]
  }
  // Legacy format: body was LocalizedContent before migration to FlowSection[]
  if (!Array.isArray(asset.body)) {
    return [
      {
        type: 'canticle',
        title: ec.localize(asset.title),
        subtitle: asset.subtitle ? ec.localize(asset.subtitle) : bilingualEmpty,
        source: asset.source ? ec.localize(asset.source) : bilingualEmpty,
        text: ec.localize(asset.body as unknown as LocalizedContent),
      },
    ]
  }
  // Canticles with subtitle/source render as a single canticle block
  // using the first inline prayer's text
  if (asset.subtitle || asset.source) {
    const resolved = asset.body.flatMap((s) => resolveSection(s, context, ec))
    const textSection = resolved.find((s) => s.type === 'prayer')
    return [
      {
        type: 'canticle',
        title: ec.localize(asset.title),
        subtitle: asset.subtitle ? ec.localize(asset.subtitle) : bilingualEmpty,
        source: asset.source ? ec.localize(asset.source) : bilingualEmpty,
        text: textSection && textSection.type === 'prayer' ? textSection.text : bilingualEmpty,
      },
    ]
  }
  return asset.body.flatMap((s) => resolveSection(s, context, ec))
}

function resolveInlinePrayer(
  inline: LocalizedContent,
  ec: EngineContext,
  speaker?: 'priest' | 'people' | 'all',
): RenderedSection {
  return {
    type: 'prayer',
    title: bilingualEmpty,
    text: ec.localize(inline),
    ...(speaker && { speaker }),
  }
}

function resolveRepeat(
  section: FlowSection & { type: 'repeat' },
  context: FlowContext,
  ec: EngineContext,
): RenderedSection[] {
  if ('from' in section) {
    const fromPath = substituteTemplateVars(section.from, composeVars(context))
    const value = resolvePath(context, fromPath)
    const entries = (Array.isArray(value) ? value : []) as RepeatEntry[]
    if (!entries.length) return []

    const iterCount = section.count ? Math.min(section.count, entries.length) : entries.length
    return Array.from({ length: iterCount }, (_, i) => {
      const entry = entries[i]
      const resolved = entry ? resolveEntryVars(entry, ec) : {}
      const overlay: Record<string, unknown> = {
        ...resolved,
        index: String(i),
        ordinal: getOrdinal(i, ec.language),
      }
      const definedTemplateVars: Record<string, string> = {
        ...context.templateVars,
        ...Object.fromEntries(
          Object.entries(resolved).filter((e): e is [string, string] => e[1] !== undefined),
        ),
        index: String(i),
        ordinal: getOrdinal(i, ec.language),
      }
      const iterContext = { ...context, templateVars: definedTemplateVars }
      const substVars = composeVars(context, overlay)
      return section.sections.flatMap((s) => {
        const substituted = substituteInFlowSection(s, substVars)
        return resolveSection(substituted, iterContext, ec)
      })
    }).flat()
  }

  const { count, sections: templateSections } = section

  // Collapse repeated single-prayer refs into one section with a count
  if (
    templateSections.length === 1 &&
    templateSections[0].type === 'prayer' &&
    'ref' in templateSections[0]
  ) {
    const resolved = resolvePrayerRef(templateSections[0].ref, context, ec)
    if (resolved.length === 1 && resolved[0].type === 'prayer') {
      return [{ ...resolved[0], count }]
    }
    return resolved
  }

  return Array.from({ length: count }, (_, i) => {
    const overlay: Record<string, string> = {
      index: String(i),
      ordinal: getOrdinal(i, ec.language),
    }
    const iterContext = {
      ...context,
      templateVars: { ...context.templateVars, ...overlay },
    }
    const substVars = composeVars(context, overlay)
    return templateSections.flatMap((s) => {
      const substituted = substituteInFlowSection(s, substVars)
      return resolveSection(substituted, iterContext, ec)
    })
  }).flat()
}

function getCycleIndex(indexBy: string, date: Date, length: number, context: FlowContext): number {
  if (indexBy === 'program-day') return (context.programDay ?? 0) % length
  if (indexBy === 'day-of-month') return (getDate(date) - 1) % length
  if (indexBy === 'day-of-week') return getDay(date)
  if (indexBy === 'fixed') return 0
  return 0
}

function mapCycleOutput(as: string, raw: unknown, ec: EngineContext): RenderedSection[] {
  if (as === 'psalmody') {
    return [{ type: 'psalmody', psalms: (raw as (number | string)[]).map(ec.parsePsalmRef) }]
  }
  if (as === 'hymn') {
    const data = raw as {
      title: string
      la?: string
      text: { 'en-US'?: string; 'pt-BR'?: string; la?: string }
    }
    return [
      {
        type: 'hymn',
        title: bilingualOf(data.title),
        text: ec.localize({ ...data.text, la: data.la }),
      },
    ]
  }
  return []
}

function resolveSection(
  section: FlowSection,
  context: FlowContext,
  ec: EngineContext,
): RenderedSection[] {
  if (section.lang && section.lang !== ec.contentLanguage) return []

  switch (section.type) {
    case 'rubric':
      return [{ type: 'rubric', label: ec.localize(section.text) }]

    case 'divider':
      return [{ type: 'divider' }]

    case 'heading': {
      // `from` reads a LocalizedText from the FlowContext (e.g. the
      // celebration title); falls back to `text`. Skip emission if neither
      // resolves to anything renderable.
      let source: string | LocalizedText | undefined = section.text
      if (section.from) {
        const resolved = resolvePath(context, section.from)
        if (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) {
          source = resolved as LocalizedText
        } else if (typeof resolved === 'string') {
          source = resolved
        }
      }
      if (!source) return []
      return [{ type: 'heading', text: ec.localize(source) }]
    }

    case 'image':
      return [
        {
          type: 'image',
          src: section.src,
          caption: section.caption ? ec.localize(section.caption) : undefined,
          attribution: section.attribution ? ec.localize(section.attribution) : undefined,
        },
      ]

    case 'prayer':
      if ('ref' in section) return resolvePrayerRef(section.ref, context, ec)
      if ('inline' in section) return [resolveInlinePrayer(section.inline, ec, section.speaker)]
      if ('title' in section && 'sections' in section) {
        const resolved = section.sections.flatMap((s) => resolveSection(s, context, ec))
        return [
          {
            type: 'prayer',
            title: ec.localize(section.title),
            text: bilingualEmpty,
            sections: resolved,
          },
        ]
      }
      return []

    case 'hymn':
      if ('ref' in section) {
        return [
          {
            type: 'hymn',
            title: bilingualOf(section.ref),
            text: bilingualOf(`[Hymn ref: ${section.ref}]`),
          },
        ]
      }
      if ('inline' in section) {
        return [
          {
            type: 'hymn',
            title: bilingualEmpty,
            text: ec.localize(section.inline),
          },
        ]
      }
      return []

    case 'canticle':
      if ('ref' in section) return resolveCanticleRef(section.ref, context, ec)
      if ('inline' in section) {
        return [
          {
            type: 'canticle',
            title: ec.localize(section.inline.title),
            subtitle: section.inline.subtitle
              ? ec.localize(section.inline.subtitle)
              : bilingualEmpty,
            source: bilingualEmpty,
            text: ec.localize(section.inline.text),
          },
        ]
      }
      return []

    case 'meditation':
      return [{ type: 'meditation', text: ec.localize(section.text) }]

    case 'response':
      return [
        {
          type: 'response',
          verses: section.verses.map((v) => ({
            v: ec.localize(v.v),
            r: ec.localize(v.r),
          })),
        },
      ]

    case 'repeat':
      return resolveRepeat(section, context, ec)

    case 'cycle': {
      const cycleData = context.cycleData?.[section.data]
      if (!cycleData) return []

      const contextValue = cycleData.contextKey
        ? getContextValue(context, cycleData.contextKey)
        : undefined
      const entries = (
        contextValue
          ? (cycleData.entries[contextValue] ?? Object.values(cycleData.entries)[0])
          : Object.values(cycleData.entries)[0]
      ) as unknown[]
      if (!entries?.length) return []

      const index = getCycleIndex(cycleData.indexBy, context.date, entries.length, context)
      const entry = entries[index]

      if (section.as === 'template' && section.sections) {
        const entryVars = resolveEntryVars(
          entry as Record<string, string | LocalizedText | undefined>,
          ec,
        )
        const substVars = composeVars(context, entryVars)
        return section.sections.flatMap((s) => {
          const substituted = substituteInFlowSection(s, substVars)
          return resolveSection(substituted, context, ec)
        })
      }

      const raw = section.key ? (entry as Record<string, unknown>)[section.key] : entry
      return mapCycleOutput(section.as, raw, ec)
    }

    case 'psalmody':
      return [{ type: 'psalmody', psalms: section.psalms.map(ec.parsePsalmRef) }]

    case 'lectio': {
      if ('reference' in section) {
        const resolveBookName = (slug: string) => ec.t(`bookName.${slug}`, { defaultValue: slug })
        const refs = ec.parseTrackEntry('bible', section.reference, resolveBookName)
        return refs.map((ref) => ({ type: 'reading' as const, reference: ref }))
      }
      const def = context.trackDefs?.[section.track]
      const state = context.trackState?.[section.track]
      if (!def || !state)
        return [{ type: 'rubric', label: bilingualOf('[Reading track not loaded]') }]
      const entry = def.entries[state.current_index % def.entries.length]
      const resolveBookName = (slug: string) => ec.t(`bookName.${slug}`, { defaultValue: slug })
      const refs = ec.parseTrackEntry(def.source, entry, resolveBookName)
      return refs.map((ref) => ({
        type: 'reading' as const,
        reference: ref,
        trackId: section.track,
      }))
    }

    case 'subheading':
      return [{ type: 'subheading', text: ec.localize(section.text) }]

    case 'proper':
      return [
        {
          type: 'proper',
          slot: section.slot,
          form: section.form,
          description: ec.localize(section.description),
        },
      ]

    case 'options': {
      if ('from' in section) {
        const fromPath = substituteTemplateVars(section.from, composeVars(context))
        const value = resolvePath(context, fromPath)
        const entries = (Array.isArray(value) ? value : []) as RepeatEntry[]
        if (!entries.length) return []

        const resolved = entries
          .map((entry, i) => {
            const vars = resolveEntryVars(entry, ec)
            const labelText = vars.label
            if (!labelText) return undefined
            const entryId = vars.id ?? String(i)
            const overlay = { ...vars, index: String(i) }
            const substVars = composeVars(context, overlay)
            return {
              id: entryId,
              label: ec.localize({ 'pt-BR': labelText, 'en-US': labelText }),
              sections: section.sections.flatMap((s) => {
                const substituted = substituteInFlowSection(s, substVars)
                return resolveSection(substituted, context, ec)
              }),
            }
          })
          .filter(
            (opt): opt is NonNullable<typeof opt> => opt !== undefined && opt.sections.length > 0,
          )

        if (resolved.length === 0) return []
        if (resolved.length === 1) return resolved[0].sections
        return [{ type: 'options' as const, label: ec.localize(section.label), options: resolved }]
      }
      const resolved = section.options
        .filter((opt) => !opt.lang || opt.lang === ec.contentLanguage)
        .map((opt) => {
          const sections = opt.sections.flatMap((s) => resolveSection(s, context, ec))
          return {
            id: opt.id,
            label: ec.localize(opt.label),
            sections,
            ...(section.pickerStyle === 'cards' ? { excerpt: deriveOptionExcerpt(sections) } : {}),
          }
        })
        .filter((opt) => opt.sections.length > 0)
      if (resolved.length === 0) return []
      if (resolved.length === 1) return resolved[0].sections
      return [
        {
          type: 'options',
          label: ec.localize(section.label),
          ...(section.pickerStyle ? { pickerStyle: section.pickerStyle } : {}),
          options: resolved,
        },
      ]
    }

    case 'prose': {
      // Dynamic prose: load chapter from book
      if ('book' in section) {
        const chapter = section.chapter
        if (!chapter) return []
        if (!ec.loadBookChapterText) return []
        const policy = section.langPolicy ?? 'active-language'
        const languageCandidates = resolveLanguageCandidates(ec, section.book, policy)
        for (const language of languageCandidates) {
          const text = ec.loadBookChapterText(section.book, chapter, language)
          if (text) return [{ type: 'prose', text: ec.localize(text) }]
        }
        return []
      }
      const proseText = context.resolvedProse?.[section.file] ?? ec.prose[section.file]
      if (!proseText) {
        if (context.resolvedProse) return []
        return [{ type: 'prose', text: bilingualOf(`[Prose not found: ${section.file}]`) }]
      }
      return [{ type: 'prose', text: ec.localize(proseText) }]
    }

    case 'gallery':
      return [
        {
          type: 'gallery',
          items: section.items.map((item) => ({
            src: item.src,
            title: item.title ? ec.localize(item.title) : undefined,
            attribution: item.attribution ? ec.localize(item.attribution) : undefined,
            caption: item.caption ? ec.localize(item.caption) : undefined,
          })),
        },
      ]

    case 'holy-card':
      return [
        {
          type: 'holy-card',
          image: section.image,
          title: section.title ? ec.localize(section.title) : undefined,
          attribution: section.attribution ? ec.localize(section.attribution) : undefined,
          prayer: section.prayer ? ec.localize(section.prayer) : undefined,
        },
      ]

    case 'select': {
      // From-data variant: dynamic options driven by an array path.
      // Used for the celebration picker (e.g. Holy Thursday → 2 celebrations,
      // Christmas → 4, an OT day with multiple optional memorials → 1 + N).
      if ('from' in section) {
        return resolveSelectFromData(section, context, ec)
      }

      const { selectedId, overrideKey } = computeSelectedId(section, context)

      const downstreamContext = section.as
        ? { ...context, templateVars: { ...context.templateVars, [section.as]: selectedId } }
        : context

      if (section.label) {
        // Visible picker: resolve only selected option sections for responsiveness.
        return [
          {
            type: 'select' as const,
            label: ec.localize(section.label),
            overrideKey: overrideKey ?? '',
            selectedId: selectedId ?? '',
            options: section.options.map((opt) => ({
              id: opt.id,
              label: ec.localize(opt.label),
              sections:
                opt.id === selectedId
                  ? (opt.sections ?? []).flatMap((s) => resolveSection(s, downstreamContext, ec))
                  : [],
            })),
          },
        ]
      }
      // Silent: resolve only the selected option
      const selected = section.options.find((o) => o.id === selectedId) ?? section.options[0]
      if (!selected?.sections?.length) return []
      return selected.sections.flatMap((s) => resolveSection(s, downstreamContext, ec))
    }

    case 'fragment': {
      const frag = context.fragments?.[section.ref]
      if (!frag) return []
      const vars = composeVars(context)
      return frag.flatMap((s) => {
        const substituted = Object.keys(vars).length > 0 ? substituteInFlowSection(s, vars) : s
        return resolveSection(substituted, context, ec)
      })
    }

    case 'call': {
      // Parameterized macro/fragment invocation.
      // Looks up section.ref in FlowContext.fragments (same registry as fragment),
      // substitutes the macro body with composeVars(context) ∪ args, and
      // resolves the result. Args take precedence over flowData/templateVars
      // so a macro can shadow outer names with its own params.
      const frag = context.fragments?.[section.ref]
      if (!frag) return []
      const args = section.args ?? {}
      const vars = composeVars(context, args)
      return frag.flatMap((s) => {
        const substituted = substituteInFlowSection(s, vars)
        return resolveSection(substituted, context, ec)
      })
    }

    case 'choice-rich-text':
      return resolveChoiceRichText(section, context, ec)

    case 'collapsible': {
      const sections = section.sections.flatMap((s) => resolveSection(s, context, ec))
      if (sections.length === 0) return []
      const dynamic = section.defaultOpenFrom
        ? resolvePath(context, section.defaultOpenFrom)
        : undefined
      const defaultOpen = typeof dynamic === 'boolean' ? dynamic : (section.defaultOpen ?? false)
      return [
        {
          type: 'collapsible',
          title: ec.localize(section.title),
          defaultOpen,
          sections,
        },
      ]
    }

    case 'liturgical-color': {
      const raw = resolvePath(context, section.from)
      const color = typeof raw === 'string' ? raw.toLowerCase() : undefined
      if (!color || !LITURGICAL_COLOR_LABELS[color]) return []
      return [
        {
          type: 'liturgical-color',
          color: color as RenderedLiturgicalColor,
          label: ec.localize(LITURGICAL_COLOR_LABELS[color]),
        },
      ]
    }

    case 'liturgical-color-scope': {
      const raw = resolvePath(context, section.from)
      const lc = typeof raw === 'string' ? raw.toLowerCase() : undefined
      const color = lc && LITURGICAL_COLOR_LABELS[lc] ? (lc as RenderedLiturgicalColor) : undefined
      const inner = section.sections.flatMap((s) => resolveSection(s, context, ec))
      if (inner.length === 0) return []
      // No color resolved — pass children through, no scope wrapping.
      if (!color) return inner
      return [{ type: 'liturgical-color-scope', color, sections: inner }]
    }

    case 'section-marker': {
      const raw = section.colorFrom
        ? (resolvePath(context, section.colorFrom) as string | undefined)
        : undefined
      const lc = typeof raw === 'string' ? raw.toLowerCase() : undefined
      const color = lc && LITURGICAL_COLOR_LABELS[lc] ? (lc as RenderedLiturgicalColor) : undefined
      return [
        {
          type: 'section-marker',
          title: ec.localize(section.title),
          ...(color ? { color } : {}),
        },
      ]
    }

    case 'celebration-banner': {
      const obj = resolvePath(context, section.from)
      if (!obj || typeof obj !== 'object') return []
      const o = obj as {
        title?: LocalizedText
        liturgicalColor?: string
        rank?: string
        season?: string
      }
      if (!o.title) return []
      const titleForRender = o.title
      const color =
        typeof o.liturgicalColor === 'string' ? o.liturgicalColor.toLowerCase() : undefined
      const validColor =
        color && LITURGICAL_COLOR_LABELS[color] ? (color as RenderedLiturgicalColor) : undefined
      const rankLabel = o.rank && RANK_LABELS[o.rank] ? ec.localize(RANK_LABELS[o.rank]) : undefined
      const cycleId = section.cycleFrom
        ? (resolvePath(context, section.cycleFrom) as string | undefined)
        : undefined
      const cycleLabel =
        cycleId && CYCLE_LABEL_RE.test(cycleId)
          ? ec.localize({
              'en-US': `Year ${cycleId}`,
              'pt-BR': `Ano ${cycleId}`,
            })
          : undefined
      return [
        {
          type: 'celebration-banner',
          title: ec.localize(titleForRender),
          ...(validColor ? { color: validColor } : {}),
          ...(rankLabel ? { rank: rankLabel } : {}),
          ...(cycleLabel ? { cycle: cycleLabel } : {}),
        },
      ]
    }

    default:
      return []
  }
}

type RenderedLiturgicalColor = 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'

const RANK_LABELS: Record<string, LocalizedText> = {
  solemnity: { 'en-US': 'Solemnity', 'pt-BR': 'Solenidade' },
  feast: { 'en-US': 'Feast', 'pt-BR': 'Festa' },
  memorial: { 'en-US': 'Memorial', 'pt-BR': 'Memória' },
  'optional-memorial': {
    'en-US': 'Optional Memorial',
    'pt-BR': 'Memória facultativa',
  },
}

const CYCLE_LABEL_RE = /^(A|B|C|I|II)$/

const LITURGICAL_COLOR_LABELS: Record<string, LocalizedText> = {
  white: { 'en-US': 'White', 'pt-BR': 'Branca' },
  red: { 'en-US': 'Red', 'pt-BR': 'Vermelha' },
  green: { 'en-US': 'Green', 'pt-BR': 'Verde' },
  violet: { 'en-US': 'Violet', 'pt-BR': 'Roxa' },
  rose: { 'en-US': 'Rose', 'pt-BR': 'Rosa' },
  black: { 'en-US': 'Black', 'pt-BR': 'Preta' },
  gold: { 'en-US': 'Gold', 'pt-BR': 'Dourada' },
}

export function getContextValue(context: FlowContext, key: string): string | undefined {
  switch (key) {
    case 'dayOfWeek':
      return String(getDay(context.date))
    case 'dayOfMonth':
      return String(getDate(context.date))
    case 'hour':
      return String(context.date.getHours())
    case 'timeOfDay': {
      const h = context.date.getHours()
      if (h >= 5 && h < 12) return 'morning'
      if (h >= 12 && h < 17) return 'afternoon'
      if (h >= 17 && h < 21) return 'evening'
      return 'night'
    }
    case 'liturgicalCalendar':
      return context.liturgicalCalendar
    case 'numbering':
      return context.numbering
    case 'programDay':
      return context.programDay !== undefined ? String(context.programDay) : undefined
    case 'dateKey': {
      const m = String(context.date.getMonth() + 1).padStart(2, '0')
      const d = String(context.date.getDate()).padStart(2, '0')
      return `${m}-${d}`
    }
    case 'liturgicalSeason':
      return getLiturgicalSeason(context.date, 'ef')
    default:
      return undefined
  }
}

export function lookupMap(map: Record<string, string>, value: string): string | undefined {
  // Exact match first
  if (value in map) return map[value]
  // Range match — iterate in declaration order, first match wins
  const num = Number(value)
  if (Number.isNaN(num)) return undefined
  for (const [k, v] of Object.entries(map)) {
    const dash = k.indexOf('-')
    if (dash === -1) continue
    const lo = Number(k.slice(0, dash))
    const hi = Number(k.slice(dash + 1))
    if (!Number.isNaN(lo) && !Number.isNaN(hi) && num >= lo && num <= hi) return v
  }
  return undefined
}

type StaticSelectSection = Extract<FlowSection, { type: 'select'; options: unknown }>
type FromDataSelectSection = Extract<FlowSection, { type: 'select'; from: string }>
type ChoiceRichTextSection = Extract<FlowSection, { type: 'choice-rich-text' }>

function getItemId(item: unknown, idFrom: string, fallbackIndex: number): string {
  if (item !== null && typeof item === 'object') {
    const v = (item as Record<string, unknown>)[idFrom]
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
  }
  return String(fallbackIndex)
}

function getItemLabel(item: unknown, labelFrom: string | undefined): LocalizedText | string {
  if (item === null || typeof item !== 'object') return ''
  const obj = item as Record<string, unknown>
  const candidates = labelFrom ? [obj[labelFrom]] : [obj.title, obj.label, obj.name]
  for (const v of candidates) {
    if (typeof v === 'string') return v
    if (v && typeof v === 'object') return v as LocalizedText
  }
  return ''
}

function selectedItemAndId(
  section: FromDataSelectSection,
  items: unknown[],
  context: FlowContext,
): { selectedId: string; overrideKey: string; item: unknown } {
  const idFrom = section.idFrom ?? 'id'
  const overrideKey = section.as
  const overrideId = context.selectOverrides?.[overrideKey]
  const defaultId = section.default

  // Try override → default → first item
  for (const candidate of [overrideId, defaultId]) {
    if (!candidate) continue
    const found = items.find((it, i) => getItemId(it, idFrom, i) === candidate)
    if (found !== undefined) {
      return { selectedId: candidate, overrideKey, item: found }
    }
  }
  const first = items[0]
  return {
    selectedId: first !== undefined ? getItemId(first, idFrom, 0) : '',
    overrideKey,
    item: first,
  }
}

function resolveSelectFromData(
  section: FromDataSelectSection,
  context: FlowContext,
  ec: EngineContext,
): RenderedSection[] {
  const fromPath = substituteTemplateVars(section.from, composeVars(context))
  const value = resolvePath(context, fromPath)
  const items = Array.isArray(value) ? value : []
  if (items.length === 0) return []

  const idFrom = section.idFrom ?? 'id'
  const { selectedId, overrideKey, item } = selectedItemAndId(section, items, context)

  // Bind the chosen item under section.as so descendants can path-access it.
  const downstreamContext: FlowContext = {
    ...context,
    flowData: { ...context.flowData, [section.as]: item },
  }
  // Substitute the body now that the item is bound — top-level substitution in
  // resolveFlowWithContext can't see this binding because it happens after.
  const downstreamVars = composeVars(downstreamContext)
  const body = section.body.flatMap((s) => {
    const substituted = substituteInFlowSection(s, downstreamVars)
    return resolveSection(substituted, downstreamContext, ec)
  })

  // Hide picker when only one item applies and hideIfSingle is set (the common case).
  const hideIfSingle = section.hideIfSingle ?? false
  if (items.length === 1 && hideIfSingle) {
    return body
  }

  // Otherwise emit a visible select with options for the chip header. Only
  // the selected item's body is materialized; the renderer triggers a
  // re-resolve via selectOverrides on click for the others.
  const optionLabels = items.map((it, i) => {
    const rawLabel = getItemLabel(it, section.labelFrom)
    const label = typeof rawLabel === 'string' ? bilingualOf(rawLabel) : ec.localize(rawLabel)
    return {
      id: getItemId(it, idFrom, i),
      label,
      sections: getItemId(it, idFrom, i) === selectedId ? body : [],
    }
  })

  return [
    {
      type: 'select',
      label: section.label ? ec.localize(section.label) : bilingualEmpty,
      overrideKey,
      selectedId,
      options: optionLabels,
    },
  ]
}

/** Map ContentLanguage to ember-extra's language tags (en-US → en, others identical). */
function emberExtraLang(lang: ContentLanguage): string {
  return lang === 'en-US' ? 'en' : lang
}

/** Pick a language fallback for the secondary text (Latin if available, else English). */
function emberExtraSecondaryLang(primary: string): string {
  return primary === 'la' ? 'en' : 'la'
}

type SourceFormulary = {
  source?: string
  [slot: string]: unknown
}

type CelebrationLike = {
  primary?: SourceFormulary
  alternates?: SourceFormulary[]
}

const SOURCE_LABELS: Record<string, LocalizedText> = {
  tempore: { 'en-US': 'Tmp', 'pt-BR': 'Tmp' },
  sanctoral: { 'en-US': 'Snt', 'pt-BR': 'Snt' },
  common: { 'en-US': 'Com', 'pt-BR': 'Com' },
  ritual: { 'en-US': 'Rit', 'pt-BR': 'Rit' },
  votive: { 'en-US': 'Vot', 'pt-BR': 'Vot' },
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

/**
 * Card-style excerpt for an `options` widget option: prefer the first
 * `prayer` (the actual liturgical text), fall back to the first `rubric`
 * (explanatory text). Headings/subheadings are skipped since they
 * mirror the option label.
 */
function deriveOptionExcerpt(sections: RenderedSection[]): BilingualText | undefined {
  for (const s of sections) {
    if (s.type === 'prayer' && s.text.primary) return s.text
  }
  for (const s of sections) {
    if (s.type === 'rubric' && s.label.primary) return s.label
  }
  return undefined
}

type SlotDataShape = {
  body?: {
    lines?: Record<string, RichTextLine[]>
    plain?: Record<string, string>
  }
  alternatives?: SlotDataShape[]
  citation?: string | Record<string, string>
  introduction?: Record<string, string>
  conclusion?: Record<string, string>
  response?: {
    body?: {
      lines?: Record<string, RichTextLine[]>
      plain?: Record<string, string>
    }
  }
  /**
   * When an alternative carries its own localized label (e.g. each preface
   * after hydration gets a label like "Páscoa I"), it overrides the
   * source-tag-based label ("Tmp", "Snt", …) in the chip toggle.
   */
  label?: Record<string, string>
  /**
   * Optional excerpt — short phrase distinguishing this option from
   * sibling alternatives in a card-style picker (e.g. each preface's
   * subtitle: "O mistério pascal", "A vida nova em Cristo", …). Body
   * incipits aren't enough because most prefaces share the same opening.
   */
  excerpt?: Record<string, string>
}

type ExtractedSlot = {
  body: BilingualRichText
  citation?: BilingualText
  introduction?: BilingualText
  conclusion?: BilingualText
  response?: BilingualRichText
  label?: BilingualText
  excerpt?: BilingualText
}

function extractOneSlotOption(
  slotData: SlotDataShape,
  ec: EngineContext,
): ExtractedSlot | undefined {
  const primaryLang = emberExtraLang(ec.contentLanguage)
  const secondaryLang = emberExtraSecondaryLang(primaryLang)

  const primary = pickRichTextLines(slotData.body, primaryLang)
  if (!primary || primary.length === 0) return undefined
  const secondary = pickRichTextLines(slotData.body, secondaryLang)

  // Citation may be a string (older shape) OR a localized object (ember-extra
  // shape). Use localize for the latter.
  const cit = slotData.citation
  const citation =
    typeof cit === 'string'
      ? bilingualOf(cit)
      : cit && typeof cit === 'object'
        ? ec.localize(cit as LocalizedText)
        : undefined

  const introduction = slotData.introduction
    ? ec.localize(slotData.introduction as LocalizedText)
    : undefined
  const conclusion = slotData.conclusion
    ? ec.localize(slotData.conclusion as LocalizedText)
    : undefined

  // Response carries typed segments (e.g. Gospel: ℟. Glória a vós, Senhor.).
  const responsePrimary = pickRichTextLines(slotData.response?.body, primaryLang)
  const responseSecondary = pickRichTextLines(slotData.response?.body, secondaryLang)
  const response = responsePrimary
    ? {
        primary: responsePrimary,
        ...(responseSecondary && responseSecondary.length > 0
          ? { secondary: responseSecondary }
          : {}),
      }
    : undefined

  const label = slotData.label ? ec.localize(slotData.label as LocalizedText) : undefined
  const excerpt = slotData.excerpt ? ec.localize(slotData.excerpt as LocalizedText) : undefined

  return {
    body: {
      primary,
      ...(secondary && secondary.length > 0 ? { secondary } : {}),
    },
    ...(citation ? { citation } : {}),
    ...(introduction ? { introduction } : {}),
    ...(conclusion ? { conclusion } : {}),
    ...(response ? { response } : {}),
    ...(label ? { label } : {}),
    ...(excerpt ? { excerpt } : {}),
  }
}

/**
 * Walk a formulary's slot path and return one option per renderable
 * alternative. Most slots have a single direct body and yield one option.
 * Reading slots may wrap multiple options in `alternatives[]` — Sundays in
 * OT, solemnities, ferial-vs-festive choices. We expose them all so the
 * renderer can offer an "Alia" chip toggle.
 */
function extractSlotData(
  formulary: SourceFormulary | undefined,
  slot: string,
  ec: EngineContext,
): ExtractedSlot[] {
  if (!formulary) return []
  // Slot may be dotted: 'readings.default.firstReading' walks nested fields.
  const slotData = walkVarPath(formulary as Record<string, unknown>, slot) as
    | SlotDataShape
    | undefined
  if (!slotData) return []

  // Direct body present: one option.
  if (slotData.body) {
    const opt = extractOneSlotOption(slotData, ec)
    return opt ? [opt] : []
  }
  // No direct body but alternatives[] present: each alt becomes one option.
  if (slotData.alternatives?.length) {
    return slotData.alternatives
      .map((alt) => extractOneSlotOption(alt, ec))
      .filter((o): o is ExtractedSlot => o !== undefined)
  }
  return []
}

/**
 * Resolve a body to RichTextLine[] for the given language. Prefers typed
 * segments (`body.lines.{lang}`); falls back to plain text (`body.plain.{lang}`)
 * synthesized into one text-only segment per paragraph. ember-extra ships
 * scripture readings (firstReading, gospel) in plain only.
 */
function pickRichTextLines(
  body: { lines?: Record<string, RichTextLine[]>; plain?: Record<string, string> } | undefined,
  lang: string,
): RichTextLine[] | undefined {
  if (!body) return undefined
  const lines = body.lines?.[lang]
  if (lines && lines.length > 0) return lines
  const plain = body.plain?.[lang]
  if (typeof plain === 'string' && plain.trim().length > 0) {
    return splitPlainIntoLines(plain).map((p) => [{ type: 'text', text: p }])
  }
  return undefined
}

/**
 * Split a plain-text body into renderable lines. Prefer real paragraph
 * breaks (`\n\n` or `\n`); when the source is one long string with no
 * line breaks (ember-extra scripture readings, ~1100+ chars in a single
 * paragraph), fall back to sentence-level chunking. Heuristic: a period
 * (or question-/exclamation-mark, or close-quote) followed by a space
 * and an uppercase / open-quote character starts a new line — but only
 * when the running paragraph is already long enough that sentence
 * splitting won't shred a short prayer into bullet points.
 */
function splitPlainIntoLines(plain: string): string[] {
  const byNewline = plain
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  if (byNewline.length > 1) return byNewline

  const single = byNewline[0] ?? plain.trim()
  if (single.length < 240) return [single]

  // Sentence-end punctuation (including ASCII "..." ellipsis) + space +
  // uppercase / open quote. False positives on abbreviations like
  // "S. Paulo", "Cf. Mt", "Pe. João" do split mid-name — the cost is a
  // few spurious breaks per reading, accepted in exchange for not
  // rendering scripture as one wall of text.
  const pattern = /(?<=[.!?…”"'»]|\.\.\.)\s+(?=[A-ZÀ-ÚÇ"“«¡¿])/u
  const parts = single
    .split(pattern)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  return parts.length > 1 ? parts : [single]
}

function resolveChoiceRichText(
  section: ChoiceRichTextSection,
  context: FlowContext,
  ec: EngineContext,
): RenderedSection[] {
  const celebrationPath = section.celebration ?? 'celebration'
  const celebration = resolvePath(context, celebrationPath) as CelebrationLike | undefined
  if (!celebration || typeof celebration !== 'object') return []

  // The slot path may have already had `{{day.cycle}}` substituted upstream
  // (via deepSubstitute when this section was rendered inside a from-data
  // select body). We still resolve any leftover templates here defensively.
  const slotForExtraction = section.slot.replace(/\{\{([\w.-]+)\}\}/g, (_, key) => {
    const value = resolvePath(context, key)
    return typeof value === 'string' ? value : value !== undefined ? String(value) : ''
  })

  // Cycle fallback: many ferials only ship `readings.default.*`; the cycle
  // template would resolve to `readings.II.gospel` and find nothing. Build
  // a fallback path that replaces the second segment of `readings.<X>.<Y>`
  // with `default`.
  const cycleFallbackSlot = (() => {
    const parts = slotForExtraction.split('.')
    if (parts.length < 3 || parts[0] !== 'readings' || parts[1] === 'default') {
      return undefined
    }
    return ['readings', 'default', ...parts.slice(2)].join('.')
  })()

  const formularies: { tag: string; formulary: SourceFormulary }[] = []
  if (celebration.primary) {
    formularies.push({
      tag: celebration.primary.source ?? 'primary',
      formulary: celebration.primary,
    })
  }
  for (const alt of celebration.alternates ?? []) {
    formularies.push({
      tag: alt.source ?? `alt-${formularies.length}`,
      formulary: alt,
    })
  }

  const options = formularies.flatMap(({ tag, formulary }) => {
    let slotOptions = extractSlotData(formulary, slotForExtraction, ec)
    if (slotOptions.length === 0 && cycleFallbackSlot) {
      slotOptions = extractSlotData(formulary, cycleFallbackSlot, ec)
    }
    return slotOptions.map((data, idx) => {
      // Prefer the per-option `label` when the data carries one (e.g. each
      // hydrated preface has its own "Páscoa I" / "Páscoa II" label).
      // Fall back to the source tag (Tmp / Snt / Com); when multiple
      // alternatives share a single source tag, append a Roman numeral.
      const baseLabel = SOURCE_LABELS[tag] ?? { 'en-US': tag, 'pt-BR': tag }
      const fallbackLabel: BilingualText =
        slotOptions.length > 1
          ? ec.localize({
              'en-US': `${baseLabel['en-US']} ${ROMAN[idx] ?? idx + 1}`,
              'pt-BR': `${baseLabel['pt-BR']} ${ROMAN[idx] ?? idx + 1}`,
            })
          : ec.localize(baseLabel)
      const optionLabel = data.label ?? fallbackLabel
      const id = slotOptions.length > 1 ? `${tag}-${idx}` : tag
      return {
        id,
        label: optionLabel,
        body: data.body,
        ...(data.citation ? { citation: data.citation } : {}),
        ...(data.introduction ? { introduction: data.introduction } : {}),
        ...(data.conclusion ? { conclusion: data.conclusion } : {}),
        ...(data.response ? { response: data.response } : {}),
        ...(data.excerpt ? { excerpt: data.excerpt } : {}),
      }
    })
  })

  if (options.length === 0) return []

  const overrideKey = `${celebrationPath}.${section.slot}`
  const overrideId = context.selectOverrides?.[overrideKey]
  const defaultId = section.defaultBlank ? undefined : (section.default ?? options[0].id)
  const selectedId = overrideId && options.some((o) => o.id === overrideId) ? overrideId : defaultId

  return [
    {
      type: 'choice-rich-text',
      label: ec.localize(section.label),
      overrideKey,
      selectedId,
      ...(section.pickerStyle ? { pickerStyle: section.pickerStyle } : {}),
      options,
    },
  ]
}

function computeSelectedId(
  section: StaticSelectSection,
  context: FlowContext,
): { selectedId: string; overrideKey?: string } {
  if (!section.on) {
    const autoId = section.default ?? section.options[0]?.id
    const overrideKey = section.as ?? autoId
    return {
      selectedId: (overrideKey && context.selectOverrides?.[overrideKey]) ?? autoId ?? '',
      overrideKey,
    }
  }

  const keys = Array.isArray(section.on) ? section.on : [section.on]
  const values = keys.map((k) => {
    const raw = resolvePath(context, k)
    return typeof raw === 'string' ? raw : raw === undefined ? undefined : String(raw)
  })

  let mappedValue: string | undefined
  if (section.map && values.every((v) => v !== undefined)) {
    // Try compound key first (all values joined), then drop from right
    for (let len = values.length; len >= 1; len--) {
      const compoundKey = values.slice(0, len).join(':')
      const result = lookupMap(section.map, compoundKey)
      if (result !== undefined) {
        mappedValue = result
        break
      }
    }
  }
  if (mappedValue === undefined && !section.map) {
    mappedValue = values[0]
  }

  // If the resolved value isn't one of the option ids, fall through to
  // `default`. Without this, a silent dispatch like `select on celebration.id`
  // with options for specific ids would match `options[0]` for any other id.
  if (mappedValue !== undefined && !section.options.some((o) => o.id === mappedValue)) {
    mappedValue = undefined
  }

  const autoId = mappedValue ?? section.default ?? section.options[0]?.id
  const overrideKey = section.as ?? autoId
  return {
    selectedId: (overrideKey && context.selectOverrides?.[overrideKey]) ?? autoId ?? '',
    overrideKey,
  }
}

type ResolveExecutionResult = {
  context: FlowContext
  dynamicBookChapters: { book: string; chapterId: string }[]
}

function isLiturgicalDayMap(value: unknown): value is LiturgicalDayMap {
  if (!value || typeof value !== 'object') return false
  const map = value as Partial<LiturgicalDayMap>
  return (
    typeof map.temporal === 'object' &&
    map.temporal !== null &&
    typeof map.fixedDates === 'object' &&
    map.fixedDates !== null &&
    typeof map.feasts === 'object' &&
    map.feasts !== null &&
    typeof map.novenas === 'object' &&
    map.novenas !== null &&
    (map.weekdaysOfMonths === undefined ||
      (typeof map.weekdaysOfMonths === 'object' && map.weekdaysOfMonths !== null)) &&
    Array.isArray(map.reserves)
  )
}

function runResolveStrategy(
  step: ResolveStep,
  context: FlowContext,
  ec: EngineContext,
): { entries: RepeatEntry[]; templateVars?: Record<string, string> } {
  if (step.source && step.source !== 'liturgical') return { entries: [] }
  if (
    step.dataType &&
    step.dataType !== 'liturgical-meditation-map' &&
    step.dataType !== 'liturgical-lectionary-map'
  )
    return { entries: [] }
  if (step.strategy !== 'liturgical-day') return { entries: [] }

  const map = context.cycleData?.[step.data]
  if (!isLiturgicalDayMap(map)) return { entries: [] }

  const entries: RepeatEntry[] = resolveLiturgicalDay(context.date, map).map((e) => ({
    chapterId: e.id,
    category: e.category,
  }))

  // FIXME: fix at the root cause in FlowContext
  const form = step.calendar || (context.liturgicalCalendar as 'ef' | 'of') || ('ef' as const)
  const liturgicalLabel = getLiturgicalDayName(context.date, form, { t: ec.t })

  return { entries, templateVars: { liturgicalLabel } }
}

function executeResolveSteps(
  flow: FlowDefinition,
  context: FlowContext,
  ec: EngineContext,
): ResolveExecutionResult {
  if (!flow.resolve?.length) return { context, dynamicBookChapters: [] }

  let ctx = context
  const dynamicBookChapters: { book: string; chapterId: string }[] = []

  for (const step of flow.resolve) {
    const strategyResult = runResolveStrategy(step, ctx, ec)
    let entries = strategyResult.entries.map((entry) => ({ ...entry }))

    const dynamicBook = step.book
    if (dynamicBook) {
      entries = entries.map((entry) => {
        const chapterId = typeof entry.chapterId === 'string' ? entry.chapterId : undefined
        if (!chapterId) return entry
        dynamicBookChapters.push({ book: dynamicBook, chapterId })
        if (typeof entry.label === 'string' && entry.label.length > 0) return entry
        const title = ec.getBookChapterTitle?.(dynamicBook, chapterId, ec.language)
        return { ...entry, label: title ?? chapterId }
      })
    }

    const firstLabel = entries[0]?.label
    const strategyVars = strategyResult.templateVars ?? {}
    const mergedVars: Record<string, string> = {
      ...strategyVars,
      meditationTitle:
        typeof firstLabel === 'string'
          ? firstLabel
          : (strategyVars.liturgicalLabel ?? ctx.templateVars?.meditationTitle ?? ''),
    }

    const firstRef = entries[0]?.chapterId
    if (typeof firstRef === 'string') {
      mergedVars[`${step.as}Ref`] = firstRef
    }

    ctx = {
      ...ctx,
      flowData: { ...ctx.flowData, [step.as]: entries },
      templateVars: { ...ctx.templateVars, ...mergedVars },
    }
  }

  return { context: ctx, dynamicBookChapters }
}

function buildSourceContext(context: FlowContext, ec: EngineContext): SourceContext {
  return {
    fetchAsset: ec.fetchAsset ?? (async () => undefined),
    fetchOwnAsset:
      ec.fetchOwnAsset ??
      // Backward compat: if the engine doesn't provide a real file reader, fall
      // back to the practice's pre-loaded data declarations (cycleData).
      (async (path: string) => context.cycleData?.[path] as unknown),
    localize: ec.localize,
    t: ec.t,
    now: () => context.date,
  }
}

async function executeLoadSteps(
  flow: FlowDefinition,
  context: FlowContext,
  ec: EngineContext,
): Promise<FlowContext> {
  if (!flow.load?.length) return context

  let ctx = context
  const sourceCtx = buildSourceContext(context, ec)

  for (const step of flow.load) {
    const source = getDataSource(step.source)
    if (!source) {
      // Unknown source — skip. Validation should catch this at the schema layer.
      continue
    }

    const args: Record<string, unknown> = { ...step }
    delete args.as
    delete args.source

    const result = await source.load(args, sourceCtx)
    ctx = {
      ...ctx,
      flowData: { ...ctx.flowData, [step.as]: result },
    }
  }
  return ctx
}

function chapterCacheKey(book: string, chapter: string): string {
  return `${book}::${chapter}`
}

function assertSupportedFlowVersion(flow: FlowDefinition): void {
  if (!flow.flowVersion || flow.flowVersion === '1') return
  throw new Error(`Unsupported flowVersion: ${flow.flowVersion}`)
}

function resolveLanguageCandidates(
  ec: EngineContext,
  book: string,
  policy: 'active-language' | 'fallback-content-language' | 'book-default',
): string[] {
  const candidates = [ec.language]
  if (policy !== 'active-language') {
    candidates.push(ec.contentLanguage)
  }
  if (policy === 'book-default') {
    candidates.push(...(ec.getBookLanguages?.(book) ?? []))
  }
  return Array.from(new Set(candidates.filter((lang) => Boolean(lang))))
}

function collectBookChapterRefs(
  flow: FlowDefinition,
  context: FlowContext,
): { book: string; chapterId: string }[] {
  const refs: { book: string; chapterId: string }[] = []

  function walkSection(section: FlowSection): void {
    switch (section.type) {
      case 'prose':
        if ('book' in section && section.book && section.chapter) {
          if (!section.chapter.includes('{{')) {
            refs.push({ book: section.book, chapterId: section.chapter })
          }
        }
        break
      case 'cycle':
        if (section.as === 'template' && section.sections) {
          const cycleData = context.cycleData?.[section.data]
          if (cycleData) {
            const allEntries = Object.values(cycleData.entries).flat()
            for (const entry of allEntries) {
              const vars: Record<string, string | undefined> = {}
              for (const [k, v] of Object.entries(entry as Record<string, unknown>)) {
                if (typeof v === 'string') vars[k] = v
              }
              for (const s of section.sections) {
                const substituted = substituteInFlowSection(s, vars)
                walkSection(substituted)
              }
            }
          } else {
            for (const s of section.sections) walkSection(s)
          }
        }
        break
      case 'repeat':
        for (const s of section.sections) walkSection(s)
        break
      case 'options':
        if ('from' in section) {
          for (const s of section.sections) walkSection(s)
        } else {
          for (const opt of section.options) {
            for (const s of opt.sections) walkSection(s)
          }
        }
        break
      case 'prayer':
        if ('sections' in section && section.sections) {
          for (const s of section.sections) walkSection(s)
        }
        break
      case 'select':
        if ('from' in section) {
          for (const s of section.body) walkSection(s)
        } else {
          for (const opt of section.options) {
            if (opt.sections) for (const s of opt.sections) walkSection(s)
          }
        }
        break
    }
  }

  for (const section of flow.sections) walkSection(section)
  if (flow.fragments) {
    for (const fragmentSections of Object.values(flow.fragments)) {
      for (const section of fragmentSections) walkSection(section)
    }
  }

  return refs
}

function resolveFlowWithContext(
  flow: FlowDefinition,
  ctx: FlowContext,
  engineContext: EngineContext,
): RenderedSection[] {
  const vars = composeVars(ctx)
  const hasVars = Object.keys(vars).length > 0
  const sections = hasVars
    ? flow.sections.map((s) => substituteInFlowSection(s, vars))
    : flow.sections

  // Process sequentially so select `as` variables propagate to subsequent sections
  const result: RenderedSection[] = []
  for (const section of sections) {
    if (section.type === 'select' && section.as) {
      if ('from' in section) {
        // From-data select: resolve the array, pick the selected item, bind it
        // (the whole object) under flowData[as] so subsequent siblings can
        // path-access it as `{{celebration.title}}` etc. Do NOT also bind the
        // selected id into templateVars[as] — that would shadow the object via
        // composeVars's templateVars-wins precedence and break path access.
        const fromPath = substituteTemplateVars(section.from, composeVars(ctx))
        const value = resolvePath(ctx, fromPath)
        const items = Array.isArray(value) ? value : []
        if (items.length > 0) {
          const { item } = selectedItemAndId(section, items, ctx)
          ctx = {
            ...ctx,
            flowData: { ...ctx.flowData, [section.as]: item },
          }
        }
      } else {
        const { selectedId } = computeSelectedId(section, ctx)
        ctx = { ...ctx, templateVars: { ...ctx.templateVars, [section.as]: selectedId } }
      }
    }
    result.push(...resolveSection(section, ctx, engineContext))
  }
  return result
}

export function resolveFlow(
  flow: FlowDefinition,
  context: FlowContext,
  engineContext: EngineContext,
): RenderedSection[] {
  assertSupportedFlowVersion(flow)

  // Inject flow.data into flowData (flow.data is lower priority than context.flowData)
  let ctx = context
  if (flow.data) {
    ctx = { ...ctx, flowData: { ...flow.data, ...ctx.flowData } }
  }
  if (flow.fragments) {
    ctx = { ...ctx, fragments: flow.fragments }
  }
  ctx = executeResolveSteps(flow, ctx, engineContext).context
  return resolveFlowWithContext(flow, ctx, engineContext)
}

export async function resolveFlowAsync(
  flow: FlowDefinition,
  context: FlowContext,
  engineContext: EngineContext,
): Promise<RenderedSection[]> {
  assertSupportedFlowVersion(flow)

  let ctx = context
  if (flow.data) {
    ctx = { ...ctx, flowData: { ...flow.data, ...ctx.flowData } }
  }
  if (flow.fragments) {
    ctx = { ...ctx, fragments: flow.fragments }
  }

  const { context: resolvedContext, dynamicBookChapters } = executeResolveSteps(
    flow,
    ctx,
    engineContext,
  )
  ctx = resolvedContext

  // Registry-based load steps run after legacy resolve steps. They can read
  // values bound by resolve steps and write into flowData under their own
  // `as` keys.
  ctx = await executeLoadSteps(flow, ctx, engineContext)

  const sectionBookChapterRefs = collectBookChapterRefs(flow, ctx)
  const allBookChapterRefs = [...dynamicBookChapters, ...sectionBookChapterRefs]

  if (allBookChapterRefs.length === 0) {
    return resolveFlowWithContext(flow, ctx, engineContext)
  }

  const chapterCache = new Map<string, LocalizedContent>()
  const uniqueRequests = Array.from(
    new Map(
      allBookChapterRefs.map((item) => [chapterCacheKey(item.book, item.chapterId), item]),
    ).values(),
  )

  for (const request of uniqueRequests) {
    const cached: LocalizedContent = {}
    const preloadLanguages = resolveLanguageCandidates(engineContext, request.book, 'book-default')

    for (const preloadLanguage of preloadLanguages) {
      const loaded = engineContext.loadBookChapterTextAsync
        ? await engineContext.loadBookChapterTextAsync(
            request.book,
            request.chapterId,
            preloadLanguage,
          )
        : engineContext.loadBookChapterText?.(request.book, request.chapterId, preloadLanguage)
      if (!loaded) continue
      for (const [lang, text] of Object.entries(loaded)) {
        if (text) (cached as Record<string, string>)[lang] = text
      }
    }

    if (Object.keys(cached).length > 0) {
      chapterCache.set(chapterCacheKey(request.book, request.chapterId), cached)
    }
  }

  const hydratedEngineContext: EngineContext = {
    ...engineContext,
    loadBookChapterText: (book, chapter) => chapterCache.get(chapterCacheKey(book, chapter)),
  }

  return resolveFlowWithContext(flow, ctx, hydratedEngineContext)
}
