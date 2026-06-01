import { getDate, getMonth, isSameDay } from 'date-fns'
import type { LiturgicalDate, LiturgicalEntry, RankOF } from './calendar-types'
import { getOfLiturgicalPosition, type OfLiturgicalPosition } from './of-position'
import { ofTemporeIds } from './of-tempore'
import { resolveDate } from './resolve-date'

/**
 * Unified Ordinary Form day resolver.
 *
 * One precedence authority for the whole OF day — the GIRM "Table of Liturgical
 * Days". It merges the temporal cycle (computed from {@link getOfLiturgicalPosition})
 * with the sanctoral celebrations (the generated calendar entries) and ranks
 * them on a single scale, so callers never re-derive precedence. This replaces
 * the old Sunday-only suppression in the calendar and the string-heuristic
 * `applyPrecedence` in `@ember/mass-of`.
 *
 * Each celebration carries the canonical ember-extra id, which is also its
 * Mass-proper id (`tempore.solemnity.most-holy-trinity` → `mass/of/tempore/...`;
 * `sanctorale.05-31` → `mass/of/sanctorale/05-31`), so the Mass builder maps the
 * principal directly with no second lookup.
 */

export type OfCelebrationKind = 'temporal' | 'sanctoral'

export type OfCelebration = {
  /** Canonical ember-extra id (also the Mass-proper id). */
  id: string
  kind: OfCelebrationKind
  /** Position on the GIRM Table of Liturgical Days (1 = highest precedence). */
  precedence: number
  rank: RankOF | undefined
  name: Record<string, string> | undefined
  /**
   * Mass-formulary ids for a temporal celebration. Usually `[id]`, but multi-Mass
   * days yield several (Christmas: vigil/night/dawn/day; Holy Thursday: chrism +
   * Lord's Supper). Undefined for sanctoral celebrations.
   */
  formularyIds?: string[]
  /** Present for sanctoral celebrations. */
  entry?: LiturgicalEntry
}

export type OfDay = {
  date: Date
  /** The celebration whose Mass is said. Always defined. */
  principal: OfCelebration
  /** Lower-precedence celebrations on the day (suppressed or commemorated). */
  others: OfCelebration[]
}

// ── GIRM Table of Liturgical Days ──
// Lower number = higher precedence. Both temporal and sanctoral celebrations
// map onto this single scale.
const girm = {
  triduum: 1,
  privileged: 2, // Christmas/Epiphany/Ascension/Pentecost; Sundays of Advent/Lent/Easter; Ash Wed; Holy Week; Easter Octave
  solemnity: 3,
  feastOfTheLord: 5,
  sundayOrdinary: 6, // Sundays of Christmas season & Ordinary Time
  feast: 7,
  privilegedFeria: 9, // Advent Dec 17-24, Christmas Octave, Lent ferias
  memorial: 10,
  optionalMemorial: 12,
  feria: 13,
} as const

// Feasts of the Lord in the General Calendar that, unlike feasts of saints,
// outrank a Sunday of Ordinary Time (GIRM Table II.5 vs II.6). ember-extra
// doesn't tag them, so we name the (small, fixed) set explicitly.
const feastOfTheLordIds = new Set([
  'sanctorale.02-02', // Presentation of the Lord
  'sanctorale.08-06', // Transfiguration of the Lord
  'sanctorale.09-14', // Exaltation of the Holy Cross
  'sanctorale.11-09', // Dedication of the Lateran Basilica
])

function sanctoralPrecedence(rank: RankOF | undefined, id: string): number {
  switch (rank) {
    case 'solemnity':
      return girm.solemnity
    case 'feast':
      return feastOfTheLordIds.has(id) ? girm.feastOfTheLord : girm.feast
    case 'memorial':
      return girm.memorial
    case 'optional_memorial':
      return girm.optionalMemorial
    default:
      return girm.feria
  }
}

// ── Temporal celebration GIRM precedence from the liturgical position ──

/**
 * GIRM precedence of the temporal day. The temporal cycle ranges from the
 * Triduum down to ordinary ferias.
 */
function temporalPrecedence(
  date: Date,
  position: OfLiturgicalPosition,
  temporalId: string,
): number {
  const { season, specialDay, dayOfWeek, week } = position
  const month = getMonth(date) + 1
  const day = getDate(date)

  // The movable solemnities of the Lord (Trinity, Corpus Christi, Sacred Heart,
  // Christ the King) carry a `tempore.solemnity.*` id — the single robust signal
  // (of-position flags only some of them as specialDays).
  if (temporalId.startsWith('tempore.solemnity.')) return girm.solemnity

  // Solemnity of the BVM on the temporal cycle (Jan 1 has a Christmas-octave id).
  if (specialDay === 'mary-mother-of-god') return girm.solemnity

  // Baptism of the Lord is a Feast of the Lord.
  if (specialDay === 'baptism-of-the-lord') return girm.feastOfTheLord

  // Triduum.
  if (specialDay === 'good-friday' || specialDay === 'holy-saturday') return girm.triduum
  if (specialDay === 'holy-thursday') return girm.triduum

  // Highest-rank feasts of the Lord / privileged days.
  if (
    specialDay === 'christmas' ||
    specialDay === 'epiphany' ||
    specialDay === 'ascension' ||
    specialDay === 'pentecost' ||
    specialDay === 'easter-sunday' ||
    specialDay === 'ash-wednesday' ||
    specialDay === 'palm-sunday'
  ) {
    return girm.privileged
  }

  const isSunday = dayOfWeek === 0

  // Sundays of Advent, Lent, Easter, and Holy Week days are privileged.
  if (season === 'advent' || season === 'lent' || season === 'holy-week') {
    if (isSunday) return girm.privileged
    // Late Advent (Dec 17-24) and Lenten weekdays are privileged ferias.
    if (season === 'advent' && month === 12 && day >= 17) return girm.privilegedFeria
    if (season === 'lent') return girm.privilegedFeria
    if (season === 'holy-week') return girm.privileged
    return girm.feria
  }

  if (season === 'easter') {
    if (isSunday) return girm.privileged
    // Easter Octave (week 1 Mon-Sat) ranks as a privileged day.
    if (week === 1) return girm.privileged
    return girm.feria
  }

  // Christmas season Sundays (Holy Family, etc.) and the octave.
  if (season === 'christmas') {
    if (isSunday) return girm.sundayOrdinary
    // Christmas Octave (Dec 25 - Jan 1) is a privileged feria.
    if ((month === 12 && day >= 25) || (month === 1 && day === 1)) return girm.privilegedFeria
    return girm.feria
  }

  // Ordinary Time.
  if (isSunday) return girm.sundayOrdinary
  return girm.feria
}

// ── Resolver ──

/**
 * Resolve the full OF day for a date, given the sanctoral calendar entries.
 *
 * @param entries the generated OF calendar entries (sanctoral + movable). The
 *   temporal cycle is computed, not passed.
 */
export function resolveOfDay(date: Date, entries: LiturgicalEntry[]): OfDay {
  const year = date.getFullYear()
  const position = getOfLiturgicalPosition(date)

  // ofTemporeIds returns [] on days where the sanctoral takes over entirely
  // (Dec 26-28: St Stephen / St John / Holy Innocents) — then there is no
  // temporal candidate and a sanctoral is always the principal.
  const formularyIds = ofTemporeIds(date)
  const candidates: OfCelebration[] = []
  if (formularyIds.length > 0) {
    candidates.push({
      id: formularyIds[0],
      kind: 'temporal',
      precedence: temporalPrecedence(date, position, formularyIds[0]),
      rank: undefined,
      name: undefined,
      formularyIds,
    })
  }

  const sanctorals: OfCelebration[] = []
  for (const entry of entries) {
    if (!entry.of) continue
    // Temporal celebrations are computed from the liturgical position, not the
    // calendar entries — skip any tempore.* ids that the generated OF calendar
    // may carry, so they aren't double-counted against the computed temporal.
    if (entry.id.startsWith('tempore.')) continue
    // A celebration can resolve into a neighbouring calendar year (e.g. an
    // easter_relative date late in a year); check both this year and last.
    const resolved =
      matchesDate(entry.of.date, date, year) || matchesDate(entry.of.date, date, year - 1)
    if (!resolved) continue
    sanctorals.push({
      id: entry.id,
      kind: 'sanctoral',
      precedence: sanctoralPrecedence(entry.of.rank, entry.id),
      rank: entry.of.rank,
      name: entry.name as Record<string, string>,
      entry,
    })
  }

  const all = [...candidates, ...sanctorals].sort((a, b) => a.precedence - b.precedence)
  const [principal, ...others] = all
  return { date, principal, others }
}

function matchesDate(litDate: LiturgicalDate, date: Date, year: number): boolean {
  const resolved = resolveDate(litDate, year)
  return resolved !== undefined && isSameDay(resolved, date)
}
