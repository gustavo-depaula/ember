// Shared hour helpers: gettempora (horascommon.pl:2277), the alleluia
// machinery and post-processing (horas.pl / LanguageTextTools.pm), and small
// predicates. Non-GABC paths only.

import type { RubricContext } from '../conditions/context'
import type { HoursState } from './state'

// Port of gettempora($caller) — season id for Psalterium lookups.
export function gettempora(state: HoursState, caller: string): string {
  const ctx = state.day.ctx
  const d = ctx.dayname[0]
  const { version, dayofweek, day } = ctx

  let tname =
    /^Adv[34]$/.test(d) && caller === 'Invitatorium'
      ? 'Adv3'
      : /^Adv/.test(d) && caller !== 'Doxology' && caller !== 'Nunc dimittis'
        ? 'Adv'
        : /^Quad[56]/.test(d) && caller !== 'Doxology'
          ? 'Quad5'
          : /^Quad(?!p)/.test(d) && caller !== 'Doxology'
            ? 'Quad'
            : /^Pasc6/.test(d) ||
                (/Pasc5/i.test(d) && dayofweek > 3 && !/^Dominica/.test(ctx.dayname[1]))
              ? 'Asc'
              : /^Pasc[0-5]/.test(d)
                ? 'Pasch'
                : /^Pasc7/.test(d)
                  ? 'Pent'
                  : ''

  if (
    (caller === 'Psalmi minor' || caller === 'Invitatorium' || caller === 'Hymnus matutinum') &&
    (tname === 'Asc' || tname === 'Pent')
  ) {
    tname = 'Pasch'
  }

  if (caller === 'Lectio brevis Prima' && !/cist/i.test(version)) {
    tname ||= 'Per Annum'
  }

  if (caller === 'Hymnus major' && !tname) {
    tname =
      !/cist|praedicatorum/i.test(version) || (ctx.hora === 'Vespera' && dayofweek === 6)
        ? `Day${dayofweek}`
        : 'Day0'
  }

  if (/^Capitulum|major$/.test(caller) && !tname) {
    tname =
      dayofweek === 0 ||
      (caller === 'Capitulum minor' &&
        /Duplex/i.test(ctx.dayname[1]) &&
        !/(Dominica|Vigilia)/.test(ctx.dayname[1]))
        ? 'Dominica'
        : 'Feria'
  }

  if (
    caller === 'Doxology' ||
    caller === 'Prima responsory' ||
    (/monastic|196/i.test(version) && caller !== 'Psalmi minor' && caller !== 'Nunc dimittis')
  ) {
    if (/^Nat/.test(d)) {
      tname = day >= 6 && day < 13 ? 'Epi' : 'Nat'
    } else if (/^Epi[01]/i.test(d) && day < 14) {
      tname = 'Epi'
    }
  }

  if ((caller === 'MM Capitulum' || caller === 'Nunc dimittis') && tname) {
    tname = ` ${tname}`
    if (caller === 'Nunc dimittis' && /^Quad[34]/.test(d)) tname += '3'
  }

  return tname
}

// Port of alleluia_required.
export function alleluiaRequired(dayname0: string, votive: string): boolean {
  return /Pasc/i.test(dayname0) && !/C(?:9|12)/.test(votive)
}

// Port of Septuagesima_vesp.
export function septuagesimaVesp(state: HoursState): boolean {
  const ctx = state.day.ctx
  return (
    ctx.dayofweek === 6 &&
    /Vespera/i.test(state.hora) &&
    ((state.day.vespera === 1 && /Quadp1/.test(ctx.dayname[0])) ||
      (state.day.vespera === 3 && /Quadp1-0/.test(state.day.state.cwinner)))
  )
}

// Port of triduum_gloria_omitted.
export function triduumGloriaOmitted(ctx: RubricContext, vespera: number): boolean {
  return /Quad6/i.test(ctx.dayname[0]) && ctx.dayofweek > 3 && vespera !== 1
}

// Port of LanguageTextTools::alleluia — the bare word from the Alleluia prayer.
export async function alleluiaWord(state: HoursState, lang: string): Promise<string> {
  const text = await state.texts.prayer('Alleluia', lang)
  return text.replace(/^v\. (.*?)\..*/s, '$1')
}

async function alleluiaRegexp(state: HoursState, lang: string): Promise<RegExp> {
  const words = new Set<string>()
  for (const l of ['Latin', state.lang1, state.lang2, state.session.fallbackLang]) {
    const w = (await alleluiaWord(state, l)).toLowerCase()
    if (w) words.add(w)
  }
  words.add('allel[uú][ij]a')
  return new RegExp(`(?:${[...words].join('|')})`, 'i')
}

// Port of ensure_single_alleluia (non-gabc).
export async function ensureSingleAlleluia(
  state: HoursState,
  text: string,
  lang: string,
): Promise<string> {
  if (!text) return text
  const regex = await alleluiaRegexp(state, lang)
  if (new RegExp(`${regex.source}\\p{P}?\\)?\\s*$`, 'iu').test(text)) return text
  const word = (await alleluiaWord(state, lang)).toLowerCase()
  return text.replace(/\p{P}?\s*$/u, `, ${word}.`)
}

// Port of ensure_double_alleluia (non-gabc).
export async function ensureDoubleAlleluia(
  state: HoursState,
  text: string,
  lang: string,
): Promise<string> {
  const regex = await alleluiaRegexp(state, lang)
  const double = new RegExp(`${regex.source}[,.] ${regex.source}\\p{P}?\\s*$`, 'iu')
  if (double.test(text)) return text
  const word = await alleluiaWord(state, lang)
  let out = text.replace(/\s*\*\s*(.)/, (_, c: string) => ` ${c.toLowerCase()}`)
  out = out.replace(/\p{P}?\s*$/u, `, * ${word}, ${word.toLowerCase()}.`)
  return out
}

// Port of process_inline_alleluias (non-gabc): unbracket bracketed alleluias
// in Paschaltide, remove them otherwise.
export async function processInlineAlleluias(
  state: HoursState,
  text: string,
  lang: string,
  paschal: boolean,
): Promise<string> {
  const regex = await alleluiaRegexp(state, lang)
  if (paschal) {
    return text.replace(new RegExp(`\\((${regex.source}[\\s\\S]*?)\\)`, 'gi'), ' $1 ')
  }
  return text.replace(new RegExp(`\\(${regex.source}[\\s\\S]*?\\)`, 'gi'), '')
}

// Port of suppress_alleluia (non-gabc).
export async function suppressAlleluia(
  state: HoursState,
  text: string,
  lang: string,
): Promise<string> {
  const regex = await alleluiaRegexp(state, lang)
  return text.replace(new RegExp(`[,.]?\\s*${regex.source}`, 'gi'), '')
}

// Port of alleluia_ant.
export async function alleluiaAnt(state: HoursState, lang: string): Promise<string> {
  const u = await alleluiaWord(state, lang)
  const l = u.toLowerCase()
  return `${u}, * ${l}, ${l}.`
}

// Port of postprocess_ant (non-gabc).
export async function postprocessAnt(
  state: HoursState,
  ant: string,
  lang: string,
): Promise<string> {
  if (!ant) return ant
  if (alleluiaRequired(state.day.ctx.dayname[0], state.votive)) {
    return ensureSingleAlleluia(state, ant, lang)
  }
  return ant
}

// Port of postprocess_vr.
export async function postprocessVr(state: HoursState, vr: string, lang: string): Promise<string> {
  if (!vr) return vr
  if (!alleluiaRequired(state.day.ctx.dayname[0], state.votive)) return vr
  const m = /^([\s\S]*?)(^\s*R\/?\..*)$/m.exec(vr)
  if (!m) return ensureSingleAlleluia(state, vr, lang)
  const versicle = await ensureSingleAlleluia(state, m[1].replace(/\s+$/, ''), lang)
  const response = await ensureSingleAlleluia(state, m[2], lang)
  return `${versicle}\n${response}`
}

// Port of postprocess_short_resp (non-gabc).
export async function postprocessShortResp(
  state: HoursState,
  lines: string[],
  lang: string,
): Promise<string[]> {
  const out = lines.map((l) => l.replace(/&Gloria1?/, '&Gloria1'))
  if (!alleluiaRequired(state.day.ctx.dayname[0], state.votive)) return out

  // Port of the flip-flop ranges: inside the short responsory proper
  // (R.br … third R.), the R-line after a V-line becomes 'R. Alleluia,
  // alleluia'; other R-lines get a double alleluia; V/R lines after the
  // responsory get a single alleluia.
  let inResp = false
  let rlines = 0
  let inVR = false
  for (let i = 0; i < out.length; i++) {
    const line = out[i]
    let endResp = false
    if (!inResp && /^R\.br\./.test(line)) inResp = true
    else if (inResp && /^R\./.test(line) && ++rlines >= 3) endResp = true

    if (inResp || endResp) {
      if (!inVR && /^V\./.test(line)) inVR = true
      if (inVR && /^R\./.test(line)) {
        out[i] = `R. ${await state.texts.prayer('Alleluia Duplex', lang)}`.replace(/\s+$/, '')
        inVR = false
      } else if (/^R\./.test(line)) {
        out[i] = await ensureDoubleAlleluia(state, line, lang)
      }
    } else if (/^[VR]\./.test(line)) {
      out[i] = await ensureSingleAlleluia(state, line, lang)
    }
    if (endResp) inResp = false
  }
  return out
}

// Port of getantcross — mark the ‡ where the psalm's first line matches the
// antiphon opening (text comparison after depuncting).
export function getantcross(psalmline: string, antline: string): string {
  const depunct = (s: string) =>
    s
      .replace(/[.,:?!"';*]/g, '')
      .replace(/[áÁ]/g, 'a')
      .replace(/[éÉ]/g, 'e')
      .replace(/[íí]/g, 'i')
      .replace(/[óöõÓÖÔ]/g, 'o')
      .replace(/[úüûÚÜÛ]/g, 'u')
      .replace(/æ/g, 'ae')

  const psalmWords = psalmline.split(' ')
  const antWords = antline.split(' ')
  let pind = 0
  let aind = 0
  let matched = 0
  while (aind < antWords.length && pind < psalmWords.length) {
    const item1 = depunct(psalmWords[pind++])
    if (!item1) continue
    const item2 = depunct(antWords[aind++])
    if (item1.toLowerCase() !== item2.toLowerCase()) return psalmline
    matched = pind
  }
  if (aind < antWords.length) return psalmline
  // Antiphon fully matched at the start: insert the dagger after it.
  const head = psalmWords.slice(0, matched).join(' ')
  const tail = psalmWords.slice(matched).join(' ')
  return tail ? `${head} /:‡:/ ${tail}` : `${head} /:‡:/`
}

// Port of loadspecial.
export function loadspecial(text: string, version: string): string[] {
  let t = text
  if (!/196/.test(version)) {
    t = t.replace(/^(Ant\. .*?) \* .*?$/m, '$1')
  }
  return t.split('\n')
}
