import { useEventStore } from '@/db/events/state'
import { bookLanguageCursorId, getCursor, setCursor } from '@/db/repositories/cursors'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { bookLang } from './bookContent'

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
  return parseOverride(getCursor(bookLanguageCursorId(bookId))?.position)
}

export async function setBookLanguageOverride(bookId: string, lang: string): Promise<void> {
  await setCursor(bookLanguageCursorId(bookId), JSON.stringify({ lang }))
}

function parseOverride(position: string | undefined): string | undefined {
  return position ? (JSON.parse(position) as StoredLanguage).lang : undefined
}

/** getBookLanguageOverride, re-rendering when the reader switches the book. The
 *  event store applies a cursor synchronously, so the switch shows at once. */
export function useBookLanguageOverride(bookId: string | undefined): string | undefined {
  const position = useEventStore((s) =>
    bookId ? s.cursors.get(bookLanguageCursorId(bookId))?.position : undefined,
  )
  return parseOverride(position)
}

// The tail every book's language cursor id ends in.
const languageCursorSuffix = bookLanguageCursorId('').slice('book/'.length)

/** Every book's language override as one string, which moves only when one is
 *  switched — a change signal for a hook that reads many books' overrides, and
 *  that would otherwise re-render on each reading-position save. */
export function useBookLanguageOverridesSignature(): string {
  return useEventStore((s) => {
    let signature = ''
    for (const [id, cursor] of s.cursors) {
      if (id.endsWith(languageCursorSuffix)) signature += `${id}=${cursor.position}\n`
    }
    return signature
  })
}

/** The language `bookId` is read in, among `langs` — see bookLang. */
export function useBookLang(bookId: string | undefined, langs: readonly string[]): string {
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  return bookLang(langs, contentLanguage, useBookLanguageOverride(bookId))
}
