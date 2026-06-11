import type {
  CycleScheme,
  FormularyKind,
  LiturgicalColor,
  MassFormulary,
  Rank,
  Season,
} from '@ember/missal-schema'
import { detectStructure } from './structure-detect'
import { type EnrichCtx, toLocalized } from './localized'
import { toParts } from './parts'
import { loadPrefaceLibrary, resolvePrefaces } from './prefaces'
import { toPrayer, toReadings } from './slots'
import { prettifyTitle } from './title'

const knownScopes = new Set([
  'brazil', 'argentina', 'chile', 'uruguay', 'spain', 'france', 'united-states',
  'africa', 'nigeria', 'german-speaking', 'religious-orders', 'argentina-chile',
  'spanish-speaking',
])

function scopeFromId(id: string): string {
  const last = id.split('.').pop() ?? ''
  return knownScopes.has(last) ? last : 'universal'
}

const groupToKind: Record<string, FormularyKind> = {
  tempore: 'temporal',
  sanctorale: 'sanctoral',
  common: 'common',
  ritual: 'ritual',
  votive: 'votive',
}

function cycleSchemeOf(readings: unknown): CycleScheme {
  if (readings && typeof readings === 'object') {
    const keys = Object.keys(readings as object)
    if (keys.some((k) => k === 'A' || k === 'B' || k === 'C')) return 'sunday'
    if (keys.some((k) => k === 'I' || k === 'II')) return 'weekday'
  }
  return 'fixed'
}

const colors = new Set(['green', 'white', 'red', 'violet', 'rose', 'black', 'gold'])
const ranks = new Set(['solemnity', 'feast', 'memorial', 'optional-memorial', 'sunday', 'weekday'])

function rankOf(d: Record<string, unknown>, kind: FormularyKind, weekday: string | undefined, id: string): Rank {
  const raw = d.rank
  if (typeof raw === 'string' && ranks.has(raw)) return raw as Rank
  if (kind === 'temporal') {
    if (id.includes('.solemnity.')) return 'solemnity'
    return weekday === 'sunday' ? 'sunday' : 'weekday'
  }
  return 'weekday'
}

const validSeasons = new Set(['advent', 'christmas', 'lent', 'holy-week', 'easter', 'ordinary-time'])

/** The four moveable solemnities (Trinity, Corpus Christi, Sacred Heart, Christ
 * the King) carry season='solemnity' upstream; they all fall in Ordinary Time. */
function seasonOf(raw: unknown, id: string): Season | undefined {
  if (typeof raw === 'string' && validSeasons.has(raw)) return raw as Season
  if (raw === 'solemnity' || id.startsWith('tempore.solemnity.')) return 'ordinary-time'
  return undefined
}

function includeGloriaOf(rank: Rank, season: Season | undefined): boolean {
  if (rank === 'solemnity' || rank === 'feast') return true
  if (rank === 'sunday') return season !== 'advent' && season !== 'lent'
  return false
}

function inheritsFrom(id: string, season: Season | undefined, weekday: string | undefined, hasCollect: boolean): string | undefined {
  if (hasCollect || season !== 'ordinary-time' || weekday === 'sunday') return undefined
  const m = /ordinary-time\.week-(\d+)\./.exec(id)
  if (!m) return undefined
  return `tempore.ordinary-time.week-${m[1]}.sunday`
}

export function buildFormulary(
  d: Record<string, unknown>,
  lib: ReturnType<typeof loadPrefaceLibrary>,
  patches: EnrichCtx['patches'],
): MassFormulary | undefined {
  const id = d.id as string
  if (!id) return undefined
  const ctx: EnrichCtx = { patches, id }

  const group = (d.group as string) ?? 'tempore'
  const kind = groupToKind[group] ?? 'votive'
  const scope = scopeFromId(id)
  const weekday = d.weekday as string | undefined

  const title = prettifyTitle(toLocalized(d.title, ctx) ?? { 'pt-BR': id })
  const structure = detectStructure(title, toLocalized(d.rankLocalized, ctx))
  const season = seasonOf(d.season, id)
  const colorRaw = d.liturgicalColor as string | undefined
  const color = colorRaw && colors.has(colorRaw) ? (colorRaw as LiturgicalColor) : undefined
  const rank = rankOf(d, kind, weekday, id)

  const collect = toPrayer(d.collect, ctx)
  const readings = toReadings(d.readings, ctx)
  const description = toLocalized(d.description, ctx)
  const prefaces = resolvePrefaces(d.preface, lib, ctx)
  const parts = structure !== 'mass' ? toParts(d.parts, ctx) : undefined

  const formulary: MassFormulary = {
    id,
    kind,
    scope,
    structure,
    title,
    cycleScheme: cycleSchemeOf(d.readings),
    includeGloria: includeGloriaOf(rank, season),
  }
  if (season) formulary.season = season
  if (color) formulary.color = color
  formulary.rank = rank
  if (description) formulary.description = description

  const inherit = inheritsFrom(id, season, weekday, Boolean(collect))
  if (inherit) formulary.inheritsOrationsFrom = inherit

  const entranceAntiphon = toPrayer(d.entranceAntiphon, ctx)
  const prayerOverOfferings = toPrayer(d.prayerOverOfferings, ctx)
  const communionAntiphon = toPrayer(d.communionAntiphon, ctx)
  const postcommunion = toPrayer(d.postcommunion, ctx)
  const prayerOverPeople = toPrayer(d.prayerOverPeople, ctx)

  if (entranceAntiphon) formulary.entranceAntiphon = entranceAntiphon
  if (collect) formulary.collect = collect
  if (readings) formulary.readings = readings
  if (prayerOverOfferings) formulary.prayerOverOfferings = prayerOverOfferings
  if (prefaces) formulary.prefaces = prefaces
  if (communionAntiphon) formulary.communionAntiphon = communionAntiphon
  if (postcommunion) formulary.postcommunion = postcommunion
  if (prayerOverPeople) formulary.prayerOverPeople = prayerOverPeople
  if (parts) formulary.parts = parts

  return formulary
}
