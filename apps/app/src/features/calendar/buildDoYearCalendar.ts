// Adapts the EF calendar rows from @ember/divinum-officium's buildDoYear onto
// the display calendar's DayCalendar/RankEF shape — the same Map every calendar
// consumer already expects (so the month grid + day detail are untouched). The
// EF counterpart of @ember/mass's buildOfYearCalendar.

import { buildDoYear, type DoCalendarDay, type DoLoader } from '@ember/divinum-officium'
import type { DayCalendar, RankEF, ResolvedCelebration } from '@ember/liturgical'
import { format } from 'date-fns'

export type DoYearCalendarOptions = {
  year: number
  loader: DoLoader
  version: string
}

export async function buildDoYearCalendar({
  year,
  loader,
  version,
}: DoYearCalendarOptions): Promise<Map<string, DayCalendar>> {
  const rows = await buildDoYear({ loader, year, version })
  const map = new Map<string, DayCalendar>()

  for (const row of rows) {
    const date = new Date(year, row.month - 1, row.day)
    const celebration = toCelebration(row, date)
    map.set(format(date, 'yyyy-MM-dd'), {
      date,
      celebrations: [celebration],
      principal: celebration,
    })
  }

  return map
}

function toCelebration(row: DoCalendarDay, date: Date): ResolvedCelebration {
  return {
    entry: {
      id: row.id,
      // Sanctoral names are the DO Latin titles; temporal names are left empty so
      // the UI resolves them from getLiturgicalDayName.
      name: row.kind === 'sanctoral' ? { la: row.name } : {},
      category: row.kind === 'sanctoral' ? 'other' : 'solemnity_temporal',
      description: {},
      holyDayOfObligation: row.holyDayOfObligation,
    },
    date,
    rank: normalizeEfRank(row.rank, row.rankText),
    form: 'ef',
  }
}

// DO numeric rank (Rubrics 1960 scale) → display class. I/II class are 6–7 / 5,
// III class the doubles (3–4), IV class the lesser feasts, simplices and
// commemorations below that. Vigils carry their own colour.
function normalizeEfRank(rank: number, rankText: string): RankEF {
  if (/vigil/i.test(rankText)) return 'vigil'
  if (rank >= 6) return 'I_class'
  if (rank >= 5) return 'II_class'
  if (rank >= 2) return 'III_class'
  if (rank >= 1.5) return 'IV_class'
  return 'commemoration'
}
