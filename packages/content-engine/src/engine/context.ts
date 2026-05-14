import type { PsalmRef, ReadingReference } from '@ember/liturgical'
import { getLiturgicalSeason } from '@ember/liturgical'
import { getDate, getDay } from 'date-fns'
import type {
  BilingualText,
  ContentLanguage,
  CycleData,
  FlowSection,
  LectioTrackDef,
  LocalizedContent,
  LocalizedText,
  ResolvedProse,
} from '../types'

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
   * Optional asset reader for a practice's own data declarations. When not
   * supplied, the engine falls back to `FlowContext.cycleData[path]` so a
   * practice's declared `data` files resolve without a host-supplied reader.
   *
   * Cross-practice data dependencies (e.g. `mass-of` reading OF Mass propers)
   * are wired into the source itself at construction time, not threaded
   * through `EngineContext`.
   */
  fetchOwnAsset?: (path: string) => Promise<unknown>
  /**
   * When true, host supports `offering` and `capture-movement` blocks. Set
   * by the app practice player; absent in pure engine tests / cloud
   * prerenders, in which case the blocks resolve to no-ops.
   */
  supportsMovements?: boolean
  /**
   * Read-side resolution access. When absent, `capture-resolution` and
   * `review-resolution` resolve to no-ops.
   */
  resolutions?: {
    active(level: ResolutionLevel): ResolutionLite | undefined
    pending(level: ResolutionLevel): ResolutionLite | undefined
  }
  /**
   * Resolution window at a given level / direction. The host closes over its
   * own "today" anchor (4am-cutoff aware), so the engine doesn't need to know
   * about clocks.
   */
  windowFor?(
    level: ResolutionLevel,
    forward: 'current' | 'next',
  ): { starts_at: number; ends_at: number }
}

export type ResolutionLevel = 'daily'

export type ResolutionLite = {
  id: string
  text: string
  level: ResolutionLevel
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
  // Holds both repeat-iteration arrays (RepeatEntry[]) and DataSource load results (arbitrary objects).
  flowData?: Record<string, unknown>
  selectOverrides?: Record<string, string>
  fragments?: Record<string, FlowSection[]>
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
  if (head === undefined) return undefined
  let value: unknown = context.flowData?.[head] ?? context.templateVars?.[head]

  for (const seg of rest) {
    if (value === null || value === undefined) return undefined
    if (typeof value !== 'object') return undefined
    value = (value as Record<string, unknown>)[seg]
  }

  return value
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

/** Build the substitution vars from a FlowContext: flowData ∪ templateVars (templateVars wins). */
export function composeVars(
  context: FlowContext,
  overlay: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...(context.flowData ?? {}),
    ...(context.templateVars ?? {}),
    ...overlay,
  }
}

export function resolveEntryVars(
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

export const bilingualEmpty: BilingualText = { primary: '' }

export function bilingualOf(text: string): BilingualText {
  return { primary: text }
}
