/**
 * Strings the old corpus carries that refine.py DERIVED rather than extracted:
 * synthesized rubrics/titles/labels and per-language reformatted citations.
 * They can never match a raw parse of the upstream — bucketing them apart
 * keeps NOT-FOUND meaning "possible extraction regression".
 */
const derivedRes: RegExp[] = [
  // Gloria instruction rubrics (synthesized per mass in 7 langs)
  /gl[oó]ria in exc/i,
  /^\d?\.? ?(si dice il gloria|diz-se o gl[oó]ria|se dice gloria|on (dit|chante) le gloria|gloria \(|the gloria in excelsis)/i,
  /^(no se dice|não se diz|non si dice|on ne dit pas) (el |o |il |le )?gl[oó]ria/i,
  // Synthesized part headings (split_rites_into_parts)
  /^(preamble|preâmbulo|préambule|preambolo|preámbulo|appendix|apêndice|appendice|anhang|apéndice)$/i,
  // Synthesized/localized rank labels
  /^(nicht gebotener )?gedenktag$/i,
  /^(optional memorial|memória facultativa|memoria facultativa|memoria facoltativa|mémoire facultative)$/i,
  /^(memorial|memória|memoria|mémoire|fest|feast|festa|fête|solemnity|solenidade|solemnidad|solennità|solennité|hochfest)$/i,
  /^(fête )?solennité$/i,
  // Synthesized ferial titles ("Friday of the I Week of Advent")
  /^\p{L}[\p{L}\s-]{2,30}(of the|da|de la|della|de la|der) [ivx0-9]+ ?[ªa°.]? ?(week|semana|settimana|semaine|woche)/iu,
  /^\d+e? ?(dimanche|domingo|sonntag|sunday|domenica)/i,
]

/**
 * Scripture-citation shapes (refine reformatted citations per language
 * conventions — "Mt 23, 8-12", "Ps 95:1 and 3, 4-5", "1 Thess 3, 12 — 4, 2",
 * "Sl Is 12"): short, contains digits, and the letter content is just a few
 * short tokens (book abbreviations + et/and connectors).
 */
function isCitationLike(text: string): boolean {
  if (text.length > 48 || !/\d/.test(text)) return false
  const letterTokens = text
    .replace(/[^\p{L}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return letterTokens.length <= 5 && letterTokens.every((w) => w.length <= 6)
}

// Synthesized/normalized sanctoral titles ("Saint John De Avila, Priest and
// Doctor of the Church") and vigil-disambiguated titles ("… (Messa Vigiliare)").
const titleRes: RegExp[] = [
  /^(saint|st\.|ss\.|são|santo|santa|hl\.|bienheureux|beato|beata|sel\.)\b.{2,70},/i,
  /\((vigil[^)]*|veille[^)]*|messa vigiliare|missa da vigília)\)/i,
  /(segunda|terça|quarta|quinta|sexta|sábado|domingo)(-feira)?\b.{0,30}\b(semana|quaresma|advento)/i,
]

export function isDerivedString(text: string): boolean {
  if (isCitationLike(text)) return true
  if (text.length > 90) return false
  return derivedRes.some((re) => re.test(text)) || titleRes.some((re) => re.test(text))
}
