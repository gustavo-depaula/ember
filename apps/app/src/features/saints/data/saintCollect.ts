import { localizeContent } from '@/lib/i18n'
import { loadMassFormulary } from '@/lib/mass-of/loaders'

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
  const body = formulary?.collect?.options?.[0]?.body as
    | { lines?: Record<string, Array<Array<{ text?: string }>>> }
    | undefined
  const byLang = body?.lines
  if (!byLang) return undefined
  const picked = byLang[lang] ?? byLang['en-US'] ?? byLang.la
  if (!picked) return undefined
  // Each line is a run of styled segments.
  const lines = picked.map((segments) => segments.map((s) => s.text ?? '').join('')).filter(Boolean)
  if (lines.length === 0) return undefined
  return {
    lang,
    lines,
    title: formulary?.title ? localizeContent(formulary.title) : undefined,
    about: formulary?.description ? localizeContent(formulary.description) : undefined,
  }
}
