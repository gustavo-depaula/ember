import { supportedLanguages } from '@/lib/i18n'

// Derived: { en: 'en-US', pt: 'pt-BR' }. Latin and any future single-segment
// canonical codes are no-ops because shortOf('la') === 'la'.
const SHORT_TO_CANONICAL: Record<string, string> = Object.fromEntries(
  supportedLanguages
    .map(({ code }) => [code.split('-')[0], code] as const)
    .filter(([short, code]) => short !== code),
)

function shortOf(code: string): string {
  return code.split('-')[0]
}

/**
 * Mass + of-library blobs are keyed with 2-letter codes (`en`, `pt`) while
 * the app uses BCP47 (`en-US`, `pt-BR`). Given a requested canonical code
 * and the manifest's available-langs map, return the key actually present
 * in the manifest (or undefined if neither form is available).
 */
export function pickAvailableLang(
  requested: string,
  available: Record<string, unknown>,
): string | undefined {
  if (available[requested]) return requested
  const short = shortOf(requested)
  return short !== requested && available[short] ? short : undefined
}

const LANG_KEY_RE = /^[a-z]{2}(-[A-Z]{2,3})?$/

/**
 * Recursively rewrite lang keys at localized leaves to canonical app codes
 * (`en` → `en-US`, `pt` → `pt-BR`). Other codes (`la`, `fr`, `es`, ...) are
 * preserved. A leaf is a non-empty object whose keys all match LANG_KEY_RE.
 */
export function normalizeLangKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(normalizeLangKeys)
  if (obj && typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length > 0 && entries.every(([k]) => LANG_KEY_RE.test(k))) {
      const out: Record<string, unknown> = {}
      for (const [k, v] of entries) out[SHORT_TO_CANONICAL[k] ?? k] = v
      return out
    }
    const out: Record<string, unknown> = {}
    for (const [k, v] of entries) out[k] = normalizeLangKeys(v)
    return out
  }
  return obj
}
