import type { EngineContext } from './context'

export function resolveLanguageCandidates(
  ec: EngineContext,
  book: string,
  policy: 'active-language' | 'fallback-content-language' | 'book-default',
): string[] {
  const candidates = [ec.language]
  if (policy !== 'active-language') {
    candidates.push(ec.contentLanguage)
  }
  if (policy === 'book-default') {
    candidates.push(...(ec.getBookLanguages?.(book) ?? []))
  }
  return Array.from(new Set(candidates.filter((lang) => Boolean(lang))))
}
