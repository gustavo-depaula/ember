import { descriptionOf, type Lang, prayerLines } from '@ember/missal'
import { localizeContent } from '@/lib/i18n'
import { loadMassFormulary } from '@/lib/missal/loaders'

export type SaintCollect = {
  lang: string
  lines: string[]
  /** The formulary's own title, and the Missal's notice of the saint where it has one. */
  title?: string
  about?: string
}

// The Collect (opening prayer) of the Mass formulary a card names as its own
// (`proper`). Resolved by id, never by date: a date's first celebration is often
// a Sunday, a weekday, or another saint. Cards without a proper formulary (≈40%
// of optional memorials have none) resolve to undefined.
export async function loadSaintCollect(
  proper: string,
  lang: string,
): Promise<SaintCollect | undefined> {
  const formulary = await loadMassFormulary(proper)
  if (!formulary) return undefined
  const collect = formulary.items.filter((item) => item.part === 'collect')
  // The reader's language, then English, then Latin.
  const used = ([lang, 'en-US', 'la'] as Lang[]).find((l) => prayerLines(collect, l).length > 0)
  if (!used) return undefined
  const lines = prayerLines(collect, used)
  return {
    lang: used,
    lines,
    title: formulary?.title ? localizeContent(formulary.title) : undefined,
    about: descriptionOf(formulary, used) || undefined,
  }
}
