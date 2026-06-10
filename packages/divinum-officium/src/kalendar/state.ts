// Mutable per-request state mirroring horascommon.pl's package globals, 1:1
// by name for traceability against the Perl. A KalendarState lives for one
// (date, version, hora) resolution, wraps the shared RubricContext (which the
// condition evaluator reads), and is mutated by occurrence()/precedence()
// exactly like the Perl mutates its globals.

import type { RubricContext } from '../conditions/context'
import type { DoSession, Sections } from '../references/resolve'
import type { Directorium } from './directorium'

export type KalendarState = {
  ctx: RubricContext
  session: DoSession
  directorium: Directorium

  // 1 when assembling an hour (horas.pl behavior), 0 for calendar listings.
  caller: number

  // occurrence/precedence outputs — names follow the Perl globals.
  winner: string
  rank: number
  commemoratio: string
  commemoratio1: string
  comrank: number
  commune: string
  communetype: string
  tname: string
  sname: string
  trankStr: string
  srankStr: string
  trank: string[]
  srank: string[]
  commemoentries: string[]
  tempora: Sections
  saint: Sections
  scriptura: string
  initia: boolean
  laudesonly: string
  transfervigil: string
  commemorated: string
  sanctoraloffice: boolean
  vespera: number
  cvespera: number
  tvesp: number
  svesp: number
  duplex: number
  rule: string
  communerule: string
  laudes: number | ''
  C10: string
  tomorrowname: [string, string, string]

  // Loaded winner/commemoratio/commune/scriptura section hashes (Latin).
  winnerSections: Sections
  commemoratioSections: Sections
  communeSections: Sections
  scripturaSections: Sections
}

export function num(value: string | number | undefined): number {
  if (value === undefined) return 0
  const n = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

export function createKalendarState(init: {
  ctx: RubricContext
  session: DoSession
  directorium: Directorium
  caller?: number
}): KalendarState {
  return {
    ctx: init.ctx,
    session: init.session,
    directorium: init.directorium,
    caller: init.caller ?? 0,
    winner: '',
    rank: 0,
    commemoratio: '',
    commemoratio1: '',
    comrank: 0,
    commune: '',
    communetype: '',
    tname: '',
    sname: '',
    trankStr: '',
    srankStr: '',
    trank: [],
    srank: [],
    commemoentries: [],
    tempora: {},
    saint: {},
    scriptura: '',
    initia: false,
    laudesonly: '',
    transfervigil: '',
    commemorated: '',
    sanctoraloffice: false,
    vespera: 0,
    cvespera: 0,
    tvesp: 0,
    svesp: 0,
    duplex: 0,
    rule: '',
    communerule: '',
    laudes: '',
    C10: 'C10',
    tomorrowname: ['', '', ''],
    winnerSections: {},
    commemoratioSections: {},
    communeSections: {},
    scripturaSections: {},
  }
}

// Port of subdirname(): version-specific data directory.
export function subdirname(subdir: string, version: string): string {
  if (/Cisterciensis/.test(version)) return `${subdir}Cist/`
  if (/^Monastic/.test(version)) return `${subdir}M/`
  if (/^Ordo Praedicatorum/.test(version)) return `${subdir}OP/`
  return `${subdir}/`
}
