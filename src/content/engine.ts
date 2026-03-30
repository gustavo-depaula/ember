import { getDate, getDay } from 'date-fns'
import apostlesCreed from '@/assets/prayers/apostles-creed.json'
import benedictus from '@/assets/prayers/benedictus.json'
import divineMercyResponse from '@/assets/prayers/divine-mercy-response.json'
import eternalFather from '@/assets/prayers/eternal-father.json'
import fatimaPrayer from '@/assets/prayers/fatima-prayer.json'
import gloryBe from '@/assets/prayers/glory-be.json'
import hailHolyQueen from '@/assets/prayers/hail-holy-queen.json'
import hailMary from '@/assets/prayers/hail-mary.json'
import holyGod from '@/assets/prayers/holy-god.json'
import magnificat from '@/assets/prayers/magnificat.json'
import nuncDimittis from '@/assets/prayers/nunc-dimittis.json'
import openingVerse from '@/assets/prayers/opening-verse.json'
import ourFather from '@/assets/prayers/our-father.json'
import signOfCross from '@/assets/prayers/sign-of-cross.json'

import type { ReadingProgress } from '@/db/schema'
import type { PsalmNumbering } from '@/lib/bolls'
import i18n, { localizeAsset, localizeContent } from '@/lib/i18n'
import {
  getLiturgicalSeason,
  getTodaysReading,
  type LiturgicalCalendarForm,
  parsePsalmRef,
} from '@/lib/liturgical'
import type {
  CycleData,
  FlowDefinition,
  FlowSection,
  LocalizedBilingualText,
  RenderedSection,
  Variant,
  VariantEntry,
} from './types'

type LocalizedTitle = { en: string; 'pt-BR'?: string; la?: string }
type PrayerAsset = { title: LocalizedTitle; english: string; latin?: string; portuguese?: string }
type CanticleAsset = {
  title: string
  subtitle?: string
  source?: string
  english: string
  portuguese?: string
}

const prayerRefs: Record<string, PrayerAsset> = {
  'sign-of-cross': signOfCross,
  'our-father': ourFather,
  'hail-mary': hailMary,
  'glory-be': gloryBe,
  'opening-verse': openingVerse,
  'apostles-creed': apostlesCreed,
  'fatima-prayer': fatimaPrayer,
  'hail-holy-queen': hailHolyQueen,
  'eternal-father': eternalFather,
  'divine-mercy-response': divineMercyResponse,
  'holy-god': holyGod,
}

const canticleRefs: Record<string, CanticleAsset> = {
  benedictus,
  magnificat,
  'nunc-dimittis': nuncDimittis,
}

export type FlowContext = {
  date: Date
  variant?: Variant
  numbering?: PsalmNumbering
  liturgicalCalendar?: LiturgicalCalendarForm
  readingProgress?: {
    ot?: ReadingProgress | null
    nt?: ReadingProgress | null
    catechism?: ReadingProgress | null
  }
  cycleData?: Record<string, CycleData>
  setKeyOverride?: string
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

function getOrdinal(index: number): string {
  const ordinals = i18n.language === 'pt-BR' ? ordinalsPtBR : ordinalsEn
  return ordinals[index] ?? String(index + 1)
}

// Re-use the canonical day-name array from the psalter module
import { dayNames } from '@/lib/liturgical/psalter'

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
  let setKey: string | undefined
  if (context.setKeyOverride && variant.data[context.setKeyOverride]) {
    setKey = context.setKeyOverride
  } else {
    switch (variant.selector) {
      case 'day-of-week':
        setKey = variant.schedule?.[dayNames[context.date.getDay()]]
        break
      case 'liturgical-season': {
        const season = getLiturgicalSeason(context.date, context.liturgicalCalendar)
        setKey = variant.data[season] ? season : Object.keys(variant.data)[0]
        break
      }
      case 'manual':
        setKey = Object.keys(variant.data)[0]
        break
    }
  }
  if (!setKey || !variant.data[setKey]) return undefined
  return { entries: variant.data[setKey], setKey }
}

function localizePrayerTitle(title: LocalizedTitle): string {
  return localizeContent(title)
}

function resolvePrayerRef(ref: string): RenderedSection {
  const asset = prayerRefs[ref]
  if (!asset) {
    return { type: 'prayer', title: ref, text: `[Unknown prayer ref: ${ref}]` }
  }
  return { type: 'prayer', title: localizePrayerTitle(asset.title), text: localizeAsset(asset) }
}

function resolveCanticleRef(ref: string): RenderedSection {
  const asset = canticleRefs[ref]
  if (!asset) {
    return {
      type: 'canticle',
      title: ref,
      subtitle: '',
      source: '',
      text: `[Unknown canticle ref: ${ref}]`,
    }
  }
  return {
    type: 'canticle',
    title: asset.title,
    subtitle: asset.subtitle ?? '',
    source: asset.source ?? '',
    text: localizeAsset(asset),
  }
}

function resolveInlinePrayer(
  inline: LocalizedBilingualText,
  speaker?: 'priest' | 'people' | 'all',
): RenderedSection {
  return {
    type: 'prayer',
    title: '',
    text: localizeContent(inline),
    ...(speaker && { speaker }),
    ...(inline.latin && { latin: inline.latin }),
  }
}

function resolveRepeat(
  section: FlowSection & { type: 'repeat' },
  context: FlowContext,
): RenderedSection[] {
  const { count, variable, sections: templateSections } = section

  let entries: VariantEntry[] | undefined
  const preamble: RenderedSection[] = []
  if (variable) {
    if (!context.variant) {
      return [{ type: 'rubric', label: '[No variant loaded for repeat variable]' }]
    }
    const resolved = resolveVariantData(context.variant, context)
    if (!resolved) {
      return [{ type: 'rubric', label: `[No data for variant key: ${variable.key}]` }]
    }
    entries = resolved.entries
    const setNames = context.variant.setNames
    if (setNames && Object.keys(setNames).length > 1) {
      preamble.push({
        type: 'set-selector',
        options: Object.entries(setNames).map(([key, name]) => ({
          key,
          label: localizeContent(name),
        })),
        selectedKey: resolved.setKey,
      })
    } else {
      const setName = setNames?.[resolved.setKey]
      if (setName) {
        preamble.push({ type: 'heading', text: localizeContent(setName) })
      }
    }
  }

  const iterCount = entries ? Math.min(count, entries.length) : count

  // Collapse repeated single-prayer refs into one section with a count
  if (
    !variable &&
    templateSections.length === 1 &&
    templateSections[0].type === 'prayer' &&
    'ref' in templateSections[0]
  ) {
    const resolved = resolvePrayerRef(templateSections[0].ref)
    if (resolved.type === 'prayer') return [{ ...resolved, count: iterCount }]
    return [resolved]
  }

  const sections = Array.from({ length: iterCount }, (_, i) => {
    const entry = entries?.[i]
    const resolved: Record<string, string | undefined> = {}
    if (entry) {
      for (const [k, v] of Object.entries(entry)) {
        resolved[k] = typeof v === 'object' && v !== null && 'en' in v ? localizeContent(v) : v
      }
    }
    const vars: Record<string, string | undefined> = {
      ...resolved,
      index: String(i),
      ordinal: getOrdinal(i),
    }
    return templateSections.flatMap((s) => {
      const substituted = substituteInFlowSection(s, vars)
      return resolveSection(substituted, context)
    })
  }).flat()

  return [...preamble, ...sections]
}

function getCycleIndex(indexBy: string, date: Date, length: number): number {
  if (indexBy === 'day-of-month') return (getDate(date) - 1) % length
  if (indexBy === 'day-of-week') return getDay(date)
  if (indexBy === 'fixed') return 0
  return 0
}

function mapCycleOutput(as: string, raw: unknown): RenderedSection[] {
  if (as === 'psalmody') {
    return [{ type: 'psalmody', psalms: (raw as (number | string)[]).map(parsePsalmRef) }]
  }
  if (as === 'hymn') {
    const data = raw as { title: string; latin?: string; text: { en: string; 'pt-BR'?: string } }
    return [
      {
        type: 'hymn',
        title: data.title,
        latin: data.latin ?? '',
        english: localizeContent(data.text),
      },
    ]
  }
  return []
}

function resolveSection(section: FlowSection, context: FlowContext): RenderedSection[] {
  switch (section.type) {
    case 'rubric':
      return [{ type: 'rubric', label: localizeContent(section.text) }]

    case 'divider':
      return [{ type: 'divider' }]

    case 'heading':
      return [{ type: 'heading', text: localizeContent(section.text) }]

    case 'image':
      return [
        {
          type: 'image',
          src: section.src,
          caption: section.caption ? localizeContent(section.caption) : undefined,
        },
      ]

    case 'prayer':
      if ('ref' in section) return [resolvePrayerRef(section.ref)]
      if ('inline' in section) return [resolveInlinePrayer(section.inline, section.speaker)]
      return []

    case 'hymn':
      if ('ref' in section) {
        return [
          { type: 'hymn', title: section.ref, latin: '', english: `[Hymn ref: ${section.ref}]` },
        ]
      }
      if ('inline' in section) {
        return [
          {
            type: 'hymn',
            title: '',
            english: localizeContent(section.inline),
            latin: section.inline.latin ?? '',
          },
        ]
      }
      return []

    case 'canticle':
      if ('ref' in section) return [resolveCanticleRef(section.ref)]
      if ('inline' in section) {
        return [
          {
            type: 'canticle',
            title: localizeContent(section.inline.title),
            subtitle: section.inline.subtitle ? localizeContent(section.inline.subtitle) : '',
            source: '',
            text: localizeContent(section.inline.text),
          },
        ]
      }
      return []

    case 'meditation':
      return [{ type: 'meditation', text: localizeContent(section.text) }]

    case 'response':
      return [
        {
          type: 'response',
          verses: section.verses.map((v) => ({ v: localizeContent(v.v), r: localizeContent(v.r) })),
        },
      ]

    case 'repeat':
      return resolveRepeat(section, context)

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

      const index = getCycleIndex(cycleData.indexBy, context.date, entries.length)
      const entry = entries[index]
      const raw = section.key ? (entry as Record<string, unknown>)[section.key] : entry

      return mapCycleOutput(section.as, raw)
    }

    case 'psalmody':
      return [{ type: 'psalmody', psalms: section.psalms.map(parsePsalmRef) }]

    case 'lectio': {
      const progress = context.readingProgress?.[section.testament]
      if (!progress) return [{ type: 'rubric', label: '[Reading progress not available]' }]
      return [
        {
          type: 'reading',
          reference: getTodaysReading(section.testament, progress),
          testament: section.testament,
        },
      ]
    }

    case 'subheading':
      return [{ type: 'subheading', text: localizeContent(section.text) }]

    case 'proper':
      return [
        { type: 'proper', slot: section.slot, description: localizeContent(section.description) },
      ]

    case 'options': {
      const filtered = section.options.filter((opt) => !opt.lang || opt.lang === i18n.language)
      if (filtered.length === 0) return []
      return [
        {
          type: 'options',
          label: localizeContent(section.label),
          options: filtered.map((opt) => ({
            id: opt.id,
            label: localizeContent(opt.label),
            sections: opt.sections.flatMap((s) => resolveSection(s, context)),
          })),
        },
      ]
    }

    default:
      return []
  }
}

export function resolveFlow(flow: FlowDefinition, context: FlowContext): RenderedSection[] {
  return flow.sections.flatMap((section) => resolveSection(section, context))
}
