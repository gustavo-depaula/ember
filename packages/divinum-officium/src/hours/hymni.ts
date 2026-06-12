// Port of specials/hymni.pl for the minor hours: gethymn (Prima/Minor
// Psalterium hymns + doxology substitution). hymnusmajor/hymnusmatutinum come
// with M6/M7.

import { gettempora, postprocessVr } from './helpers'
import { setup } from './proprium'
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

// Port of gethymn (minor-hours paths).
export async function gethymn(state: HoursState, lang: string): Promise<string> {
  const ctx = state.day.ctx
  const hora = state.hora
  let section = await state.texts.translate('Hymnus', lang)
  let name = `Hymnus ${hora}`
  let hymn = ''
  const versum = ''

  if (hora === 'Matutinum' || hora === 'Laudes' || hora === 'Vespera') {
    throw new Error('major/matutinum hymns are not ported yet — M6/M7')
  }

  if (hora === 'Tertia' && /Pasc7/.test(ctx.dayname[0])) {
    name = name.replace(/ /, ' Pasc7 ')
  }
  const hymnsource = hora === 'Prima' ? 'Prima' : 'Minor'
  section = `#${section}`

  const h = await setup(state, lang, `Psalterium/Special/${hymnsource} Special`)
  // tryoldhymn equivalent for the Psalterium hymn table.
  const nameM = name.replace(/Hymnus\S*/, '$&M')
  if (/(Monastic|1570|Praedicatorum)/i.test(ctx.version) && h[nameM] !== undefined) {
    hymn = h[nameM] ?? ''
  } else {
    hymn = h[name] ?? ''
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
