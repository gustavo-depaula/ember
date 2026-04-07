import type { RankEF, RankOF, ResolvedCelebration } from './calendar-types'
import type { LiturgicalCalendarForm, LiturgicalSeason } from './season'

// Lower index = higher precedence
const ofRankOrder: RankOF[] = ['solemnity', 'feast', 'memorial', 'optional_memorial']
const efRankOrder: RankEF[] = [
  'I_class',
  'II_class',
  'III_class',
  'IV_class',
  'commemoration',
  'vigil',
]

function rankIndex(rank: RankOF | RankEF, form: LiturgicalCalendarForm): number {
  const order = form === 'of' ? ofRankOrder : efRankOrder
  const idx = (order as string[]).indexOf(rank)
  return idx === -1 ? order.length : idx
}

export function compareRank(a: ResolvedCelebration, b: ResolvedCelebration): number {
  return rankIndex(a.rank, a.form) - rankIndex(b.rank, b.form)
}

export function sortByPrecedence(celebrations: ResolvedCelebration[]): ResolvedCelebration[] {
  return [...celebrations].sort(compareRank)
}

// Sundays of Advent, Lent, and Easter suppress everything below solemnity/I_class
const suppressingSeasons: LiturgicalSeason[] = ['advent', 'lent', 'easter', 'septuagesima']

export function applySundaySuppression(
  celebrations: ResolvedCelebration[],
  season: LiturgicalSeason,
  isSunday: boolean,
): ResolvedCelebration[] {
  if (!isSunday || !suppressingSeasons.includes(season)) return celebrations

  return celebrations.filter((c) => {
    if (c.form === 'of') return c.rank === 'solemnity'
    return c.rank === 'I_class'
  })
}
