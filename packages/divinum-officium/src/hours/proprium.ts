// Port of specials.pl's lookup helpers: getproprium (with HymnusM redirect,
// pseudo-commune daisy chains, and Nocturn-Versum substitutes), getanthoras,
// getantvers, getfrompsalterium, replaceNdot, and the horas setcomment (which
// — unlike the missa one — really pushes the headline into the script).

import { sessionWithLang } from '../kalendar/officestring'
import { num, subdirname } from '../kalendar/state'
import { type Sections, setupstring } from '../references/resolve'
import { gettempora, postprocessAnt, postprocessVr } from './helpers'
import { chompd, columnsel, communeOf, type HoursState, winnerOf } from './state'

export async function setup(state: HoursState, lang: string, fname: string): Promise<Sections> {
  return (
    (await setupstring(sessionWithLang(state.session, lang), fname.replace(/\.txt$/, ''))) ?? {}
  )
}

// Port of tryoldhymn: Monastic/1570/OP prefer the pre-Urban 'HymnusM …' text.
function tryoldhymn(state: HoursState, source: Sections, name: string): string {
  const name1 = name.replace(/Hymnus\S*/, '$&M')
  return /(Monastic|1570|Praedicatorum)/i.test(state.day.ctx.version) && source[name1] !== undefined
    ? name1
    : name
}

// Port of replaceNdot (horas variant: Ant=/Oratio= selection from [Name]).
export function replaceNdot(state: HoursState, s: string, lang: string, name?: string): string {
  if (!/N\./.test(s)) return s
  let n = name
  if (!n) n = winnerOf(state, lang).Name
  if (!n) n = (columnsel(state, lang) ? state.day.commemoratioSections : state.commemoratio2).Name
  if (!n) return s

  let names = n.split('\n')
  if (/^[OÓ],?\s|O Doctor optime/.test(s) && /Ant=/.test(n)) {
    names = names.filter((x) => x.includes('Ant='))
  } else if (/Oratio=/.test(n)) {
    names = names.filter((x) => x.includes('Oratio='))
  }
  const first = (names[0] ?? '').replace(/^.*?=/, '').replace(/[\r\n]/g, '')
  if (first) {
    let out = s.replace(/N\. .*? N\./, first)
    out = out.replace(/N\./g, first)
    return out
  }
  return s
}

// Port of getproprium($name, $lang, $flag).
export async function getproprium(
  state: HoursState,
  name: string,
  lang: string,
  flag: boolean,
): Promise<[string, number]> {
  const w = winnerOf(state, lang)
  let result = ''
  let c = 0
  let lookupName = name

  if (w[lookupName] !== undefined) {
    if (/^Hymnus/.test(lookupName)) lookupName = tryoldhymn(state, w, lookupName)
    result = w[lookupName] ?? ''
    c = /Sancti/.test(state.day.winner) ? 3 : 2
  }
  if (result) return [result, c]

  if (state.day.communetype && (/^ex/i.test(state.day.communetype) || flag)) {
    let com = communeOf(state, lang)
    let cn = state.day.commune
    const substitute =
      name === 'Nocturn 1 Versum'
        ? 'Versum 1'
        : name === 'Responsory TertiaM'
          ? 'Nocturn 1 Versum'
          : name === 'Versum Tertia' || name === 'Responsory SextaM'
            ? 'Nocturn 2 Versum'
            : name === 'Versum Sexta' || name === 'Responsory NonaM'
              ? 'Nocturn 3 Versum'
              : name === 'Versum Nona'
                ? 'Versum 2'
                : ''

    let loopcounter = 0
    let currentName = name
    while (!result && loopcounter < 5) {
      loopcounter++
      if (com[currentName] !== undefined) {
        if (/^Hymnus/.test(currentName)) currentName = tryoldhymn(state, com, currentName)
        result = com[currentName] ?? ''
        c = 4
        break
      }
      if (/^C/i.test(stripDir(cn)) && substitute && com[substitute] !== undefined) {
        result = com[substitute] ?? ''
        c = 4
        break
      }
      const chain =
        /;;(ex|vide)\s*(C[0-9a-z]+)/i.exec(com.Rank ?? '') ??
        /;;(ex|vide)\s*(SanctiM?\/.*?)\s/i.exec(com.Rank ?? '')
      if (!/^C/i.test(stripDir(cn)) && chain) {
        if (chain[1].toLowerCase() === 'vide' && !flag) break
        const fn = chain[2]
        cn = /^Sancti/i.test(fn) ? fn : `${subdirname('Commune', state.day.ctx.version)}${fn}`
        com = await setup(state, lang, cn)
        continue
      }
      break
    }

    if (result) result = replaceNdot(state, result, lang)
  }
  return [result, c]
}

function stripDir(commune: string): string {
  return commune.replace(/^.*\//, '').replace(/\.txt$/, '')
}

// Port of getanthoras.
export async function getanthoras(state: HoursState, lang: string): Promise<[string, number]> {
  const ctx = state.day.ctx
  let tflag = /Trident|Monastic/i.test(ctx.version) && /Sancti/i.test(state.day.winner)
  if (
    /1963/.test(ctx.version) &&
    /SanctiM?.01-(?:(?:0[2-5789])|(?:1[012]))/.test(state.day.winner)
  ) {
    tflag = false
  }

  if (
    !/Antiphonas horas/i.test(state.rule) &&
    !/Antiphonas horas/i.test(state.communerule) &&
    !tflag
  ) {
    return ['', 0]
  }
  const newcal = /(1960|Newcal)/.exec(ctx.version)
  if (newcal && (ctx.dayofweek > 0 || newcal[1] === '1960') && state.day.rank < 6) return ['', 0]

  const w = winnerOf(state, lang)
  let ant = w['Ant Laudes'] ?? ''
  let c = /Sancti/.test(state.day.winner) ? 3 : 2
  if (!ant && (/ex\s*/i.test(state.day.communetype) || /Trident|Monastic/i.test(ctx.version))) {
    ant = communeOf(state, lang)['Ant Laudes'] ?? ''
    c = 4
  }
  const ants = ant.split('\n')
  const ind =
    state.hora === 'Prima' ? 0 : state.hora === 'Tertia' ? 1 : state.hora === 'Sexta' ? 2 : 4
  return [ants.length > 3 ? (ants[ind] ?? '') : '', c]
}

// Port of getfrompsalterium.
export async function getfrompsalterium(
  state: HoursState,
  item: string,
  ind: number,
  lang: string,
): Promise<string> {
  const c = await setup(state, lang, 'Psalterium/Special/Major Special')
  const name = `${gettempora(state, 'getfrompsalterium major')} ${item}`
  return c[`${name} ${ind}`] ?? c[`${name} 1`] ?? c[`${name} 3`] ?? c[`${name} 2`] ?? ''
}

// Port of getseant — 'Ant 3' from the Str$year (stransfer) file.
async function getseant(state: HoursState, lang: string): Promise<string> {
  const ctx = state.day.ctx
  const key = `seant${String(ctx.month).padStart(2, '0')}-${String(ctx.day).padStart(2, '0')}`
  const d = await state.day.state.directorium.getFromDirectorium(
    'stransfer',
    ctx.version,
    key,
    ctx.year,
  )
  if (!d) return ''
  const w = (await setupstring(sessionWithLang(state.session, lang), `Tempora/${d}`)) ?? {}
  return w['Ant 3'] ?? ''
}

// Port of getantvers.
export async function getantvers(
  state: HoursState,
  item: string,
  ind: number,
  lang: string,
): Promise<[string, number]> {
  let [w, c] = await getproprium(state, `${item} ${ind}`, lang, true)
  if (!w && ind > 1) {
    ;[w, c] = await getproprium(state, `${item} ${4 - ind}`, lang, true)
  }
  // Septuagesima/Sexagesima Vespers: Ant 3 from the stransfer table.
  if (
    !w &&
    state.hora === 'Vespera' &&
    /Ant/i.test(item) &&
    /Tempora\/Quadp[12]/i.test(state.day.winner)
  ) {
    w = await getseant(state, lang)
    if (w) c = 0
  }
  if (!w) {
    w = await getfrompsalterium(state, item, ind, lang)
    c = 0
  }
  if (w) {
    w = /Versum/i.test(item)
      ? await postprocessVr(state, w, lang)
      : await postprocessAnt(state, w, lang)
  } else {
    w = `${item} ${ind} missing`
  }
  return [w, c]
}

// Port of the horas setcomment — really pushes the headline (+{comment}) to @s.
export async function setcomment(
  state: HoursState,
  label: string,
  comment: string,
  ind: number,
  lang: string,
  prefix = '',
): Promise<void> {
  if (ind > -1) {
    let index = ind
    if (/Source/i.test(comment) && state.votive && !/hodie/i.test(state.votive)) index = 7
    let translated = await state.texts.translate(label, lang)
    const comm = await setup(state, lang, 'Psalterium/Comment')
    let commentText = (comm[comment] ?? '').split('\n')[index] ?? ''
    if (prefix) commentText = `${prefix} ${commentText}`
    if (/\}\s*/.test(translated)) {
      translated = translated.replace(/\}\s*$/, ` ${commentText}}`)
    } else {
      translated += `{${commentText}}`
    }
    state.s.push(translated)
  } else {
    state.s.push(label)
  }
}

// Port of checksuffragium (horas variant) — M6 consumers; ported now since
// psalmi_minor's Quicumque rule needs it.
export async function checksuffragium(state: HoursState): Promise<boolean> {
  const ctx = state.day.ctx
  const ranklimit = 3
  const w = state.day.winnerSections
  if (
    /no suffragium/i.test(state.rule) ||
    !ctx.dayname[0] ||
    /Nat05|Quad6|Pasc[067]/i.test(ctx.dayname[0]) ||
    /Adv|Nat|Quad5/i.test(ctx.dayname[0]) ||
    (/sancti/i.test(state.day.winner) && state.day.rank >= ranklimit) ||
    (/tempora/i.test(state.day.winner) && state.day.duplex > 2) ||
    (/octav/i.test(w.Rank ?? '') && !/post Octavam/i.test(w.Rank ?? '')) ||
    state.octavcount > 0 ||
    /octav/i.test(state.day.commemoratioSections.Rank ?? '') ||
    /C12/.test(state.day.winner)
  ) {
    return false
  }

  if (state.day.commemoratio) {
    const r = (state.day.commemoratioSections.Rank ?? '').split(';;')
    if (num(r[2]) >= ranklimit || /in.*Octav/i.test(state.day.commemoratioSections.Rank ?? '')) {
      return false
    }
    for (const commemo of state.day.commemoentries) {
      if (!commemo) continue
      const c = await setup(state, 'Latin', commemo)
      const cr = (c.Rank ?? '').split(';;')
      if (num(cr[2]) >= ranklimit || /in.*Octav/i.test(c.Rank ?? '')) return false
    }
  }
  return true
}
