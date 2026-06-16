export type Lang = 'en-US' | 'pt-BR'

export function narrowLang(lang: string): Lang {
  return lang === 'pt-BR' ? 'pt-BR' : 'en-US'
}

// opusdei.org keys its locale by a lowercase hyphenated path segment.
export function pathLang(lang: Lang): string {
  return lang === 'pt-BR' ? 'pt-br' : 'en-us'
}

const pad2 = (n: number): string => String(n).padStart(2, '0')

// The daily pages carry the calendar date in the path: .../gospel/YYYY-MM-DD/.
// `date` is the app's logical "today" (midnight local), so use its local Y/M/D.
// Doubles as a per-day cache key for date-scoped queries.
export function dateSlug(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function gospelUrl(lang: Lang, date: Date): string {
  return `https://opusdei.org/${pathLang(lang)}/gospel/${dateSlug(date)}/`
}

export function meditationUrl(lang: Lang, date: Date): string {
  return `https://opusdei.org/${pathLang(lang)}/meditation/${dateSlug(date)}/`
}

export function siteHome(lang: Lang): string {
  return `https://opusdei.org/${pathLang(lang)}/`
}

// The gospel page divides scripture from reflection with a paragraph headed by
// this localized word; we keep only the reflection that follows it.
export function commentaryLabel(lang: Lang): string {
  return lang === 'pt-BR' ? 'Comentário' : 'Commentary'
}
