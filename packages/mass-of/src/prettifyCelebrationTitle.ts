/**
 * ember-extra ships solemnity titles in awkward shapes:
 *   - all-caps: "NATAL DO SENHOR", "ASCENÇÃO DO SENHOR" (≈40% of pt-BR
 *     solemnity entries shout in caps);
 *   - "<Ordinal> semana <SOLEMNITY>" prefix when a solemnity falls on a
 *     weekday: "Sexta semana ASCENÇÃO DO SENHOR";
 *   - English keys live under `en` (not `en-US`), so the engine's en-US
 *     localizer falls back to Latin;
 *   - all four Christmas Masses share an identical title — "NATAL DO
 *     SENHOR" with no Vigil/Night/Dawn/Day disambiguator.
 *
 * Normalize at the mass-of layer so both the celebration picker chips
 * and the banner read clean titles.
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

const CHRISTMAS_VARIANTS: Record<string, { 'pt-BR': string; 'en-US': string }> = {
  'tempore.christmas.nativity-vigil': {
    'pt-BR': 'Missa da Vigília',
    'en-US': 'Mass at the Vigil',
  },
  'tempore.christmas.nativity-night': {
    'pt-BR': 'Missa da Noite',
    'en-US': 'Mass during the Night',
  },
  'tempore.christmas.nativity-dawn': {
    'pt-BR': 'Missa da Aurora',
    'en-US': 'Mass at Dawn',
  },
  'tempore.christmas.nativity-day': {
    'pt-BR': 'Missa do Dia',
    'en-US': 'Mass during the Day',
  },
}

export function prettifyCelebrationTitle(
  title: EmberExtraTitle,
  primaryId: string,
): CelebrationTitle {
  const out: CelebrationTitle = {}
  const ptRaw = title['pt-BR']
  const enRaw = title['en'] ?? title['en-US']
  const laRaw = title['la']

  if (ptRaw) out['pt-BR'] = normalize(ptRaw, PT_CONNECTORS, PT_ORDINAL_WEEK_PREFIX)
  if (enRaw) out['en-US'] = normalize(enRaw, EN_CONNECTORS, EN_SEASON_PREFIX)
  if (laRaw) out.la = laRaw

  const variant = CHRISTMAS_VARIANTS[primaryId]
  if (variant) {
    if (out['pt-BR']) out['pt-BR'] = `${out['pt-BR']} — ${variant['pt-BR']}`
    if (out['en-US']) out['en-US'] = `${out['en-US']} — ${variant['en-US']}`
  }

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
