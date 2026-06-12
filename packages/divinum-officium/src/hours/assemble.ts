// Port of the horas assembly flow: getordinarium (horas.pl:579) →
// specials() (specials.pl:21) → $/& expansion → render finish. Minor hours +
// Compline in M5; Lauds/Vespers (M6) and Matins (M7) throw until ported.

import { processConditionalLines } from '../conditions/evaluate'
import { officestring } from '../kalendar/officestring'
import { type DayResolution, resolveDay } from '../kalendar/precedence'
import type { DoLoader } from '../loader'
import { createTextTables } from '../mass/texts'
import { isSectioned } from '../types'
import {
  capitulumMajor,
  capitulumMinor,
  capitulumPrima,
  lectioBrevisPrima,
  monasticMajorResponsory,
  regula,
} from './capitulis'
import { loadspecial, processInlineAlleluias, septuagesimaVesp, suppressAlleluia } from './helpers'
import { gethymn } from './hymni'
import { martyrologium } from './martyrologium'
import { invitatorium } from './matins'
import { getsuffragium, oratio, papalAntiphonDumEsset, papalRule } from './orationes'
import { getpreces, preces } from './preces'
import { checksuffragium, getantvers, getproprium, setcomment, setup } from './proprium'
import { antetpsalm, psalmi } from './psalmi'
import { hourScriptFunctions } from './scripts'
import { columnsel, type HoursState, winnerOf } from './state'

// Port of horas getordinarium: Ordinarium script + conditional processing,
// with the '#Prelude' pseudo-item prefix.
async function getordinarium(state: HoursState, hora: string): Promise<string[]> {
  const command = /Tertia|Sexta|Nona/i.test(hora) ? 'Minor' : hora
  const file = await state.session.loader.load(`horas/Ordinarium/${command}`)
  if (!file || isSectioned(file)) throw new Error(`cannot load Ordinarium/${command}`)
  const script = processConditionalLines(file.lines, state.day.ctx)
  return ['#Prelude', '', ...script]
}

// Port of specials() — the #-directive walker.
async function specials(
  state: HoursState,
  script: string[],
  lang: string,
  special = false,
): Promise<string[]> {
  const ctx = state.day.ctx
  const { version } = ctx
  const hora = state.hora
  const w = winnerOf(state, lang)
  state.octavam = ''

  // Special <hora> override (suppressed on nested &special('#…') re-entry).
  const i = hora === 'Laudes' ? ' 2' : hora === 'Vespera' ? ` ${state.day.vespera}` : ''
  if (!special && w[`Special ${hora}${i}`] !== undefined) {
    return loadspecial(w[`Special ${hora}${i}`] ?? '', version)
  }

  state.s = []
  state.skipflag = false
  state.litaniaflag = false
  state.specialflag = false
  const t = [...script]
  let tind = 0

  while (tind < t.length) {
    const item = (t[tind++] ?? '').replace(/\s*$/, '')

    if (!/^\s*#/.test(item)) {
      if (!state.skipflag) state.s.push(item)
      continue
    }
    if (state.skipflag) state.s.push('\n')
    state.label = item
    state.skipflag = false

    // Capitulum Versum 2 rule.
    const cv2 = /Capitulum Versum 2(.*);?$/im.exec(state.rule)
    if (/Capitulum/.test(item) && cv2) {
      const cv2hora = cv2[1]
      if (/nisi ad Laudes/i.test(cv2hora) && hora === 'Laudes') {
        // fall through to normal handling
      } else if (
        !(
          (/ad Laudes tantum/i.test(cv2hora) && hora !== 'Laudes') ||
          (/ad Laudes et Vesperas/i.test(cv2hora) && !/^(?:Laudes|Vespera)$/.test(hora))
        )
      ) {
        if (hora !== 'Completorium') {
          const c = columnsel(state, lang) ? state.day.communeSections : state.commune2
          state.s.push(
            `#${await state.texts.translate('Versus in loco', lang)}`,
            w['Versum 2'] ?? c['Versum 2'] ?? '',
            '',
          )
        }
        state.skipflag = true
        continue
      }
    }

    // Omit rule.
    const iteMatch = /#(.+?)(\s|$)/.exec(item)
    const ite = iteMatch?.[1] ?? ''
    if (
      new RegExp(`Omit.*? ${ite}`, 'i').test(state.rule) &&
      !(
        /Capitulum/.test(item) &&
        /Capitulum Versum 2( etiam ad Vesperas)?/i.test(state.rule) &&
        ((RegExp.$1 && hora === 'Vespera') || hora === 'Laudes')
      ) &&
      (!/Omit ad Matutinum/.test(state.rule) || hora === 'Matutinum')
    ) {
      state.skipflag = true
      let comment = 1
      if (/incipit/i.test(item) && !/Cist|1955|196/i.test(version)) comment = 2
      if (!new RegExp(`Omit.*? ${ite} mute`, 'i').test(state.rule)) {
        await setcomment(state, state.label, 'Preces', comment, lang)
      }
      if (/incipit/i.test(item) && !/1955|196/.test(version) && !/C12/.test(state.day.winner)) {
        state.s.push(hora === 'Laudes' ? '$rubrica Secreto a Laudibus' : '$rubrica Secreto')
        state.s.push('$Pater noster', '$Ave Maria')
        if (/^(?:Matutinum|Prima)$/.test(hora)) state.s.push('$Credo')
      }
      continue
    }

    if (/Prelude/.test(item)) {
      if (w[`Prelude ${hora}`] !== undefined) state.s.push(w[`Prelude ${hora}`] ?? '')
      continue
    }

    if (/Ave only/i.test(state.rule) && /incipit/i.test(item)) {
      await setcomment(state, state.label, 'Preces', 2, lang)
      while (tind < t.length && !/^\s*#/.test(t[tind])) {
        if (!/(Pater|Credo)/.test(t[tind])) {
          state.s.push(t[tind])
        } else if (/Ave/.test(t[tind])) {
          state.s.push('$Ave Maria')
        }
        tind++
      }
      continue
    }

    if (/Commemoratio officii parvi/.test(item)) {
      const mariae = await setup(state, lang, 'CommuneM/C12')
      state.s.push(item, mariae[`COP ${hora}`] ?? '')
      continue
    }

    if (/preces/i.test(item)) {
      const said = await preces(state, item)
      state.skipflag = !said
      await setcomment(state, state.label, 'Preces', state.skipflag ? 1 : 0, lang)
      if (state.precesferiales && /Dominicales/i.test(item) && !state.skipflag) {
        state.s.push('$rubrica Preces flexis genibus')
      }
      if (!state.skipflag) {
        state.s.push(await getpreces(state, lang, /Dominicales/.test(item)))
      }
      continue
    }

    if (/invitatorium/i.test(item)) {
      await invitatorium(state, lang)
      continue
    }

    if (/psalm/i.test(item)) {
      await psalmi(state, lang)
      continue
    }

    if (/Capitulum/i.test(item) && hora === 'Prima') {
      state.s.push(await capitulumPrima(state, lang, /Responsorium/i.test(item)))
      continue
    }

    if (/Lectio brevis/i.test(item) && hora === 'Completorium') {
      const lectio = await setup(state, lang, 'Psalterium/Special/Minor Special')
      state.s.push(item, lectio['Lectio Completorium'] ?? '')
      continue
    }

    if (/Capitulum/i.test(item) && /^(?:Tertia|Sexta|Nona|Completorium)$/i.test(hora)) {
      if (hora === 'Completorium') state.s.push(await state.texts.translate(item, lang))
      state.s.push(await capitulumMinor(state, lang))
      continue
    }

    // No `continue` — '#Capitulum … Hymnus Versus' items fall through to the
    // Responsorium and Hymnus branches below.
    if (/Capitulum/i.test(item) && /^(?:Laudes|Vespera)$/.test(hora)) {
      state.s.push(await capitulumMajor(state, lang))
    }

    if (/Responsor/.test(item) && /monastic/i.test(version) && /^(?:Laudes|Vespera)$/.test(hora)) {
      const resp = await monasticMajorResponsory(state, lang)
      if (resp) state.s.push('_', resp)
    }

    if (/Regula/i.test(item)) {
      const reg = await regula(state, lang)
      state.s.push(await state.texts.translate(state.label, lang))
      state.s.push(reg)
      // '#Regula vel Lectio brevis' falls through to the Lectio brevis branch.
      if (!/Lectio brevis/i.test(item)) continue
    }

    if (/Lectio brevis/i.test(item) && hora === 'Prima') {
      const [b, c] = await lectioBrevisPrima(state, lang)
      let label = state.label
      if (/regula/i.test(label)) label = ''
      await setcomment(state, label, 'Source', c, lang)
      if (!label) {
        // Join the source of the Lectio brevis to the rubric describing its
        // use outside of choir.
        const comment = state.s.pop() ?? ''
        let reg = state.s.pop() ?? ''
        reg = reg.replace(/\.?:\/\s*$/, ` ${comment}:/`)
        state.s.push(reg)
      }
      state.s.push(b)
      continue
    }

    if (/Hymnus/.test(item)) {
      state.s.push(await gethymn(state, lang))
      continue
    }

    if (/Canticum/.test(item)) {
      // Port of horas.pl::canticum — Benedictus (231) at Lauds, Magnificat
      // (232) at Vespers, Nunc dimittis (233) at Compline.
      const numC = hora === 'Laudes' ? 2 : hora === 'Completorium' ? 4 : 3
      let duplexf = /196/.test(version)
      let ant = ''
      let ant2: string | undefined

      if (hora === 'Completorium') {
        state.s.push(`#${await state.texts.translate(item.slice(1), lang)}`)
        const [w] = await getproprium(state, `Ant 4${state.day.vespera}`, lang, false)
        if (w) {
          ;[ant, ant2] = w.split('\n')
        } else {
          const a = await setup(state, lang, 'Psalterium/Special/Minor Special')
          ant = a['Ant 4'] ?? ''
        }
      } else {
        const commentC = /sancti/i.test(state.day.winner) ? 3 : 2
        await setcomment(
          state,
          item,
          'Source',
          commentC,
          lang,
          await state.texts.translate('Antiphona', lang),
        )
        duplexf ||= state.day.duplex > 2
        const key = numC === 3 ? state.day.vespera : numC
        const [special, df] = await ant123Special(state, lang)
        if (special) {
          ant = special
          duplexf ||= df
        } else {
          ;[ant] = await getantvers(state, 'Ant', key, lang)
        }
      }

      await antetpsalm(state, [`${ant};;${229 + numC}`], duplexf, lang)
      if (ant2) state.s[state.s.length - 1] = `Ant. ${ant2}`
      continue
    }

    if (/Oratio/.test(item)) {
      const primeOrCompline = /^(?:Prima|Completorium)$/i.test(hora)
      const triduum = /Limit.*?Oratio/.test(state.rule)
      const oratioParams: { special?: boolean } = {}
      if (primeOrCompline && triduum) {
        state.skipflag = true
        oratioParams.special = true
      }
      if (!primeOrCompline || triduum) {
        await oratio(state, lang, oratioParams)
        continue
      }
    }

    if (/Suffragium/i.test(item) && /^(?:Laudes|Vespera)$/.test(hora)) {
      if (
        !(await checksuffragium(state)) ||
        (!/Cist/i.test(version) && /Quad5/i.test(ctx.dayname[0])) ||
        /Quad6/i.test(ctx.dayname[0])
      ) {
        await setcomment(state, state.label, 'Suffragium', 0, lang)
        state.s.push('\n')
        continue
      }
      const [suffr, c] = await getsuffragium(state, lang)
      await setcomment(state, state.label, 'Suffragium', c, lang)
      state.s.push(suffr)
      continue
    }

    if (/Martyrologium/.test(item)) {
      await setcomment(state, state.label, 'Martyrologium', 0, lang)
      state.s.push(await martyrologium(state, lang))
      if (!/ex C9/.test(state.rule)) state.s.push('', '$Pretiosa')
      continue
    }

    if (item === '#Commemoratio defunctorum') {
      const key = item.slice(1)
      state.s.push(await state.texts.translate(state.label, lang))
      const ps = await setup(state, lang, 'Psalterium/Special/Prima Special')
      state.s.push(ps[key] ?? '')
      continue
    }

    if (/Antiphona finalis/.test(item)) {
      if (state.litaniaflag || state.specialflag) continue
      const ctx2 = state.day.ctx
      state.s.push(`#${await state.texts.translate('Antiphona finalis BMV', lang)}`)
      if (
        /Adv|Nat/i.test(ctx2.dayname[0]) ||
        ctx2.month === 1 ||
        (ctx2.month === 2 && ctx2.day < 2) ||
        (ctx2.month === 2 && ctx2.day === 2 && !/Completorium/i.test(hora))
      ) {
        state.s.push('$ant Alma Redemptoris Mater')
      } else if (
        (ctx2.month === 2 || ctx2.month === 3 || /Quad/i.test(ctx2.dayname[0])) &&
        !/Pasc/i.test(ctx2.dayname[0])
      ) {
        state.s.push('$ant Ave Regina caelorum')
      } else if (/Pasc/.test(ctx2.dayname[0])) {
        state.s.push('$ant Regina caeli')
      } else {
        state.s.push('$ant Salve Regina')
      }
      state.s.push('&Divinum_auxilium')
      continue
    }

    // Litaniae majores flag for St Mark's day (and Rogation Monday cases).
    let litFlag = false
    if (state.votive === 'Hodie') {
      const { month, day, dayofweek } = ctx
      if (month === 4 && day === 25 && (!/Pasc0/.test(ctx.dayname[0]) || dayofweek > 1)) {
        litFlag = true
      }
      if (month === 4 && day === 27 && /Pasc0/.test(ctx.dayname[0]) && dayofweek === 2) {
        litFlag = true
      }
      if (
        !/1960/.test(version) &&
        month === 4 &&
        day === 25 &&
        /Pasc0/.test(ctx.dayname[0]) &&
        dayofweek === 1
      ) {
        litFlag = true
      }
      if (
        /1960/.test(version) &&
        month === 4 &&
        day === 26 &&
        /Pasc0/.test(ctx.dayname[0]) &&
        dayofweek === 2
      ) {
        litFlag = true
      }
      if (/Laudes Litania/i.test(state.rule) && /Sancti/.test(state.day.winner) && ctx.day !== 25) {
        state.rule = state.rule.replace(/Laudes Litania/gi, '')
      }
    }

    // Insert the title.
    state.s.push(await state.texts.translate(state.label, lang))

    // Litany of the Saints replaces the conclusion of Lauds on Rogation days.
    if (
      /Conclusio/i.test(item) &&
      hora === 'Laudes' &&
      (ctx.month === 4 || !/1960/.test(version)) &&
      (/Laudes Litania/i.test(state.rule) ||
        /Laudes Litania/i.test(state.day.commemoratioSections.Rule ?? '') ||
        /Laudes Litania/i.test(state.day.scripturaSections.Rule ?? '') ||
        litFlag)
    ) {
      const preces = await setup(state, lang, 'Psalterium/Special/Preces')
      const lname = /Monastic/.test(version) ? 'LitaniaM' : 'Litania'
      state.s.push('$Domine exaudi', '&Benedicamus_Domino', '')
      const lit = (preces[lname] ?? '').split('\n\n')
      lit.push('', '')
      state.s.push(
        lit[0] ?? '',
        lit[lit.length - 1] ?? '',
        lit[1] ?? '',
        lit[lit.length - 2] ?? '',
        lit[2] ?? '',
      )
      state.skipflag = true
      state.litaniaflag = true
    }

    // Special conclusions, e.g. on All Souls' day.
    if (/Conclusio/.test(item) && /Special Conclusio/i.test(state.rule)) {
      state.s.push(w.Conclusio ?? '')
      state.skipflag = true
      state.specialflag = true
    }

    // Special conclusion when the Office of the Dead follows.
    if (/Conclusio/.test(item) && !/C9/i.test(state.day.commune) && !/C9/i.test(state.votive)) {
      const { month, day, year } = ctx
      const dirge = await state.day.state.directorium.dirge(version, hora, day, month, year)

      if (
        (dirge ||
          (/Vesperae Defunctorum/.test(state.day.winnerSections.Rule ?? '') &&
            state.day.vespera === 3)) &&
        hora === 'Vespera'
      ) {
        state.s.push(await state.texts.prayer('DefunctV', lang))
        state.skipflag = true
        state.specialflag = true
      } else if (
        (dirge || /Matutinum et Laudes Defunctorum/.test(state.day.winnerSections.Rule ?? '')) &&
        hora === 'Laudes'
      ) {
        state.s.push(await state.texts.prayer('DefunctM', lang))
        state.skipflag = true
        state.specialflag = true
      }
    }
  }
  return state.s
}

// Port of ant123_special — the Greater-Advent 'O' antiphons and the common
// papal Magnificat antiphon at second Vespers.
async function ant123Special(state: HoursState, lang: string): Promise<[string, boolean]> {
  const ctx = state.day.ctx
  const { version, month, day } = ctx
  let ant = ''
  let duplexf = false

  if (month === 12 && day > 16 && day < 24 && /tempora/i.test(state.day.winner)) {
    const specials = await setup(state, lang, 'Psalterium/Special/Major Special')
    if (state.hora === 'Laudes' && (day === 21 || day === 23)) {
      ant = specials[`Adv Ant ${day}L`] ?? ''
    } else if (state.hora === 'Vespera') {
      ant = specials[`Adv Ant ${day}`] ?? ''
      duplexf = true
    }
  } else if (
    /^Sancti/.test(state.day.winner) &&
    !/Trident/.test(version) &&
    state.day.vespera === 3
  ) {
    // Confessor-Popes share a Magnificat antiphon at second Vespers.
    const pr = papalRule(state.day.winnerSections.Rule ?? '')
    if (pr && /C/i.test(pr[1])) {
      ant = await papalAntiphonDumEsset(state, lang)
    }
  }
  return [ant, duplexf]
}

// Re-run the walker over a single '#…' item (Perl's special() ScriptFunc with
// a '#' name). The walker state is saved/restored around the nested run.
export async function specialsForItem(
  state: HoursState,
  item: string,
  lang: string,
): Promise<string[]> {
  const savedS = state.s
  const savedLabel = state.label
  const savedSkip = state.skipflag
  const out = await specials(state, [item], lang, true)
  state.s = savedS
  state.label = savedLabel
  state.skipflag = savedSkip
  return out
}

// Expansion pass — same shape as the missa one, plus the antline pass-through
// for &psalm after an 'Ant. …' line and the '$ant '/'$rubrica ' sigils.
async function expandItems(state: HoursState, items: string[], lang: string): Promise<string[]> {
  const out: string[] = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const prev = i > 0 ? items[i - 1] : ''
    const expanded = await expandText(state, item, lang, prev)
    // If the psalm has a cross, then so should the antiphon (horas.pl:128).
    if (/psalm/.test(item) && /^\s*Ant\. /i.test(prev) && expanded.includes('‡') && out.length) {
      out[out.length - 1] += ' /:‡:/'
    }
    out.push(expanded)
  }
  return out
}

async function expandText(
  state: HoursState,
  text: string,
  lang: string,
  prevItem = '',
): Promise<string> {
  const lines = text.split('\n')
  const out: string[] = []
  for (let li = 0; li < lines.length; li++) {
    let line = lines[li].replace(/\s+$/, '')
    if (/^\s*[$&]/.test(line.trimStart()) && !/(callpopup|rubrics)/i.test(line)) {
      const prevLine = li > 0 ? lines[li - 1] : prevItem
      let antline: string | undefined
      if (/psalm/.test(line) && /^\s*Ant\. /i.test(prevLine)) {
        antline = prevLine.replace(/^\s*Ant\. /i, '')
      }
      line = line.replace(/\./g, '')
      const expanded = await expandLine(state, line.trim(), lang, antline)
      if (/^\s*$/.test(expanded)) continue
      out.push(await expandText(state, expanded.replace(/\n$/, ''), lang))
    } else {
      out.push(line)
    }
  }
  return out.join('\n')
}

async function expandLine(
  state: HoursState,
  lineIn: string,
  lang: string,
  antline?: string,
): Promise<string> {
  let line = lineIn
  const sigilMatch = /^([&$](?:rubrica |Preces )?)/.exec(line)
  if (!sigilMatch) return line
  const sigil = sigilMatch[1]
  line = line.slice(sigil.length)

  if (sigil === '&') {
    const m = /(.*?)(?:[(](.*)[)])?$/.exec(line)
    const name = m?.[1] ?? line
    const argString = m?.[2]
    const args: (string | number)[] = []
    if (argString !== undefined) {
      for (const part of argString.split(/,(?=(?:[^']|'[^']*')*$)/)) {
        const am = /'(.*)'|(-?\d+)/.exec(part)
        if (am) args.push(am[1] ?? Number(am[2]))
      }
    }
    const fn = hourScriptFunctions[name]
    if (!fn) throw new Error(`unknown hour script function: &${name}`)
    return await fn(state, lang, args, antline)
  }
  if (sigil === '$rubrica ') {
    return `!${await state.texts.rubric(line, lang)}`
  }
  if (sigil === '$Preces ') {
    return state.texts.prex(`Preces ${line}`, lang)
  }
  return state.texts.prayer(line, lang)
}

// Render-finish (shared semantics with the Mass).
function spellVar(text: string, version: string): string {
  if (/196/.test(version)) {
    return text
      .replace(/[Jj]/g, (c) => (c === 'J' ? 'I' : 'i'))
      .replace(/H-Iesu/g, 'H-Jesu')
      .replace(/er eúmdem/g, 'er eúndem')
  }
  return text
    .replace(/Génetrix/g, 'Génitrix')
    .replace(/Genetrí/g, 'Genitrí')
    .replace(/\bco(t[ií]d[ií])/g, 'quo$1')
}

// Port of the omit-words regexp from load_languages_data: the second Preces
// comment word and the first Suffragium comment word, across all langs.
async function omitRegexp(state: HoursState): Promise<RegExp> {
  const langs = [...new Set(['Latin', state.lang1, state.lang2, state.session.fallbackLang])]
  const words: string[] = []
  for (const l of langs) {
    const comm = await setup(state, l, 'Psalterium/Comment')
    words.push(
      (comm.Preces ?? '').split('\n')[1] ?? '',
      (comm.Suffragium ?? '').split('\n')[0] ?? '',
    )
  }
  return new RegExp(`\\b(?:${words.filter(Boolean).join('|')})\\b`)
}

async function renderFinish(
  state: HoursState,
  items: string[],
  lang: string,
  version: string,
): Promise<string[]> {
  const omit = await omitRegexp(state)
  const paschal = /Pasc/.test(state.day.ctx.dayname[0])
  const lent =
    /Quadp|Quad[1-5]|Quad6-[0-5]/i.test(state.day.ctx.dayname[0]) && !septuagesimaVesp(state)
  const out: string[] = []
  for (const itemIn of items) {
    const lines = itemIn.split('\n')

    // horas.pl setlines: an item's first line that is a '#' heading gets
    // translated at render time (Translate.txt carries '#…' keys), except for
    // omitted parts, which stay as-is and render small.
    if (/^\s*#/.test(lines[0]) && !omit.test(lines[0])) {
      const m = /^\s*(#.*?)\s*$/.exec(lines[0])
      if (m) lines[0] = `#${(await state.texts.translate(m[1], lang)).slice(1)}`
    }

    // Per-line pass: final dot on antiphons and translated Benedictio/
    // Absolutio prefixes.
    for (let i = 0; i < lines.length; i++) {
      if (/^Ant\./.test(lines[i])) lines[i] = lines[i].replace(/(\w)$/, '$1.')
      const m = /^(Benedictio|Absolutio)\./.exec(lines[i])
      if (m) {
        const translated = await state.texts.translate(m[1], lang)
        lines[i] = `${translated}.${lines[i].slice(m[0].length)}`
      }
    }
    let item = lines.join('\n')

    // webdia.pl cell pass: inline alleluias by season, Lenten suppression,
    // Latin spelling, then marker cleanup.
    item = await processInlineAlleluias(state, item, lang, paschal)
    if (lent) item = await suppressAlleluia(state, item, lang)
    if (/Latin/.test(lang)) item = spellVar(item, version)
    item = item.replace(/wait[0-9]+/gi, '')
    item = item.replace(/\{:[\s\S]*?:\}/g, '')
    item = item.replace(/`/g, '')
    out.push(item)
  }
  return out
}

export type AssembledHour = {
  day: DayResolution
  latin: string[]
  vernacular?: string[]
}

export async function assembleHour(opts: {
  loader: DoLoader
  day: number
  month: number
  year: number
  version: string
  hora: 'Prima' | 'Tertia' | 'Sexta' | 'Nona' | 'Completorium' | 'Matutinum' | 'Laudes' | 'Vespera'
  lang2?: string
  priest?: boolean
}): Promise<AssembledHour> {
  const lang2 = opts.lang2 ?? 'Latin'
  const day = await resolveDay({
    loader: opts.loader,
    day: opts.day,
    month: opts.month,
    year: opts.year,
    version: opts.version,
    hora: opts.hora,
    missa: false,
    lang1: 'Latin',
    lang2,
    // The interactive pray<Hora> request runs with $caller unset — caller=1
    // would suppress the 'All Souls ends after None' Vespers rule.
    caller: 0,
  })

  const texts = createTextTables(day.state.session, false)

  const state: HoursState = {
    day,
    session: day.state.session,
    texts,
    lang1: 'Latin',
    lang2,
    column: 1,
    hora: opts.hora,
    priest: opts.priest ?? false,
    votive: 'Hodie',
    rule: day.rule,
    communerule: day.communerule,
    winner2: {},
    commemoratio2: {},
    commune2: {},
    scriptura2: {},
    s: [],
    label: '',
    skipflag: false,
    litaniaflag: false,
    specialflag: false,
    precesferiales: false,
    psalmnum1: 0,
    psalmnum2: 0,
    collectcount: 1,
    octavcount: 0,
  }

  // setsecondcol port.
  if (lang2 !== 'Latin') {
    if (day.winner) {
      const flag = /tempora/i.test(day.winner) && day.vespera === 1
      state.winner2 = (await officestring(day.state, lang2, day.winner, flag)) ?? {}
    }
    if (day.commemoratio) {
      const flag = /tempora/i.test(day.commemoratio) && day.cvespera === 1
      state.commemoratio2 = (await officestring(day.state, lang2, day.commemoratio, flag)) ?? {}
    }
    if (day.commune) state.commune2 = (await officestring(day.state, lang2, day.commune)) ?? {}
    if (day.scriptura) {
      state.scriptura2 = (await officestring(day.state, lang2, day.scriptura)) ?? {}
    }
  }

  state.column = 1
  const script = await getordinarium(state, opts.hora)
  let items1 = await specials(state, script, 'Latin')
  items1 = await renderFinish(
    state,
    await expandItems(state, items1, 'Latin'),
    'Latin',
    opts.version,
  )

  let items2: string[] | undefined
  if (lang2 !== 'Latin') {
    state.column = 2
    state.precesferiales = false
    state.litaniaflag = false
    state.specialflag = false
    const script2 = await getordinarium(state, opts.hora)
    items2 = await specials(state, script2, lang2)
    items2 = await renderFinish(state, await expandItems(state, items2, lang2), lang2, opts.version)
  }

  return { day, latin: items1, vernacular: items2 }
}
