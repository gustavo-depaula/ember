import type { Lang, Line, Segment } from '@ember/missal-schema'

/**
 * Gospel-acclamation splitting, ported from refine.py: the slot arrives as a
 * flat per-language body mixing the printed header ("Aclamação ao Evangelho" /
 * "Alleluia vel Versus ante Evangelium"), the people's refrain wrap, the
 * cantor's verse, and an inline scripture reference. Output: mode +
 * acclamation + verse + citation.
 */

const labelPatterns: Partial<Record<Lang, RegExp>> = {
  la: /^(?:Alleluia(?:\s+vel\s+Versus\s+ante\s+Evangelium)?|Versus\s+ante\s+Evangelium)(?=\s|$)/,
  es: /^(?:Aleluya(?:\s+vel\s+Vers[íi]culo\s+antes\s+del\s+Evangelio)?|Vers[íi]culo\s+antes\s+del\s+Evangelio)(?=\s|$)/,
  // en: no separate header in source — "Alleluia, alleluia." IS the wrap.
  'pt-BR':
    /^(?:Aclamação\s+ao\s+Evangelho|Aclamaçãoao\s+Evangelho|Aclamçãoao\s+Evangelho|Aclamção\s+ao\s+Evangelho|Aclamação)(?=\s|$)/,
  it: /^(?:Canto\s+al\s+Vangelo|Acclamazione\s+al\s+Vangelo)(?=\s|$)/,
  fr: /^(?:All[ée]luia(?:\s+vel\s+Verset\s+avant\s+l[’']Évangile)?|Verset\s+avant\s+l[’']Évangile)(?=\s|$)/,
  de: /^(?:Ruf\s+vor\s+dem\s+Evangelium|Ruf\s+vor\s+der\s+Passion|Vor\s+dem\s+Evangelium)(?=\s|$)/,
}

export type GaMode = 'alleluia' | 'versus-ante-evangelium' | 'alleluia-or-versus'

/** Only la/es/fr distinguish the mode in their printed headers. */
const modeFromLabel: Record<string, GaMode> = {
  Alleluia: 'alleluia',
  'Versus ante Evangelium': 'versus-ante-evangelium',
  'Alleluia vel Versus ante Evangelium': 'alleluia-or-versus',
  Aleluya: 'alleluia',
  'Versículo antes del Evangelio': 'versus-ante-evangelium',
  'Aleluya vel Versículo antes del Evangelio': 'alleluia-or-versus',
  Alléluia: 'alleluia',
  'Verset avant l’Évangile': 'versus-ante-evangelium',
  "Verset avant l'Évangile": 'versus-ante-evangelium',
  'Alléluia vel Verset avant l’Évangile': 'alleluia-or-versus',
  "Alléluia vel Verset avant l'Évangile": 'alleluia-or-versus',
}

const refrainWordRe: Record<Lang, string> = {
  la: 'Allel[uú]ia',
  'en-US': '(?:Alleluia|Hallelujah)',
  es: 'Aleluya',
  'pt-BR': 'Aleluia',
  it: 'Alleluia',
  fr: 'All[eé]luia',
  de: 'Halleluja',
}

function leadingRefrainPattern(lang: Lang): RegExp {
  const w = refrainWordRe[lang]
  // Admits the doubled form ("Alleluia, alleluia.") and parenthesized wraps.
  return new RegExp(`^(\\(?${w}(?:[,.]\\s+${w})?\\s*[.!]?\\)?)(?:\\s+|$)`, 'i')
}

function trailingRefrainPattern(lang: Lang): RegExp {
  const w = refrainWordRe[lang]
  return new RegExp(`\\s+(\\(?${w}\\s*[.!]?\\)?)\\s*$`, 'i')
}

function peelLabel(text: string, lang: Lang): [string, string] {
  const pat = labelPatterns[lang]
  if (!pat) return ['', text]
  const m = pat.exec(text)
  if (!m) return ['', text]
  return [m[0].trim(), text.slice(m[0].length).replace(/^\s+/, '')]
}

function peelLeadingRefrain(text: string, lang: Lang): [string, string] {
  const m = leadingRefrainPattern(lang).exec(text)
  if (!m) return ['', text]
  return [m[1].trim(), text.slice(m[0].length).replace(/^\s+/, '')]
}

function peelTrailingRefrain(text: string, lang: Lang): [string, string] {
  const m = trailingRefrainPattern(lang).exec(text)
  if (!m) return [text, '']
  return [text.slice(0, m.index).replace(/\s+$/, ''), m[1].trim()]
}

export interface GaLangParse {
  label: string
  citation: string
  acclamation: Line[]
  verse: Line[]
}

export function parseGaLangLines(lines: Line[], lang: Lang): GaLangParse | undefined {
  const flat: Segment[] = lines.flat().map((s) => ({ ...s }))
  if (flat.length === 0) return undefined

  let label = ''
  let citation = ''

  // 1. Peel the printed header from the first text segment.
  if (flat[0]?.type === 'text') {
    const [peeled, rest] = peelLabel(flat[0].text, lang)
    if (peeled) {
      label = peeled
      if (rest) flat[0].text = rest
      else flat.shift()
    }
  }

  // 2. Lift inline reference segments into the citation; drop from the verse.
  const kept: Segment[] = []
  for (const seg of flat) {
    if (seg.type === 'reference') {
      if (!citation) citation = seg.text.trim()
      continue
    }
    kept.push(seg)
  }
  let segs = kept.filter((s) => !(s.type === 'text' && !s.text.trim()))

  let leadingRefrain = ''
  let trailingRefrain = ''

  // 3. Peel a leading refrain ("Aleluia." / "(Aleluia.)" / "Alleluia, alleluia.").
  if (segs[0]?.type === 'text') {
    const [leading, rest] = peelLeadingRefrain(segs[0].text, lang)
    if (leading) {
      leadingRefrain = leading
      if (rest) segs[0].text = rest
      else segs = segs.slice(1)
    }
  }

  // 4. Peel a trailing refrain.
  const last = segs[segs.length - 1]
  if (last?.type === 'text') {
    const [rest, trailing] = peelTrailingRefrain(last.text, lang)
    if (trailing) {
      trailingRefrain = trailing
      if (rest) last.text = rest
      else segs = segs.slice(0, -1)
    }
  }

  // 5. Verse = response(leading) + remaining + response(trailing).
  const verseSegs: Segment[] = [
    ...(leadingRefrain ? [{ type: 'response' as const, text: leadingRefrain }] : []),
    ...segs,
    ...(trailingRefrain ? [{ type: 'response' as const, text: trailingRefrain }] : []),
  ]

  const refrain = leadingRefrain || trailingRefrain
  return {
    label,
    citation,
    acclamation: refrain ? [[{ type: 'response', text: refrain }]] : [],
    verse: verseSegs.length > 0 ? [verseSegs] : [],
  }
}

export function deriveGaMode(labelsPerLang: Partial<Record<Lang, string>>, hasAcclamation: boolean): GaMode {
  for (const lang of ['la', 'es', 'fr'] as const) {
    const peeled = labelsPerLang[lang]
    if (peeled && modeFromLabel[peeled]) return modeFromLabel[peeled]
  }
  return hasAcclamation ? 'alleluia' : 'versus-ante-evangelium'
}

export interface GaSplit {
  mode: GaMode
  acclamation: Partial<Record<Lang, Line[]>>
  verse: Partial<Record<Lang, Line[]>>
  citation: Partial<Record<Lang, string>>
}

export function splitGospelAcclamation(linesByLang: Partial<Record<Lang, Line[]>>): GaSplit | undefined {
  const labels: Partial<Record<Lang, string>> = {}
  const acclamation: GaSplit['acclamation'] = {}
  const verse: GaSplit['verse'] = {}
  const citation: GaSplit['citation'] = {}

  for (const [lang, lines] of Object.entries(linesByLang) as Array<[Lang, Line[]]>) {
    if (!lines) continue
    const parsed = parseGaLangLines(lines, lang)
    if (!parsed) continue
    if (parsed.label) labels[lang] = parsed.label
    if (parsed.acclamation.length > 0) acclamation[lang] = parsed.acclamation
    if (parsed.verse.length > 0) verse[lang] = parsed.verse
    if (parsed.citation) citation[lang] = parsed.citation
  }

  if (Object.keys(verse).length === 0) return undefined

  return {
    mode: deriveGaMode(labels, Object.keys(acclamation).length > 0),
    acclamation,
    verse,
    citation,
  }
}
