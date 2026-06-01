export type Lang = 'en-US' | 'pt-BR'
export type DayBlock = 'gospel' | 'pope'

export function narrowLang(lang: string): Lang {
  return lang === 'pt-BR' ? 'pt-BR' : 'en-US'
}

// Vatican News publishes one "Word of the Day" page per language per date.
// Each content block is headed by a per-language <h2>; we match on that text.
const langConfig: Record<Lang, { path: string; headings: Record<DayBlock, string> }> = {
  'en-US': {
    path: 'en/word-of-the-day',
    headings: { gospel: 'Gospel of the day', pope: 'The words of the Popes' },
  },
  'pt-BR': {
    path: 'pt/palavra-do-dia',
    headings: { gospel: 'Evangelho do Dia', pope: 'As palavras dos Papas' },
  },
}

export function blockHeading(lang: Lang, block: DayBlock): string {
  return langConfig[lang].headings[block]
}

const pad2 = (n: number): string => String(n).padStart(2, '0')

// URL carries the calendar date: .../YYYY/MM/DD.html. `date` is the app's
// logical "today" (midnight local), so use its local Y/M/D.
export function dayUrl(lang: Lang, date: Date): string {
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  return `https://www.vaticannews.va/${langConfig[lang].path}/${y}/${m}/${d}.html`
}
