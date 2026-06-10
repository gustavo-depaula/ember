// Mass-assembly state — mirrors the missa.pl/propers.pl globals. One
// MassState lives for one assembled Mass (both columns); per-column section
// hashes follow Perl's %winner/%winner2 pattern via columnsel().

import type { Directorium } from '../kalendar/directorium'
import type { DayResolution } from '../kalendar/precedence'
import type { DoSession, Sections } from '../references/resolve'
import type { TextTables } from './texts'

export type MassState = {
  day: DayResolution
  session: DoSession // area 'missa', Latin
  directorium: Directorium
  texts: TextTables
  lang1: string
  lang2: string
  only: boolean
  rubrics: boolean
  solemn: boolean
  propers: boolean
  votive: string
  column: number

  // Mutable copies — prefatio() and the suffragium logic append to rule.
  rule: string
  communerule: string

  // Column-2 (vernacular) section hashes (setsecondcol port).
  winner2: Sections
  commemoratio2: Sections
  commune2: Sections
  scriptura2: Sections

  // oratio() working state.
  cc: Map<string, string>
  ccind: number
  ctotalnum: number
  addconclusio: string
  oremusflag: string

  // specials() working state (per column).
  s: string[]
  t: string[]
  tind: number
  label: string
}

// Port of columnsel() for the missa case: pick the first-column hashes when
// the requested language is lang1.
export function columnsel(state: MassState, lang: string): boolean {
  return new RegExp(state.lang1, 'i').test(lang)
}

export function winnerOf(state: MassState, lang: string): Sections {
  return columnsel(state, lang) ? state.day.winnerSections : state.winner2
}

export function communeOf(state: MassState, lang: string): Sections {
  return columnsel(state, lang) ? state.day.communeSections : state.commune2
}

export function commemoratioOf(state: MassState, lang: string): Sections {
  return columnsel(state, lang) ? state.day.commemoratioSections : state.commemoratio2
}

export function chompd(s: string): string {
  return s.replace(/\s*$/, '')
}
