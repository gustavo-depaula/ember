// Build the Extraordinary Form *display* calendar for a whole year from the
// same authority the EF Mass/Office uses — resolveDay over the Divinum
// Officium data — so the celebration card and month grid show exactly what the
// EF Mass celebrates (transfers, octaves, vigils, commemorations) instead of a
// separately-curated, drift-prone list. Mirrors @ember/mass's buildOfYearCalendar.
//
// Pure DO: returns a neutral row shape (Latin name + DO numeric rank); the app
// maps it onto the display calendar's RankEF / DayCalendar types. Names are the
// DO Latin titles (the Kalendarium has no vernacular), which suits the EF; the
// UI fills temporal names from getLiturgicalDayName.

import type { DoLoader } from '../loader'
import { createDirectorium } from './directorium'
import { resolveDay } from './precedence'
import { num } from './state'

export type DoCalendarDay = {
  month: number
  day: number
  // Stable kind-prefixed id derived from the winner file ('ef/sancti/01-25r').
  id: string
  // Winner office file in Perl form ('Sancti/01-25r.txt', 'Tempora/Adv2-0.txt').
  winner: string
  kind: 'sanctoral' | 'temporal'
  // Latin celebration name for sanctoral days; empty for temporal days (the UI
  // resolves those from getLiturgicalDayName).
  name: string
  // DO numeric rank and the rank-class text (e.g. 'Duplex I classis'), so the
  // consumer can normalize to a display rank.
  rank: number
  rankText: string
  holyDayOfObligation: boolean
}

export type DoYearOptions = {
  loader: DoLoader
  year: number
  version: string
}

// Universal EF (1962) Holy Days of Obligation. Sanctoral feasts keyed by the
// winner's month-day; the two movable temporal HDO (Ascension, Corpus Christi)
// matched by their Latin name. Jurisdiction-specific transfers/abrogations are a
// later refinement, mirroring the OF side.
const efHdoSanctoralDates = new Set([
  '01-01', // Octave of the Nativity (Circumcision)
  '01-06', // Epiphany
  '03-19', // St Joseph
  '06-29', // Ss Peter and Paul
  '08-15', // Assumption
  '11-01', // All Saints
  '12-08', // Immaculate Conception
  '12-25', // Nativity
])

function isEfHolyDay(winner: string, latinName: string): boolean {
  const m = /^Sancti[^/]*\/(\d\d-\d\d)/.exec(winner)
  if (m && efHdoSanctoralDates.has(m[1])) return true
  return /Ascensione|Corporis Christi/i.test(latinName)
}

function efId(winner: string): string {
  return `ef/${winner.replace(/\.txt$/, '').toLowerCase()}`
}

// A temporal day is surfaced only when it is privileged — Sundays of Advent,
// Lent, Passiontide and Eastertide plus the great feasts of the Lord (Ascension,
// Pentecost, Trinity, Corpus Christi, Sacred Heart, Christ the King) all carry a
// DO rank of 6 or more. Ordinary green Sundays (rank 5) and ferias are dropped,
// just as the OF display drops Sundays in Ordinary Time.
const notableTemporalRank = 6

export async function buildDoYear({
  loader,
  year,
  version,
}: DoYearOptions): Promise<DoCalendarDay[]> {
  const directorium = await createDirectorium(loader)
  const days: DoCalendarDay[] = []

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(year, month, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const r = await resolveDay({
        loader,
        directorium,
        day,
        month,
        year,
        version,
        hora: '',
        missa: true,
        sections: false,
      })
      const s = r.state
      const sanctoralName = (s.srank[0] ?? '').trim()
      const sanctoralRankText = (s.srank[1] ?? '').trim()
      const winnerIsSancti = /^Sancti/i.test(r.winner)

      let row: Omit<DoCalendarDay, 'month' | 'day' | 'id'> | undefined

      if (s.sanctoraloffice && winnerIsSancti) {
        // A saint (or a feast kept in the Sancti folder, e.g. the Nativity) is
        // the office of the day.
        row = {
          winner: r.winner,
          kind: 'sanctoral',
          name: sanctoralName,
          rank: r.rank,
          rankText: sanctoralRankText,
          holyDayOfObligation: isEfHolyDay(r.winner, sanctoralName),
        }
      } else if (r.rank >= notableTemporalRank) {
        // A privileged temporal day (Sunday of a major season, or a feast of the
        // Lord). The display name comes from getLiturgicalDayName.
        row = {
          winner: r.winner,
          kind: 'temporal',
          name: '',
          rank: r.rank,
          rankText: (s.trank[1] ?? '').trim(),
          holyDayOfObligation: isEfHolyDay(r.winner, (s.trank[0] ?? '').trim()),
        }
      } else if (sanctoralName) {
        // The temporal feria/ordinary Sunday wins, but a saint is commemorated —
        // still surface the saint so the calendar reads as a saints' calendar.
        const winner = s.sname || r.winner
        row = {
          winner,
          kind: 'sanctoral',
          name: sanctoralName,
          rank: num(s.srank[2]),
          rankText: sanctoralRankText,
          holyDayOfObligation: isEfHolyDay(winner, sanctoralName),
        }
      }

      if (row) days.push({ ...row, month, day, id: efId(row.winner) })
    }
  }

  return days
}
