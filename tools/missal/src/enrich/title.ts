import type { Lang, Localized } from '@ember/missal-schema'
import { fixTitleTypos } from '../fixes/universal'

/**
 * Build-time title prettification (was runtime prettifyCelebrationTitle).
 * The baseline ships display-ready pt-BR titles and already-disambiguated
 * Christmas/vigil titles; what remains is: all-caps solemnity titles
 * ("NATAL DO SENHOR"), the "<Ordinal> semana <X>" / "<Season> Season <X>"
 * prefix on weekday solemnities, and en→en-US mapping (done in localized).
 */

const ptConnectors = new Set([
  'de', 'do', 'da', 'dos', 'das', 'e', 'em', 'na', 'no', 'nas', 'nos', 'a', 'o', 'as', 'os',
])
const enConnectors = new Set([
  'of', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'a', 'an', 'by',
])

const ptOrdinalWeekPrefix =
  /^(?:Primeira|Segunda|Terceira|Quarta|Quinta|Sexta|Sétima|Oitava|Nona|Décima)\s+semana\s+(?=\p{Lu})/u
const enSeasonPrefix = /^(?:Advent|Lent|Easter)\s+Season\s+/

function titleCase(raw: string, connectors: Set<string>): string {
  let first = true
  return raw.replace(/\p{L}+/gu, (word) => {
    const wasFirst = first
    first = false
    if (word !== word.toUpperCase()) return word // mixed-case → leave as authored
    const lower = word.toLowerCase()
    if (!wasFirst && connectors.has(lower)) return lower
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  })
}

function prettifyOne(raw: string, lang: Lang): string {
  let out = fixTitleTypos(raw)
  if (lang === 'pt-BR') out = titleCase(out.replace(ptOrdinalWeekPrefix, '').trim(), ptConnectors)
  else if (lang === 'en-US') out = titleCase(out.replace(enSeasonPrefix, '').trim(), enConnectors)
  // Latin and the rest pass through (purists recognize the canonical forms).
  return out.trim()
}

export function prettifyTitle(title: Localized): Localized {
  const out: Localized = {}
  for (const [lang, text] of Object.entries(title) as Array<[Lang, string]>) {
    if (text) out[lang] = prettifyOne(text, lang)
  }
  return out
}
