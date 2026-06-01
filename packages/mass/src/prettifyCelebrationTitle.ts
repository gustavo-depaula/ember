/**
 * Most title cleanup now happens upstream in ember-extra (title-casing
 * pure ALL-CAPS strings, disambiguating the four Christmas Day Masses,
 * synthesizing ferial titles from season/weekIndex/weekday metadata).
 * What remains is the awkward "<Season> Season <SOLEMNITY>" / "<Ordinal>
 * semana <SOLEMNITY>" prefix that ember-extra still emits when a
 * solemnity falls on a weekday — those titles arrive mixed-case so the
 * upstream all-caps gate doesn't fire. Strip the prefix and title-case
 * what remains, then map the `en` key to `en-US` for the engine.
 */

export type EmberExtraTitle = Record<string, string | undefined>
export type CelebrationTitle = { 'en-US'?: string; 'pt-BR'?: string; la?: string }

const PT_CONNECTORS = new Set([
  'de',
  'do',
  'da',
  'dos',
  'das',
  'e',
  'em',
  'na',
  'no',
  'nas',
  'nos',
  'a',
  'o',
  'as',
  'os',
])

const EN_CONNECTORS = new Set([
  'of',
  'the',
  'and',
  'or',
  'in',
  'on',
  'at',
  'to',
  'for',
  'a',
  'an',
  'by',
])

const PT_ORDINAL_WEEK_PREFIX =
  /^(?:Primeira|Segunda|Terceira|Quarta|Quinta|Sexta|Sétima|Oitava|Nona|Décima)\s+semana\s+(?=\p{Lu})/u

const EN_SEASON_PREFIX = /^(?:Advent|Lent|Easter)\s+Season\s+/

export function prettifyCelebrationTitle(title: EmberExtraTitle): CelebrationTitle {
  const out: CelebrationTitle = {}
  const ptRaw = title['pt-BR']
  const enRaw = title['en'] ?? title['en-US']
  const laRaw = title['la']

  if (ptRaw) out['pt-BR'] = normalize(ptRaw, PT_CONNECTORS, PT_ORDINAL_WEEK_PREFIX)
  if (enRaw) out['en-US'] = normalize(enRaw, EN_CONNECTORS, EN_SEASON_PREFIX)
  if (laRaw) out.la = laRaw

  return out
}

function normalize(raw: string, connectors: Set<string>, stripPrefix: RegExp): string {
  return titleCase(raw.replace(stripPrefix, '').trim(), connectors)
}

function titleCase(raw: string, connectors: Set<string>): string {
  let firstWord = true
  return raw.replace(/\p{L}+/gu, (word) => {
    const wasFirst = firstWord
    firstWord = false
    if (word !== word.toUpperCase()) return word
    const lower = word.toLowerCase()
    if (!wasFirst && connectors.has(lower)) return lower
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  })
}
