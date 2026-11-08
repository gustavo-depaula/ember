// Port of horascommon.pl rankname(): the rank a day is printed with, in the
// words of its rubrics ('II. classis' after 1960, 'Semiduplex Dominica minor'
// before). The table is Latin; a translation names the few phrases it uses.

import { createSession, setupstring } from '../references/resolve'
import { getweek } from './date'
import type { DayResolution } from './precedence'

export async function rankname(day: DayResolution, hora = ''): Promise<string> {
  const { ctx } = day
  const { version, month, dayofweek } = ctx
  const dayOfMonth = ctx.day
  const rank = day.rank
  const winner = day.winner
  const session = createSession({
    loader: day.state.session.loader,
    ctx,
    area: 'horas',
    lang: 'Latin',
  })
  const t = (await setupstring(session, 'Psalterium/Comment')) ?? {}
  const latname = (day.winnerSections.Rank ?? '').replace(/;;[\s\S]*/, '').trim()
  const ranktable = (t.Festa ?? '').split('\n')
  const at = (table: string[], i: number) => table[Math.floor(i)] ?? ''
  const word = (key: string) => (t[key] ?? key).trim()
  const is196 = /196/.test(version)
  let name = ''

  if (
    !/(?:Die|Feria|Sabbato|^In Octava)/i.test(latname) &&
    (!/Pasc[07]-[1-6]/.test(winner) || dayofweek === 0)
  ) {
    let i = rank
    if (/19(?:55|6)/.test(version) && !/Pasc5-3/.test(winner) && /feria/i.test(latname)) i = 0
    if (/Sanctæ Fami/i.test(latname) && !is196) i = 4
    if (/Defunctorum/i.test(latname) && !is196) i = 3
    name = at(ranktable, i)

    if (/Vigilia Epi/i.test(latname)) {
      if (/cist/i.test(version)) {
        name = word('Vigilia') + (dayofweek ? word('privilegiata') : at(ranktable, 2))
      } else {
        name = at(ranktable, 2)
        if (!/Trident/.test(version)) name += ` ${word('Vigilia')} II. ${word('classis')}`
      }
    } else if (/^In Vigilia/i.test(latname) && rank <= 2.5) {
      name = /cist/i.test(version) ? word('Vigilia') : at(ranktable, 1)
    }

    if (/Dominica/i.test(latname) && !is196) {
      const sundaytable = (t.Dominicae ?? '').split('\n')
      const week = getweek(
        dayOfMonth,
        month,
        ctx.year,
        dayofweek === 6 && /(?:Vespera|Completorium)/.test(hora),
        false,
      )
      let s = 4 // 'Semiduplex Dominica minor'
      if (/Pasc[017]/.test(week) || /Pent01/.test(week)) s = 0
      else if (/Adv1|Quad[1-6]/.test(week)) s = 1
      else if (/Adv[2-4]|Quadp/.test(week)) s = 2
      else if (
        /Epi[1-6]|Pent2[23]/.test(week) &&
        dayofweek &&
        !(dayofweek === 6 && /(?:Vespera|Completorium)/.test(hora))
      )
        s = 3
      if (/Trident/.test(version) && /Quad[2-4]/.test(week)) s = 2
      name = at(sundaytable, s)
      if (/cist/i.test(version)) {
        if (/Pasc[07]i/.test(week)) name = at(ranktable, 6)
        if (/Pent01/.test(week)) name = at(ranktable, 5)
        name = name.replace(/Duplex /, 'Dominica ').replace(/Semiduplex /, '')
      }
    }
  } else if (/C10/.test(day.commune)) {
    name = at(ranktable, 1) // Simplex: Our Lady on Saturday
  } else if (is196 && /Pasc[07]-[1-6]/.test(winner)) {
    name = `${word('Dies Octavæ')} I. ${word('classis')}`
  } else if (is196 && /Pasc6-6/.test(winner)) {
    name = at(ranktable, 6)
  } else if (is196 && /Pasc5-3/.test(winner)) {
    name = at(ranktable, 5)
  } else if (is196 && month === 12 && dayOfMonth > 16 && dayOfMonth < 25 && dayofweek) {
    name = at(ranktable, 5)
  } else if (/cist/i.test(version) && /Pasc[07]-[1-6]/.test(winner)) {
    name = /7/.test(String(rank)) ? at(ranktable, 4) : at(ranktable, 1)
  } else if (!is196 && /Pasc[07]-[1-6]/.test(winner)) {
    name = /7/.test(String(rank))
      ? at(ranktable, 7)
      : /1955/.test(version)
        ? at(ranktable, 3)
        : at(ranktable, 2)
  } else if (/1955/.test(version) && /Pasc6-6/.test(winner)) {
    name = at(ranktable, 3)
  } else if (/Trident/.test(version) && /^In Octava/i.test(latname)) {
    name = at(ranktable, /cist/i.test(version) ? 2 : 3)
  } else if (
    /Trident/.test(version) &&
    /infra Octavam|post Octavam Asc|Vigilia Pent/i.test(latname)
  ) {
    name = at(ranktable, /cist/i.test(version) ? 1 : 2)
  } else if (
    /Divino/.test(version) &&
    /^In Octava|infra Octavam|post Octavam Asc|Vigilia Pent/i.test(latname)
  ) {
    const ordinis = word('ordinis')
    const major = !/Asc|Nat|Cord/i.test(latname)
    name = (() => {
      if (rank < 2) return at(ranktable, 1)
      if (rank < 3 && (major || /post|Joan/.test(latname))) return at(ranktable, 2)
      if (rank < 3) return `${at(ranktable, 2)} III. ${ordinis}`
      if (rank < 5 && major) return at(ranktable, 4)
      if (rank < 5) return `${at(ranktable, 4)} III. ${ordinis}`
      if (rank < 5.61) return `${at(ranktable, 2)} II. ${ordinis}`
      if (rank < 6.5) return `${at(ranktable, 4)} II. ${ordinis}`
      return `${at(ranktable, 2)} ${word('Vigilia')} I. ${word('classis')}`
    })()
  } else if (!is196 && /07-04/.test(winner) && dayofweek > 0) {
    name = /7/.test(String(rank)) ? 'Duplex I. classis' : 'Semiduplex'
  } else if (!is196) {
    const feriatable = (t.Feriae ?? '').split('\n')
    name = at(feriatable, rank === 1.15 ? 2 : rank)
  } else {
    name = at(ranktable, rank === 4.9 ? 5 : rank)
  }

  return name.replace(/\n/g, '').trim()
}
