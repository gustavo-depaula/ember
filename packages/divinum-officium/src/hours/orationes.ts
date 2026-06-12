// Port of specials/orationes.pl::oratio() — the minor-hours (Tertia / Sexta /
// Nona, plus the Triduum path for Prima/Compline) subset. The Lauds/Vespers
// commemoration machinery (SET COMMEMORATIONS onward) comes with M6.

import { officestring, sessionWithLang } from '../kalendar/officestring'
import { subdirname } from '../kalendar/state'
import { type Sections, setupstring } from '../references/resolve'
import { getproprium, replaceNdot, setcomment, setup } from './proprium'
import { columnsel, communeOf, type HoursState, winnerOf } from './state'

export async function oratio(
  state: HoursState,
  lang: string,
  params: { special?: boolean } = {},
): Promise<void> {
  const ctx = state.day.ctx
  const { version, dayofweek } = ctx
  const hora = state.hora
  state.collectcount = 1

  if (/^(?:Laudes|Vespera)$/.test(hora) && state.day.rank < 7) {
    throw new Error('oratio commemorations at Lauds/Vespers are not ported yet — M6')
  }

  let wSections: Sections = winnerOf(state, lang)
  const ind = hora === 'Vespera' ? state.day.vespera : 2

  await setcomment(
    state,
    state.label,
    params.special ? 'Preces' : 'Source',
    params.special ? 2 : (/Sancti/.test(state.day.winner) ? 1 : 0) + 2,
    lang,
  )

  let rule = state.rule
  if (
    /Epi1/i.test(ctx.dayname[0]) &&
    /Infra octavam Epiphaniæ Domini/i.test(rule) &&
    /1955|196/.test(version)
  ) {
    rule += 'Oratio Dominica\n'
  }

  if (
    (/Oratio Dominica/i.test(rule) &&
      (state.day.winnerSections.Oratio === undefined || hora === 'Vespera')) ||
    (/Quattuor/i.test(state.day.winnerSections.Rank ?? '') &&
      !/Pasc7/i.test(ctx.dayname[0]) &&
      !/196|cist/i.test(version) &&
      hora === 'Vespera')
  ) {
    let name = `${ctx.dayname[0]}-0`
    if (/(?:Epi1|Nat)/i.test(name) && version !== 'Monastic - 1930') name = 'Epi1-0a'
    wSections =
      (await setupstring(
        sessionWithLang(state.session, lang),
        `${subdirname('Tempora', version)}${name}`,
      )) ?? {}
  }

  let w: string | undefined
  if (dayofweek > 0 && state.day.winnerSections.OratioW !== undefined && state.day.rank < 5) {
    w = wSections.OratioW
  } else {
    w = wSections.Oratio
  }

  if (!w || wSections[`Oratio ${ind}`] !== undefined) {
    w = wSections[`Oratio ${ind}`]
  }

  if (!w) {
    const c = communeOf(state, lang)
    let i = ind
    w = c[`Oratio ${i}`]
    if (!w) {
      i = 4 - i
      w = c[`Oratio ${i}`]
    }
    if (!w) w = c.Oratio
  }

  if (!w) {
    let i = ind
    if (i === 2) {
      i = 3
      w = wSections[`Oratio ${i}`]
    } else {
      w = wSections['Oratio 2']
    }
    if (!w) {
      i = 4 - i
      w = wSections[`Oratio ${i}`]
    }
  }

  if (!w && state.day.commune) {
    const com = communeOf(state, lang)
    w = com.Oratio ?? com[`Oratio ${ind}`]
  }

  if (/Tempora/.test(state.day.winner) && !w) {
    const name = `${ctx.dayname[0]}-0`
    const sunday =
      (await officestring(state.day.state, lang, `${subdirname('Tempora', version)}${name}.txt`)) ??
      {}
    w = sunday.Oratio ?? sunday['Oratio 2']
  }

  if (w && /N\./.test(w)) {
    const name = wSections.Name
    if (name) w = replaceNdot(state, w, lang, name)
  }

  // Delete an appended commemoratio at the minor hours.
  if (w) {
    const comm = await state.texts.translate('Commemoratio', lang)
    const regex = new RegExp(`([\\s\\S]*?)!(${comm}|Commemoratio)`, 'i')
    const m = regex.exec(w)
    if (m && !/(laudes|vespera)/i.test(hora)) {
      w = m[1].replace(/\s*_\s*/, '')
    }
  }
  if (!w) w = 'Oratio missing'

  if (!/Limit.*?Oratio/i.test(rule)) {
    if (/Monastic/.test(version) && !/C12/.test(state.day.winner)) {
      state.s.push('$Kyrie', '$pater secreto', '_')
    }

    if (state.priest) {
      state.s.push('&Dominus_vobiscum')
    } else if (!state.precesferiales) {
      state.s.push('&Dominus_vobiscum')
    } else {
      const text = (await state.texts.prayer('Dominus', lang)).split('\n')
      state.s.push(text[4] ?? '')
      state.precesferiales = false
    }

    const oremus = await state.texts.translate('Oremus', lang)
    state.s.push(`v. ${oremus}`)
  }

  // Ensure the large red initial.
  if (!/^[$&#/!{]/.test(w)) {
    w = w.replace(/^(?:v\. )?/, 'v. ')
  }
  state.s.push(w)
}
