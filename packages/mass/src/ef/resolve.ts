import type { DayCalendar, LiturgicalCategory } from '@ember/liturgical'
import { getDoSanctiId, getDoTemporaId, getDoTemporaSundayId } from './do-file-id'
import { getSectionIdsForSlot } from './slot-map'
import type { ProperDay, ProperSection } from './types'

export type RawSection = { 'en-US'?: string; la?: string; 'pt-BR'?: string; citation?: string }
export type RawProperFile = Record<string, RawSection>

export type PropersDataSource = {
  loadTempora(id: string): Promise<RawProperFile | undefined>
  loadSancti(id: string): Promise<RawProperFile | undefined>
  /**
   * Optional DO precedence index (id→number) from `content/propers/ef-ranks.json`.
   * When provided, tempora-vs-sancti is decided by Divinum Officium's own
   * occurrence value (higher wins) instead of the hand-authored calendar category.
   */
  loadRanks?(): Promise<Record<string, number> | undefined>
}

export type LocalizeContent = (text: { 'en-US'?: string; 'pt-BR'?: string }) => string

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
 * Decide tempora vs sancti from Divinum Officium's own occurrence values: the
 * higher-ranked celebration's Mass is said. Ferial days (rank 1) yield to any
 * saint; Sundays (rank ~6.x) yield only to a strictly higher feast. Ties and
 * missing sancti stay on tempora (the Sunday/feria Mass, saint commemorated).
 */
export function chooseProperSourceByRank(
  temporaId: string | undefined,
  sanctiId: string,
  ranks: Record<string, number>,
): 'tempora' | 'sancti' {
  const tempora = temporaId ? (ranks[temporaId] ?? 0) : 0
  const sancti = ranks[sanctiId] ?? 0
  return sancti > tempora ? 'sancti' : 'tempora'
}

/**
 * Loads all proper sections for a given date.
 * Returns localized text for the current app language.
 */
export async function getProperDay(
  date: Date,
  dayCalendar: DayCalendar | undefined,
  dataSource: PropersDataSource,
  localize: LocalizeContent,
): Promise<ProperDay | undefined> {
  const raw = await loadRawProperDay(date, dayCalendar, dataSource)
  if (!raw) return undefined

  const result: ProperDay = {}
  for (const [sectionId, section] of Object.entries(raw)) {
    const text = localize({ 'en-US': section['en-US'] ?? '', 'pt-BR': section['pt-BR'] })
    if (!text) continue
    result[sectionId] = {
      text,
      latin: section.la,
      citation: section.citation,
    }
  }
  return result
}

/**
 * Gets a single proper section for a flow slot name (e.g., 'introit', 'collect').
 */
export async function getProperForSlot(
  date: Date,
  slot: string,
  dayCalendar: DayCalendar | undefined,
  dataSource: PropersDataSource,
  localize: LocalizeContent,
): Promise<ProperSection | undefined> {
  const raw = await loadRawProperDay(date, dayCalendar, dataSource)
  if (!raw) return undefined

  const sectionIds = getSectionIdsForSlot(slot)
  for (const id of sectionIds) {
    const section = raw[id]
    if (!section) continue

    const text = localize({ 'en-US': section['en-US'] ?? '', 'pt-BR': section['pt-BR'] })
    if (!text) continue

    return {
      text,
      latin: section.la,
      citation: section.citation,
    }
  }
  return undefined
}

/**
 * Gets the raw (unlocalised) section for a flow slot name.
 * Callers can apply their own bilingual localization.
 */
export async function getRawProperForSlot(
  date: Date,
  slot: string,
  dayCalendar: DayCalendar | undefined,
  dataSource: PropersDataSource,
): Promise<(RawSection & { sectionId: string }) | undefined> {
  const raw = await loadRawProperDay(date, dayCalendar, dataSource)
  if (!raw) return undefined

  const sectionIds = getSectionIdsForSlot(slot)
  for (const id of sectionIds) {
    const section = raw[id]
    if (section) return { ...section, sectionId: id }
  }
  return undefined
}

// ── Internal ──

async function loadRawProperDay(
  date: Date,
  dayCalendar: DayCalendar | undefined,
  dataSource: PropersDataSource,
): Promise<RawProperFile | undefined> {
  const temporaId = getDoTemporaId(date)
  const sanctiId = getDoSanctiId(date)

  // Prefer Divinum Officium's own occurrence values when available; fall back to
  // the calendar-category heuristic.
  const ranks = dataSource.loadRanks ? await dataSource.loadRanks() : undefined
  const source = ranks
    ? chooseProperSourceByRank(temporaId, sanctiId, ranks)
    : chooseProperSource(date, dayCalendar)

  const dayTempora = temporaId ? await dataSource.loadTempora(temporaId) : undefined
  const sancti = await dataSource.loadSancti(sanctiId)

  // EF free-ferial rule: weekday tempora files (-1..-6) ship only the slots that
  // differ from the previous Sunday. Gap-fill from that Sunday so missing
  // Introit/Collect/Epistle/Gradual/Gospel/Offertory/Secret/Communion/Postcommunion
  // resolve to last Sunday's text. Days with own propers (Lent, Advent ferials,
  // ember days, vigils) win slot-by-slot via the overlay.
  const sundayId = temporaId ? getDoTemporaSundayId(temporaId) : undefined
  const sundayTempora = sundayId ? await dataSource.loadTempora(sundayId) : undefined
  const tempora =
    sundayTempora && dayTempora
      ? { ...sundayTempora, ...dayTempora }
      : (dayTempora ?? sundayTempora)

  // Use the calendar-determined source, fall back to the other if unavailable.
  // This handles cases like Christmas (calendar says Tempora, DO stores in Sancti).
  if (source === 'sancti') return sancti ?? tempora
  return tempora ?? sancti
}
