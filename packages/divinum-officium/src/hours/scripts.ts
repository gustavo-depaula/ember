// Port of horasscripts.pl — the &-functions invoked from the Ordinarium and
// the assembled script. Non-GABC paths only.

import { isSectioned } from '../types'
import { alleluiaWord, getantcross, septuagesimaVesp, triduumGloriaOmitted } from './helpers'
import { preces } from './preces'
import { type HoursState, winnerOf } from './state'

// Port of psalm() — reads the psalm file, applies range/antiphon/number
// handling, and appends &Gloria.
async function psalmFn(
  state: HoursState,
  lang: string,
  args: (string | number)[],
  antline?: string,
): Promise<string> {
  let psnumArg = String(args[0] ?? '')
  let v1 = 0
  let v2 = 1000
  let c1 = ''
  let c2 = ''
  let nogloria = false

  // Two-arg call '&psalm(n,1)' marks a Gloria-less psalm (Commemoratio
  // defunctorum's De profundis); three args are a verse range.
  if (args.length === 2 && String(args[1]) === '1') {
    nogloria = true
  } else if (args.length >= 3) {
    const m1 = /^(\d+)([a-z])?/.exec(String(args[1]))
    if (m1) {
      v1 = Number(m1[1])
      c1 = m1[2] ?? ''
    }
    const m2 = /^(\d+)([a-z])?/.exec(String(args[2]))
    if (m2) {
      v2 = Number(m2[1])
      c2 = m2[2] ?? ''
    }
  }

  // '-NNN': under-one-Gloria groups for Tridentine/Monastic.
  if (psnumArg.startsWith('-')) {
    psnumArg = psnumArg.slice(1)
    const n = Number(psnumArg)
    if (/Trident|Monastic/.test(state.day.ctx.version)) {
      nogloria =
        n === 148 ||
        n === 149 ||
        (n === 62 && !/Monastic/.test(state.day.ctx.version)) ||
        (n === 115 && /Monastic/.test(state.day.ctx.version))
    }
  }
  const psnum = psnumArg

  // Load the psalm file with the language fallback chain.
  let lines: string[] | undefined
  for (const l of [lang, state.session.fallbackLang, 'Latin']) {
    const file = await state.session.loader.load(`horas/${l}/Psalterium/Psalmorum/Psalm${psnum}`)
    if (file && !isSectioned(file)) {
      lines = [...file.lines]
      break
    }
    if (file && isSectioned(file)) {
      lines = file.sections.flatMap((s) => s.lines)
      break
    }
  }
  if (!lines || lines.length === 0) return `Psalm${psnum} not found`

  let title = `${await state.texts.translate('Psalmus', lang)} ${psnum}`
  if (v1) title = title.replace(/(; Tonus:.*)?$/, `(${v1}${c1}-${v2}${c2})$1`)
  let source = ''

  const psnumN = Number(psnum)
  if (psnumN > 150 && psnumN < 300) {
    const first = lines.shift() ?? ''
    const m = /\(?(.*?) \* (.*?)\)?\s*$/.exec(first)
    if (m) {
      title = m[1]
      source = m[2]
      if (v1) source = source.replace(/:.*/, `:${v1}-${v2}`)
    }
  }

  if (v1) {
    lines = lines.filter((line) => {
      const m = /^(?:\d+:)?(\d+)([a-z])?/.exec(line)
      if (!m) return false
      const v = Number(m[1])
      const c = m[2] ?? ''
      return (v === v1 && (!c1 || c >= c1)) || (v === v2 && (!c2 || c <= c2)) || (v > v1 && v < v2)
    })
  }

  if (antline && psnumN !== 232) {
    lines[0] = (lines[0] ?? '').replace(
      /^(\d+:\d+[a-z]? )(.*)/,
      (_, head: string, rest: string) => {
        return head + getantcross(rest, antline)
      },
    )
    if (/\/:‡:\/$/.test(lines[0] ?? '')) {
      lines[0] = (lines[0] ?? '').replace(/\/:‡:\/$/, '')
      lines[1] = (lines[1] ?? '').replace(/^(\d+:\d+[a-z]? )/, '$1/:‡:/ ')
    }
  }

  // handleverses (non-gabc) under the site's default setup: noinnumbers=1
  // (drop the first subverse letter and the first inline verse number),
  // nonumbers=0 (leading numbers as rubrics), noflexa=1 (mediant ‡ becomes
  // the asterisk, daggers dropped). Each substitution applies once per line
  // unless the Perl uses /g.
  lines = lines.map((line) => {
    let out = line
    out = out.replace(/(\d)[a-z]/, '$1')
    out = out.replace(/\(\d+[a-z]?\)/, '')
    out = out.replace(/^(?:\d+:)?\d+[a-z]?/, (m) => `/:${m}:/`)
    out = out.replace(/\(\d+[a-z]?\)/, (m) => `/:${m}:/`)
    out = out.replace(/(\(.*?\))/, '/:$1:/')
    out = out.replace(/‡\s+(.*?)\*\s*/g, '* $1')
    out = out.replace(/†\s*/g, '')
    return out
  })

  // Quicumque (234) has no verse numbers; give the first line its initial.
  if (psnumN === 234) {
    lines[0] = (lines[0] ?? '').replace(/^(?=\p{L})/u, 'v. ')
  }

  let output = `!${title}`
  if (!(psnumN > 230 && psnumN < 234)) {
    output += ` [${state.column === 1 ? ++state.psalmnum1 : ++state.psalmnum2}]`
  }
  if (source) output += `\n!${source}`
  output += `\n${lines.join('\n')}\n`

  if (psnumN !== 210 && !nogloria) {
    output += '&Gloria\n'
  }

  if (psnumN === 94 && antline) {
    output = output.replace(/\$ant/g, `Ant. ${antline}`)
  }
  return output
}

export const hourScriptFunctions: Record<
  string,
  (
    state: HoursState,
    lang: string,
    args: (string | number)[],
    antline?: string,
  ) => Promise<string> | string
> = {
  psalm: (state, lang, args, antline) => psalmFn(state, lang, args, antline),

  teDeum: async (state, lang) => `\n!Te Deum\n${await state.texts.prayer('Te Deum', lang)}`,

  Deus_in_adjutorium: (state, lang) => state.texts.prayer('Deus in adjutorium', lang),

  Alleluia: async (state, lang) => {
    const text = (await state.texts.prayer('Alleluia', lang)).split('\n')
    return /Quad/i.test(state.day.ctx.dayname[0]) && !septuagesimaVesp(state)
      ? (text[1] ?? '')
      : (text[0] ?? '')
  },

  Gloria: async (state, lang) => {
    if (triduumGloriaOmitted(state.day.ctx, state.day.vespera)) return ''
    if (/Requiem gloria/i.test(state.rule)) return state.texts.prayer('Requiem', lang)
    return state.texts.prayer('Gloria', lang)
  },

  Gloria1: async (state, lang) => {
    if (
      /(Quad5|Quad6)/i.test(state.day.ctx.dayname[0]) &&
      !/Sancti/i.test(state.day.winner) &&
      !/Gloria responsory/i.test(state.rule)
    ) {
      return ''
    }
    return state.texts.prayer('Gloria1', lang)
  },

  Gloria2: async (state, lang) => {
    if (/(Quad[56])/i.test(state.day.ctx.dayname[0])) return ''
    if (/Requiem gloria/i.test(state.rule)) return state.texts.prayer('Requiem', lang)
    return state.texts.prayer('Gloria', lang)
  },

  Dominus_vobiscum: async (state, lang) => {
    const text = (await state.texts.prayer('Dominus', lang)).split('\n')
    if (state.priest) return `${text[0]}\n${text[1]}`
    if (!state.precesferiales) return `${text[2]}\n${text[3]}`
    state.precesferiales = false
    return text[4] ?? ''
  },

  Dominus_vobiscum1: async (state, lang) => {
    if ((await preces(state, 'Dominicales et Feriales')) || state.litaniaflag) {
      if (!state.priest) state.precesferiales = true
    }
    return hourScriptFunctions.Dominus_vobiscum(state, lang, [])
  },

  Dominus_vobiscum2: async (state, lang) => {
    if (!state.priest) state.precesferiales = true
    return hourScriptFunctions.Dominus_vobiscum(state, lang, [])
  },

  mLitany: async (state, _lang) => {
    if (await preces(state, 'Dominicales')) return ''
    return '$Kyrie\n$pater secreto'
  },

  Benedicamus_Domino: async (state, lang) => {
    const text = await state.texts.prayer('Benedicamus Domino', lang)
    if (
      /(Laudes|Vespera)/i.test(state.hora) &&
      (/Pasc0/i.test(state.day.ctx.dayname[0]) || septuagesimaVesp(state))
    ) {
      const duplex = (await state.texts.prayer('Alleluia Duplex', lang))
        .toLowerCase()
        .replace(/\s+$/, '')
      return text.replace(/\.\s*\n/g, `, ${duplex}\n`)
    }
    return text
  },

  Divinum_auxilium: async (state, lang) => {
    // Perl split drops trailing empty fields — the indexes count from the end.
    const text = (await state.texts.prayer('Divinum auxilium', lang))
      .replace(/\s+$/, '')
      .split('\n')
    const n = text.length
    text[n - 2] = `V. ${text[n - 2]}`
    if (!/Monastic/i.test(state.day.ctx.version)) {
      text[n - 1] = text[n - 1].replace(/.*\. /, '')
    }
    text[n - 1] = `R. ${text[n - 1]}`
    return text.join('\n')
  },

  Domine_labia: async (state, lang) => {
    let text = await state.texts.prayer('Domine labia', lang)
    if (/monastic/i.test(state.day.ctx.version)) {
      text = `${text}\n${text}\n${text}`
      text = text.replace(/\+\+/, '$&++')
      text = text.replace(/\+\+ /g, ' ')
    }
    return text
  },

  special: async (state, lang, args) => {
    const name = String(args[0] ?? '')
    // Perl selects winner vs winner2 by the call's literal lang argument, not
    // the rendering column — load-bearing for English Sancti/11-02, whose
    // Compline ends with &special('Conclusio', 'Latin') and so keeps the
    // Latin conclusion in the vernacular column.
    const w = winnerOf(state, String(args[1] ?? lang))
    if (w[name] !== undefined) {
      return `${(w[name] ?? '').replace(/\s*$/, '')}\n`
    }
    if (name.startsWith('#')) {
      // Perl re-runs specials() over the single item (e.g. '#Martyrologium'
      // inside All Souls' Special Prima).
      const { specialsForItem } = await import('./assemble')
      const lines = await specialsForItem(state, name, lang)
      return lines.join('\n')
    }
    return `${name} is missing`
  },

  versiculum_ante_laudes: () => '', // Ordo Praedicatorum only — out of v1 scope.

  lectio: async (state, lang, args) => {
    const { lectioFn } = await import('./matins')
    return lectioFn(state, Number(args[0] ?? 1), lang)
  },
}
