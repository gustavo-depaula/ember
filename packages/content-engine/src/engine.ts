import {
  getLiturgicalDayName,
  type LiturgicalMeditationMap,
  type PsalmRef,
  type ReadingReference,
  resolveLiturgicalMeditation,
} from '@ember/liturgical'
import { getDate, getDay } from 'date-fns'
import type {
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
  flowData?: Record<string, RepeatEntry[]>
  selectOverrides?: Record<string, string>
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

function substituteTemplateVars(text: string, vars: Record<string, string | undefined>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] ?? match)
}

function deepSubstitute(obj: unknown, vars: Record<string, string | undefined>): unknown {
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

function substituteInFlowSection(
  section: FlowSection,
  vars: Record<string, string | undefined>,
): FlowSection {
  return deepSubstitute(section, vars) as FlowSection
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
    const fromKey = substituteTemplateVars(section.from, context.templateVars ?? {})
    const entries = context.flowData?.[fromKey]
    if (!entries?.length) return []

    const iterCount = section.count ? Math.min(section.count, entries.length) : entries.length
    return Array.from({ length: iterCount }, (_, i) => {
      const entry = entries[i]
      const resolved = entry ? resolveEntryVars(entry, ec) : {}
      const vars: Record<string, string | undefined> = {
        ...context.templateVars,
        ...resolved,
        index: String(i),
        ordinal: getOrdinal(i, ec.language),
      }
      return section.sections.flatMap((s) => {
        const substituted = substituteInFlowSection(s, vars)
        return resolveSection(substituted, context, ec)
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
    const vars: Record<string, string | undefined> = {
      index: String(i),
      ordinal: getOrdinal(i, ec.language),
    }
    return templateSections.flatMap((s) => {
      const substituted = substituteInFlowSection(s, vars)
      return resolveSection(substituted, context, ec)
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
  switch (section.type) {
    case 'rubric':
      return [{ type: 'rubric', label: ec.localize(section.text) }]

    case 'divider':
      return [{ type: 'divider' }]

    case 'heading':
      return [{ type: 'heading', text: ec.localize(section.text) }]

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
        const vars = resolveEntryVars(
          entry as Record<string, string | LocalizedText | undefined>,
          ec,
        )
        return section.sections.flatMap((s) => {
          const substituted = substituteInFlowSection(s, vars)
          return resolveSection(substituted, context, ec)
        })
      }

      const raw = section.key ? (entry as Record<string, unknown>)[section.key] : entry
      return mapCycleOutput(section.as, raw, ec)
    }

    case 'psalmody':
      return [{ type: 'psalmody', psalms: section.psalms.map(ec.parsePsalmRef) }]

    case 'lectio': {
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
        const fromKey = substituteTemplateVars(section.from, context.templateVars ?? {})
        const entries = context.flowData?.[fromKey]
        if (!entries?.length) return []

        const resolved = entries
          .map((entry, i) => {
            const vars = resolveEntryVars(entry, ec)
            const labelText = vars.label
            if (!labelText) return undefined
            const entryId = vars.id ?? String(i)
            const allVars = { ...context.templateVars, ...vars, index: String(i) }
            return {
              id: entryId,
              label: ec.localize({ 'pt-BR': labelText, 'en-US': labelText }),
              sections: section.sections.flatMap((s) => {
                const substituted = substituteInFlowSection(s, allVars)
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
        .map((opt) => ({
          id: opt.id,
          label: ec.localize(opt.label),
          sections: opt.sections.flatMap((s) => resolveSection(s, context, ec)),
        }))
        .filter((opt) => opt.sections.length > 0)
      if (resolved.length === 0) return []
      if (resolved.length === 1) return resolved[0].sections
      return [
        {
          type: 'options',
          label: ec.localize(section.label),
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
        const text = ec.loadBookChapterText(section.book, chapter, ec.language)
        if (!text) return []
        return [{ type: 'prose', text: ec.localize(text) }]
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

    default:
      return []
  }
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

function computeSelectedId(
  section: FlowSection & { type: 'select' },
  context: FlowContext,
): { selectedId: string; overrideKey?: string } {
  const rawValue = section.on ? getContextValue(context, section.on) : undefined
  const mappedValue =
    rawValue !== undefined && section.map ? lookupMap(section.map, rawValue) : rawValue
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

function isLiturgicalMeditationMap(value: unknown): value is LiturgicalMeditationMap {
  if (!value || typeof value !== 'object') return false
  const map = value as Partial<LiturgicalMeditationMap>
  return (
    typeof map.temporal === 'object' &&
    map.temporal !== null &&
    typeof map.fixedDates === 'object' &&
    map.fixedDates !== null &&
    typeof map.feasts === 'object' &&
    map.feasts !== null &&
    typeof map.novenas === 'object' &&
    map.novenas !== null &&
    typeof map.appendix === 'object' &&
    map.appendix !== null &&
    Array.isArray(map.reserves)
  )
}

function runResolveStrategy(
  step: ResolveStep,
  context: FlowContext,
  ec: EngineContext,
): { entries: RepeatEntry[]; templateVars?: Record<string, string> } {
  if (step.strategy !== 'liturgical-day') return { entries: [] }

  const map = context.cycleData?.[step.data]
  if (!isLiturgicalMeditationMap(map)) return { entries: [] }

  const resolved = resolveLiturgicalMeditation(context.date, map)
  const entries: RepeatEntry[] = []

  const pushEntry = (
    category: 'feast' | 'temporal',
    chapterId?: string,
    secondary?: string,
  ): void => {
    if (chapterId) entries.push({ chapterId, category })
    if (secondary) entries.push({ chapterId: secondary, category })
  }

  pushEntry('feast', resolved.feast?.chapterId, resolved.feast?.secondary)
  pushEntry('temporal', resolved.temporal?.chapterId, resolved.temporal?.secondary)

  const form = context.liturgicalCalendar === 'of' ? 'of' : 'ef'
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
    const mergedVars = {
      ...strategyVars,
      meditationTitle:
        typeof firstLabel === 'string'
          ? firstLabel
          : (strategyVars.liturgicalLabel ?? ctx.templateVars?.meditationTitle),
    }

    ctx = {
      ...ctx,
      flowData: { ...ctx.flowData, [step.as]: entries },
      templateVars: { ...ctx.templateVars, ...mergedVars },
    }
  }

  return { context: ctx, dynamicBookChapters }
}

function chapterCacheKey(book: string, chapter: string): string {
  return `${book}::${chapter}`
}

function resolveFlowWithContext(
  flow: FlowDefinition,
  ctx: FlowContext,
  engineContext: EngineContext,
): RenderedSection[] {
  const vars = ctx.templateVars
  const hasVars = vars && Object.keys(vars).length > 0
  const sections = hasVars
    ? flow.sections.map((s) => substituteInFlowSection(s, vars))
    : flow.sections

  // Process sequentially so select `as` variables propagate to subsequent sections
  const result: RenderedSection[] = []
  for (const section of sections) {
    if (section.type === 'select' && section.as) {
      const { selectedId } = computeSelectedId(section, ctx)
      ctx = { ...ctx, templateVars: { ...ctx.templateVars, [section.as]: selectedId } }
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
  // Inject flow.data into flowData (flow.data is lower priority than context.flowData)
  let ctx = context
  if (flow.data) {
    ctx = { ...ctx, flowData: { ...flow.data, ...ctx.flowData } }
  }
  ctx = executeResolveSteps(flow, ctx, engineContext).context
  return resolveFlowWithContext(flow, ctx, engineContext)
}

export async function resolveFlowAsync(
  flow: FlowDefinition,
  context: FlowContext,
  engineContext: EngineContext,
): Promise<RenderedSection[]> {
  let ctx = context
  if (flow.data) {
    ctx = { ...ctx, flowData: { ...flow.data, ...ctx.flowData } }
  }

  const { context: resolvedContext, dynamicBookChapters } = executeResolveSteps(
    flow,
    ctx,
    engineContext,
  )
  ctx = resolvedContext

  if (dynamicBookChapters.length === 0) {
    return resolveFlowWithContext(flow, ctx, engineContext)
  }

  const chapterCache = new Map<string, LocalizedContent>()
  const uniqueRequests = Array.from(
    new Map(
      dynamicBookChapters.map((item) => [chapterCacheKey(item.book, item.chapterId), item]),
    ).values(),
  )

  for (const request of uniqueRequests) {
    const loaded = engineContext.loadBookChapterTextAsync
      ? await engineContext.loadBookChapterTextAsync(
          request.book,
          request.chapterId,
          engineContext.language,
        )
      : engineContext.loadBookChapterText?.(request.book, request.chapterId, engineContext.language)
    if (loaded) chapterCache.set(chapterCacheKey(request.book, request.chapterId), loaded)
  }

  const hydratedEngineContext: EngineContext = {
    ...engineContext,
    loadBookChapterText: (book, chapter) => chapterCache.get(chapterCacheKey(book, chapter)),
  }

  return resolveFlowWithContext(flow, ctx, hydratedEngineContext)
}
