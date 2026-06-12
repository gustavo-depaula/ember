// Port of specials/hymni.pl for the minor hours: gethymn (Prima/Minor
// Psalterium hymns + doxology substitution). hymnusmajor/hymnusmatutinum come
// with M6/M7.

import { gettempora, postprocessVr } from './helpers'
import { hymnusmatutinum } from './matins'
import { getantvers, getproprium, setup } from './proprium'
import { columnsel, type HoursState, winnerOf } from './state'

// Port of doxology().
async function doxology(state: HoursState, lang: string): Promise<[string, string]> {
  const ctx = state.day.ctx
  const { version, day, month, dayofweek } = ctx
  let dox = ''
  let dname = ''

  if (state.day.winnerSections.Doxology !== undefined) {
    dox = winnerOf(state, lang).Doxology ?? ''
    dname = 'Special'
  } else {
    const ruleDox = /Doxology=([a-z]+)/i.exec(state.rule)
    const comDox = /Doxology=([a-z]+)/i.exec(state.day.commemoratioSections.Rule ?? '')
    if (ruleDox) {
      dname = ruleDox[1]
    } else if (
      (/Trident/i.test(version) || !/Adventus/.test(state.day.winnerSections.Rank ?? '')) &&
      comDox
    ) {
      dname = comDox[1]
    } else if (
      (month === 8 && day > 15 && day < 23 && !/1955|1963/i.test(version)) ||
      (!/1570|1617|1963|altovadensis/i.test(version) &&
        month === 12 &&
        day > 8 &&
        day < 16 &&
        dayofweek > 0)
    ) {
      dname = 'Nat'
    } else {
      dname = gettempora(state, 'Doxology')
    }

    if (dname) {
      const w = await setup(state, lang, 'Psalterium/Doxologies')
      if (/Monastic|1570|Praedicatorum/i.test(version) && w[`${dname}T`]) dname += 'T'
      dox = w[dname] ?? ''
    }
  }
  return [dox, dname]
}

// Port of hymnusmajor (Lauds/Vespers hymn selection).
async function hymnusmajor(state: HoursState, lang: string): Promise<[string, string]> {
  const ctx = state.day.ctx
  const { version, day, month, year } = ctx
  const hora = state.hora
  const w = state.day.winnerSections
  const directorium = state.day.state.directorium
  let hymn = ''
  let name = 'Hymnus'
  if (hora === 'Vespera') name += checkmtv(version, w)
  if (
    w[`${name} Vespera`] === undefined &&
    state.day.vespera === 3 &&
    w[`${name} Vespera 3`] === undefined &&
    ((state.day.vespera === 3 && w['Hymnus Vespera 3'] !== undefined) ||
      w['Hymnus Vespera'] !== undefined)
  ) {
    name = 'Hymnus'
  }

  if (await directorium.hymnshift(version, day, month, year)) {
    if (hora === 'Laudes') name += ' Matutinum'
    if (hora === 'Vespera') name += ' Laudes'
  } else if ((await directorium.hymnshiftmerge(version, day, month, year)) && hora === 'Laudes') {
    let [h] = await getproprium(state, `${name} Laudes`, lang, true)
    const [h1] = await getproprium(state, `${name} Matutinum`, lang, true)
    h = h.replace(/^(v\. )/, '')
    // Replace the Matins hymn's doxology (its last verse) with the Lauds hymn.
    hymn = h1.replace(/_(?![\s\S]*_)[\s\S]*/, `_\n${h}`)
  } else {
    name += ` ${hora}`
  }

  if (hora === 'Vespera' && state.day.vespera === 3) {
    ;[hymn] = await getproprium(state, `${name} 3`, lang, true)
  }

  if (!hymn) {
    ;[hymn] = await getproprium(state, name, lang, true)
  }

  if (!hymn) {
    name = `${gettempora(state, 'Hymnus major')} ${hora}`
    if (
      /Day0/i.test(name) &&
      /Laudes/i.test(name) &&
      (/Epi[2-6]/.test(ctx.dayname[0]) ||
        /Quadp/i.test(ctx.dayname[0]) ||
        /Novembris/i.test(w.Rank ?? '') ||
        /Octobris/i.test(w.Rank ?? ''))
    ) {
      name += ' hiemalis'
    }
  }
  return [hymn, name]
}

// Port of checkmtv.
function checkmtv(version: string, w: { Rule?: string }): string {
  return (/1955|196/.test(version) || /;mtv/i.test(w.Rule ?? '')) && /C[45]/.test(w.Rule ?? '')
    ? '1'
    : ''
}

// Port of gethymn (minor + major hours).
export async function gethymn(state: HoursState, lang: string): Promise<string> {
  const ctx = state.day.ctx
  const hora = state.hora
  let section = await state.texts.translate('Hymnus', lang)
  let name = `Hymnus ${hora}`
  let hymn = ''
  let hymnsource = ''
  let versum = ''

  if (hora === 'Matutinum') {
    ;[hymn, name] = await hymnusmatutinum(state, lang)
    if (!hymn) hymnsource = 'Matutinum'
    section = ''
  } else if (hora === 'Laudes' || hora === 'Vespera') {
    ;[hymn, name] = await hymnusmajor(state, lang)
    name = `Hymnus ${name}`
    if (!hymn) hymnsource = 'Major'
    section = `_\n!${section}`

    const ind = hora === 'Laudes' ? 2 : state.day.vespera
    ;[versum] = await getantvers(state, 'Versum', ind, lang)
  } else {
    if (hora === 'Tertia' && /Pasc7/.test(ctx.dayname[0])) {
      name = name.replace(/ /, ' Pasc7 ')
    }
    hymnsource = hora === 'Prima' ? 'Prima' : 'Minor'
    section = `#${section}`
  }

  if (hymnsource) {
    const h = await setup(state, lang, `Psalterium/Special/${hymnsource} Special`)
    // tryoldhymn equivalent for the Psalterium hymn table.
    const nameM = name.replace(/Hymnus\S*/, '$&M')
    if (/(Monastic|1570|Praedicatorum)/i.test(ctx.version) && h[nameM] !== undefined) {
      hymn = h[nameM] ?? ''
    } else {
      hymn = h[name] ?? ''
    }
  }

  if (!/196[02]/.test(ctx.version) && /\*/.test(hymn)) {
    const [dox, dname] = await doxology(state, lang)
    if (dname) hymn = hymn.replace(/\*[\s\S]*/, dox)
    if (
      dname &&
      section &&
      (!/Pasc7/.test(ctx.dayname[0]) || (hora !== 'Tertia' && hora !== 'Vespera'))
    ) {
      section += ` {Doxology: ${dname}}`
    }
  }

  hymn = hymn.replace(/^(?:v\.\s*)?(\p{Lu})/u, 'v. $1')
  hymn = hymn.replace(/\*\s*/g, '')
  hymn = hymn.replace(/_\n(?!!)/g, '_\nr. ')

  let output = `${section}\n${hymn}`
  if (versum) output += `_\n${versum}`
  return output
}
