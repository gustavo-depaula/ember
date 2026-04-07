import type { PsalmRef, ReadingReference } from '@ember/liturgical'
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
  Variant,
  VariantEntry,
} from './types'

export type PrayerAsset = {
  title: LocalizedContent
  subtitle?: LocalizedContent
  source?: LocalizedContent
  body: LocalizedContent
}

export type EngineContext = {
  language: string
  contentLanguage: ContentLanguage
  localize: (text: { 'en-US'?: string; 'pt-BR'?: string; la?: string }) => BilingualText
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
}

export type FlowContext = {
  date: Date
  variant?: Variant
  numbering?: string
  liturgicalCalendar?: string
  trackDefs?: Record<string, LectioTrackDef>
  trackState?: Record<string, { current_index: number }>
  cycleData?: Record<string, CycleData>
  setKeyOverride?: string
  programDay?: number
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

function resolveVariantData(
  variant: Variant,
  context: FlowContext,
): { entries: VariantEntry[]; setKey: string } | undefined {
  const setKey =
    context.setKeyOverride && variant.data[context.setKeyOverride]
      ? context.setKeyOverride
      : Object.keys(variant.data)[0]
  if (!setKey || !variant.data[setKey]) return undefined
  return { entries: variant.data[setKey], setKey }
}

const bilingualEmpty: BilingualText = { primary: '' }

function bilingualOf(text: string): BilingualText {
  return { primary: text }
}

function resolvePrayerRef(ref: string, ec: EngineContext): RenderedSection {
  const asset = ec.prayers[ref]
  if (!asset) {
    return {
      type: 'prayer',
      title: bilingualOf(ref),
      text: bilingualOf(`[Unknown prayer ref: ${ref}]`),
    }
  }
  return {
    type: 'prayer',
    title: ec.localize(asset.title),
    text: ec.localize(asset.body),
  }
}

function resolveCanticleRef(ref: string, ec: EngineContext): RenderedSection {
  const asset = ec.canticles[ref]
  if (!asset) {
    return {
      type: 'canticle',
      title: bilingualOf(ref),
      subtitle: bilingualEmpty,
      source: bilingualEmpty,
      text: bilingualOf(`[Unknown canticle ref: ${ref}]`),
    }
  }
  return {
    type: 'canticle',
    title: ec.localize(asset.title),
    subtitle: asset.subtitle ? ec.localize(asset.subtitle) : bilingualEmpty,
    source: asset.source ? ec.localize(asset.source) : bilingualEmpty,
    text: ec.localize(asset.body),
  }
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
  const { count, variable, sections: templateSections } = section

  let entries: VariantEntry[] | undefined
  if (variable) {
    if (!context.variant) {
      return [{ type: 'rubric', label: bilingualOf('[No variant loaded for repeat variable]') }]
    }
    const resolved = resolveVariantData(context.variant, context)
    if (!resolved) {
      return [{ type: 'rubric', label: bilingualOf(`[No data for variant key: ${variable.key}]`) }]
    }
    entries = resolved.entries
  }

  const iterCount = entries ? Math.min(count, entries.length) : count

  // Collapse repeated single-prayer refs into one section with a count
  if (
    !variable &&
    templateSections.length === 1 &&
    templateSections[0].type === 'prayer' &&
    'ref' in templateSections[0]
  ) {
    const resolved = resolvePrayerRef(templateSections[0].ref, ec)
    if (resolved.type === 'prayer') return [{ ...resolved, count: iterCount }]
    return [resolved]
  }

  const sections = Array.from({ length: iterCount }, (_, i) => {
    const entry = entries?.[i]
    const resolved: Record<string, string | undefined> = {}
    if (entry) {
      for (const [k, v] of Object.entries(entry)) {
        resolved[k] =
          typeof v === 'object' && v !== null && ('en-US' in v || 'pt-BR' in v)
            ? ec.localizeUI(v as LocalizedText)
            : typeof v === 'string'
              ? v
              : undefined
      }
    }
    const vars: Record<string, string | undefined> = {
      ...resolved,
      index: String(i),
      ordinal: getOrdinal(i, ec.language),
    }
    return templateSections.flatMap((s) => {
      const substituted = substituteInFlowSection(s, vars)
      return resolveSection(substituted, context, ec)
    })
  }).flat()

  return sections
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
        },
      ]

    case 'prayer':
      if ('ref' in section) return [resolvePrayerRef(section.ref, ec)]
      if ('inline' in section) return [resolveInlinePrayer(section.inline, ec, section.speaker)]
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
      if ('ref' in section) return [resolveCanticleRef(section.ref, ec)]
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

      const variantValue = cycleData.variantKey
        ? String((context as Record<string, unknown>)[cycleData.variantKey] ?? '')
        : undefined
      const entries = (
        variantValue
          ? (cycleData.entries[variantValue] ?? Object.values(cycleData.entries)[0])
          : Object.values(cycleData.entries)[0]
      ) as unknown[]
      if (!entries?.length) return []

      const index = getCycleIndex(cycleData.indexBy, context.date, entries.length, context)
      const entry = entries[index]

      if (section.as === 'template' && section.sections) {
        const entryObj = entry as Record<string, string | LocalizedText | undefined>
        const vars: Record<string, string | undefined> = {}
        for (const [k, v] of Object.entries(entryObj)) {
          vars[k] =
            typeof v === 'object' && v !== null && ('en-US' in v || 'pt-BR' in v)
              ? ec.localizeUI(v as LocalizedText)
              : typeof v === 'string'
                ? v
                : undefined
        }
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
      const filtered = section.options.filter((opt) => !opt.lang || opt.lang === ec.contentLanguage)
      if (filtered.length === 0) return []
      return [
        {
          type: 'options',
          label: ec.localize(section.label),
          options: filtered.map((opt) => ({
            id: opt.id,
            label: ec.localize(opt.label),
            sections: opt.sections.flatMap((s) => resolveSection(s, context, ec)),
          })),
        },
      ]
    }

    default:
      return []
  }
}

export function resolveFlow(
  flow: FlowDefinition,
  context: FlowContext,
  engineContext: EngineContext,
): RenderedSection[] {
  return flow.sections.flatMap((section) => resolveSection(section, context, engineContext))
}
