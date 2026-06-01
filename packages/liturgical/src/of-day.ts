import { addDays, getDate, getMonth, isSameDay, subDays } from 'date-fns'
import type { LiturgicalDate, LiturgicalEntry, RankOF } from './calendar-types'
import { getOfLiturgicalPosition, type OfLiturgicalPosition } from './of-position'
import { resolveDate } from './resolve-date'
import { computeEaster, getFirstSundayOfAdvent } from './season'

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

const weekdayNames = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

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

// ── Temporal celebration (id + GIRM precedence) from the liturgical position ──

/**
 * Map a date to its principal tempore formulary id (canonical ember-extra id).
 * Mirrors the temporal cycle; movable solemnities override the season-week-weekday id.
 */
function temporalId(date: Date, position: OfLiturgicalPosition): string {
  const easter = computeEaster(date.getFullYear())
  if (isSameDay(date, addDays(easter, 56))) return 'tempore.solemnity.most-holy-trinity'
  if (isSameDay(date, addDays(easter, 60))) return 'tempore.solemnity.corpus-christi'
  if (isSameDay(date, addDays(easter, 68))) return 'tempore.solemnity.sacred-heart-of-jesus'
  const advent1 = getFirstSundayOfAdvent(date.getFullYear())
  if (isSameDay(date, subDays(advent1, 7))) return 'tempore.solemnity.christ-the-king'

  const wd = weekdayNames[date.getDay()]
  const season = position.season === 'ordinary' ? 'ordinary-time' : position.season
  if (position.week > 0) return `tempore.${season}.week-${position.week}.${wd}`
  return `tempore.${season}.${wd}`
}

/**
 * GIRM precedence of the temporal day. The temporal cycle ranges from the
 * Triduum down to ordinary ferias.
 */
function temporalPrecedence(date: Date, position: OfLiturgicalPosition): number {
  const { season, specialDay, dayOfWeek, week } = position
  const month = getMonth(date) + 1
  const day = getDate(date)

  // Movable solemnities of the Lord in Ordinary Time.
  if (
    specialDay === 'trinity-sunday' ||
    specialDay === 'corpus-christi' ||
    specialDay === 'sacred-heart'
  ) {
    return girm.solemnity
  }

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

  const temporal: OfCelebration = {
    id: temporalId(date, position),
    kind: 'temporal',
    precedence: temporalPrecedence(date, position),
    rank: undefined,
    name: undefined,
  }

  const sanctorals: OfCelebration[] = []
  for (const entry of entries) {
    if (!entry.of) continue
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

  const all = [temporal, ...sanctorals].sort((a, b) => a.precedence - b.precedence)
  const [principal, ...others] = all
  return { date, principal, others }
}

function matchesDate(litDate: LiturgicalDate, date: Date, year: number): boolean {
  const resolved = resolveDate(litDate, year)
  return resolved !== undefined && isSameDay(resolved, date)
}
