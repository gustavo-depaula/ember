import type { ContentLanguage } from '@ember/content-engine'

// Composite key for memorization cards. The pipe avoids collision with
// `prayer/<id>` slashes in catalog ids and language tags like `pt-BR`.

const SEP = '|'

export function composeCardKey(
  prayerId: string,
  language: ContentLanguage,
  portionIndex: number,
): string {
  return `${prayerId}${SEP}${language}${SEP}${portionIndex}`
}

// Prefix of a card key, used for the per-(prayer, language) derived index.
export function composePrayerLangKey(prayerId: string, language: ContentLanguage): string {
  return `${prayerId}${SEP}${language}`
}

export function parseCardKey(key: string): {
  prayerId: string
  language: string
  portionIndex: number
} {
  const parts = key.split(SEP)
  if (parts.length !== 3) throw new Error(`malformed card key: ${key}`)
  return {
    prayerId: parts[0],
    language: parts[1],
    portionIndex: Number.parseInt(parts[2], 10),
  }
}
