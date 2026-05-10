import type { ContentLanguage } from '@ember/content-engine'

import type { LocalizedText } from '@/content/types'

import { resolvePortions, splitBodyLines } from './lines'

// LocalizedText in @ember/content-engine omits Latin, but corpus prayer JSONs
// include `la`. Widen locally for property access.
type AnyLangText = Partial<Record<ContentLanguage, string>>

type PrayerBodyItem = { inline?: AnyLangText }
type PrayerLike = {
  title: LocalizedText
  body: unknown
  memorize?: {
    portions?: { lines: [number, number]; label?: LocalizedText }[]
  }
}

function localizeWithFallback(text: AnyLangText, language: ContentLanguage): string | undefined {
  return text[language] ?? text['en-US']
}

// Pulls the localized lines out of the manifest body. Multiple body items are
// concatenated with a newline so portion ranges can span them.
function extractLines(body: unknown, language: ContentLanguage): string[] {
  if (!Array.isArray(body)) return []
  const items = body as PrayerBodyItem[]
  const text = items
    .map((item) => item?.inline?.[language] ?? '')
    .filter((s) => s.length > 0)
    .join('\n')
  return splitBodyLines(text)
}

// Returns the title + lines + label for a single (prayer, language, portionIndex)
// review. Returns undefined when the prayer body in that language is empty
// (corpus drift) or when the portion index is out of range.
export function extractPortionContent(
  prayer: PrayerLike,
  language: ContentLanguage,
  portionIndex: number,
): { title: string; portionLabel: string | undefined; lines: string[] } | undefined {
  const lines = extractLines(prayer.body, language)
  if (lines.length === 0) return undefined

  const portions = resolvePortions(lines, prayer.memorize?.portions)
  const portion = portions[portionIndex]
  if (!portion) return undefined

  return {
    title: localizeWithFallback(prayer.title as AnyLangText, language) ?? '',
    portionLabel: portion.label
      ? localizeWithFallback(portion.label as AnyLangText, language)
      : undefined,
    lines: portion.lines,
  }
}
