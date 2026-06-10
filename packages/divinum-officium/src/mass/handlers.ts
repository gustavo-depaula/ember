// Port of missa/propers.pl: the ScriptFunc handlers (&introitus, &collect, …),
// the oratio/commemoration machinery (setcc/getcc/delconclusio), and their
// helpers. Translated statement-for-statement from the Perl; HTML font calls
// are replaced by plain-text markers handled later by the block mapper:
//   setfont(largefont, x)  → x kept inline (rendered big by '!!' heads)
//   setfont(smallfont, x)  → '(x)' retained as a rubric parenthesis
// Rubrics are always on in the engine (state.rubrics = true).

import { monthday } from '../kalendar/date'
import { nooctnat } from '../kalendar/occurrence'
import { officestring, sessionWithLang } from '../kalendar/officestring'
import { num, subdirname } from '../kalendar/state'
import { type Sections, setupstring } from '../references/resolve'
import { chompd, commemoratioOf, communeOf, type MassState, winnerOf } from './state'

async function setup(state: MassState, lang: string, fname: string): Promise<Sections> {
  return (
    (await setupstring(sessionWithLang(state.session, lang), fname.replace(/\.txt$/, ''))) ?? {}
  )
}

async function office(state: MassState, lang: string, fname: string, flag = false) {
  return (await officestring(state.day.state, lang, fname, flag)) ?? {}
}

// ---------------------------------------------------------------------------
// Small shared helpers
// ---------------------------------------------------------------------------

export function deTemporePassionis(state: MassState): boolean {
  const { ctx } = state.day
  return (
    (/Quad5/i.test(ctx.dayname[0]) || (/Quad6/.test(ctx.dayname[0]) && ctx.dayofweek < 6)) &&
    /Tempora/i.test(state.day.winner) &&
    !/Septem Dolorum/i.test(state.day.winnerSections.Rank ?? '')
  )
}

export function worldMissionSunday(state: MassState): boolean {
  const { ctx } = state.day
  return (
    /Divino|1955|196/.test(ctx.version) &&
    /Dominica/i.test(state.day.winnerSections.Rank ?? '') &&
    monthday(ctx.day, ctx.month, ctx.year, true, false) === '104-0'
  )
}

// Port of papal_rule / papal_prayer (horascommon.pl).
function papalRule(rule: string, commemoration = false): [string, string, string] | undefined {
  const classchar = commemoration ? 'C' : 'O'
  const m = new RegExp(`${classchar}Papa(e)?([CMD])=(.*?);`, 'i').exec(rule)
  if (!m) return undefined
  return [m[1] ?? '', m[2], m[3]]
}

async function papalPrayer(
  state: MassState,
  lang: string,
  plural: string,
  cls: string,
  name: string,
  type = 'Oratio',
): Promise<string> {
  const version = state.day.ctx.version
  const common = await setup(state, lang, `${subdirname('Commune', version)}C4b`)
  const numSuffix = plural && type === 'Oratio' ? '91' : ''
  let prayer = common[`${type}${numSuffix}`] ?? ''
  prayer = prayer.replace(/ N\.([a-z ]+N\.)*/, ` ${name}`)
  if (!/M/i.test(cls)) {
    prayer = prayer.replace(/\s*\((.|~[\s\n\r]*)*?\)/, '')
  } else {
    prayer = prayer.replace(/[()]/g, '')
  }
  return prayer
}

function checkCoronatio(day: number, month: number): string {
  return day === 18 && month === 5 ? 'Commune/Coronatio' : ''
}

// Port of replaceNdot.
function replaceNdot(state: MassState, s: string, lang: string, name?: string): string {
  if (!/N\./.test(s)) return s
  let n = name
  if (!n) n = winnerOf(state, lang).Name
  if (!n) n = commemoratioOf(state, lang).Name
  if (n) {
    n = n.replace(/[\r\n]/g, '')
    let out = s.replace(/N\. .*? N\./, n)
    out = out.replace(/N\./, n)
    return out
  }
  return s
}

export function replaceNpb(
  s: string,
  pb: string,
  lang: string,
  letter: string,
  ending: string,
): string {
  const parts = pb.split(',')
  let name = /Latin/i.test(lang) ? parts[0] : /English/i.test(lang) ? parts[1] : parts[2]
  name ||= 'N.'
  if (/Latin/i.test(lang)) {
    let e = ending
    if (e === 'um' && /e$/.test(name)) e = 'em'
    if (e === 'o' && /e$/.test(name)) e = 'e'
    name = name.replace(/[eo]$/, e)
  }
  return s.split(`N.${letter}`).join(name)
}

// Port of norubr — strips '!' rubric lines but keeps '!!' heads.
function norubr(state: MassState, t: string): string {
  if (state.rubrics) return t
  let out = t.replace(/!!/g, '``')
  out = out.replace(/\n!.*?\n/g, '\n')
  out = out.replace(/\n!.*?\n/g, '\n')
  return out.replace(/``/g, '!!')
}

export function norubr1(state: MassState, t: string): string {
  if (state.rubrics) {
    // setfont(smallfont, …) — keep the parenthesis as a rubric marker.
    return t
  }
  return t.replace(/^\s*!(?!!).*?\n/gm, '').replace(/\(.*?\)/g, '')
}

// ---------------------------------------------------------------------------
// getitem — proper sections with seasonal Graduale handling
// ---------------------------------------------------------------------------

async function getitem(state: MassState, type: string, lang: string): Promise<string> {
  const { ctx } = state.day
  let w = winnerOf(state, lang)
  let item = w[type] ?? ''
  if (/Graduale/i.test(type) && /Pasc/i.test(ctx.dayname[0]) && w.GradualeP !== undefined) {
    item = w.GradualeP
  }
  if (/Graduale/i.test(type) && /Quad/i.test(ctx.dayname[0]) && w.Tractus !== undefined) {
    item = w.Tractus
  }

  if (!item) {
    w = communeOf(state, lang)
    item = w[type] ?? ''
    if (/Graduale/i.test(type) && /Pasc/i.test(ctx.dayname[0]) && w.GradualeP !== undefined) {
      item = w.GradualeP
    }
    if (/Graduale/i.test(type) && /Quad/i.test(ctx.dayname[0]) && w.Tractus !== undefined) {
      item = w.Tractus
    }
  }

  if (!item && /Tempora/i.test(state.day.winner)) {
    let name = `${ctx.dayname[0]}-0`
    if (/(Epi1|Nat)/i.test(name)) name = 'Epi1-0a'
    if (/Pent01/i.test(name)) name = 'Pent01-0a'
    const sunday = await office(state, lang, `${subdirname('Tempora', ctx.version)}${name}.txt`)
    item = sunday[type] ?? ''
    if (/Graduale/i.test(type) && ctx.dayofweek > 0 && sunday.GradualeF !== undefined) {
      item = sunday.GradualeF
    }
  }
  if (!item) item = `${type} missing!\n`

  if (/Pasc/i.test(ctx.dayname[0])) {
    item = item.replace(/\((Al+[eé].*?)\)/gi, '$1')
    item = item.replace(/\((Аліл.*?)\)/gi, '$1')
  } else {
    item = item.replace(/\(Al+[eé].*?\)/gi, '')
    item = item.replace(/\(Аліл.*?\)/gi, '')
  }
  // Remaining single parens are rubrics (kept; rubrics always on). Collapse
  // doubled parens like the Perl.
  item = item.replace(/\(\(/g, '(').replace(/\)\)/g, ')')
  return item
}

// ---------------------------------------------------------------------------
// oratio machinery
// ---------------------------------------------------------------------------

// Port of setcc.
function setcc(state: MassState, str: string, code: number, c: Sections): void {
  const version = state.day.ctx.version
  const rank = (state.day.winnerSections.Rank ?? '').split(';;')

  if (
    /196/.test(version) &&
    (num(rank[2]) >= 5 || (/Feria/i.test(state.day.dayname[1]) && num(rank[2]) >= 4)) &&
    state.ccind > 0 &&
    nooctnat(state.day.state)
  ) {
    return
  }
  if (/1955|196/.test(version) && state.ccind >= 3) return

  let key = 90
  const cRank = c.Rank ?? ''
  const inner = /;;([2-7])/.exec(cRank)
  if (/Dominica/i.test(cRank) && code < 10) key = 10
  else if (/;;Feria/i.test(cRank) && /;;[23456]/.test(cRank)) key = 50
  else if (/infra Octav/i.test(cRank)) key = 40
  else if (/Vigilia com/i.test(cRank) || code % 10 === 3) key = 60
  else if (inner && code < 10) key = 30 + (8 - Number(inner[1]))
  else if (/;;1/.test(cRank) || code >= 10) {
    key = 80
    if (worldMissionSunday(state)) key = 99
  }
  const comkey = /Comkey=([0-9]+)/i.exec(c.Rule ?? '')
  if (comkey) key = Number(comkey[1])

  let keyStr = String(key)
  keyStr += code % 10 !== 1 ? '0' : '1'
  keyStr += String(state.ccind)
  state.ccind++
  state.cc.set(keyStr, str)
}

// Port of getcc.
function getcc(state: MassState, retvalue: string): string {
  let out = retvalue
  for (const key of [...state.cc.keys()].sort()) {
    if (Number(key) > 999) out += delconclusio(state, state.cc.get(key) ?? '')
  }
  return out
}

// Port of delconclusio.
function delconclusio(state: MassState, ostrIn: string): string {
  const version = state.day.ctx.version
  state.ctotalnum++
  if (/(1955|196)/.test(version) && state.day.rank >= 5 && state.ctotalnum > 2) return ''
  if (/196/.test(version) && state.ctotalnum > 3) return ''

  let ostr = ostrIn
  if (/\n_\s*\n!/s.test(ostr) && !/\$Oremus/.test(ostr)) state.ctotalnum++
  const lines = ostr.split('\n')
  ostr = ''
  if (state.oremusflag) {
    ostr = state.oremusflag
    state.oremusflag = ''
  }
  for (const line of lines) {
    if (/\$Oremus/.test(line)) {
      state.ctotalnum++
      continue
    }
    if (/^\$/.test(line)) {
      state.addconclusio = `${line}\n`
      continue
    }
    ostr += `${line}\n`
  }
  return ostr
}

// Port of getcommemoratio.
async function getcommemoratio(
  state: MassState,
  wday: string,
  type: string,
  lang: string,
): Promise<string> {
  const { ctx } = state.day
  const w = await office(state, lang, wday)
  if (/no commemoratio/i.test(state.rule)) return ''
  const rank = (w.Rank ?? '').split(';;')
  if (/Feria/.test(rank[1] ?? '') && num(rank[2]) < 2) return ''

  let c: Sections = {}
  const exm = /(ex|vide)\s+(.*)\s*$/i.exec(rank[3] ?? '')
  if (exm) {
    let file = exm[2]
    if (/^C[0-9]+$/.test(file) && /Pasc/i.test(ctx.dayname[0])) file += 'p'
    if (/(?:[a-z\s]*\/)?C[0-9]+/.test(file)) file = `Commune/${file}`
    c = await setup(state, lang, file)
  }
  if (!rank[0]) rank[0] = w.Officium ?? ''
  let o = w[type] ?? ''
  if (!o) o = c[type] ?? ''

  if (/N\./.test(o) && w.Name !== undefined) {
    let names = w.Name.split('\n')
    if (new RegExp(`${type}=`).test(w.Name)) names = names.filter((n) => n.includes(`${type}=`))
    const name = (names[0] ?? '').replace(/^.*?=/, '')
    o = replaceNdot(state, o, lang, name)
  }

  if (!o && /Oratio Dominica/i.test(w.Rule ?? '')) {
    const sday = wday.replace(/-[0-9]/, '-0').replace(/Epi1-0/, 'Epi1-0a')
    const w1 = await office(state, lang, sday)
    o = w1[`${type}W`] ?? w1[type] ?? ''
  }

  if (!/Trident/i.test(ctx.version)) {
    const papal = papalRule(w.Rule ?? '')
    if (papal) o = await papalPrayer(state, lang, papal[0], papal[1], papal[2], type)
  }
  if (!o) return ''
  let comm = await state.texts.translate('Commemoratio', lang)
  comm = comm.replace(/\s$/, '')
  return `!${comm} ${rank[0]}\nv. ${o}\n`
}

// Port of commemoratio() — commemorations carried inside an office's own
// 'Commemoratio <type>' section.
async function commemoratioFromOffice(
  state: MassState,
  item: string,
  type: string,
  lang: string,
): Promise<void> {
  const { ctx } = state.day
  const version = ctx.version
  if (
    state.day.rank > 6.9 ||
    (/(1955|196)/.test(version) &&
      /Dominica/i.test(state.day.winnerSections.Rank ?? '') &&
      !worldMissionSunday(state))
  ) {
    return
  }
  if (/no commemoratio/i.test(state.rule)) return

  let w: Sections = {}
  let code = 10
  let ite = ''
  if (/winner/i.test(item)) {
    w = winnerOf(state, lang)
    ite = state.day.winner
  } else if (/commemoratio1/i.test(item)) {
    w = await office(state, lang, state.day.commemoratio1)
    code = 11
    ite = state.day.commemoratio1
  } else if (/commemoratio/i.test(item)) {
    w = commemoratioOf(state, lang)
    code = 22
    ite = state.day.commemoratio
  } else if (/commemorated/i.test(item)) {
    w = await office(state, lang, state.day.commemorated)
    code = 13
    ite = '' // Perl reads the never-set $commemoratio2 here.
  }

  let text = w[`Commemoratio ${type}`] ?? ''
  if (
    /(1955|196)/.test(version) &&
    /!.*?(Octav|Dominica)/i.test(text) &&
    !/Octav.*?Nativ/i.test(text)
  ) {
    return
  }
  if (/(1955|196)/.test(version) && /!.*?Vigil/i.test(text) && /no Vigil1960/i.test(state.rule)) {
    return
  }
  if (
    text &&
    /1955|196/.test(version) &&
    /!.*?Vigil/i.test(text) &&
    /Sancti/i.test(ite) &&
    !/(08-14|06-23|06-28|08-09)/.test(ite)
  ) {
    text = ''
  }
  if (text) {
    setcc(state, text, code, w)
  }
}

// Port of LectionesTemporum — ember-day readings preceding the collect.
async function lectionesTemporum(state: MassState, lang: string): Promise<string> {
  const m = /LectioL([0-9])/i.exec(state.day.winnerSections.Rule ?? '')
  if (!m) return ''
  const n = Number(m[1])
  const w = winnerOf(state, lang)
  let s = ''
  for (let i = 1; i <= n; i++) {
    s += `\n_\n#${await state.texts.translate('Lectio', lang)}\n`
    s += `${w[`LectioL${i}`] ?? ''}\n_\n`
    if (w[`GradualeL${i}`] !== undefined) {
      s += `\n#${await state.texts.translate('Graduale', lang)}\n`
      s += `${w[`GradualeL${i}`]}\n_\n`
    }
    s += `#${await state.texts.translate('Oratio', lang)}\n`
    if (i === n) s += await dominusVobiscum(state, lang, 1)
    s += '$Oremus\n'
    if (i < n && !/Pasc/i.test(state.day.ctx.dayname[0])) {
      s += await state.texts.prayer('Flectamus', lang)
    }
    s += `${w[`OratioL${i}`] ?? ''}\n_\n_\n`
  }
  // Inline parens stay as rubric markers (rubrics on); '#' heads become '!!'.
  return s.replace(/#/g, '!!')
}

// Port of checksuffragium (missa variant; $seasonalflag is unset for missa).
function checksuffragium(state: MassState): boolean {
  if (/no suffragium/i.test(state.rule)) return false
  return true
}

// Port of translate_label.
export async function translateLabel(
  state: MassState,
  item: string,
  lang: string,
): Promise<string> {
  if (
    /Gradual/i.test(item) &&
    /Pasc[1-5]/i.test(state.day.ctx.dayname[0]) &&
    !/Defunct|C9/i.test(state.day.winner)
  ) {
    return state.texts.translate('Alleluia', lang)
  }
  return /Latin/.test(lang) ? item : state.texts.prayer(item, lang)
}

// Port of setcomment — chapter headline {comment} suffix from Ordo/Comment.txt.
async function setcomment(
  state: MassState,
  label: string,
  comment: string,
  ind: number,
  lang: string,
): Promise<void> {
  let index = ind
  if (/Source/i.test(comment) && state.votive) index = 7
  const translated = await translateLabel(state, label, lang)
  const comm = await setup(state, lang, 'Ordo/Comment')
  const commentText = (comm[comment] ?? '').split('\n')[index] ?? ''
  let line = translated
  if (/\}\s*/.test(line)) {
    line = line.replace(/\}\s*$/, ` ${commentText}}`)
  } else {
    line += `{${commentText}}`
  }
  state.s.push(line)
}

// Port of oratio() — collect/secret/postcommunion with commemorations.
async function oratio(state: MassState, lang: string, type: string): Promise<string> {
  const { ctx } = state.day
  const version = ctx.version
  state.cc = new Map()
  state.ccind = 0
  state.ctotalnum = 0
  state.addconclusio = ''

  let w: Sections = winnerOf(state, lang)
  const comment = /sancti/i.test(state.day.winner) ? 3 : 2
  await setcomment(state, state.label, 'Source', comment, lang)

  if (/Oratio Dominica/i.test(state.rule) && w[type] === undefined) {
    let name = `${ctx.dayname[0]}-0`
    if (/(Epi1|Nat)/i.test(name)) name = 'Epi1-0a'
    w = await office(state, lang, `${subdirname('Tempora', version)}${name}.txt`)
  }

  let text = ctx.dayofweek > 0 && w[`${type}W`] !== undefined ? w[`${type}W`] : (w[type] ?? '')

  if (!text && state.day.commune) {
    const com = communeOf(state, lang)
    text = com[type] ?? ''
  }

  if (/N\./.test(text) && w.Name !== undefined) {
    let names = w.Name.split('\n')
    if (new RegExp(`${type}=`).test(w.Name)) names = names.filter((n) => n.includes(`${type}=`))
    const name = (names[0] ?? '').replace(/^.*?=/, '')
    text = replaceNdot(state, text, lang, name)
  }

  if (!/Trident/i.test(version)) {
    const papal = papalRule(w.Rule ?? '')
    if (papal) text = await papalPrayer(state, lang, papal[0], papal[1], papal[2], type)
  }

  if (/tempora/i.test(state.day.winner) && !text) {
    const name = `${ctx.dayname[0]}-0`
    const w1 = await office(state, lang, `${subdirname('Tempora', version)}${name}.txt`)
    text = w1[type] ?? ''
  }
  if (!text) text = 'Oratio missing'

  if (
    (/196/.test(version) || `${ctx.month}${ctx.day}` === '1102') &&
    /(.*?)&psalm\([0-9]+\)\s*_\s*(.*)/is.test(text)
  ) {
    const m = /(.*?)&psalm\([0-9]+\)\s*_\s*(.*)/is.exec(text)
    if (m) text = `${m[1]}_\n${m[2]}`
  }

  const subUnicaConc =
    /Sub unica conclusione in commemoratione/i.test(state.day.commemoratioSections.Rule ?? '') ||
    /Sub unica concl(usione)?\s*$/im.test(state.day.winnerSections.Rule ?? '') ||
    (worldMissionSunday(state) && !/Divino/.test(version))

  if (subUnicaConc) {
    if (!/196/.test(version)) {
      let m = /(.*?)(\n\$Per [^\n\r]*?\s*)$/s.exec(text)
      if (m) {
        state.addconclusio = m[2]
        text = m[1]
      }
      m = /(.*?)(\n\$Qui [^\n\r]*?\s*)$/s.exec(text)
      if (m) {
        state.addconclusio = m[2]
        text = m[1]
      }
    } else {
      text = text.replace(/\$(Per|Qui) .*?\n/i, '')
    }
  }

  let orm = ''
  if (!/Secreta/i.test(type)) orm = await state.texts.prayer('Oremus', lang)
  if (/Oratio/i.test(type) && /LectioL/.test(state.rule) && !/Pasc/i.test(ctx.dayname[0])) {
    orm += await state.texts.prayer('Flectamus', lang)
  }
  let retvalue = `${orm}\n${text}\n`
  state.ctotalnum = 1

  const coron = checkCoronatio(ctx.day, ctx.month)
  if (coron) {
    retvalue = retvalue.replace(/\$(Per|Qui) .*\n/g, '')
    const c = await setup(state, lang, coron)
    let ct = c[type] ?? ''
    if (/Coronatio/i.test(coron)) ct = replaceNpb(ct, '', lang, 'p', 'um')
    retvalue += `_\n$Papa\n${ct}`
  }

  if (
    /omit .*? commemoratio/i.test(state.rule) ||
    (/196/.test(version) &&
      state.solemn &&
      !(/Sancti/.test(state.day.winner) && /Dominica/i.test(state.day.state.tempora.Rank ?? '')))
  ) {
    return retvalue
  }

  state.oremusflag = `_\n${await state.texts.prayer('Oremus', lang)}`
  if (/Secreta/i.test(type) || (subUnicaConc && !/196/.test(version))) state.oremusflag = ''

  let vw = ''
  if (
    w[`${type} Vigilia`] !== undefined &&
    (!/(1955|196)/.test(version) || /Vigilia/i.test(state.rule))
  ) {
    vw += w[`${type} Vigilia`]
    if (/(1955|196)/.test(version)) {
      retvalue += `${state.oremusflag}${vw}\n`
      state.oremusflag = ''
    } else {
      setcc(state, vw, 3, {})
    }
  } else if (state.day.transfervigil) {
    const ctv = await setup(state, lang, state.day.transfervigil)
    vw += ctv[`${type} Vigilia`] ?? ''
    setcc(state, vw, 3, {})
  }

  if (/Oratio/.test(type) && /LectioL/.test(state.rule)) {
    retvalue += await lectionesTemporum(state, lang)
  }

  if (state.day.commemoratio1 && state.day.rank < 6) {
    const c1 = await getcommemoratio(state, state.day.commemoratio1, type, lang)
    if (c1) setcc(state, c1, 1, await setup(state, lang, state.day.commemoratio1))
  }

  for (let commemo of state.day.commemoentries) {
    if (!commemo) continue
    if (!/txt$/i.test(commemo)) commemo = `${commemo}.txt`
    const c = await setup(state, lang, commemo)
    if (
      state.day.rank < 6 ||
      !/(1955|196)/i.test(version) ||
      /(Dominica|;;6)/i.test(c.Rank ?? '') ||
      (/Tempora/i.test(commemo) && /;;[234]/.test(c.Rank ?? ''))
    ) {
      const w2 = await getcommemoratio(state, commemo, type, lang)
      if (w2) setcc(state, w2, 2, c)
    }
  }

  if (
    !/nocomm1960/i.test(state.rule) &&
    ((/(1955|196)/.test(version) &&
      (!/Octav/i.test(state.day.winnerSections['Commemoratio Oratio'] ?? '') ||
        /Octav.*?Nativ/i.test(state.day.winnerSections['Commemoratio Oratio'] ?? ''))) ||
      !(/(1955|196)/.test(version) && state.day.rank >= 5))
  ) {
    await commemoratioFromOffice(state, 'winner', type, lang)
    if (!/196/.test(version) || state.day.rank < 5) {
      if (state.day.commemoratio) await commemoratioFromOffice(state, 'commemoratio', type, lang)
      if (state.day.commemoratio1) await commemoratioFromOffice(state, 'commemoratio1', type, lang)
      if (state.day.commemorated && !/196/.test(version)) {
        await commemoratioFromOffice(state, 'commemorated', type, lang)
      }
    }
  }
  retvalue = getcc(state, retvalue)

  if (/1955|196/.test(version) || !checksuffragium(state)) {
    retvalue += state.addconclusio
    return retvalue
  }

  // Pre-1955 suffragium (Ordo/Suffragium.txt) — Tridentine/DA Masses.
  const sufRule = /Suffr.*?=(.*?);;/i.exec(state.rule)
  if (sufRule) {
    let sf = sufRule[1]
    if (state.day.ctx.month > 2 || (state.day.ctx.month === 2 && state.day.ctx.day > 1)) {
      sf = sf.replace(/Maria2;(Ecclesiæ|Papa),/, 'Sanctorum;Maria3,$1,')
    }
    const suffr = await setup(state, lang, 'Ordo/Suffragium')
    for (const part of sf.split(';')) {
      if (state.ctotalnum > 2) break
      const sf1 = part.split(',')
      const i = state.day.ctx.dayofweek % sf1.length
      let entry = suffr[`${type} ${sf1[i]}`] ?? ''
      if (sf1.length === 3) {
        const adlibitum = (suffr['ad libitum'] ?? '').replace(/\s*$/, '')
        entry = entry.replace(/(!.*)$/m, `$1 (${adlibitum})`)
      }
      retvalue += `_\n${delconclusio(state, entry)}`
    }
  }
  retvalue += state.addconclusio
  return retvalue
}

// ---------------------------------------------------------------------------
// Hooks (the !*&name and !&name directives)
// ---------------------------------------------------------------------------

export function gloriflag(state: MassState): boolean {
  const { ctx } = state.day
  let flag = true
  if (ctx.dayofweek === 0) flag = false
  if (/no Gloria/i.test(state.rule)) flag = true
  else if (/Gloria/.test(state.rule) || /Gloria/i.test(state.communerule)) flag = false
  else if (state.votive && /Defunct|C9/i.test(state.votive)) flag = true
  else if (/Sancti/.test(state.day.winner)) flag = false
  else if (/Adv|Quad/i.test(ctx.dayname[0])) flag = true
  else if (/Pasc/.test(ctx.dayname[0])) flag = false
  return flag
}

async function credoFlag(state: MassState): Promise<boolean> {
  const { ctx } = state.day
  const version = ctx.version
  const winnerRank = state.day.winnerSections.Rank ?? ''
  const comRank = state.day.commemoratioSections.Rank ?? ''
  let flag = true

  if (
    ctx.dayofweek === 0 ||
    (state.day.rank >= 5 && /Sancti/.test(state.day.winner) && !/Vigil/i.test(winnerRank)) ||
    (/Octav/i.test(winnerRank) &&
      !/post Octavam/i.test(winnerRank) &&
      !/Simplex/i.test(winnerRank)) ||
    (/Octav/i.test(comRank) &&
      !/post Octavam/i.test(comRank) &&
      !/Simplex/i.test(comRank) &&
      !/196/.test(version))
  ) {
    flag = false
  } else {
    for (let commemo of state.day.commemoentries) {
      if (!commemo) continue
      if (!/txt$/i.test(commemo)) commemo = `${commemo}.txt`
      const c = await setup(state, 'Latin', commemo)
      if (
        ((/Octav/i.test(c.Rank ?? '') && !/post Octavam/.test(c.Rank ?? '')) ||
          /Credo/i.test(c.Rule ?? '')) &&
        !/Simplex/i.test(c.Rank ?? '') &&
        !/196/.test(version)
      ) {
        flag = false
        break
      }
    }
  }

  if (/no Credo/i.test(state.rule)) flag = true
  else if (/Credo/i.test(state.rule) || /Credo/i.test(state.communerule)) flag = false
  if (/196/.test(version) && /CredoDA/i.test(state.rule)) flag = true
  return flag
}

// Hook table: each returns true when the following block should be SKIPPED.
// Hooks that push '!omit.' markers do so via the state.s accumulator.
export const hooks: Record<string, (state: MassState) => Promise<boolean> | boolean> = {
  Introibo: (state) => {
    if (/Defunct|C9/.test(state.votive) || deTemporePassionis(state)) {
      state.s.push('!omit. psalm')
      return true
    }
    return false
  },
  GloriaM: (state) => {
    const flag = gloriflag(state)
    if (flag) state.s.push('!omit.')
    return flag
  },
  Credo: async (state) => {
    const flag = await credoFlag(state)
    if (flag) state.s.push('!omit.')
    return flag
  },
  CheckQuiDixisti: (state) =>
    /Defunct|C9/i.test(state.votive) || /no Qui Dixisti/i.test(state.rule),
  CheckPax: (state) =>
    !state.solemn || /Defunct|C9/i.test(state.votive) || /no Pax/i.test(state.rule),
  CheckBlessing: (state) => /Defunct|C9/i.test(state.votive) || /no Benedictio/i.test(state.rule),
  CheckUltimaEv: (state) => /no Ultima Evangelium/i.test(state.rule),
  placeattibi: () => false,
  AgnusHook: (state) => {
    if (/ter miserere/i.test(state.rule)) {
      state.s[state.s.length - 1] = state.s[state.s.length - 2]
    }
    return false
  },
}

// ---------------------------------------------------------------------------
// ScriptFuncs (& functions in the Ordo script)
// ---------------------------------------------------------------------------

export const scriptFunctions: Record<
  string,
  (state: MassState, lang: string, ...args: (string | number)[]) => Promise<string> | string
> = {
  introitus: (state, lang) => getitem(state, 'Introitus', lang),
  collect: (state, lang) => oratio(state, lang, 'Oratio'),
  lectio: async (state, lang) => `${await getitem(state, 'Lectio', lang)}$Deo gratias\n`,
  graduale: async (state, lang) => {
    let t = await getitem(state, 'Graduale', lang)
    if (state.day.winnerSections.Sequentia !== undefined) {
      t += `_\n!!Sequentia\n${await getitem(state, 'Sequentia', lang)}`
    } else if (
      /Sequentia/i.test(state.communerule) &&
      state.day.communeSections.Sequentia !== undefined
    ) {
      const c = communeOf(state, lang)
      t += `_\n!!Sequentia\n${c.Sequentia ?? ''}`
    }
    return t
  },
  evangelium: async (state, lang) => {
    let t = await getitem(state, 'Evangelium', lang)
    const passio = /^\s*Passio\s*$/m.test(state.rule)
    if (t && !/^\s*$/.test(t)) {
      t = `v. ${t}`
      if (!passio) t = t.replace(/\n/, '\n$Gloria tibi\n')
      if (!(passio && /1955|196/.test(state.day.ctx.version))) t += '$Laus tibi\n'
    }
    if (/(1955|196)/.test(state.day.ctx.version) && /Maundi/i.test(state.rule)) {
      const w = winnerOf(state, lang)
      t += `_\n_\n${norubr1(state, w.Maundi ?? '')}`
    }
    return t
  },
  offertorium: (state, lang) => getitem(state, 'Offertorium', lang),
  secreta: async (state, lang) => `\n${await oratio(state, lang, 'Secreta')}`,
  communio: (state, lang) => getitem(state, 'Communio', lang),
  postcommunio: async (state, lang) => {
    let str = await oratio(state, lang, 'Postcommunio')
    if (/Super pop/i.test(state.rule)) {
      str += `_\n_\n${await getitem(state, 'Super populum', lang)}`
    }
    return str
  },
  prefatio: async (state, lang) => {
    const { ctx } = state.day
    const version = ctx.version
    const pr = await setup(state, lang, 'Ordo/Prefationes')
    const prw = winnerOf(state, lang)
    let prwRule = prw.Rule ?? ''

    if (!/Prefatio=/i.test(state.rule) && !/Prefatio/i.test(state.communerule)) {
      for (let commemo of state.day.commemoentries) {
        if (!commemo) continue
        if (!/txt$/i.test(commemo)) commemo = `${commemo}.txt`
        const comlat = await setup(state, 'Latin', commemo)
        const com = await setup(state, lang, commemo)
        const m =
          /Prefatio=([a-z0-9]+)(=.*?;)?/i.exec(com.Rule ?? '') ??
          /Prefatio=([a-z0-9]+)(=.*?;)?/i.exec(comlat.Rule ?? '')
        if (m) {
          state.rule += `\nPrefatio=${m[1]}${m[2] ?? ''}`
          prwRule += `\nPrefatio=${m[1]}${m[2] ?? ''}`
          break
        }
      }
    }

    const p1960 = /(1955|196)/.test(version) && /Prefatio1960=([a-z0-9]+)/i.exec(state.rule)
    const pRule =
      /Prefatio=([a-z0-9]+)/i.exec(state.rule) ?? /Prefatio=([a-z0-9]+)/i.exec(state.communerule)
    const name = p1960
      ? p1960[1]
      : pRule
        ? pRule[1]
        : /Adv[1-4]/i.test(ctx.dayname[0])
          ? 'Adv'
          : (ctx.month === 12 && ctx.day > 24) || (ctx.month === 1 && ctx.day === 1)
            ? 'Nat'
            : ctx.month === 1 && ctx.day > 5 && ctx.day < 14
              ? 'Epi'
              : /Quad[1-4]/i.test(ctx.dayname[0])
                ? 'Quad'
                : /Quad[56]/i.test(ctx.dayname[0])
                  ? 'Quad5'
                  : /Pasc[0-4]/i.test(ctx.dayname[0]) ||
                      (/Pasc5/i.test(ctx.dayname[0]) && ctx.dayofweek < 4)
                    ? 'Pasch'
                    : (/Pasc5/i.test(ctx.dayname[0]) && ctx.dayofweek > 3) ||
                        /Pasc6/i.test(ctx.dayname[0])
                      ? 'Asc'
                      : /Pasc7/i.test(ctx.dayname[0])
                        ? 'Spiritu'
                        : /Beata.*?Maria.*?Virg/i.test(state.day.winnerSections.Rank ?? '')
                          ? 'Maria'
                          : /C1$/i.test(state.day.commune) ||
                              (/1955|196/.test(version) && /C[234]b/.test(state.day.commune))
                            ? 'Apostolis'
                            : /Defunct|C9/i.test(state.votive)
                              ? 'Defunctorum'
                              : ctx.dayofweek === 0
                                ? 'Trinitate'
                                : 'Communis'

    let pref = pr[name] ?? ''
    const sub = /prefatio=(.*?)=(.*?);/i.exec(prwRule)
    if (sub) {
      pref = pref.replace(/\*.*?\*/, sub[2])
    } else {
      pref = pref.replace(/\*/g, '')
    }
    return norubr(state, pref)
  },
  communicantes: async (state, lang) => {
    const { ctx } = state.day
    const version = ctx.version
    const haveOctaves = !/1955|196/.test(version)
    const d = ctx.dayname[0]
    let name =
      (ctx.month === 12 && ctx.day > 24) || (ctx.month === 1 && ctx.day === 1)
        ? 'Nat'
        : ctx.month === 1 && (ctx.day === 6 || (haveOctaves && ctx.day >= 7 && ctx.day <= 13))
          ? 'Epi'
          : /Pasc0/.test(d)
            ? 'Pasc'
            : (/Pasc5/.test(d) && ctx.dayofweek === 4) ||
                (haveOctaves &&
                  ((/Pasc5/i.test(d) && ctx.dayofweek >= 5) ||
                    (/Pasc6/i.test(d) && ctx.dayofweek <= 4)))
              ? 'Asc'
              : /Pasc7/i.test(d) || (/Pasc6/.test(d) && ctx.dayofweek === 6)
                ? 'Pent'
                : 'common'
    const pr = await setup(state, lang, 'Ordo/Prefationes')
    if (/196/.test(version)) name += '1962'
    return norubr(state, chompd(pr[`C-${name}`] ?? ''))
  },
  hancigitur: async (state, lang) => {
    if (!/Pasc[07]/.test(state.day.ctx.dayname[0])) return ''
    const pr = await setup(state, lang, 'Ordo/Prefationes')
    return norubr(state, chompd(pr['H-Pent'] ?? ''))
  },
  itemissaest: async (state, lang) => {
    const text = (await state.texts.prayer('IteMissa', lang)).split('\n')
    const benedicamus =
      (gloriflag(state) && !/196/.test(state.day.ctx.version)) ||
      /^\s*Benedicamus Domino\s*$/im.test(state.rule)
    if (/Pasc0/i.test(state.day.ctx.dayname[0])) return `${text[2]}\n${text[3]}`
    if (/Defunct|C9/i.test(state.votive)) return `${text[6]}\n${text[7]}`
    if (benedicamus) return `${text[4]}\n${text[5]}`
    return `${text[0]}\n${text[1]}`
  },
  Vidiaquam: async (state, lang) => {
    if (state.solemn && state.day.ctx.dayofweek === 0 && !/Defunct|C9/i.test(state.votive)) {
      const name = /Pasc/i.test(state.day.ctx.dayname[0]) ? 'Vidi aquam' : 'Asperges me'
      return state.texts.prayer(name, lang)
    }
    return ''
  },
  DominusVobiscum: (state, lang, opt) => dominusVobiscum(state, lang, Number(opt ?? 0)),
  Gloria: async (state, lang) => {
    if (deTemporePassionis(state) && !/defunct|C9/i.test(state.rule)) return ''
    if (/defunct|C9/i.test(state.rule)) return state.texts.prayer('Requiem', lang)
    return state.texts.prayer('Gloria', lang)
  },
  Communio_Populi: () => '',
  Ultimaev: async (state, lang) => {
    const { ctx } = state.day
    const version = ctx.version
    const win = winnerOf(state, lang)
    let com: Sections = {}
    let comlat: Sections = {}
    for (let commemo of state.day.commemoentries) {
      if (!commemo) continue
      if (!/txt$/i.test(commemo)) commemo = `${commemo}.txt`
      comlat = await office(state, 'Latin', commemo)
      com = lang === 'Latin' ? comlat : await office(state, lang, commemo)
      if (com.Evangelium !== undefined && !/Evangelium non appropriatum/i.test(comlat.Rule ?? '')) {
        break
      }
    }

    let t: string
    if (
      /196/.test(version) ||
      (/1955/.test(version) && !/12-25/.test(state.day.winner)) ||
      (win['Ultima Evangelium'] === undefined &&
        (com.Evangelium === undefined ||
          /Evangelium non appropriatum/.test(com.Rule ?? '') ||
          (/Trident/i.test(version) && !/Dominica|Feria|Vigil/.test(comlat.Rank ?? ''))))
    ) {
      if (state.propers) return ''
      t = await state.texts.prayer('Ultima Evangelium', lang)
    } else if (win['Ultima Evangelium'] === undefined) {
      let comm = await translateLabel(state, 'Commemoratio', lang)
      comm = comm.replace(/\s$/, '')
      const comrank = (com.Rank ?? '').split(';;')
      t = (com.Evangelium ?? '').replace(/!/s, `!${comm} ${comrank[0]}\n!`)
    } else {
      t = win['Ultima Evangelium']
    }

    if (t && !/^\s*$/.test(t)) {
      t = t.replace(/\n/, '\n$Gloria tibi\n')
      t = `${t}$Deo gratias`
    }
    return t
  },
}

async function dominusVobiscum(state: MassState, lang: string, opt = 0): Promise<string> {
  if (/LectioL/.test(state.rule) && !opt) return ''
  return state.texts.prayer('Dominus vobiscum', lang)
}
