// Port of horascommon.pl::precedence() — the day-resolution entry point.
// Computes the day's winner office, rank, commemorations, scripture source,
// commune, rules, and Lauds scheme for a (date, version, hora). Vespers and
// Compline route through concurrence() against the following day's office.

import { defaultContext, type RubricContext } from '../conditions/context'
import type { DoLoader } from '../loader'
import { createSession, type Sections } from '../references/resolve'
import { concurrence } from './concurrence'
import { dayOfWeek, getweek } from './date'
import { createDirectorium, type Directorium } from './directorium'
import { emberday, occurrence } from './occurrence'
import { officestring } from './officestring'
import { createKalendarState, type KalendarState, num, subdirname } from './state'

export type DayResolution = {
  // File ids in Perl form ('Sancti/01-25.txt', 'TemporaM/Pent02-3.txt').
  winner: string
  rank: number
  dayname: [string, string, string]
  commemoratio: string
  commemoratio1: string
  comrank: number
  commemoentries: string[]
  commune: string
  communetype: string
  communerule: string
  scriptura: string
  rule: string
  duplex: number
  laudes: number | ''
  laudesonly: string
  transfervigil: string
  commemorated: string
  initia: boolean
  vespera: number
  cvespera: number
  dayofweek: number
  monthday: string
  winnerSections: Sections
  commemoratioSections: Sections
  communeSections: Sections
  scripturaSections: Sections
  ctx: RubricContext
  state: KalendarState
}

export async function resolveDay(opts: {
  loader: DoLoader
  day: number
  month: number
  year: number
  version: string
  hora?: string
  lang1?: string
  lang2?: string
  missa?: boolean
  caller?: number
  votive?: string
  // Reuse a directorium across many resolutions (e.g. a whole year) instead of
  // rebuilding the transfer/version tables on every call.
  directorium?: Directorium
  // Calendar mode: resolve precedence only (winner, rank, names, commemorations)
  // and skip the officestring text assembly. Section trees come back empty.
  sections?: boolean
}): Promise<DayResolution> {
  const hora = opts.hora ?? 'Laudes'
  const lang1 = opts.lang1 ?? 'Latin'
  const missa = opts.missa ?? false
  const votive = opts.votive ?? 'Hodie'
  const { day, month, year, version } = opts

  const ctx = defaultContext({
    version,
    day,
    month,
    year,
    hora,
    missa,
    votive,
    dayofweek: dayOfWeek(day, month, year),
    dayname: [getweek(day, month, year, false, missa), '', ''],
  })
  const session = createSession({
    loader: opts.loader,
    ctx,
    area: missa ? 'missa' : 'horas',
    lang: 'Latin',
  })
  const directorium = opts.directorium ?? (await createDirectorium(opts.loader))
  const state = createKalendarState({ ctx, session, directorium, caller: opts.caller ?? 0 })

  state.C10 += /Adv/i.test(ctx.dayname[0])
    ? 'a'
    : month === 1 || (month === 2 && day === 1)
      ? 'b'
      : /(Epi|Quad)/i.test(ctx.dayname[0])
        ? 'c'
        : /Pasc/i.test(ctx.dayname[0])
          ? 'Pasc'
          : ''

  // The Little Office of the BVM (C12) has no concurrence — its Vespers and
  // Compline are resolved by occurrence like any other hour.
  if (/vespera|completorium/i.test(hora) && !/C12/i.test(votive)) {
    await concurrence(state, opts.lang2)
  } else {
    await occurrence(state, false)
  }

  if (ctx.dayname[1] && !/duplex/i.test(ctx.dayname[1])) {
    state.duplex = 1
  } else if (/semiduplex/i.test(ctx.dayname[1])) {
    state.duplex = 2
  } else {
    state.duplex = 3
  }
  state.rule = ''
  state.communerule = ''

  // Calendar mode stops here: occurrence/concurrence have already fixed the
  // winner, rank, day names, and commemorations — everything the display
  // calendar needs — so skip the (expensive) officestring text assembly below.
  if (opts.sections === false) {
    ctx.winner = state.winner
    ctx.winnerRule = state.rule
    return toResolution(state, ctx)
  }

  if (state.winner) {
    const flag = /tempora/i.test(state.winner) && state.vespera === 1
    state.winnerSections = (await officestring(state, lang1, state.winner, flag)) ?? {}

    // Feriae where the octave of the Epiphany used to be: Mass is of the
    // Epiphany before the Sunday, of the I. Sunday after Epiphany afterwards.
    const epiDay = /01-([0-9]+)/.exec(state.winner)
    if (
      /19(?:55|6)/.test(version) &&
      missa &&
      /Epi1/i.test(ctx.dayname[0]) &&
      epiDay &&
      Number(epiDay[1]) < 13 &&
      ctx.dayofweek !== 0
    ) {
      state.communetype = 'ex'
      state.commune = 'Tempora/Epi1-0a.txt'
    }
    state.rule = state.winnerSections.Rule ?? ''

    if (/12-28/.test(state.winner) && ctx.dayofweek === 0) {
      state.rule = state.rule.replace(/no Te Deum/, '')
    }
  }
  ctx.winner = state.winner
  ctx.winnerRule = state.rule

  if (
    !/196/.test(version) &&
    state.winnerSections['Oratio Vigilia'] !== undefined &&
    ctx.dayofweek !== 0 &&
    /Laudes/i.test(hora)
  ) {
    state.transfervigil = state.winner
  }

  // Restrict/add commemorations.
  if (/Sancti/.test(state.winner) && /Tempora none/i.test(state.rule)) {
    state.commemoratio = ''
    state.scriptura = ''
    ctx.dayname[2] = ''
    state.commemoentries = []
  }

  if (
    !/1960/.test(version) &&
    /Vespera/.test(hora) &&
    month === 1 &&
    day === 3 &&
    ctx.dayofweek === 6
  ) {
    state.commemoratio1 = 'Sancti/01-04.txt'
  }

  if (
    /1960/.test(version) &&
    /No Sunday commemoratio/i.test(state.winnerSections.Rule ?? '') &&
    ctx.dayofweek === 0
  ) {
    state.commemoratio = ''
    state.commemoratio1 = ''
    ctx.dayname[2] = ''
    state.commemoentries = []
  }

  if (state.commemoratio) {
    const flag = /tempora/i.test(state.commemoratio) && state.tvesp === 1
    state.commemoratioSections = (await officestring(state, lang1, state.commemoratio, flag)) ?? {}

    if (
      /1960/.test(version) &&
      /Festum Domini/.test(state.winnerSections.Rule ?? '') &&
      /Festum Domini/i.test(state.commemoratioSections.Rule ?? '')
    ) {
      state.commemoratio = ''
      state.commemoratioSections = {}
      ctx.dayname[2] = ''
      state.commemoentries = []
    }

    if (/196/.test(version) && /06-28r?/i.test(state.commemoratio) && ctx.dayofweek === 0) {
      state.commemoratio = ''
      state.commemoratioSections = {}
      ctx.dayname[2] = ''
      state.commemoentries = []
    }

    if (
      state.vespera === state.svesp &&
      state.vespera === 1 &&
      state.cvespera === 3 &&
      /No second Vespera/i.test(state.commemoratioSections.Rule ?? '')
    ) {
      state.commemoratio = ''
      state.commemoratioSections = {}
      ctx.dayname[2] = ''
      state.commemoentries = []
    }
  }

  // Only short readings in monastic summer.
  if (
    /monastic/i.test(version) &&
    /(?:Pasc|Pent)/.test(state.scriptura) &&
    month < 11 &&
    !/Vigilia/.test(ctx.dayname[1]) &&
    ctx.dayofweek > 0
  ) {
    state.scriptura = ''
  }

  if (state.scriptura) {
    state.scripturaSections = (await officestring(state, lang1, state.scriptura)) ?? {}
    if (!ctx.dayname[2] && !/Nat0[12345]/.test(state.scriptura)) {
      ctx.dayname[2] =
        `Scriptura: ${state.scripturaSections.Rank ?? ''}  ${state.scriptura}`.replace(
          /;;[\s\S]*/,
          '',
        )
    }
  }

  if (emberday(state)) {
    state.transfervigil = ''
  }

  if (state.commune) {
    state.communeSections = (await officestring(state, lang1, state.commune)) ?? {}

    if (state.communeSections.Responsory7c !== undefined) {
      const a = (state.communeSections.Responsory7 ?? '').split('\n')
      const b = (state.scripturaSections.Responsory1 ?? '').split('\n')
      if (b[0] !== undefined && new RegExp(b[0], 'i').test(a[0] ?? '')) {
        state.communeSections.Responsory7 = state.communeSections.Responsory7c
      }
    }

    if (/C10/.test(state.commune)) {
      state.rule += `ex ${state.C10}`
      state.rule = state.rule.replace(/Oratio Dominica/gi, '')
      state.winnerSections.Rank = `Sanctæ Mariæ Sabbato;;Simplex;;1.3;;ex ${state.C10}`
      ctx.winnerRule = state.rule
    }

    if (
      /;;ex\s/.test(state.winnerSections.Rank ?? '') ||
      (/Trident/i.test(version) &&
        /;;(ex|vide)/i.test(state.winnerSections.Rank ?? '') &&
        state.duplex > 1)
    ) {
      state.communerule = state.communeSections.Rule ?? ''
    }
  }

  // Port of the votive-office redirection (horascommon.pl). When the user
  // asks for a votive office (votive !== 'Hodie'), the whole day is redirected
  // to the votive Commune office (C1–C12, or Votiva/V4·V6), with the day's
  // sanctoral winner demoted to a commemoration.
  if (votive !== 'Hodie') {
    let vtv = votive
    if (/C12/i.test(vtv)) {
      // C12: Little Office BVM — seasonal text variants.
      if (!/cist/i.test(version)) {
        if (
          (month === 12 && ((day === 24 && /Vespera|Completorium/.test(hora)) || day > 24)) ||
          month === 1 ||
          (month === 2 && day < 3)
        ) {
          vtv = 'C12N'
        } else if (
          /adv/i.test(ctx.dayname[0]) ||
          (/03-25/.test(state.winner) && !/Praedicatorum/.test(version))
        ) {
          vtv = 'C12A'
        } else if (/(Quadp|Quad)/i.test(ctx.dayname[0]) && !/Praedicatorum/.test(version)) {
          vtv = 'C12Q'
        }
      }
      state.commemoratio = ''
      state.commemoratio1 = ''
      state.cwinner = ''
      state.scriptura = ''
      state.commune = ''
      state.commemoratioSections = {}
      state.cwinnerSections = {}
      state.scripturaSections = {}
      state.communeSections = {}
      state.commemoentries = []
      state.ccommemoentries = []
    } else {
      if (/Pasc/.test(ctx.dayname[0]) && /C[1-3](?!\d)/.test(vtv)) vtv += 'p' // Commune T.P.
      vtv = vtv.replace(/^V/, 'Votiva/V') // votive offices live in a subdirectory
      if (/Tempora/.test(state.commemoratio)) {
        // Keep the 9th lesson from the Sunday or Feria (typically in Lent).
        state.commemoentries.push(state.winner)
      } else {
        // The day's sanctoral winner becomes the first commemoration.
        state.commemoentries.unshift(state.winner)
        state.commemoratio = state.winner
        state.commemoratioSections = { ...state.winnerSections }
      }
    }

    state.winner = `${subdirname('Commune', version)}${vtv}.txt`
    state.winnerSections = (await officestring(state, lang1, state.winner)) ?? {}
    state.rule = state.winnerSections.Rule ?? ''
    if (state.winnerSections.Rank) {
      const vrank = state.winnerSections.Rank.split(';;')
      state.rank = num(vrank[2])
      state.duplex = !/duplex/i.test(vrank[1] ?? '')
        ? 1
        : /semiduplex/i.test(vrank[1] ?? '')
          ? 2
          : 3
    }

    if (/C12/i.test(vtv)) {
      state.commune = `${subdirname('Commune', version)}C11.txt`
      state.communetype = 'ex'
      state.communeSections = (await officestring(state, lang1, state.commune)) ?? {}
    } else {
      if (/^Trident|^Divino/i.test(version) && !/Votiva/.test(vtv)) {
        // Votive Matins is fully sanctoral (Duplex, 3 nocturns) under these.
        state.rule += '\n9 lectiones'
        state.rank = 4
        state.duplex = 3
      }
      // Self-reference the commune so getproprium resolves the votive office.
      state.commune = state.winner
      state.communetype = 'ex'
      state.communeSections = { ...state.winnerSections }
    }
    ctx.dayname[1] = state.winnerSections.Officium ?? ''
    ctx.dayname[2] = ''
  }

  // Lauds scheme: penitential days have Lauds II.
  if (/Trident/i.test(version)) {
    state.laudes =
      /Quad/i.test(ctx.dayname[0]) && ctx.dayofweek === 0 && /Tempora/i.test(state.winner) ? 2 : ''
  } else {
    state.laudes =
      (((/Adv/i.test(ctx.dayname[0]) && ctx.dayofweek !== 0) ||
        /Quad/i.test(ctx.dayname[0]) ||
        (emberday(state) && !/Pasc/.test(ctx.dayname[0]))) &&
        /tempora/i.test(state.winner) &&
        !/(Beatæ|Sanctæ) Mariæ/i.test(state.winnerSections.Rank ?? '')) ||
      /Laudes 2/i.test(state.rule) ||
      (/vigil/i.test(state.winnerSections.Rank ?? '') &&
        !/19(?:55|60)/.test(version) &&
        !/Psalmi Dominica/.test(state.rule))
        ? 2
        : 1
  }

  return toResolution(state, ctx)
}

function toResolution(state: KalendarState, ctx: RubricContext): DayResolution {
  return {
    winner: state.winner,
    rank: state.rank,
    dayname: ctx.dayname,
    commemoratio: state.commemoratio,
    commemoratio1: state.commemoratio1,
    comrank: state.comrank,
    commemoentries: state.commemoentries,
    commune: state.commune,
    communetype: state.communetype,
    communerule: state.communerule,
    scriptura: state.scriptura,
    rule: state.rule,
    duplex: state.duplex,
    laudes: state.laudes,
    laudesonly: state.laudesonly,
    transfervigil: state.transfervigil,
    commemorated: state.commemorated,
    initia: state.initia,
    vespera: state.vespera,
    cvespera: state.cvespera,
    dayofweek: ctx.dayofweek,
    monthday: ctx.monthday,
    winnerSections: state.winnerSections,
    commemoratioSections: state.commemoratioSections,
    communeSections: state.communeSections,
    scripturaSections: state.scripturaSections,
    ctx,
    state,
  }
}
