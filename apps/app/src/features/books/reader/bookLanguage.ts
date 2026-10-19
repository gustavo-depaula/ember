import { bookLanguageCursorId, getCursor, setCursor } from '@/db/repositories/cursors'

// Each language's name in itself, so a reader finds their own language whatever
// the app's language is. Hermes has no Intl.DisplayNames to derive these.
const autonyms: Record<string, string> = {
  ar: 'العربية',
  be: 'Беларуская',
  cs: 'Čeština',
  da: 'Dansk',
  de: 'Deutsch',
  'en-US': 'English',
  es: 'Español',
  fi: 'Suomi',
  fr: 'Français',
  'fr-FR': 'Français',
  grc: 'Ἑλληνική',
  he: 'עברית',
  hr: 'Hrvatski',
  hu: 'Magyar',
  it: 'Italiano',
  ja: '日本語',
  la: 'Latina',
  li: 'Limburgs',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  mg: 'Malagasy',
  nl: 'Nederlands',
  pl: 'Polski',
  'pt-BR': 'Português',
  ro: 'Română',
  ru: 'Русский',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  sw: 'Kiswahili',
  ta: 'தமிழ்',
  uk: 'Українська',
  vi: 'Tiếng Việt',
  zh: '中文',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
}

export function languageAutonym(code: string): string {
  return autonyms[code] ?? code
}

type StoredLanguage = { lang?: string }

/** The language this book was last switched to in the reader, if any. */
export function getBookLanguageOverride(bookId: string): string | undefined {
  const c = getCursor(bookLanguageCursorId(bookId))
  if (!c) return undefined
  return (JSON.parse(c.position) as StoredLanguage).lang
}

export async function setBookLanguageOverride(bookId: string, lang: string): Promise<void> {
  await setCursor(bookLanguageCursorId(bookId), JSON.stringify({ lang }))
}
