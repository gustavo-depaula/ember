// Port of specmatins.pl + the Matins half of monastic.pl: invitatorium,
// hymnusmatutinum, psalmi_matutinum (Roman + Monastic), nocturns, the
// absolutions/benedictions table, lectio() with its responsories, Te Deum
// logic, and the initia (Scripture incipit) transfer tables. Non-GABC paths
// only; Cistercian/OP-only branches are omitted (unreachable in v1 versions).

import { leapyear, monthday } from '../kalendar/date'
import { officestring, sessionWithLang } from '../kalendar/officestring'
import { num, subdirname } from '../kalendar/state'
import { type Sections, setupstring } from '../references/resolve'
import { isSectioned } from '../types'
import {
  alleluiaAnt,
  alleluiaRequired,
  ensureSingleAlleluia,
  gettempora,
  postprocessAnt,
  postprocessVr,
  processInlineAlleluias,
} from './helpers'
import { getproprium, replaceNdot, setcomment, setup } from './proprium'
import { antetpsalm, splitPerl } from './psalmi'
import { chompd, columnsel, type HoursState, winnerOf } from './state'

const LT1960_DEFAULT = 0
const LT1960_FERIAL = 1
const LT1960_SUNDAY = 2
const LT1960_SANCTORAL = 3
const LT1960_OCTAVEII = 4
const LT1960_OCTAVE = 5

function scripturaOf(state: HoursState, lang: string): Sections {
  return columnsel(state, lang) ? state.day.scripturaSections : state.scriptura2
}

function commemoratioOf(state: HoursState, lang: string): Sections {
  return columnsel(state, lang) ? state.day.commemoratioSections : state.commemoratio2
}

function communeOf(state: HoursState, lang: string): Sections {
  return columnsel(state, lang) ? state.day.communeSections : state.commune2
}

// Read a whole header-less file (Perl do_read) with the per-file language
// fallback chain.
async function doReadLangFallback(state: HoursState, path: string, lang: string): Promise<string> {
  for (const l of [lang, state.session.fallbackLang, 'Latin']) {
    const file = await state.session.loader.load(`horas/${l}/${path}`)
    if (!file) continue
    if (isSectioned(file)) {
      const pre = file.sections.find((s) => s.name === '__preamble')
      if (pre) return pre.lines.join('\n')
      continue
    }
    return file.lines.join('\n')
  }
  return ''
}

// Port of dayofweek2i.
export function dayofweek2i(state: HoursState): number {
  let i = state.day.ctx.dayofweek || 1
  if (i > 3) i -= 3
  return i
}

// Port of gettype1960.
export function gettype1960(state: HoursState): number {
  const ctx = state.day.ctx
  const { version } = ctx
  let type = LT1960_DEFAULT

  if (/196/.test(version) && !/(C9|Defunctorum)/i.test(state.votive)) {
    if (/post Nativitatem/i.test(ctx.dayname[1])) {
      type = LT1960_OCTAVEII
    } else if (state.day.rank < 2 || /(feria|vigilia|die)/i.test(ctx.dayname[1])) {
      type = LT1960_FERIAL
    } else if (
      !/Monastic/i.test(version) &&
      (!/1962/.test(version) || !/Pasc.-0/.test(state.day.winner)) &&
      (/dominica.*?semiduplex/i.test(ctx.dayname[1]) || /Pasc1-0/i.test(state.day.winner))
    ) {
      type = LT1960_SUNDAY
    } else if (state.day.rank < 5) {
      type = LT1960_SANCTORAL
    }
  } else if (/monastic/i.test(version) && !/(C9|Defunctorum)/i.test(state.votive)) {
    if (
      state.day.rank < 2 ||
      (/(feria|vigilia|die)/i.test(ctx.dayname[1]) && !/infra octavam/i.test(ctx.dayname[1]))
    ) {
      type = LT1960_FERIAL
    } else if (/infra octavam/i.test(ctx.dayname[1])) {
      type = LT1960_OCTAVE
    } else if (!/trident/i.test(version) && state.day.rank < 4) {
      type = LT1960_SANCTORAL
    }
  }
  if (/9 lectiones 1960|12 lectiones/i.test(state.rule)) type = LT1960_DEFAULT
  return type
}

// Port of contract_scripture.
export function contractScripture(state: HoursState, n: number, respFlag = false): boolean {
  if (n !== 2 || /(C9|Defunctorum)/i.test(state.votive)) return false
  if (!/196/.test(state.day.ctx.version)) return false
  if (/C10/i.test(state.day.commune)) return true
  const lt = state.ltype1960 ?? 0
  if (
    (lt === LT1960_SANCTORAL || lt === LT1960_SUNDAY) &&
    (!/scriptura1960/i.test(state.rule) || respFlag) &&
    (!/feria/i.test(state.day.ctx.dayname[1]) || state.day.commemoratio !== '')
  ) {
    return true
  }
  return false
}

// Port of cujus_q.
function cujusQ(state: HoursState, str: string): number {
  if (/Quorum Festum/.test(state.rule)) return 1
  if (/C11|08-15|09-08|12-08/.test(state.day.commune)) return 4
  if (/basilic/i.test(str)) return -2
  if (/S\. P\. N\. Benedicti Abbatis/.test(str)) return 5
  let j = 0
  if (/(virgin|vidu[aæ]|poenitentis|pœnitentis|C6|C7)/i.test(str) && !/C[2-5]/.test(str)) j += 2
  if (/(?:ss\.|bb\.|sanctorum|sociorum)/i.test(str)) j++
  return j
}

// Port of getC10readingname.
function getC10readingname(state: HoursState): string {
  const { version, month, day } = state.day.ctx
  if (!/196/.test(version) && month === 9 && day > 8 && day < 15) return 'Lectio M101'
  let satnum = Math.floor((day - 1) / 7 + 1)
  if (satnum === 5) satnum = 4
  const suffix = /1963/i.test(version) ? String(satnum) : ''
  return `Lectio M${String(month).padStart(2, '0')}${suffix}`
}

// Port of initiarule.
export async function initiarule(state: HoursState): Promise<string> {
  const { version, month, day, year } = state.day.ctx
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  let initfile = await state.day.state.directorium.getFromDirectorium(
    'stransfer',
    version,
    key,
    year,
  )
  initfile = initfile.replace(/(XX-XX)?;;[\s\S]*$/, '')
  return initfile
}

// Port of tferifile.
function tferifile(
  state: HoursState,
  w: Sections,
  winit: Sections,
  start: number,
  i: number,
  lang: string,
): Sections {
  const out = { ...w }
  out[`Lectio${start}`] = winit[`Lectio${i}`]
  if (
    winit[`Responsory${i}`] !== undefined &&
    (/Initia cum Responsory/i.test(winit.Rule ?? '') ||
      /Dominica/i.test(winit.Rank ?? '') ||
      /Dominica/i.test(winit.Scriptura ?? ''))
  ) {
    out[`Responsory${start}`] = winit[`Responsory${i}`]
  } else if (out[`Responsory${start}`] === undefined) {
    const s = scripturaOf(state, lang)
    out[`Responsory${start}`] = s[`Responsory${i}`]
  }
  return out
}

// Port of resolveitable — applies the Str$year initia-transfer table.
async function resolveitable(
  state: HoursState,
  wIn: Sections,
  fileIn: string,
  lang: string,
): Promise<Sections> {
  const { version } = state.day.ctx
  let w = { ...wIn }
  let file = fileIn
  let winit: Sections = {}
  const lect12 = /12 lect/.test(state.rule)
  const load = async (f: string) =>
    (await setupstring(
      sessionWithLang(state.session, lang),
      `${subdirname('Tempora', version)}${f}`,
    )) ?? {}

  if (!/~B$/.test(file) || !state.day.initia) {
    const replace = /~R$/.test(file)
    file = file.replace(/~[ABR]$/, '')
    const files = file.split('~')
    let lim = lect12 ? 4 : 3
    let start = 1

    if (state.day.initia && !replace) {
      start = files.length < 2 ? (lect12 ? 4 : 3) : 2
      if (!/(9|12) lectiones/i.test(state.rule) && /Sancti/i.test(state.day.winner)) {
        lim = 1
        start = 1
      }
    }
    let i = 1
    while (files.length > 0 && i <= lim) {
      const f = files.shift() ?? ''
      winit = await load(f)
      w = tferifile(state, w, winit, start, 1, lang)
      i++
      start++
    }
    i = 2
    while (start <= (lect12 ? 4 : 3)) {
      w = tferifile(state, w, winit, start, i, lang)
      i++
      start++
    }
  } else {
    file = file.replace(/~[ABR]$/, '')
    const files = file.split('~')
    let lim = 1
    let start = 2
    if (
      files.length > 1 &&
      !(!/(9|12) lectiones/i.test(state.rule) && /Sancti/i.test(state.day.winner))
    ) {
      lim = 2
      start = 3
    }
    if (w.Lectio2 !== undefined) {
      winit = { ...w }
    } else {
      winit = scripturaOf(state, lang)
    }
    let i = 1
    while (start < 4) {
      w = tferifile(state, w, winit, start, i, lang)
      i++
      start++
    }
    i = 1
    start = 1
    while (files.length > 0 && i <= lim) {
      const f = files.shift() ?? ''
      winit = await load(f)
      w = tferifile(state, w, winit, start, 1, lang)
      i++
      start++
    }
  }
  return w
}

// Port of StJamesRule.
async function stJamesRule(
  state: HoursState,
  wIn: Sections,
  lang: string,
  n: number,
  sIn: string,
): Promise<Sections> {
  const { version } = state.day.ctx
  const w = { ...wIn }
  let w1: Sections | undefined

  if (/Dominica/i.test(w.Rank ?? '') && (await prevdayl1(state, sIn, lang))) {
    const kd = `${state.day.ctx.dayname[0]}-1`
    w1 =
      (await setupstring(
        sessionWithLang(state.session, lang),
        `${subdirname('Tempora', version)}${kd}`,
      )) ?? {}
  }

  if (
    /Jacobi|Joannis/.test(w.Rank ?? '') &&
    new RegExp(`!.*?(${sIn}) `, 'i').test(state.day.scripturaSections.Lectio1 ?? '')
  ) {
    w1 = scripturaOf(state, lang)
  }

  if (!w1 || w1[`Lectio${n}`] === undefined) return w
  w[`Lectio${n}`] = w1[`Lectio${n}`]
  return w
}

// Port of prevdayl1 — bug-compatible: `if ($day = 0)` is an assignment that
// always yields false, so the month never rolls back.
async function prevdayl1(state: HoursState, sIn: string, lang: string): Promise<boolean> {
  const { version, month, day } = state.day.ctx
  const s = sIn.split(',')[0]
  const d = day - 1
  const kd = `${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const w1 =
    (await setupstring(
      sessionWithLang(state.session, lang),
      `${subdirname('Sancti', version)}${kd}`,
    )) ?? {}
  const l = w1.Lectio1 ?? ''
  return new RegExp(`!.*?${s} 1:`, 'i').test(l)
}

// Port of tedeum_required.
export function tedeumRequired(state: HoursState, n: number): boolean {
  const ctx = state.day.ctx
  const { version, dayofweek } = ctx
  const rule = state.rule
  const winner = state.day.winner

  if (/^Monastic/.test(version)) return n === 12

  return (
    ((n === 9 && /9 lectiones/i.test(rule)) ||
      (n === 3 &&
        (!/9 lectiones/i.test(rule) ||
          state.day.duplex === 1 ||
          (/19(?:55|6[02])/.test(version) && gettype1960(state) !== LT1960_DEFAULT)))) &&
    !/no Te Deum/.test(rule) &&
    !/C9/.test(state.day.commune) &&
    (!/^Tempora.*(?:Adv|Quad)/.test(winner) || /^Monastic/.test(version)) &&
    ((!dayofweek && !/(Vigilia)/.test(ctx.dayname[1])) ||
      (/Sancti|Commune/i.test(winner) && !/(Vigilia)/.test(ctx.dayname[1])) ||
      /Feria Te Deum/i.test(rule) ||
      /Pasc|Nat|C10/.test(winner) ||
      (/^Tempora/.test(winner) && state.day.rank > 5 && dayofweek > 0) ||
      (!/19(?:55|6)/.test(version) && /Pent01-[56]|Pent02-[1-4]/.test(winner)) ||
      (/Divino/.test(version) && /Pent02-6|Pent03-[1-5]/.test(winner)))
  )
}

// Port of matins_lectio_responsory_alleluia.
async function matinsLectioResponsoryAlleluia(
  state: HoursState,
  rIn: string,
  lang: string,
): Promise<string> {
  let r = rIn.replace(/\s*~\s*/g, ' ')
  const resp = splitPerl(r)
  if (resp.length > 1) resp[1] = await ensureSingleAlleluia(state, resp[1], lang)
  if (resp.length > 3) resp[3] = await ensureSingleAlleluia(state, resp[3], lang)
  resp[resp.length - 1] = await ensureSingleAlleluia(state, resp[resp.length - 1], lang)
  r = resp.join('\n')
  return r
}

// Port of responsory_gloria.
export async function responsoryGloria(
  state: HoursState,
  wIn: string,
  n: number,
  lang: string,
): Promise<string> {
  const ctx = state.day.ctx
  const { version } = ctx
  let w = wIn.replace(/&Gloria1?/g, '&Gloria1')

  if (
    (n === 1 && /(?:Adv1|Pasc0)-0/i.test(state.day.winner) && !/cist/i.test(version)) ||
    /requiem Gloria/i.test(state.rule)
  ) {
    return w
  }

  const rpn = /12 lectio/.test(state.rule) ? 4 : 3

  if (
    n % rpn === 0 ||
    (!/^Monastic|Praedicatorum/.test(version) &&
      n % rpn === rpn - 1 &&
      tedeumRequired(state, n + 1))
  ) {
    if (!/&Gloria/i.test(w)) {
      w = w.replace(/[\s_]*$/, '')
      if (/Quad[56]/.test(state.day.winner) && /monastic/i.test(version)) {
        // Passiontide: Gloria Patri replaced by the first two lines of the R.
        w = w.replace(
          /^(R\..*)\n(\* .*)\n(V\..*)\n(R\..*)$/m,
          (_m, r1: string, star: string, _v: string, r2: string) =>
            `${r1}\n${star}\n${r2}\n\n&Gloria1\n${r1} ${star}`,
        )
        w = w.replace(/ {2}/g, ' ')
      } else {
        // Perl `s/(R\..*?)$/…/` — '.' excludes newlines: only the LAST
        // R-line is captured and repeated.
        w = w.replace(/(R\.[^\n]*)$/, '$1\n&Gloria1\n$1')
      }
    }
  } else {
    // Perl /s — the dot before &Gloria also eats a preceding newline.
    w = w.replace(/[\s\S]&Gloria[\s\S]*/, '')
  }
  return w
}

// Port of invitatorium.
export async function invitatorium(state: HoursState, lang: string): Promise<void> {
  const ctx = state.day.ctx
  const { version, dayofweek, month } = ctx
  const invitFile = await setup(state, lang, 'Psalterium/Special/Matutinum Special')
  let name = gettempora(state, 'Invitatorium')

  if (/Trid|Monastic/i.test(version) && (!name || (name === 'Quad' && dayofweek !== 0))) {
    name = 'Trid'
  }

  let comment: number
  if (name) {
    name = `Invit ${name}`
    comment = 1
  } else {
    name = 'Invit'
    comment = 0
  }
  let i = /^Invit$/i.test(name) || /Invit Trid/i.test(name) ? dayofweek : 0
  if (
    i === 0 &&
    /^Invit$/i.test(name) &&
    (month < 4 || (state.day.monthday && /^1[0-9][0-9]-/.test(state.day.monthday)))
  ) {
    i = 7
  }
  const invitLines = splitPerl(invitFile[name])
  let ant = chompd(invitLines[i])
  let w = ''

  if (
    /Monastic|Praedicatorum/i.test(version) &&
    dayofweek > 0 &&
    /Pasc/.test(state.day.winner) &&
    !/Pasc[07]/.test(state.day.winner) &&
    !/Pasc5-4/.test(state.day.winner) &&
    !(/trident|divino/i.test(version) && /ascensio|pent|joseph/i.test(ctx.dayname[1]))
  ) {
    ant = await state.texts.prayer('Alleluia Duplex', lang)
    ant = ant.replace(/(\S+), (\S+)\./, '$1, $2, * $1')
  } else {
    let c = 0
    ;[w, c] = await getproprium(state, 'Invit', lang, true)
    if (w) {
      ant = chompd(w)
      comment = c
    }
    await setcomment(
      state,
      state.label,
      'Source',
      comment,
      lang,
      await state.texts.translate('Antiphona', lang),
    )
  }
  ant = ant.replace(/^.*?=\s*/, '')
  ant = chompd(ant)
  ant = `Ant. ${ant}`
  ant = await postprocessAnt(state, ant, lang)
  const antParts = ant.split('*')
  const ant2 = `Ant. ${antParts[1] ?? ''}`

  let text = await doReadLangFallback(state, 'Psalterium/Invitatorium', lang)
  if (!text) return

  if (/Invit2/i.test(state.rule)) {
    // old Invitatorium2 = Quadp[123]-0
    text = text.replace(/ \*.*?$/m, ' ')
  } else if (
    /Quad[56]/i.test(ctx.dayname[0]) &&
    /tempora/i.test(state.day.winner) &&
    !/Gloria responsory|Invit6/i.test(state.rule) &&
    !/Praedicatorum/.test(version)
  ) {
    // old Invitatorium3
    text = text.replace(/&Gloria/, '&Gloria2')
    text = text.replace(
      /^(v\.)\s*.* \^ (.)/m,
      (_m, a: string, b: string) => `${a} ${b.toUpperCase()}`,
    )
    text = text.replace(/\$ant2\s*(?=\$)/, '')
  } else if (
    !w &&
    dayofweek === 1 &&
    !(state.day.winnerSections.Invit || state.day.communeSections.Invit) &&
    (/(Epi|Pent|Quadp)/i.test(ctx.dayname[0]) ||
      (/Quad/i.test(ctx.dayname[0]) && /Trident|Monastic/i.test(version)))
  ) {
    // old Invitatorium4
    text = text.replace(
      /^(v\.)\s*.* \+ (.)/m,
      (_m, a: string, b: string) => `${a} ${b.toUpperCase()}`,
    )
  } else if (/Invit5/i.test(state.rule)) {
    text = text.replace(
      /^(v\.)\s*.* = (.)/m,
      (_m, a: string, b: string) => `${a} ${b.toUpperCase()}`,
    )
  } else if (/Invit6/i.test(state.rule)) {
    text = text.replace(/&Gloria/, '&Gloria2')
    text = text.replace(/\$ant\s*(?=&)/, '')
    text = text.replace(/\$ant2\s*(?=\$)/, '')
    text = text.replace(/_(.*)(.) _ .*/m, '$1.\nAnt. $1')
  }

  text = text.replace(/[+*^=_] /g, '')
  text = text.replace(/\$ant2/g, ant2)
  text = text.replace(/\$ant/g, ant)
  state.s.push(text)
}

// Port of hymnusmatutinum.
export async function hymnusmatutinum(state: HoursState, lang: string): Promise<[string, string]> {
  const ctx = state.day.ctx
  const { version, day, month, year } = ctx
  const directorium = state.day.state.directorium
  let hymn = ''
  let name = 'Hymnus'
  let comment: number

  if (state.day.winnerSections['Hymnus Matutinum'] === undefined) {
    name += checkmtvMatins(version, state.day.winnerSections)
  }
  let [h, c] = await getproprium(state, `${name} Matutinum`, lang, true)

  if (h) {
    if (
      (await directorium.hymnshift(version, day, month, year)) ||
      (await directorium.hymnshiftmerge(version, day, month, year))
    ) {
      const [h1] = await getproprium(state, `${name} Vespera`, lang, true)
      h = h1
    } else if (await hymnmerge(state)) {
      const [h1] = await getproprium(state, `${name} Vespera`, lang, true)
      h = h.replace(/^(v\. )/, '')
      h = h1.replace(/_(?![\s\S]*_)[\s\S]*/, `_\n${h}`)
    }
    hymn = h
    comment = c
  } else {
    name = gettempora(state, 'Hymnus matutinum')
    name = name ? `Hymnus ${name}` : `Day${ctx.dayofweek} Hymnus`
    comment = name ? 1 : 5
    if (
      /^Day0 Hymnus$/i.test(name) &&
      (month < 4 || (state.day.monthday && /^1[0-9][0-9]-/.test(state.day.monthday)))
    ) {
      name += '1'
    }
  }
  await setcomment(state, state.label, 'Source', comment, lang)
  return [hymn, name]
}

// checkmtv (matins copy — same logic as the Vespers one).
function checkmtvMatins(version: string, w: { Rule?: string }): string {
  return (/1955|196/.test(version) || /;mtv/i.test(w.Rule ?? '')) && /C[45]/.test(w.Rule ?? '')
    ? '1'
    : ''
}

async function hymnmerge(state: HoursState): Promise<boolean> {
  const { version, day, month, year } = state.day.ctx
  const flag = await state.day.state.directorium.getFromDirectorium(
    'transfer',
    version,
    `Hy${monthdayKey(state)}`,
    year,
  )
  void day
  void month
  return /1/.test(flag)
}

function monthdayKey(state: HoursState): string {
  const { day, month, year } = state.day.ctx
  // get_sday with the leap-day convention.
  let d = day
  if (leapyear(year) && month === 2) {
    if (d === 24) d = 29
    else if (d > 24) d -= 1
  }
  return `${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// Port of nocturn().
async function nocturn(
  state: HoursState,
  n: number,
  lang: string,
  psalmi: string[],
  select: (number | string)[],
): Promise<void> {
  if (n) {
    state.s.push(`!${await state.texts.translate('Nocturn', lang)} ${'I'.repeat(n)}`)
  } else {
    state.s.push(`!${await state.texts.translate('Ad Nocturnum', lang)}`)
  }

  const psalmiN = select.slice(0, -2).map((i) => psalmi[Number(i)] ?? '')
  const duplexf =
    /196/.test(state.day.ctx.version) ||
    (state.day.duplex > 2 && !/Matins simplex/.test(state.rule) && !/C12/.test(state.day.winner))
  await antetpsalm(state, psalmiN, duplexf, lang)

  const last = select[select.length - 1]
  const secondLast = select[select.length - 2]
  let vs: [string, string]
  if (/^\d+$/.test(String(last))) {
    vs = [psalmi[Number(secondLast)] ?? '', psalmi[Number(last)] ?? '']
  } else {
    vs = [String(secondLast ?? ''), String(last ?? '')]
  }
  if (alleluiaRequired(state.day.ctx.dayname[0], state.votive)) {
    vs[0] = await ensureSingleAlleluia(state, vs[0], lang)
    vs[1] = await ensureSingleAlleluia(state, vs[1], lang)
  }
  state.s.push('\n', vs[0], vs[1], '\n')
}

// Port of get_absolutio_et_benedictiones.
async function getAbsolutioEtBenedictiones(
  state: HoursState,
  n: number,
  lang: string,
): Promise<string[]> {
  const ctx = state.day.ctx
  const { version, dayofweek } = ctx
  const rule = state.rule
  const benFile = await setup(state, lang, 'Psalterium/Benedictions')
  const abs = splitPerl(benFile.Absolutiones)
  const eva = splitPerl(benFile.Evangelica)
  let ben: string[]

  if (
    n &&
    ((/9 lectiones/i.test(rule) && !/Monastic/.test(version)) || /12 lectiones/.test(rule))
  ) {
    const rpn = /12 lectio/.test(rule) ? 3 : 2 // readings per nocturn - 1
    ben = splitPerl(benFile[`Nocturn ${n}`])

    if (n === 3 && /Sancti|Quad5-5/.test(state.day.winner)) {
      if (/12-25/.test(state.day.winner)) {
        ben = splitPerl(benFile['Nocturn 3 12-25'])
      } else if (
        /(?:\bss?\.|\bbb?\.|sanctorum)/i.test(state.day.winnerSections.Rank ?? '') ||
        /C11|08-15|09-08|12-08/.test(state.day.commune)
      ) {
        ben[1] = ben[3 + cujusQ(state, state.day.winnerSections.Rank ?? '')] ?? ''
      }
    }

    if (n === 3 && !/12-25/.test(state.day.winner)) {
      // 'Evangelica lectio' first.
      if (/Monastic/i.test(version)) {
        ben.unshift(eva[0] ?? '')
      } else {
        ben[0] = eva[0] ?? ''
      }
    }

    // Update the last benedictio if the last lectio is from the Gospel.
    if (n === 3 && !/12-25/.test(state.day.winner)) {
      const w = await lectioFn(state, /Monastic/.test(version) ? 12 : 9, 'Latin')
      if (/!(?:Matt|Marc|Luc|Joannes)/.test(w)) {
        const ev9 = splitPerl(benFile.Evangelica9)
        ben[rpn] = ev9[0] ?? ''
      }
    }

    ben.unshift(abs[n - 1] ?? '')
  } else if (/(C1[02])/.test(state.day.winner)) {
    const m = /(C1[02])/.exec(state.day.winner)
    const mariae = await setup(state, lang, `${subdirname('Commune', version)}${m?.[1]}`)
    ben = splitPerl(mariae.Benedictio)
  } else {
    ben = splitPerl(benFile['Nocturn 3'])

    if (
      /vigil|quatt|ciner/i.test(state.day.winnerSections.Rank ?? '') ||
      /Quad[1-5]-[^0]|Quad6-1|Pasc5-1|Pasc[07]/.test(state.day.winner) ||
      (/Nat(?:29|3[01])/.test(state.day.winner) && !/196[02]/.test(version))
    ) {
      ben[0] = eva[0] ?? ''
    } else if (/dominica/i.test(state.day.winnerSections.Rank ?? '')) {
      const ev9 = splitPerl(benFile.Evangelica9)
      ben[2] = ev9[0] ?? ''
    } else if (
      (/Sancti/.test(state.day.winner) &&
        /\bss?\.|b\./i.test(state.day.winnerSections.Rank ?? '')) ||
      /C11/.test(state.day.commune)
    ) {
      ben[1] = ben[3 + cujusQ(state, state.day.winnerSections.Rank ?? '')] ?? ''
    } else {
      const i = dayofweek2i(state)
      ben = splitPerl(benFile[`Nocturn ${i}`])
    }

    ben.unshift(abs[dayofweek2i(state) - 1] ?? '')
  }
  return ben
}

// Port of lectiones().
export async function lectiones(state: HoursState, n: number, lang: string): Promise<void> {
  const { version } = state.day.ctx
  const rule = state.rule
  const a = await getAbsolutioEtBenedictiones(state, n, lang)

  if (!/Limit.*?Benedictio/i.test(rule) && !/Cist/i.test(version)) {
    if (!/sine absolutio/i.test(rule)) {
      state.s.push('$rubrica Pater secreto')
      state.s.push('$Pater noster Et')
      state.s.push(`Absolutio. ${a[0] ?? ''}`, '$Amen')
    }
  } else if (!/Cist/i.test(version) || /Matutinum Romanum/i.test(rule)) {
    state.s.push('$Pater totum secreto')
  }
  state.s.push('\n')

  const rpn = n && /12 lectio/.test(rule) ? 4 : !/Lectio brevis/.test(rule) ? 3 : 1
  const noct = n || 1

  for (let i = 1; i <= rpn; i++) {
    const l = (noct - 1) * rpn + i
    let benIdx = i
    if (/Lectio brevis sine absolutio/.test(rule)) benIdx = 0

    if (!/Limit.*?Benedictio/i.test(rule)) {
      state.s.push(await state.texts.prayer('Jube domne', lang))
      state.s.push(`Benedictio. ${a[benIdx] ?? ''}`, '$Amen')
    }
    state.s.push(`&lectio(${l})`, '\n')
  }
}

// Port of parenthesised_text.
function parenthesisedText(text: string): string {
  if (text.length < 20 || /[0-9][.,]/.test(text)) return `/:${text}:/`
  return `(${text})`
}

// Port of lectio() — the ScriptFunc resolved at expansion time.
export async function lectioFn(state: HoursState, numIn: number, lang: string): Promise<string> {
  const ctx = state.day.ctx
  const { version, dayofweek, month, day } = ctx
  let rule = state.rule
  let n = numIn
  state.ltype1960 = gettype1960(state)
  if (/C12/i.test(state.day.winner)) state.ltype1960 = LT1960_DEFAULT
  const ltype1960 = state.ltype1960

  if (ltype1960 === LT1960_SUNDAY && n === 3) {
    n = 7 // diverge to Gospel / Homily
  } else if (
    n === 3 &&
    ((ltype1960 === LT1960_SANCTORAL && !/(C9|Defunctorum)/i.test(state.votive)) ||
      (!/196|Cist/.test(version) &&
        !/1 et 2 lectiones/i.test(rule) &&
        /Sancti/i.test(state.day.winner) &&
        state.day.rank < 2 &&
        !/vigil|(vide|ex) C10/i.test(state.day.winnerSections.Rank ?? '')))
  ) {
    n = 4 // diverge to legend
  }
  let w: Sections = { ...winnerOf(state, lang) }

  let nocturnNum = Math.floor((n - 1) / (/12 lectiones/i.test(rule) ? 4 : 3)) + 1

  let homilyflag =
    state.day.commemoratioSections.Lectio1 !== undefined &&
    /!(Matt|Mark|Marc|Luke|Luc|Joannes|John)\s+[0-9]+:[0-9]+-[0-9]+/i.test(
      state.day.commemoratioSections.Lectio1 ?? '',
    )
      ? 1
      : 0

  if (
    n < 4 &&
    /trident|monastic.*divino/i.test(version) &&
    !/cist/i.test(version) &&
    /Dominica/i.test(state.day.winnerSections.Rank ?? '') &&
    month !== 12 &&
    dayofweek > 0
  ) {
    const inum = n + (/Monastic/.test(version) ? 8 : 6)
    w[`Lectio${n}`] = w[`Lectio${inum}`]
    if (inum === 11) w[`Lectio${n}`] = (w[`Lectio${n}`] ?? '') + (w.Lectio12 ?? '')
    homilyflag = 7
    nocturnNum = 0
  }

  // Lectio1 OctNat/TempNat: Dec 29 – Jan 05.
  if (nocturnNum === 1 && /Lectio1 (Oct|Temp)Nat/i.test(rule)) {
    let temp: Sections
    if (month === 12 && day < 29) {
      temp =
        (await officestring(state.day.state, lang, `${subdirname('Sancti', version)}12-25.txt`)) ??
        {}
    } else {
      let tfile = `${subdirname('Tempora', version)}Nat${String(day).padStart(2, '0')}${
        /Trident/i.test(version) ? 'o.txt' : '.txt'
      }`
      const t = await state.day.state.directorium.getFromDirectorium(
        'tempora',
        version,
        tfile,
        ctx.year,
      )
      tfile = t || tfile
      temp = (await officestring(state.day.state, lang, tfile)) ?? {}

      if (/12 lectiones/.test(rule)) {
        const scrip = { ...temp }
        for (const i of [1, 2, 3, 4]) {
          temp[`Lectio${i}`] = lectionesEx3Fiunt4(scrip, i)
        }
        temp[`Responsory${n}`] = w[`Responsory${n}`]
      }
    }
    if (contractScripture(state, 2)) {
      temp.Lectio2 = (temp.Lectio2 ?? '') + (temp.Lectio3 ?? '')
    }
    w[`Lectio${n}`] = temp[`Lectio${n}`]
    w[`Responsory${n}`] = temp[`Responsory${n}`]
  }

  // Lectio1 tempora (octave of Epiphany).
  if (
    nocturnNum === 1 &&
    /Lectio1 tempora/i.test(rule) &&
    state.day.scripturaSections.Lectio1 !== undefined
  ) {
    const scrip = scripturaOf(state, lang)
    if (/monastic/i.test(version) && /12 lectiones/i.test(rule)) {
      w[`Lectio${n}`] = lectionesEx3Fiunt4(scrip, n)
    } else {
      w[`Lectio${n}`] = scrip[`Lectio${n}`]
      w[`Responsory${n}`] = scrip[`Responsory${n}`]
    }
  }

  // scriptura1960.
  if (
    n < 3 &&
    /196/.test(version) &&
    /scriptura1960/i.test(rule) &&
    state.day.scripturaSections[`Lectio${n}`] !== undefined
  ) {
    const c = scripturaOf(state, lang)
    w[`Lectio${n}`] = c[`Lectio${n}`]
    if (
      n === 2 &&
      !/(C9|Defunctorum)/i.test(state.votive) &&
      (!/feria/i.test(ctx.dayname[1]) || state.day.commemoratio)
    ) {
      const m = /([\s\S]*?)_/.exec(w.Lectio2 ?? '')
      if (m) w.Lectio2 = m[1]
      w.Lectio2 = (w.Lectio2 ?? '') + (c.Lectio3 ?? '')
    }
  }

  // Initia table (Str$year).
  if (nocturnNum === 1 && !/1963/.test(version) && !/C12/.test(state.day.winner)) {
    const file = await initiarule(state)
    if (file) {
      w = await resolveitable(state, w, file, lang)
    }
  }

  const stJames = /StJamesRule=((?:1 )?[a-z,|á]+)\s/i.exec(rule)
  if (n < 4 && stJames) {
    w = await stJamesRule(state, w, lang, n, stJames[1])
  }

  // Sancta Maria in Sabbato.
  if (/C12/i.test(state.day.winner)) {
    if (
      (/1960/.test(version) || (/Sancti/i.test(state.day.winner) && state.day.rank < 2)) &&
      n === 4
    ) {
      n = 3
    }
    n = n % 3
    if (n === 0) n = 3
  }
  let text = w[`Lectio${n}`] ?? ''

  if (
    nocturnNum === 1 &&
    /Lectio1 Quad/i.test(rule) &&
    !/Quad(\d|p3-[3456])/i.test(ctx.dayname[0])
  ) {
    text = ''
    rule = rule.replace(/in 1 Nocturno L.*loco/, '')
    state.rule = state.rule.replace(/in 1 Nocturno L.*loco/, '')
  }

  if (
    /12 lectiones/i.test(rule) &&
    !/Lectio1 (Oct|Temp)(Nat|ora)/i.test(rule) &&
    ((n === 4 && w.Lectio1 === undefined) || (n === 9 && w.Lectio10 === undefined))
  ) {
    text = ''
  }

  if (homilyflag && /vigilia/i.test(state.day.commemoratioSections.Rank ?? '')) {
    homilyflag = 9
  }

  // Common when ex Tempora / homily superseded.
  if (
    !text &&
    ((/^ex/i.test(state.day.communetype) &&
      /Tempora/i.test(state.day.commune) &&
      state.day.rank > 3) ||
      (nocturnNum === 1 &&
        homilyflag === 1 &&
        state.day.communeSections[`Lectio${n}`] !== undefined &&
        !/in 1 Nocturno/i.test(rule)))
  ) {
    w = { ...communeOf(state, lang) }
    text = w[`Lectio${n}`] ?? ''
  }

  // Commune for sancti 'ex commune'.
  if (
    !text &&
    /sancti/i.test(state.day.winner) &&
    /^C/.test(state.day.commune.replace(/^.*\//, '')) &&
    ((/^ex/i.test(state.day.communetype) && state.day.rank > 3) ||
      new RegExp(`in ${nocturnNum} Nocturno Lectiones ex`, 'i').test(rule))
  ) {
    let com = communeOf(state, lang)
    let lecnum = `Lectio${n}`
    const locoMatch = new RegExp(
      `in ${nocturnNum} Nocturno Lectiones ex (Commune|C\\d+[a-z]*) in (\\d+) loco`,
      'i',
    ).exec(rule)
    if (locoMatch) {
      const loco = Number(locoMatch[2])
      if (locoMatch[1] !== 'Commune') {
        com =
          (await setupstring(
            sessionWithLang(state.session, lang),
            `${subdirname('Commune', version)}${locoMatch[1]}`,
          )) ?? {}
      }
      if (loco > 1) lecnum += ` in ${loco} loco`
      text = com[lecnum] ?? ''
    } else if (com[lecnum] !== undefined) {
      text = com[lecnum] ?? ''
    }
    if (text && contractScripture(state, n)) {
      lecnum = lecnum.replace(/Lectio2/, 'Lectio3')
      text += com[lecnum] ?? ''
    }
  }

  // Scriptura for the first nocturn.
  if (
    !text &&
    ((n < 4 && state.day.scripturaSections[`Lectio${n}`] !== undefined) ||
      (n === 4 && /12 lect/i.test(rule) && state.day.scripturaSections.Lectio3 !== undefined)) &&
    (!/trident/i.test(version) || state.day.rank < 5)
  ) {
    w = { ...scripturaOf(state, lang) }
    const infile = await initiarule(state)
    if (infile && !/C12/.test(state.day.winner)) {
      w = await resolveitable(state, w, infile, lang)
    }
    text = w[`Lectio${n}`] ?? ''
    if (
      /monastic/i.test(version) &&
      /12 lectiones/i.test(rule) &&
      (!/1963/.test(version) || /Lectio1 tempora/i.test(rule))
    ) {
      text = lectionesEx3Fiunt4(w, n)
    }
  } else if (
    !text &&
    n === 4 &&
    state.day.commemoratioSections[`Lectio${n}`] !== undefined &&
    /1960/i.test(version)
  ) {
    // Diverged 3rd lesson in 1960.
    w = { ...commemoratioOf(state, lang) }
    text = w[`Lectio${n}`] ?? ''
  }

  if (contractScripture(state, n)) {
    const m = /([\s\S]*?)_/.exec(text)
    if (m) text = m[1]
    text += w.Lectio3 ?? ''
  }
  if (/monastic/i.test(version) && n === 3) {
    text = monasticLectio3(state, text, lang)
  }

  if (!text && state.day.communeSections[`Lectio${n}`] !== undefined) {
    const c = communeOf(state, lang)
    text = c[`Lectio${n}`] ?? ''
    if (contractScripture(state, n)) {
      text += c.Lectio3 ?? ''
    }
  }

  if (new RegExp(`Special Lectio ${n}`).test(state.day.communeSections.Rule ?? '')) {
    const mariae = await setup(state, lang, `${subdirname('Commune', version)}C10`)
    text = mariae[getC10readingname(state)] ?? ''
  }

  const wo = text

  // Commemorated 9th/last lesson.
  if (
    (!/196/.test(version) &&
      !/C10/.test(state.day.commune) &&
      !/no93/i.test(rule) &&
      !/Octav.*(Epi|Corp)/i.test(state.day.winnerSections.Rank ?? '') &&
      ((/9 lectio/i.test(rule) &&
        n === 9 &&
        !(
          state.day.winnerSections.Responsory9 !== undefined ||
          (/Dominica/i.test(state.day.winnerSections.Rank ?? '') && !/Trid/i.test(version))
        )) ||
        (!/(9|12) lectio/i.test(rule) &&
          n === 3 &&
          !/Tempora/i.test(state.day.winner) &&
          state.day.winnerSections.Responsory3 === undefined) ||
        (/12 lectio/i.test(rule) &&
          n === 12 &&
          !/Cist/i.test(version) &&
          !(
            (state.day.rank > 5.5 && dayofweek > 0 && !homilyflag) ||
            (/Dominica/i.test(state.day.winnerSections.Rank ?? '') && state.day.rank > 3)
          )))) ||
    ((ltype1960 === LT1960_SANCTORAL || state.day.rank < 2) &&
      /Sancti/i.test(state.day.winner) &&
      n === 4)
  ) {
    let wl: Sections = winnerOf(state, lang)
    let L9winnerflag = false
    let wc = ''

    if (
      (/Simplex/i.test(wl.Rank ?? '') || (/1955/.test(version) && state.day.rank === 1.5)) &&
      wl.Lectio94 !== undefined &&
      !/Cist/i.test(version)
    ) {
      text = wl.Lectio94 ?? ''
      L9winnerflag = true
    } else if (wl.Lectio93 !== undefined) {
      text = wl.Lectio93 ?? ''
      L9winnerflag = true
    }

    let j0 = homilyflag ? 1 : n === 12 ? 9 : 7

    if (
      ((/tempora/i.test(state.day.commemoratio) &&
        !/Nat(29|30|31)/i.test(state.day.commemoratio)) ||
        /01-05\./.test(state.day.commemoratio)) &&
      (homilyflag === 1 || state.day.commemoratioSections[`Lectio${j0}`] !== undefined) &&
      state.day.comrank > 1 &&
      !/Cist/i.test(version) &&
      (state.day.rank > 4 || (state.day.rank >= 3 && /Trident/i.test(version)) || homilyflag === 1)
    ) {
      wl = commemoratioOf(state, lang)
      wc = wl[`Lectio${j0}`] ?? ''

      if (
        (wc && /monastic/i.test(version) && wl[`Responsory${j0}`] !== undefined) ||
        wl.Responsory12C !== undefined
      ) {
        state.day.winnerSections[`Responsory${n}`] = wl.Responsory12C || wl[`Responsory${j0}`]
        state.winner2[`Responsory${n}`] = wl.Responsory12C || wl[`Responsory${j0}`]
      } else if (!wc) {
        j0 = 1
        wc = wl.Lectio1 ?? ''
        if (
          (wc && /monastic/i.test(version) && wl.Responsory1 !== undefined) ||
          wl.Responsory12C !== undefined
        ) {
          state.day.winnerSections[`Responsory${n}`] = wl.Responsory12C || wl.Responsory1
          state.winner2[`Responsory${n}`] = wl.Responsory12C || wl.Responsory1
        }
      }

      if (wc) {
        const comm = await setup(state, lang, 'Psalterium/Comment')
        const commLines = splitPerl(comm.Lectio)
        const commentText = /Feria/.test(state.day.commemoratioSections.Rank ?? '')
          ? commLines[0]
          : /01-05\./.test(state.day.commemoratio)
            ? commLines[3]
            : commLines[1]
        text = `!${commentText ?? ''}\n${wc}`
      }
    }

    if (state.day.transfervigil) {
      let tv = state.day.transfervigil
      if (!(await state.session.loader.exists(`horas/${lang}/${tv.replace(/\.txt$/, '')}`))) {
        tv = tv.replace(/v\.txt/, '.txt')
      }
      const tro =
        (await setupstring(sessionWithLang(state.session, lang), tv.replace(/\.txt$/, ''))) ?? {}
      if (tro['Lectio Vigilia'] !== undefined) text = tro['Lectio Vigilia'] ?? ''
    } else if (homilyflag === 9) {
      const tro = commemoratioOf(state, lang)
      if (tro.Lectio1 !== undefined) {
        let trorank = tro.Rank ?? ''
        trorank = trorank.replace(/;;[\s\S]*/, '')
        text = `!${await state.texts.translate('Commemoratio', lang)}: ${trorank}\n${tro.Lectio1 ?? ''}`
      }
    }

    if (
      !L9winnerflag &&
      ((/sancti/i.test(state.day.commemoratio) &&
        /S\. /i.test(state.day.commemoratioSections.Rank ?? '')) ||
        /infra octavam/i.test(state.day.commemoratioSections.Rank ?? '')) &&
      (!/tempora/i.test(state.day.winner) ||
        num((state.day.winnerSections.Rank ?? '').split(';;')[2]) < 5) &&
      (!/1955/.test(version) || state.day.comrank > 4) &&
      !/Cist/i.test(version)
    ) {
      let wcm: Sections = commemoratioOf(state, lang)
      let ji: string | number = wcm.Lectio94 !== undefined ? 94 : 93
      let wc2 = wcm.Lectio94 ?? ''

      if (
        !wc2 &&
        !/infra octav/i.test(state.day.commemoratioSections.Rank ?? '') &&
        !/Monastic/.test(version)
      ) {
        wc2 = ''
        let j = 4
        for (; j < 7; j++) {
          const w1 = wcm[`Lectio${j}`]
          if (!w1 || (j > 4 && /!/.test(w1))) break
          const m = /([\s\S]*?)_/.exec(wc2)
          if (m) wc2 = m[1]
          wc2 += w1
        }
        ji = '4-6'
      }

      if (!wc2) {
        wc2 = wcm.Lectio93 ?? ''
      }

      if (
        !wc2 &&
        /infra octav/i.test(state.day.commemoratioSections.Rank ?? '') &&
        !/Monastic/.test(version)
      ) {
        const commemo1 = state.day.commemoentries[1]
        if (commemo1) {
          wcm =
            (await setupstring(
              sessionWithLang(state.session, lang),
              commemo1.replace(/\.txt$/, ''),
            )) ?? {}
          wc2 =
            wcm.Lectio94 ||
            `${wcm.Lectio4 ?? ''}${wcm.Lectio5 ?? ''}${wcm.Lectio6 ?? ''}` ||
            wcm.Lectio93 ||
            ''
        }
      }

      if (wc2) {
        if (!/^!/.test(wc2)) {
          if (wcm.Rank !== undefined) {
            const wcr = (wcm.Rank ?? '').split(';;')
            text = `!${await state.texts.translate('Commemoratio', lang)}: ${wcr[0]}\n${wc2}`
          } else {
            const comm = await setup(state, lang, 'Psalterium/Comment')
            const commLines = splitPerl(comm.Lectio)
            text = `!${commLines[2] ?? ''}\n${wc2}`
          }
        } else {
          text = wc2
        }
      }
    }
    if (/Octav.*(Epi|Corp)/i.test(state.day.winnerSections.Rank ?? '') && !/!.*Vigil/i.test(text)) {
      text = wo
    }
  }

  if (ltype1960 === LT1960_SANCTORAL && n === 4) {
    if (state.day.winnerSections.Lectio94 !== undefined) {
      const wl = winnerOf(state, lang)
      text = wl.Lectio94 ?? ''
    } else {
      let i = 5
      while (i < 7) {
        const w1 = w[`Lectio${i}`]
        if (!w1 || /!/.test(w1)) break
        const m = /([\s\S]*?)_/.exec(text)
        if (m) text = m[1]
        text += w1
        i++
      }
    }
  }
  if ((ltype1960 || (/Sancti/i.test(state.day.winner) && state.day.rank < 2)) && n > 2) {
    n = 3
  }

  text = text.replace(/¶/, '')
  text = text.replace(/&teDeum\n*/g, '')

  if (
    !/Limit.*?Benedictio/i.test(rule) &&
    state.day.winnerSections['In Finem Lectio'] === undefined
  ) {
    text = text.replace(/~?\s*$/, '\n$Tu autem')
  }

  // Responsory.
  if (!tedeumRequired(state, n) || /^(?:Monastic|Ordo Praedicatorum)/.test(version)) {
    let s = ''
    let na = n

    if (
      /1960/.test(version) &&
      /tempora/i.test(state.day.winner) &&
      dayofweek === 0 &&
      /(Adv|Quad)/i.test(ctx.dayname[0]) &&
      na === 3
    ) {
      na = 9
    }

    if (contractScripture(state, n, true) && !/Monastic|Ordo Praedicatorum/i.test(version)) {
      na = 3
    }

    const scripL = state.day.scripturaSections
    if (/1955|1960/.test(version) && w[`Responsory${na} 1960`] !== undefined) {
      s = w[`Responsory${na} 1960`] ?? ''
    } else if (
      /Responsory Feria/i.test(rule) ||
      (/1960/.test(version) &&
        /scriptura1960/i.test(rule) &&
        state.day.winnerSections[`Responsory${na}`] === undefined)
    ) {
      if (scripL[`Responsory${na}`] !== undefined) {
        s = scripturaOf(state, lang)[`Responsory${na}`] ?? ''
      } else {
        s = scripturaOf(state, lang)[`Lectio${na}`] ?? ''
        const m = /\n_([\s\S]*?)/.exec(s)
        if (m) {
          s = `_${m[1]}`
        } else {
          s = ''
        }
      }
      if (!s && /1960/.test(version) && scripL[`Responsory${na} 1960`] !== undefined) {
        s = scripturaOf(state, lang)[`Responsory${na} 1960`] ?? ''
      }
    } else {
      if (w[`Responsory${na}`] !== undefined) {
        s = w[`Responsory${na}`] ?? ''
      } else if (
        /1960/.test(version) &&
        state.day.communeSections[`Responsory${na}`] !== undefined
      ) {
        s = communeOf(state, lang)[`Responsory${na}`] ?? ''
      }
      if (state.day.winnerSections[`Responsory${na}`] !== undefined) s = ''
    }

    if (!s) {
      let wr = winnerOf(state, lang)
      if (/C9/.test(state.day.winner) && na === 9) na = 91
      if (wr[`Responsory${na}`] !== undefined) s = wr[`Responsory${na}`] ?? ''
      if (!s) {
        wr = communeOf(state, lang)
        if (wr[`Responsory${na}`] !== undefined) s = wr[`Responsory${na}`] ?? ''
      }
    }
    if (alleluiaRequired(ctx.dayname[0], state.votive)) {
      s = await matinsLectioResponsoryAlleluia(state, s, lang)
    }
    s = await responsoryGloria(state, s, n, lang)
    text = text.replace(/\s*$/, `\n_\n${s}`)
  }

  text = text.replace(/^_/, '')

  // Add the initial.
  if (!/^!/m.test(text)) {
    text = text.replace(/^(?=\p{L})/u, 'v. ')
  } else if (!/^\d/m.test(text)) {
    text = text.replace(/^!.*?\n(?=\p{L})/gmu, (m) => `${m}v. `)
  }

  // Title + verse numbers.
  let item = await state.texts.translate('Lectio', lang)
  if (!item.includes('%s')) item += ' %s'
  if (!/Lectio brevis sine absolutio/.test(rule)) {
    text = `${!/Limit.*?Benedictio/i.test(rule) ? '_\n' : ''}!!${item.replace(/%s/, String(n))}\n${text}`
  }
  const lines = text.split(/\n+/)
  text = ''
  let initial = false // $nonumbers = 0
  for (let li = 0; li < lines.length; li++) {
    let line = lines[li]
    const m = /^([0-9]+)\s+([\s\S]*)/.exec(line)
    if (m) {
      let rest = m[2]
      let numStr = `\n/:${m[1]}:/`
      rest = rest.replace(/^./, (c) => c.toUpperCase())
      if (initial) {
        numStr = '\nv. '
        initial = false
      }
      line = `${numStr} ${rest}`
    } else {
      line = `\n${line}`
    }
    text += line
  }

  if (!/Latin/i.test(lang)) {
    text = await processInlineAlleluias(state, text, lang, /Pasc/.test(ctx.dayname[0]))
    text = text.replace(/\(([^(]*?[.,\d][^(]*?)\)/g, (_m, t: string) => parenthesisedText(t))
  }

  text = replaceNdot(state, text, lang)
  if (tedeumRequired(state, n)) text += '\n_\n&teDeum\n'

  return text
}

// Port of lectiones_ex3_fiunt4.
function lectionesEx3Fiunt4(scrip: Sections, n: number): string {
  const scrips: string[] = []
  for (const l0 of [1, 2, 3]) {
    const cc = scrip[`Lectio${l0}`] ?? ''
    if (!cc.includes('¶')) {
      scrips.push(cc)
    } else {
      const m = /(¶\s)/.exec(cc)
      if (m) scrips.push(...cc.split(m[1]))
      else scrips.push(cc)
    }
  }
  return scrips[n - 1] ?? ''
}

// Port of getantmatutinum.
async function getantmatutinum(state: HoursState, lang: string): Promise<[string, number]> {
  const { version } = state.day.ctx
  let nocturns = [1, 2, 3]
  let ppN = 3
  let target = 15
  let flag = false

  if (
    /monastic/i.test(version) &&
    !/Matutinum Romanum/i.test(state.day.winnerSections.Rule ?? '')
  ) {
    flag = !/1963/.test(version)
    ppN = 6
    target = 19
    if (/3 lectio/i.test(state.day.winnerSections.Rule ?? '')) {
      let i = state.day.ctx.dayofweek
      if (i > 3) i -= 3
      nocturns = [i, 0]
      target = 14
    }
  }

  const [wprop, cprop] = await getproprium(state, 'Ant Matutinum', lang, flag)
  if (!wprop) return ['', 0]

  let w = wprop
  const wpropLines = splitPerl(wprop)
  const out: string[] = []

  if (wpropLines.length < target) {
    for (const noc of nocturns) {
      if (wpropLines.length < ppN) ppN = wpropLines.length
      for (let k = 0; k < ppN; k++) out.push(wpropLines.shift() ?? '')
      if (!noc) break
      const [vers] = await getproprium(state, `Nocturn ${noc} Versum`, lang, true)
      out.push(...splitPerl(vers))
    }
    w = out.join('\n')
  }
  return [w, cprop]
}

// Port of ant_matutinum_paschal.
async function antMatutinumPaschal(
  state: HoursState,
  psalmiIn: string[],
  lang: string,
  proper: number,
): Promise<string[]> {
  const ctx = state.day.ctx
  const { version, dayofweek } = ctx
  let psalmi = [...psalmiIn]

  if (dayofweek || (/Pasc6/.test(ctx.dayname[0]) && /196/.test(version))) {
    if (!proper || /\/C10/.test(state.day.winner)) {
      psalmi = psalmi.map((p) => {
        const m = /;;([\s\S]*)/.exec(p)
        return m ? `;;${m[1]}` : p
      })
      psalmi[0] = (await alleluiaAnt(state, lang)) + (psalmi[0] ?? '')
      if (
        dayofweek &&
        /9 lectio/i.test(state.rule) &&
        (!/196/.test(version) || state.day.rank > 3) &&
        state.day.rank >= 2
      ) {
        psalmi[5] = (await alleluiaAnt(state, lang)) + (psalmi[5] ?? '')
        psalmi[10] = (await alleluiaAnt(state, lang)) + (psalmi[10] ?? '')
      }
    } else if (!/tempora/i.test(state.day.winner)) {
      const perNoct = /Monastic/.test(version) ? 8 : 5
      for (const i of [0, 1, 2, 3]) {
        const strip = (idx: number) => {
          if (psalmi[idx] !== undefined) psalmi[idx] = psalmi[idx].replace(/.*;;/, ';;')
        }
        strip(i * perNoct + 1)
        strip(i * perNoct + 2)
        if (/Monastic/.test(version)) {
          strip(i * perNoct + 3)
          strip(i * perNoct + 4)
          strip(i * perNoct + 5)
        }
      }
    }
  } else {
    if (
      /Pasc[1-5]/i.test(ctx.dayname[0]) &&
      /Dominica/.test(ctx.dayname[1]) &&
      !/Praedicatorum|Monastic/i.test(version)
    ) {
      const psalmiFile = await setup(state, lang, 'Psalterium/Psalmi/Psalmi matutinum')
      const a = splitPerl(psalmiFile.Pasch0)
      for (let i = 0; i < psalmi.length; i++) {
        psalmi[i] = psalmi[i].replace(/.*;;/, `${a[i] ?? ''}`)
      }
      if (/196/.test(version)) {
        for (let i = 1; i < psalmi.length; i++) {
          psalmi[i] = psalmi[i].replace(/.*;;/, ';;')
        }
      }
    }
  }
  return psalmi
}

// Port of psalmi_matutinum (Roman).
export async function psalmiMatutinum(state: HoursState, lang: string): Promise<void> {
  const ctx = state.day.ctx
  const { version, dayofweek, month, day } = ctx
  if (
    /monastic/i.test(version) &&
    !/Matutinum Romanum/i.test(state.day.winnerSections.Rule ?? '')
  ) {
    return psalmiMatutinumMonastic(state, lang)
  }
  const psalmiFile = await setup(state, lang, 'Psalterium/Psalmi/Psalmi matutinum')
  const d = /trident/i.test(version) ? 'Daya' : 'Day'
  const dw = dayofweek
  let psalmi = splitPerl(psalmiFile[`${d}${dw}`])
  let comment = 1
  let prefix = await state.texts.translate('Antiphonae', lang)

  if (dayofweek === 0 && /Adv/i.test(ctx.dayname[0])) {
    psalmi = splitPerl(psalmiFile[/Trident/i.test(version) ? 'Adv0' : 'Adv 0 Ant Matutinum'])
  }

  if (
    state.day.laudes === 2 &&
    dayofweek === 3 &&
    !/trident/i.test(version) &&
    !/12-24/i.test(state.day.winner)
  ) {
    psalmi = splitPerl(psalmiFile.Day31)
  }

  const name = gettempora(state, 'Psalmi Matutinum')

  if (
    name &&
    !/Trident/i.test(version) &&
    (/tempora/i.test(state.day.winner) || name === 'Nat' || name === 'Epi')
  ) {
    if (dayofweek === 0) {
      for (const i of [1, 2, 3]) {
        const parts = splitPerl(psalmiFile[`${name} ${i} Versum`])
        psalmi[(i - 1) * 5 + 3] = parts[0] ?? ''
        psalmi[(i - 1) * 5 + 4] = parts.slice(1).join('\n')
      }
      if (/1960/.test(version)) {
        psalmi[13] = psalmi[3]
        psalmi[14] = psalmi[4]
      }
    } else {
      let i = dayofweek
      if (i > 3) i -= 3
      const parts = splitPerl(psalmiFile[`${name} ${i} Versum`])
      psalmi[13] = parts[0] ?? ''
      psalmi[14] = parts.slice(1).join('\n')
    }
  }

  const [w, c] = await getantmatutinum(state, lang)
  if (w) {
    psalmi = splitPerl(w)
    comment = c
    prefix += ` ${await state.texts.translate('et Psalmi', lang)}`
  }

  if (/Pasc[1-6]/i.test(ctx.dayname[0]) && !/C9|C12/.test(state.votive)) {
    psalmi = await antMatutinumPaschal(state, psalmi, lang, w.length)
  }

  const antSpecial = /Ant Matutinum ([0-9]+) special/i.exec(state.rule)
  if (antSpecial) {
    const ind = Number(antSpecial[1])
    const wa = chompd(winnerOf(state, lang)[`Ant Matutinum ${ind}`])
    if (wa) {
      if (ind === 12 && /Pasc/i.test(ctx.dayname[0])) {
        psalmi[10] = (psalmi[10] ?? '').replace(/^.*?;;/, `${wa};;`)
      } else {
        psalmi[ind] = (psalmi[ind] ?? '').replace(/^.*?;;/, `${wa};;`)
      }
    }
  }

  await setcomment(state, state.label, 'Source', comment, lang, prefix)

  // Nine lessons.
  if (
    /9 lectio/i.test(state.rule) &&
    !gettype1960(state) &&
    state.day.rank >= 2 &&
    !(
      dayofweek > 0 &&
      /trident/i.test(version) &&
      /Dominica (?!infra.*(?:Nat|Epi))/i.test(state.day.winnerSections.Rank ?? '')
    )
  ) {
    if (state.day.winnerSections['Ant Matutinum'] === undefined) {
      if (
        (name === 'Pasch' || name === 'Asc') &&
        !/trident/i.test(version) &&
        state.day.rank < 5 &&
        !/(?:in|post).*octava.*Ascensio/i.test(state.day.winnerSections.Rank ?? '')
      ) {
        const dname = /Dominica/i.test(state.day.winnerSections.Rank ?? '') ? 'Dominica' : 'Feria'
        const spec = splitPerl(psalmiFile[`Pasch Ant ${dname}`])
        for (const i of [3, 4, 8, 9, 13, 14]) psalmi[i] = spec[i] ?? ''
      } else if (/tempora/i.test(state.day.winner) && /^(?:Adv|Quad|Pasch)$/i.test(name)) {
        for (const i of [1, 2, 3]) {
          const parts = splitPerl(psalmiFile[`${name} ${i} Versum`])
          psalmi[(i - 1) * 5 + 3] = parts[0] ?? ''
          psalmi[(i - 1) * 5 + 4] = parts.slice(1).join('\n')
        }
      }
    }

    for (const noc of [1, 2, 3]) {
      const select: number[] = []
      for (let k = (noc - 1) * 5; k < noc * 5; k++) select.push(k)
      await nocturn(state, noc, lang, psalmi, select)
      await lectiones(state, noc, lang)
    }
    state.s.push('\n')
    return
  }

  // Three lessons.
  let vers = ''
  const vn = dayofweek2i(state)

  if (
    /Pasc[1-6]/i.test(ctx.dayname[0]) &&
    !/Trident/i.test(version) &&
    !/C9|C12/.test(state.votive)
  ) {
    if (/196/.test(version) && name === 'Asc') {
      const r =
        (await setupstring(
          sessionWithLang(state.session, lang),
          `${subdirname('Tempora', version)}Pasc5-4`,
        )) ?? {}
      vers = r[`Nocturn ${vn} Versum`] ?? ''
    } else {
      vers = psalmiFile[`Pasch ${vn} Versum`] ?? ''
    }
  }

  const psalmIndices: (number | string)[] = [0, 1, 2]

  if (!vers) {
    vers = `${psalmi[13] ?? ''}\n${psalmi[14] ?? ''}`
    comment = 5
  }

  if (psalmi.length > 9) {
    psalmIndices.push(5, 6, 7, 10, 11, 12)
  }

  if (month === 12 && day === 24) {
    vers = psalmiFile['Nat24 Versum'] ?? ''
    comment = 1
  }

  if (/Pasc[07]/i.test(ctx.dayname[0])) {
    vers = `${psalmi[3] ?? ''}\n${psalmi[4] ?? ''}`
    comment = 2
  }

  if (/votive nocturn/i.test(state.rule)) {
    let i = dayofweek2i(state)
    i--
    i *= 5
    psalmIndices.length = 0
    psalmIndices.push(i, i + 1, i + 2)
  }

  psalmIndices.push(...chompd(vers).split('\n'))

  await nocturn(state, 0, lang, psalmi, psalmIndices)
  await lectiones(state, 0, lang)
}

// Port of monastic_lectio3.
function monasticLectio3(state: HoursState, w: string, lang: string): string {
  if (
    !/Sancti/i.test(state.day.winner) ||
    state.day.winnerSections.Lectio3 !== undefined ||
    state.day.rank >= 4 ||
    /(9|12) lectio/i.test(state.rule) ||
    /Lectio1 tempora/.test(state.rule)
  ) {
    return w
  }
  const wl = winnerOf(state, lang)
  if (wl.Lectio94 !== undefined) return wl.Lectio94 ?? ''
  if (wl.Lectio4 !== undefined) return wl.Lectio4 ?? ''
  return w
}

// Port of absolutio_benedictio (Monastic).
async function absolutioBenedictio(state: HoursState, lang: string): Promise<void> {
  const { version } = state.day.ctx
  let abs: string
  let ben: string

  if (/C10/.test(state.day.commune)) {
    const m = communeOf(state, lang)
    const a = splitPerl(m.Benedictio)
    abs = a[0] ?? ''
    ben = a[3] ?? ''
  } else {
    const benFile = await setup(state, lang, 'Psalterium/Benedictions')
    const i = dayofweek2i(state)
    const absList = splitPerl(benFile.Absolutiones)
    const a = splitPerl(benFile[`Nocturn ${i}`])
    abs = absList[dayofweek2i(state) - 1] ?? ''
    ben = a[3 - (i === 3 ? 1 : 0)] ?? ''
  }

  if (!/Cist/i.test(version)) {
    state.s.push('$rubrica Pater secreto')
    state.s.push('$Pater noster Et')
    state.s.push(`Absolutio. ${abs}`, '$Amen', '\n')
  }
  state.s.push(await state.texts.prayer('Jube domne', lang))
  state.s.push(`Benedictio. ${ben}`, '$Amen', '_')
}

// Port of legend_monastic.
async function legendMonastic(state: HoursState, lang: string): Promise<void> {
  await absolutioBenedictio(state, lang)
  const w = winnerOf(state, lang)
  let str: string

  if (w.Lectio94 !== undefined || w.Lectio93 !== undefined) {
    str = w.Lectio94 || w.Lectio93 || ''
  } else {
    str = w.Lectio4 ?? ''
    if (w.Lectio5 !== undefined && !/!/.test(w.Lectio5 ?? '')) {
      str += (w.Lectio5 ?? '') + (w.Lectio6 ?? '')
    }
  }

  str = str.replace(/&teDeum\s*/, '')
  str = str.replace(/^(?=\p{L})/u, 'v. ')
  state.s.push('#Lectio unica', str, '$Tu autem', '_')

  let resp = ''
  if (w.Responsory1 !== undefined) {
    resp = w.Responsory1 ?? ''
  } else {
    const c = communeOf(state, lang)
    resp = c.Responsory1 ?? 'Responsory for ne lesson not found!'
  }
  resp = await responsoryGloria(state, resp, 3, lang)
  if (alleluiaRequired(state.day.ctx.dayname[0], state.votive)) {
    resp = await matinsLectioResponsoryAlleluia(state, resp, lang)
  }
  state.s.push(resp)
}

// Port of brevis_monastic.
async function brevisMonastic(state: HoursState, lang: string): Promise<void> {
  await absolutioBenedictio(state, lang)
  let lectio = ''

  if (/C10/.test(state.day.commune)) {
    const c = communeOf(state, lang)
    const cname = getC10readingname(state)
    const resp = splitPerl(c.Responsory3)
    if (/Pasc/i.test(state.day.ctx.dayname[0])) {
      if (resp.length > 1) resp[1] = await ensureSingleAlleluia(state, resp[1], lang)
      resp[resp.length - 1] = await ensureSingleAlleluia(state, resp[resp.length - 1], lang)
    }
    lectio = [(c[cname] ?? '').replace(/.teDeum/, ''), '$Tu autem\n_', ...resp].join('\n')
  } else if (state.day.commune && !/C\d/.test(state.day.commune)) {
    const c = communeOf(state, lang)
    lectio = c['MM LB'] ?? ''
  } else {
    const b = await setup(state, lang, 'Psalterium/Special/Matutinum Special')
    lectio =
      b[
        `MM LB${/Pasc/.test(state.day.ctx.dayname[0]) ? ' Pasch' : String(state.day.ctx.dayofweek)}`
      ] ?? ''
  }
  lectio = lectio.replace(/&Gloria1?/, '&Gloria1')

  if (lectio) lectio = `#Lectio brevis\n${lectio}`
  state.s.push(lectio)
}

// Port of lectioE — the Gospel reading at Monastic Matins.
async function lectioE(state: HoursState, lang: string): Promise<string> {
  const { version } = state.day.ctx
  const w = winnerOf(state, lang)
  const com = communeOf(state, lang)
  let win = state.day.winner
  let evang = 'Evangelium'

  const loco = /in 3 Nocturno Lectiones ex Commune in (\d+) loco/i.exec(state.rule)
  if (loco && Number(loco[1]) > 1) evang += ` in ${loco[1]} loco`

  win = win.replace(/(?:M|OP|Cist)/g, '')
  const missaSession = { ...sessionWithLang(state.session, lang), area: 'missa' as const }
  const missa = (await setupstring(missaSession, win.replace(/\.txt$/, ''))) ?? {}

  let e: string[]
  if (w.Evangelium !== undefined) {
    e = splitPerl(w.Evangelium)
  } else if (missa.Evangelium !== undefined) {
    e = splitPerl(missa.Evangelium)
  } else if (com[evang] !== undefined) {
    e = splitPerl(com[evang])
  } else if (com.Evangelium !== undefined) {
    e = splitPerl(com.Evangelium)
  } else {
    e = ['']
  }

  if (!e[0] || e[0].startsWith('@')) {
    const ref = (e[0] ?? '').replace(/^@/, '')
    const [wrefName0, s0] = ref.split(':')
    const wrefName = wrefName0 || state.day.winner
    const s = s0 || 'Evangelium'
    const wref =
      (await setupstring(sessionWithLang(state.session, lang), wrefName.replace(/\.txt$/, ''))) ??
      {}
    const mrefName = wrefName.replace(/(?:M|OP)/g, '')
    const mref =
      (await setupstring(
        { ...sessionWithLang(state.session, lang), area: 'missa' as const },
        mrefName.replace(/\.txt$/, ''),
      )) ?? {}

    if (wref[s] !== undefined) {
      e = splitPerl(wref[s])
    } else if (mref[s] !== undefined) {
      e = splitPerl(mref[s])
    } else {
      e = ['Sequéntia ++ sancti Evangélii secúndum /:...:/', '!...', 'In illo témpore: /:...:/']
    }
  }

  let begin = e.shift() ?? ''
  begin += `\n${e.shift() ?? ''}`

  if (/^Monastic/.test(version)) {
    begin = begin.replace(/\++/, '++')
    begin += `\nR. ${await state.texts.translate('Gloria tibi Domine', lang)}`
  }

  e = e.filter((l) => !/^!/.test(l))
  if (e.length > 0) e[0] = e[0].replace(/^(v\. )?/, 'v. ')

  return ['v. ' + begin, e.join(' ')].join('\n')
}

// Port of psalmi_matutinum_monastic.
export async function psalmiMatutinumMonastic(state: HoursState, lang: string): Promise<void> {
  const ctx = state.day.ctx
  const { version, dayofweek, month, day } = ctx
  state.psalmnum1 = -1
  state.psalmnum2 = -1

  const psalmiFile = await setup(state, lang, 'Psalterium/Psalmi/Psalmi matutinum')
  let psalmi = splitPerl(psalmiFile[`Daym${dayofweek}`])

  if (dayofweek === 5) {
    // replace 92 99
    if (
      state.day.winnerSections['Ant Laudes'] ||
      (state.day.communetype === 'ex' && state.day.communeSections['Ant Laudes'])
    ) {
      psalmi[4] = (psalmi[4] ?? '').replace(/92!/, '')
      psalmi[12] = (psalmi[12] ?? '').replace(/.*99!/, '')
    } else {
      psalmi[4] = (psalmi[4] ?? '').replace(/!75/, '')
      psalmi[12] = (psalmi[12] ?? '').replace(/99![\s\S]*/, '99')
    }
  }
  let comment = 1
  let prefix = await state.texts.translate('Antiphonae', lang)
  const name = gettempora(state, 'Psalmi Matutinum Monastic')

  // Special Adv/Pasch Sunday antiphons.
  if (dayofweek === 0 && /^(Adv|Pasch)$/i.test(name)) {
    psalmi = splitPerl(psalmiFile[`${name}m0`])
  }

  // Special antiphons for non-Quad weekdays.
  if ((dayofweek > 0 && !/Quad/i.test(ctx.dayname[0])) || /Pasc6-0/.test(state.day.winner)) {
    const start = /Pasc|Nat[23]\d/i.test(ctx.dayname[0]) ? 0 : 8
    let p: string[] = []
    if (/Pasc/.test(ctx.dayname[0])) {
      p = splitPerl(psalmiFile['Daym Pasch'])
    } else if (/Nat[23]\d/.test(ctx.dayname[0])) {
      p = splitPerl(psalmiFile['Daym Nat'])
    }

    for (let i = start; i < 14; i++) {
      let pv = p[i] ?? ''
      const m = /;;([\s\S]*)/.exec(psalmi[i] ?? '')
      if (m) pv = `;;${m[1]}`
      if (i === 0 || i === 8) {
        if (!/Nat[23]\d|Pasc0/.test(ctx.dayname[0])) {
          pv = (await alleluiaAnt(state, lang)) + pv
        } else {
          pv = `${p[i] ?? ''}${pv}`
        }
      }
      psalmi[i] = pv
    }
  }

  // Versicle changes for Adv, Quad, Quad5, Pasch.
  if (name && (/^Tempora/.test(state.day.winner) || /^(Nat|Epi)$/.test(name))) {
    let i = dayofweek || 1
    if (i > 3) i -= 3

    if (name !== 'Asc') {
      const parts = splitPerl(psalmiFile[`${name} ${i} Versum`])
      psalmi[6] = parts[0] ?? ''
      psalmi[7] = parts[1] ?? ''
      if (dayofweek === 0) {
        const p2 = splitPerl(psalmiFile[`${name} 2 Versum`])
        psalmi[14] = p2[0] ?? ''
        psalmi[15] = p2[1] ?? ''
        const p3 = splitPerl(psalmiFile[`${name} 3 Versum`])
        psalmi[17] = p3[0] ?? ''
        psalmi[18] = p3[1] ?? ''
      }
    } else {
      const c = communeOf(state, lang)
      const parts = splitPerl(c[`Nocturn ${i} Versum`])
      psalmi[6] = parts[0] ?? ''
      psalmi[7] = parts[1] ?? ''
      if (dayofweek === 0) {
        const p2 = splitPerl(c['Nocturn 2 Versum'])
        psalmi[14] = p2[0] ?? ''
        psalmi[15] = p2[1] ?? ''
        const p3 = splitPerl(c['Nocturn 3 Versum'])
        psalmi[17] = p3[0] ?? ''
        psalmi[18] = p3[1] ?? ''
      }
    }
  }

  if (month === 12 && day === 24) {
    const parts = splitPerl(psalmiFile['Nat24 Versum'])
    if (dayofweek) {
      psalmi[6] = parts[0] ?? ''
      psalmi[7] = parts[1] ?? ''
    } else {
      psalmi[17] = parts[0] ?? ''
      psalmi[18] = parts[1] ?? ''
    }
    comment = 1
  }

  // Special cantica in Quad — Perl bug-compatible: `my $c = split(...)` takes
  // the COUNT, then `$c[$i]` reads the unrelated global @c (empty), so the
  // three canticle lines are simply blanked.
  if (state.day.winnerSections.Cantica !== undefined) {
    for (let i = 0; i < 3; i++) psalmi[i + 16] = ''
  }

  const is12 =
    (state.day.rank > 4.9 ||
      /C8/.test(state.votive) ||
      (state.day.rank >= 4 && /divino/i.test(version)) ||
      (state.day.rank >= 2 && /trident/i.test(version))) &&
    (state.day.duplex === 3 || !/feria|sabbato|Die.*infra octavam/i.test(ctx.dayname[1]))

  if (
    is12 &&
    !(/Pasc0/.test(ctx.dayname[0]) && dayofweek > 2) &&
    !/Pasc6-6|01-05/i.test(state.day.winner) &&
    !(/infra.*Nativitatis/i.test(ctx.dayname[1]) && dayofweek > 0 && !/196/.test(version))
  ) {
    const [w, c] = await getantmatutinum(state, lang)
    if (w) {
      psalmi = splitPerl(w)
      comment = c
      prefix += ` ${await state.texts.translate('et Psalmi', lang)}`
    }

    if (/Pasc[1-6]/i.test(ctx.dayname[0]) && !/C9|C12/.test(state.votive)) {
      psalmi = await antMatutinumPaschal(state, psalmi, lang, w.length)
    }

    const antSpecial = /Ant Matutinum ([0-9]+) special/i.exec(state.rule)
    if (antSpecial) {
      const ind = Number(antSpecial[1])
      const wa = winnerOf(state, lang)[`Ant Matutinum ${ind}`]
      if (wa) {
        if (ind === 12 && /Pasc/i.test(ctx.dayname[0])) {
          psalmi[8] = (psalmi[8] ?? '').replace(/^.*?;;/, `${wa};;`)
        } else {
          psalmi[ind] = (psalmi[ind] ?? '').replace(/^.*?;;/, `${wa};;`)
        }
      }
    }
  } else if (
    (/(?:Die|Feria|Sabbato).*infra octavam|post Octavam Asc|Quattuor Temporum Pent/i.test(
      ctx.dayname[1],
    ) ||
      (/in Vigilia (?:Pent|Epi)/i.test(ctx.dayname[1]) && !/196/.test(version))) &&
    !(/Pasc0/.test(ctx.dayname[0]) && dayofweek > 2)
  ) {
    if (state.day.winnerSections['Ant Matutinum'] !== undefined) {
      const [w] = await getantmatutinum(state, lang)
      const p = splitPerl(w)
      for (let i = 0; i < p.length; i++) {
        let pv = p[i] ?? ''
        const m = /;;([\s\S]*)/.exec(psalmi[i] ?? '')
        if (m) pv = `;;${m[1]}`
        if (i === 0 || i === 8) {
          pv = `${p[i] ?? ''}${pv}`
        }
        psalmi[i] = pv
      }
    }
  }
  await setcomment(state, state.label, 'Source', comment, lang, prefix)

  await nocturn(state, 1, lang, psalmi, [0, 1, 2, 3, 4, 5, 6, 7])

  const twelveLessons =
    (/12 lectiones/.test(state.rule) ||
      (((state.day.rank >= 4 && /divino/i.test(version)) ||
        (state.day.rank >= 2 && /trident/i.test(version))) &&
        !/feria|sabbato|infra octavam/i.test(ctx.dayname[1]) &&
        !/3 lectiones/i.test(state.rule))) &&
    !(dayofweek > 0 && /Dominica (?!infra.*(?:Nat|Epi))/i.test(state.day.winnerSections.Rank ?? ''))

  if (twelveLessons) {
    await lectiones(state, 1, lang)
  } else if (
    /(Pasc[1-6]|Pent)/i.test(ctx.dayname[0]) &&
    !/^11[1-5]-/.test(monthday(day, month, ctx.year, /196/.test(version), false)) &&
    !/vigil|quat(t?)uor|infra octavam|post octavam asc|Dominica/i.test(
      state.day.winnerSections.Rank ?? '',
    ) &&
    (!/secunda.*roga/i.test(state.day.winnerSections.Rank ?? '') || /196/.test(version)) &&
    !/3 lectiones/.test(state.rule)
  ) {
    if (await initiarule(state)) {
      await lectiones(state, 0, lang)
    } else if (
      /Tempora/i.test(state.day.winner) ||
      !(
        state.day.winnerSections.Lectio94 !== undefined ||
        state.day.winnerSections.Lectio93 !== undefined ||
        state.day.winnerSections.Lectio4 !== undefined
      )
    ) {
      await brevisMonastic(state, lang)
    } else {
      await legendMonastic(state, lang)
    }
    state.s.push('\n')
  } else {
    await lectiones(state, 0, lang)
  }

  if (
    !(
      /12 lectiones/.test(state.rule) ||
      (((state.day.rank >= 4 && /divino/i.test(version)) ||
        (state.day.rank >= 2 && /trident/i.test(version))) &&
        !/feria|sabbato|infra octavam/i.test(ctx.dayname[1]) &&
        !/3 lectiones/i.test(state.rule))
    ) ||
    (dayofweek > 0 && /Dominica (?!infra.*(?:Nat|Epi))/i.test(state.day.winnerSections.Rank ?? ''))
  ) {
    psalmi[14] = ''
    psalmi[15] = ''
  }
  await nocturn(state, 2, lang, psalmi, [8, 9, 10, 11, 12, 13, 14, 15])

  if (twelveLessons) {
    await lectiones(state, 2, lang)

    // Third nocturn canticles (sub una antiphona).
    let [ant, p] = (psalmi[16] ?? '').split(';;')
    const wsec = winnerOf(state, lang)
    if (
      state.day.winnerSections['Ant Matutinum 3N'] !== undefined ||
      state.day.communeSections['Ant Matutinum 3N'] !== undefined
    ) {
      const t = splitPerl(wsec['Ant Matutinum 3N'] || communeOf(state, lang)['Ant Matutinum 3N'])
      for (let i = 0; i < t.length; i++) psalmi[16 + i] = t[i]
      const [a1, p1] = (psalmi[16] ?? '').split(';;')
      ant = a1
      p = p1 || p
    }
    p = (p ?? '').replace(/[(-]/g, ',')
    p = p.replace(/\)/g, '')

    ant = await postprocessAnt(state, ant ?? '', lang)
    psalmi[16] = `${ant};;${p}`

    await nocturn(state, 3, lang, psalmi, [16, 17, 18])
    await lectiones(state, 3, lang)

    state.s.push(
      await lectioE(state, lang),
      `R. ${await state.texts.translate('Amen', lang)}`,
      '_',
      '$Te decet',
    )
    return
  }

  // End the second nocturn of the ferial office: MM Capitulum.
  let [w] = await getproprium(state, 'MM Capitulum', lang, false)
  if (!w && state.day.commune) {
    const c = communeOf(state, lang)
    w = c['MM Capitulum'] ?? ''
  }
  if (!w) {
    const cname = gettempora(state, 'MM Capitulum')
    const sfile = await setup(state, lang, 'Psalterium/Special/Matutinum Special')
    w = sfile[`MM Capitulum${cname}`] ?? ''
  }
  if (/Pasc/.test(ctx.dayname[0])) {
    w = await postprocessVr(state, w, lang)
  }
  state.s.push('!!Capitulum', w, '\n')
}
