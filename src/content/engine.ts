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
  getComplinePsalms,
  getHymnForHour,
  getMarianAntiphon,
  getPsalmsForDay,
  getTodaysReading,
  type OfficeHour,
} from '@/lib/liturgical'
import type {
  FlowDefinition,
  FlowSection,
  LocalizedBilingualText,
  RenderedSection,
  Variant,
  VariantEntry,
} from './types'

type PrayerAsset = { title: string; english: string; latin?: string; portuguese?: string }
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
  readingProgress?: {
    ot?: ReadingProgress | null
    nt?: ReadingProgress | null
    catechism?: ReadingProgress | null
  }
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

const dayNames = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

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

function resolveVariantData(variant: Variant, date: Date): VariantEntry[] | undefined {
  let setKey: string | undefined
  switch (variant.selector) {
    case 'day-of-week':
      setKey = variant.schedule?.[dayNames[date.getDay()]]
      break
    case 'manual':
    case 'liturgical-season':
      setKey = Object.keys(variant.data)[0]
      break
  }
  return setKey ? variant.data[setKey] : undefined
}

function resolvePrayerRef(ref: string): RenderedSection {
  const asset = prayerRefs[ref]
  if (!asset) {
    return { type: 'prayer', title: ref, text: `[Unknown prayer ref: ${ref}]` }
  }
  return { type: 'prayer', title: asset.title, text: localizeAsset(asset) }
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

function resolveInlinePrayer(inline: LocalizedBilingualText): RenderedSection {
  return { type: 'prayer', title: '', text: localizeContent(inline) }
}

function resolveRepeat(
  section: FlowSection & { type: 'repeat' },
  context: FlowContext,
): RenderedSection[] {
  const { count, variable, sections: templateSections } = section

  let entries: VariantEntry[] | undefined
  if (variable) {
    if (!context.variant) {
      return [{ type: 'rubric', label: '[No variant loaded for repeat variable]' }]
    }
    entries = resolveVariantData(context.variant, context.date)
    if (!entries) {
      return [{ type: 'rubric', label: `[No data for variant key: ${variable.key}]` }]
    }
  }

  const iterCount = entries ? Math.min(count, entries.length) : count
  return Array.from({ length: iterCount }, (_, i) => {
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
      if ('inline' in section) return [resolveInlinePrayer(section.inline)]
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

    case 'psalter': {
      const numbering = context.numbering ?? 'mt'
      if (section.hour === 'compline') {
        return [{ type: 'psalmody', psalms: getComplinePsalms(context.date, numbering) }]
      }
      const forDay = getPsalmsForDay(context.date, numbering)
      const psalms = section.hour === 'morning' ? forDay.morning : forDay.evening
      return [{ type: 'psalmody', psalms }]
    }

    case 'lectio': {
      const progress = context.readingProgress?.[section.testament]
      if (!progress) return [{ type: 'rubric', label: '[Reading progress not available]' }]
      return [{ type: 'reading', reference: getTodaysReading(section.testament, progress) }]
    }

    case 'seasonal': {
      if (section.set === 'hymns') {
        const hymn = getHymnForHour(section.hour as OfficeHour)
        return [
          { type: 'hymn', title: hymn.title, latin: hymn.latin, english: localizeAsset(hymn) },
        ]
      }
      if (section.set === 'marian-antiphon') {
        const antiphon = getMarianAntiphon(context.date)
        return [
          {
            type: 'hymn',
            title: antiphon.title,
            latin: antiphon.latin,
            english: localizeAsset(antiphon),
          },
        ]
      }
      return []
    }

    default:
      return []
  }
}

export function resolveFlow(flow: FlowDefinition, context: FlowContext): RenderedSection[] {
  return flow.sections.flatMap((section) => resolveSection(section, context))
}
