// Port of horascommon.pl::precedence() — the day-resolution entry point.
// Computes the day's winner office, rank, commemorations, scripture source,
// commune, rules, and Lauds scheme for a (date, version, hora). Vespers and
// Compline route through concurrence() against the following day's office.

import { defaultContext, type RubricContext } from '../conditions/context'
import type { DoLoader } from '../loader'
import { createSession, type Sections } from '../references/resolve'
import { concurrence } from './concurrence'
import { dayOfWeek, getweek } from './date'
import { createDirectorium } from './directorium'
import { emberday, occurrence } from './occurrence'
import { officestring } from './officestring'
import { createKalendarState, type KalendarState } from './state'

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
}): Promise<DayResolution> {
  const hora = opts.hora ?? 'Laudes'
  const lang1 = opts.lang1 ?? 'Latin'
  const missa = opts.missa ?? false
  const { day, month, year, version } = opts

  const ctx = defaultContext({
    version,
    day,
    month,
    year,
    hora,
    missa,
    dayofweek: dayOfWeek(day, month, year),
    dayname: [getweek(day, month, year, false, missa), '', ''],
  })
  const session = createSession({
    loader: opts.loader,
    ctx,
    area: missa ? 'missa' : 'horas',
    lang: 'Latin',
  })
  const directorium = await createDirectorium(opts.loader)
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

  // The app has no votive offices (votive is always 'Hodie'), so the Perl's
  // `$votive !~ /C12/` guard is always true.
  if (/vespera|completorium/i.test(hora)) {
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

  // Votive offices are out of scope for v1.

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
