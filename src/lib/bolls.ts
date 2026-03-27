const baseUrl = 'https://bolls.life'

export type BollsBook = {
  bookid: number
  name: string
  chronorder: number
  chapters: number
}

export type BollsVerse = {
  pk: number
  verse: number
  text: string
}

export type BollsLanguageEntry = {
  language: string
  translations: Array<{
    short_name: string
    full_name: string
    updated: number
    dir?: string
  }>
}

export type Translation = {
  code: string
  name: string
  language: string
  languageName: string
  description: string
  source: 'bundled' | 'api'
  numbering: PsalmNumbering
  catholic: boolean
}

export async function fetchBooks(translation: string): Promise<BollsBook[]> {
  const res = await fetch(`${baseUrl}/get-books/${translation}/`)
  if (!res.ok) {
    throw new Error(`Bolls.life: failed to fetch books for ${translation} (${res.status})`)
  }
  return res.json()
}

export async function fetchChapter(
  translation: string,
  bookId: number,
  chapter: number,
): Promise<BollsVerse[]> {
  const res = await fetch(`${baseUrl}/get-text/${translation}/${bookId}/${chapter}/`)
  if (!res.ok) {
    throw new Error(
      `Bolls.life: failed to fetch ${translation}/${bookId}/${chapter} (${res.status})`,
    )
  }
  return res.json()
}

// Curated list of Catholic-friendly translations with rich metadata
export const suggestedTranslations: Translation[] = [
  {
    code: 'DRB',
    name: 'Douay-Rheims Bible',
    language: 'EN',
    languageName: 'English',
    description:
      'Classic Catholic translation, public domain. Full 73-book canon bundled for offline use.',
    source: 'bundled',
    numbering: 'lxx',
    catholic: true,
  },
  {
    code: 'NABRE',
    name: 'New American Bible Revised Edition',
    language: 'EN',
    languageName: 'English',
    description: 'Standard Catholic translation used in the US liturgy and daily Mass readings.',
    source: 'api',
    numbering: 'mt',
    catholic: true,
  },
  {
    code: 'RSV',
    name: 'Revised Standard Version',
    language: 'EN',
    languageName: 'English',
    description: 'Widely respected ecumenical translation favored by many Catholic scholars.',
    source: 'api',
    numbering: 'mt',
    catholic: true,
  },
  {
    code: 'NRSVCE',
    name: 'New Revised Standard Version Catholic Edition',
    language: 'EN',
    languageName: 'English',
    description: 'USCCB approved Catholic translation used in Hallow and various Catholic apps.',
    source: 'api',
    numbering: 'mt',
    catholic: true,
  },
  {
    code: 'RSV2CE',
    name: 'Revised Standard Version 2nd Catholic Edition',
    language: 'EN',
    languageName: 'English',
    description: 'Updated RSV Catholic Edition widely used by Catholics today.',
    source: 'api',
    numbering: 'mt',
    catholic: true,
  },
  {
    code: 'NJB1985',
    name: 'New Jerusalem Bible',
    language: 'EN',
    languageName: 'English',
    description: 'Catholic translation from the Jerusalem Bible tradition, literary style.',
    source: 'api',
    numbering: 'mt',
    catholic: true,
  },
  {
    code: 'CNBB',
    name: 'Bíblia CNBB',
    language: 'PT',
    languageName: 'Português',
    description: 'Tradução oficial da Conferência Nacional dos Bispos do Brasil.',
    source: 'api',
    numbering: 'mt',
    catholic: true,
  },
  {
    code: 'VULG',
    name: 'Vulgata Latina',
    language: 'LA',
    languageName: 'Latina',
    description: 'The Latin Vulgate, the official Bible of the Catholic Church for centuries.',
    source: 'api',
    numbering: 'lxx',
    catholic: true,
  },
]

export async function fetchAllTranslations(): Promise<BollsLanguageEntry[]> {
  const res = await fetch(`${baseUrl}/static/bolls/app/views/languages.json`)
  if (!res.ok) {
    throw new Error(`Bolls.life: failed to fetch translations list (${res.status})`)
  }
  return res.json()
}

export type PsalmNumbering = 'mt' | 'lxx'

export function getPsalmNumbering(translationCode: string): PsalmNumbering {
  const t = suggestedTranslations.find((t) => t.code === translationCode)
  return t?.numbering ?? 'mt'
}

// Maps Bolls.life freeform language strings (e.g. "Ukrainian Українська") to ISO-ish 2-letter codes
const languageNameToCode: Record<string, string> = {
  english: 'EN',
  portuguese: 'PT',
  spanish: 'ES',
  french: 'FR',
  german: 'DE',
  italian: 'IT',
  latin: 'LA',
  chinese: 'ZH',
  korean: 'KO',
  japanese: 'JA',
  russian: 'RU',
  arabic: 'AR',
  hebrew: 'HE',
  greek: 'EL',
  dutch: 'NL',
  polish: 'PL',
  czech: 'CZ',
  hungarian: 'HU',
  romanian: 'RO',
  swedish: 'SV',
  norwegian: 'NO',
  afrikaans: 'AF',
  swahili: 'SW',
  hindi: 'HI',
  tamil: 'TA',
  vietnamese: 'VI',
  indonesian: 'ID',
  ukrainian: 'UK',
  nepali: 'NE',
  kannada: 'KN',
  malayalam: 'ML',
  farsi: 'FA',
}

export function extractLanguageCode(languageString: string): string {
  const lower = languageString.toLowerCase()
  for (const [key, code] of Object.entries(languageNameToCode)) {
    if (lower.includes(key)) return code
  }
  return languageString.slice(0, 2).toUpperCase()
}

export function getTranslationLanguage(translationCode: string): string {
  const suggested = suggestedTranslations.find((t) => t.code === translationCode)
  if (suggested) return suggested.language
  return translationCode.slice(0, 2).toUpperCase()
}
