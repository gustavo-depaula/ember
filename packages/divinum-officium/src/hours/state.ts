// Hours-assembly state — mirrors horas.pl's globals. One HoursState lives for
// one assembled hour (one column at a time, like the Perl's per-column
// specials() runs). The accumulated script is state.s (handlers push into it
// directly, exactly like the Perl's `our @s`).

import type { DayResolution } from '../kalendar/precedence'
import type { TextTables } from '../mass/texts'
import type { DoSession, Sections } from '../references/resolve'

export type HoursState = {
  day: DayResolution
  session: DoSession // area 'horas', Latin
  texts: TextTables
  lang1: string
  lang2: string
  column: number
  hora: string
  // App defaults: not a priest, no votive office.
  priest: boolean
  votive: string

  // Mutable copies of the day's rules (handlers append/strip).
  rule: string
  communerule: string

  // Column-2 (vernacular) section hashes.
  winner2: Sections
  commemoratio2: Sections
  commune2: Sections
  scriptura2: Sections

  // Walker state.
  s: string[]
  label: string
  skipflag: boolean
  litaniaflag: boolean
  specialflag: boolean
  precesferiales: boolean
  // Perl `state` counter in getpreces; lives for one assembled hour (both
  // columns), initialized on first use.
  precdomfer?: number
  // Perl's $octavam accumulator (getrefs octave dedupe) — request-scoped.
  octavam?: string
  // Perl's $ltype1960 global, set by each lectio() call.
  ltype1960?: number
  psalmnum1: number
  psalmnum2: number
  collectcount: number
  octavcount: number
}

export function columnsel(state: HoursState, lang: string): boolean {
  return new RegExp(state.lang1, 'i').test(lang)
}

export function winnerOf(state: HoursState, lang: string): Sections {
  return columnsel(state, lang) ? state.day.winnerSections : state.winner2
}

export function communeOf(state: HoursState, lang: string): Sections {
  return columnsel(state, lang) ? state.day.communeSections : state.commune2
}

export function commemoratioOf(state: HoursState, lang: string): Sections {
  return columnsel(state, lang) ? state.day.commemoratioSections : state.commemoratio2
}

export function chompd(s: string | undefined): string {
  return (s ?? '').replace(/\s*$/, '')
}
