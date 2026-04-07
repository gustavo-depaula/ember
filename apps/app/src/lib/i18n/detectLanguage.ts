import { getLocales } from 'expo-localization'

const supportedLocales = ['en-US', 'pt-BR'] as const
type SupportedLocale = (typeof supportedLocales)[number]
const defaultLocale: SupportedLocale = 'en-US'

export function detectLanguage(): SupportedLocale {
  const locales = getLocales()
  for (const locale of locales) {
    if (supportedLocales.includes(locale.languageTag as SupportedLocale)) {
      return locale.languageTag as SupportedLocale
    }
    const match = supportedLocales.find((s) => s.split('-')[0] === locale.languageCode)
    if (match) return match
  }
  return defaultLocale
}
