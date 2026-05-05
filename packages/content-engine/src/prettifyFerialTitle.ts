/**
 * ember-extra ships some weekday titles in an awkward "<Ordinal> semana
 * <Weekday>" / "<Season> Season <Ordinal> Week <Weekday>" form (Advent,
 * Lent, Easter — not OT). Rewrite to natural missal phrasing per
 * language. Sundays + solemnities + OT weekdays already have natural
 * titles and pass through untouched.
 *
 * Self-contained: no engine dependencies. Add a new locale by appending
 * an entry to FERIAL_RULES.
 */

type LocaleTitle = Record<string, string | undefined>

type FerialRule = {
  // Per-language input title key (matches what ember-extra emits).
  // ember-extra uses 'pt-BR', 'en' (not 'en-US'), 'la', etc.
  key: string
  re: RegExp
  ordinals: Record<string, string>
  seasonPhrase: Record<string, string>
  render: (weekday: string, roman: string, seasonPhrase: string) => string
}

const FERIAL_RULES: FerialRule[] = [
  {
    key: 'pt-BR',
    re: /^(Primeira|Segunda|Terceira|Quarta|Quinta|Sexta|Sétima|Oitava|Nona|Décima)\s+semana\s+((?:Segunda|Terça|Quarta|Quinta|Sexta)-feira|Sábado|Domingo)$/,
    ordinals: {
      Primeira: 'I',
      Segunda: 'II',
      Terceira: 'III',
      Quarta: 'IV',
      Quinta: 'V',
      Sexta: 'VI',
      Sétima: 'VII',
      Oitava: 'VIII',
      Nona: 'IX',
      Décima: 'X',
    },
    seasonPhrase: {
      advent: 'do Advento',
      lent: 'da Quaresma',
      easter: 'da Páscoa',
    },
    render: (wd, r, sp) => `${wd} da ${r} Semana ${sp}`,
  },
  {
    key: 'en',
    re: /^(?:Advent Season|Lent Season|Easter Season)\s+(First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\s+Week\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/,
    ordinals: {
      First: 'I',
      Second: 'II',
      Third: 'III',
      Fourth: 'IV',
      Fifth: 'V',
      Sixth: 'VI',
      Seventh: 'VII',
      Eighth: 'VIII',
      Ninth: 'IX',
      Tenth: 'X',
    },
    seasonPhrase: {
      advent: 'of Advent',
      lent: 'of Lent',
      easter: 'of Easter',
    },
    render: (wd, r, sp) => `${wd} of the ${r} Week ${sp}`,
  },
]

export function prettifyFerialTitle<T extends LocaleTitle>(title: T, season: string | undefined): T {
  if (!season) return title
  let mutated: Record<string, string | undefined> | undefined
  for (const rule of FERIAL_RULES) {
    const seasonPhrase = rule.seasonPhrase[season]
    if (!seasonPhrase) continue
    const raw = title[rule.key]
    if (!raw) continue
    const m = raw.match(rule.re)
    if (!m) continue
    const ordinal = m[1]
    const weekday = m[2]
    const roman = rule.ordinals[ordinal]
    if (!roman) continue
    mutated = mutated ?? { ...title }
    mutated[rule.key] = rule.render(weekday, roman, seasonPhrase)
  }
  return (mutated ?? title) as T
}
