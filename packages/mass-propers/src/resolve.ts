import type { DayCalendar, LiturgicalCategory } from '@ember/liturgical'
import { getDoSanctiId, getDoTemporaId } from './do-file-id'
import { getSectionIdsForSlot } from './slot-map'
import type { ProperDay, ProperSection } from './types'

export type RawSection = { en?: string; latin?: string; 'pt-BR'?: string; citation?: string }
export type RawProperFile = Record<string, RawSection>

export type PropersDataSource = {
  hasTempora(id: string): boolean
  hasSancti(id: string): boolean
  loadTempora(id: string): RawProperFile | undefined
  loadSancti(id: string): RawProperFile | undefined
}

export type LocalizeContent = (text: { en: string; 'pt-BR'?: string }) => string

// Categories that map to Tempora (seasonal cycle) in DO
const temporaCategories = new Set<LiturgicalCategory>([
  'solemnity_temporal',
  'feast_of_the_lord',
  'liturgical_season',
])

/**
 * Determines whether to use Tempora or Sancti propers for a given date.
 * Uses the liturgical calendar's principal celebration to decide.
 * Falls back to Tempora when no calendar data is available.
 */
export function chooseProperSource(
  _date: Date,
  dayCalendar: DayCalendar | undefined,
): 'tempora' | 'sancti' {
  if (!dayCalendar?.principal) return 'tempora'
  const category = dayCalendar.principal.entry.category
  return temporaCategories.has(category) ? 'tempora' : 'sancti'
}

/**
 * Loads all proper sections for a given date.
 * Returns localized text for the current app language.
 */
export function getProperDay(
  date: Date,
  dayCalendar: DayCalendar | undefined,
  dataSource: PropersDataSource,
  localize: LocalizeContent,
): ProperDay | undefined {
  const raw = loadRawProperDay(date, dayCalendar, dataSource)
  if (!raw) return undefined

  const result: ProperDay = {}
  for (const [sectionId, section] of Object.entries(raw)) {
    const text = localize({ en: section.en ?? '', 'pt-BR': section['pt-BR'] })
    if (!text) continue
    result[sectionId] = {
      text,
      latin: section.latin,
      citation: section.citation,
    }
  }
  return result
}

/**
 * Gets a single proper section for a flow slot name (e.g., 'introit', 'collect').
 */
export function getProperForSlot(
  date: Date,
  slot: string,
  dayCalendar: DayCalendar | undefined,
  dataSource: PropersDataSource,
  localize: LocalizeContent,
): ProperSection | undefined {
  const raw = loadRawProperDay(date, dayCalendar, dataSource)
  if (!raw) return undefined

  const sectionIds = getSectionIdsForSlot(slot)
  for (const id of sectionIds) {
    const section = raw[id]
    if (!section) continue

    const text = localize({ en: section.en ?? '', 'pt-BR': section['pt-BR'] })
    if (!text) continue

    return {
      text,
      latin: section.latin,
      citation: section.citation,
    }
  }
  return undefined
}

// ── Internal ──

function loadRawProperDay(
  date: Date,
  dayCalendar: DayCalendar | undefined,
  dataSource: PropersDataSource,
): RawProperFile | undefined {
  const source = chooseProperSource(date, dayCalendar)
  const temporaId = getDoTemporaId(date)
  const sanctiId = getDoSanctiId(date)

  const tempora =
    temporaId && dataSource.hasTempora(temporaId) ? dataSource.loadTempora(temporaId) : undefined
  const sancti = dataSource.hasSancti(sanctiId) ? dataSource.loadSancti(sanctiId) : undefined

  // Use the calendar-determined source, fall back to the other if unavailable.
  // This handles cases like Christmas (calendar says Tempora, DO stores in Sancti).
  if (source === 'sancti') return sancti ?? tempora
  return tempora ?? sancti
}
