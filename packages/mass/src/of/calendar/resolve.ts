import {
  getLiturgicalYear,
  getOfLiturgicalPosition,
  getSundayCycle,
  getWeekdayCycle,
  ofTemporeIds,
} from '@ember/liturgical'
import type {
  OfCalendarStatics,
  Rank,
  SanctoralEntry,
  Season,
  TemporalEntry,
} from '@ember/missal-schema'
import { girm, isPrivilegedFeria, sanctoralPrecedence, temporalPrecedence } from './precedence'
import { type Scope, sanctoralFor } from './sanctoral'
import { transferredDate } from './transfers'
import type { OfCelebration, OfDay } from './types'

const seasonMap: Record<string, Season | undefined> = {
  advent: 'advent',
  christmas: 'christmas',
  lent: 'lent',
  'holy-week': 'holy-week',
  easter: 'easter',
  ordinary: 'ordinary-time',
}

/** Apply impeded-solemnity transfers to the day's sanctoral matches. */
function sanctoralWithTransfers(
  entries: SanctoralEntry[],
  date: Date,
  scope: Scope,
): SanctoralEntry[] {
  const year = date.getFullYear()
  const natural = sanctoralFor(entries, date, scope).filter((e) => {
    // Drop a solemnity whose natural date today is impeded (transferred away).
    if (e.rank === 'solemnity' && e.dateRule.type === 'fixed') {
      const observed = transferredDate(e.dateRule.month, e.dateRule.day, year)
      return observed.getDate() === date.getDate() && observed.getMonth() === date.getMonth()
    }
    return true
  })
  // Add any solemnity transferred *into* today from an impeded natural date.
  for (const e of entries) {
    if (e.rank !== 'solemnity' || e.dateRule.type !== 'fixed') continue
    if (e.scope !== 'universal' && e.scope !== scope) continue
    const observed = transferredDate(e.dateRule.month, e.dateRule.day, year)
    const naturalDate = new Date(year, e.dateRule.month - 1, e.dateRule.day)
    const transferred = observed.getTime() !== naturalDate.getTime()
    if (
      transferred &&
      observed.getDate() === date.getDate() &&
      observed.getMonth() === date.getMonth()
    ) {
      if (!natural.includes(e)) natural.push(e)
    }
  }
  return natural
}

/**
 * Resolve the full OF day. Pure over the calendar statics + the (validated)
 * temporal math from `@ember/liturgical`. Returns every celebration the day
 * offers, ordered with the principal first — the renderer's celebration picker
 * presents them. The producer assembles the formulary-fetch closure
 * (`inheritsOrationsFrom`, the temporal sibling for memorial readings).
 */
export function resolveOfDay(
  date: Date,
  statics: OfCalendarStatics,
  opts: { scope?: Scope } = {},
): OfDay {
  const scope = opts.scope ?? 'universal'
  const position = getOfLiturgicalPosition(date)
  const litYear = getLiturgicalYear(date)
  const season = seasonMap[position.season]

  const temporalByRef = new Map<string, TemporalEntry>(
    statics.temporal.map((t) => [t.formularyRef, t]),
  )
  const temporalIds = ofTemporeIds(date)
  const temporalRef = temporalIds[0]

  const celebrations: OfCelebration[] = []

  // Temporal candidates (multi-Mass days expand to several formulary refs).
  for (const ref of temporalIds) {
    const entry = temporalByRef.get(ref)
    celebrations.push({
      ref,
      kind: 'temporal',
      rank: temporalRank(date, position, ref),
      precedence: temporalPrecedence(date, position, ref),
      mode: 'full',
      structure: entry?.structure,
    })
  }

  // Sanctoral candidates.
  for (const e of sanctoralWithTransfers(statics.sanctoral, date, scope)) {
    celebrations.push({
      ref: e.formularyRef,
      kind: 'sanctoral',
      rank: e.rank,
      precedence: sanctoralPrecedence(e.rank, e.formularyRef),
      mode: 'full',
      title: e.title,
    })
  }

  celebrations.sort((a, b) => a.precedence - b.precedence)
  const principal = celebrations[0]

  // Suppression + commemoration. When the principal is a Sunday/feast/solemnity
  // (precedence ≤ feast), sanctoral memorials are omitted; on privileged ferias,
  // surviving optional memorials are commemorations.
  const privileged = isPrivilegedFeria(position, date)
  const offered = celebrations.filter((c) => {
    if (c === principal) return true
    if (principal.precedence <= girm.feast) return c.kind === 'temporal' // saints suppressed
    return true
  })
  for (const c of offered) {
    if (c !== principal && privileged && c.precedence >= girm.optionalMemorial)
      c.mode = 'commemoration'
  }

  return {
    date,
    season,
    specialDay: position.specialDay,
    cycle: getSundayCycle(litYear),
    weekdayCycle: getWeekdayCycle(litYear),
    temporalRef,
    celebrations: offered,
  }
}

function temporalRank(
  date: Date,
  position: ReturnType<typeof getOfLiturgicalPosition>,
  ref: string,
): Rank {
  const p = temporalPrecedence(date, position, ref)
  if (p <= girm.solemnity) return 'solemnity'
  if (p <= girm.feastOfTheLord) return 'feast'
  if (p === girm.sundayOrdinary || p === girm.privileged)
    return position.dayOfWeek === 0 ? 'sunday' : 'weekday'
  if (p <= girm.feast) return 'feast'
  return 'weekday'
}
