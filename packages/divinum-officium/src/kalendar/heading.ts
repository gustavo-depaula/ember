// What a day of the Mass or the Office is headed with: its name, its rank,
// the days it commemorates, and, where the missal gives it more than one
// Mass, their names (missa.pl's setmissanumber).

import { officestring } from './officestring'
import type { DayResolution } from './precedence'
import { rankname } from './rankname'

export type DayName = { la: string; vernacular?: string }

export type DayHeading = {
  name: DayName
  /** In the words of the rubrics, Latin: 'II. classis', 'Semiduplex Dominica minor'. */
  rank: string
  commemorations: DayName[]
  /** The day's Masses, in order, where it has several: 'missa prima', 'forma brevior', or '1', '2'… */
  masses?: string[]
}

function titleOf(sections: Record<string, string> | undefined): string | undefined {
  const title = (sections?.Officium ?? sections?.Rank ?? '').replace(/;;[\s\S]*/, '').trim()
  return title || undefined
}

// A name the translation leaves in Latin, respelled ('Beatae Mariae' for
// 'Beatæ Mariæ'), is no translation.
const folded = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').replace(/æ/g, 'ae').replace(/œ/g, 'oe').toLowerCase()

async function nameOf(day: DayResolution, file: string, lang2?: string): Promise<DayName> {
  const fname = /\.txt$/.test(file) ? file : `${file}.txt`
  const la = titleOf(await officestring(day.state, 'Latin', fname)) ?? ''
  const vernacular = lang2 ? titleOf(await officestring(day.state, lang2, fname)) : undefined
  return vernacular && folded(vernacular) !== folded(la) ? { la, vernacular } : { la }
}

/** Port of missa.pl setmissanumber's reading of the Rule: the Masses a day may be said with. */
export function massesOf(rule: string): string[] | undefined {
  const m = /(?:multiple|celebranda aut\s+)(.*)/.exec(rule)
  if (!m) return undefined
  const object = m[1].trim()
  if (/[0-9]/.test(object)) {
    return Array.from({ length: Number(object.match(/[0-9]+/)?.[0]) }, (_, i) => String(i + 1))
  }
  return object.split(/\baut\s+/i).map((s) => s.trim())
}

export async function dayHeading(
  day: DayResolution,
  opts: { lang2?: string; hora?: string } = {},
): Promise<DayHeading> {
  const lang2 = opts.lang2 && opts.lang2 !== 'Latin' ? opts.lang2 : undefined
  // A day of several Masses reads the chosen one's file ('12-25m1.txt'); it
  // is named by the day's own.
  const name = await nameOf(day, day.winner.replace(/m\d(\.txt)?$/, '.txt'), lang2)
  const commemorations = await Promise.all(
    day.commemoentries.filter(Boolean).map((file) => nameOf(day, file, lang2)),
  )
  const masses = massesOf(day.winnerSections.Rule ?? '')
  return {
    name,
    rank: await rankname(day, opts.hora),
    commemorations: commemorations.filter((c) => c.la),
    ...(masses ? { masses } : {}),
  }
}
