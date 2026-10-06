import type {
  DayCalendar,
  LiturgicalCategory,
  LocalizedText,
  RankOF,
  ResolvedCelebration,
} from '@ember/liturgical'
import type { Localized, MissalCalendar } from '../types'
import { type Celebration, type ResolveOptions, resolveOfDay } from './resolve'
import { addDays } from './temporal'

// Holy days of obligation of the universal Church (canon 1246 §1). Law, not
// data; a bishops' conference may suppress or move some of them.
const holyDayIds = new Set([
  'sanctorale.03-19',
  'sanctorale.06-29',
  'sanctorale.08-15',
  'sanctorale.11-01',
  'sanctorale.12-08',
])
const holyDayKeys = new Set([
  'christmas',
  'mary-mother-of-god',
  'epiphany',
  'easter-sunday',
  'ascension',
  'pentecost',
  'corpus-christi',
])

export function isOfHolyDay(id: string, key: string | undefined): boolean {
  return holyDayIds.has(id) || (key !== undefined && holyDayKeys.has(key))
}

// The temporal days a calendar names as "the celebration of the day". Every
// day has a Mass, but an ordinary Sunday or weekday is told by the season, not
// by a celebration card.
const namedKeys = new Set([
  'christmas',
  'holy-family',
  'mary-mother-of-god',
  'epiphany',
  'baptism-of-the-lord',
  'ash-wednesday',
  'palm-sunday',
  'holy-thursday',
  'good-friday',
  'holy-saturday',
  'easter-sunday',
  'ascension',
  'pentecost',
  'trinity-sunday',
  'corpus-christi',
  'sacred-heart',
  'christ-the-king',
])

export function isNamedDay(key: string | undefined): boolean {
  return key !== undefined && namedKeys.has(key)
}

export interface OfYearOptions extends ResolveOptions {
  year: number
  calendar: MissalCalendar
}

const isoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/**
 * The display calendar for a year, from the same `resolveOfDay` the Mass uses,
 * so a celebration card and the Mass can never disagree. Only named
 * celebrations are listed: every saint's day kept that year, and the temporal
 * solemnities and feasts.
 */
export function buildOfYearCalendar({
  year,
  calendar,
  ...options
}: OfYearOptions): Map<string, DayCalendar> {
  const days = new Map<string, DayCalendar>()
  for (let date = new Date(year, 0, 1, 12); date.getFullYear() === year; date = addDays(date, 1)) {
    const day = resolveOfDay(date, calendar, options)
    const celebrations = day.celebrations
      .filter((c) => c.kind === 'sanctoral' || isNamedDay(day.key))
      .map((c) => toResolved(c, date, day.key))
    if (celebrations.length === 0) continue
    days.set(isoDay(date), { date, celebrations, principal: celebrations[0] })
  }
  return days
}

function toResolved(c: Celebration, date: Date, key: string | undefined): ResolvedCelebration {
  const category: LiturgicalCategory = c.kind === 'tempore' ? 'solemnity_temporal' : 'other'
  return {
    entry: {
      id: c.masses[0]?.formulary ?? c.id,
      name: localized(c.title),
      category,
      description: {},
      holyDayOfObligation: isOfHolyDay(c.id, c.kind === 'tempore' ? key : undefined),
    },
    date,
    rank: displayRank(c),
    form: 'of',
  }
}

// The display calendar has four ranks; a named Sunday or weekday (Palm Sunday,
// Ash Wednesday) is shown at the weight of what it outranks.
function displayRank(c: Celebration): RankOF {
  if (c.rank === 'optional-memorial') return 'optional_memorial'
  if (c.rank === 'solemnity' || c.rank === 'feast' || c.rank === 'memorial') return c.rank
  return c.precedence <= 4 ? 'solemnity' : 'feast'
}

function localized(title: Localized | undefined): LocalizedText {
  const any = title?.['*']
  return {
    'en-US': title?.['en-US'] ?? any,
    la: title?.la ?? any,
    'pt-BR': title?.['pt-BR'] ?? any,
  }
}
