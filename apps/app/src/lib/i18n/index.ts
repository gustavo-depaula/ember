import type { BilingualText, ContentLanguage } from '@ember/content-engine'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { detectLanguage } from './detectLanguage'
import enUS from './locales/en-US'
import ptBR from './locales/pt-BR'

export const supportedLanguages = [
  { code: 'en-US', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
] as const

i18n.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'pt-BR': { translation: ptBR },
  },
  lng: detectLanguage(),
  fallbackLng: 'en-US',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
  saveMissing: __DEV__,
  missingKeyHandler: __DEV__
    ? (_lngs, _ns, key) => {
        console.warn(`[i18n] Missing translation key: "${key}"`)
      }
    : undefined,
})

export default i18n

export function localizeContent(text: { 'en-US'?: string; 'pt-BR'?: string }): string {
  const dict = text as Record<string, string | undefined>
  // Prefer the user's language, then the other app language, then Latin (the
  // canonical liturgical fallback). Only after those do we accept any remaining
  // language — otherwise a dict shipped with es/fr/it/de but no app language
  // would surface whichever key sorts first (the corpus serializes with sorted
  // keys, so that would always be German).
  const preference = i18n.language === 'pt-BR' ? ['pt-BR', 'en-US', 'la'] : ['en-US', 'pt-BR', 'la']
  for (const lang of preference) {
    if (dict[lang]) return dict[lang] as string
  }
  const first = Object.values(dict).find(Boolean)
  return first ?? ''
}

export type { BilingualText, ContentLanguage } from '@ember/content-engine'

function resolveLanguage(
  text: { 'en-US'?: string; 'pt-BR'?: string; la?: string },
  lang: ContentLanguage,
): string | undefined {
  if (lang === 'la') return text.la
  return text[lang]
}

export function localizeBilingual(
  text: string | { 'en-US'?: string; 'pt-BR'?: string; la?: string },
  primary: ContentLanguage,
  secondary: ContentLanguage | undefined,
): BilingualText {
  if (typeof text === 'string') return { primary: text }
  const primaryText =
    resolveLanguage(text, primary) ??
    resolveLanguage(text, 'en-US') ??
    Object.values(text).find(Boolean) ??
    ''

  if (!secondary) return { primary: primaryText }

  const secondaryText = resolveLanguage(text, secondary)
  if (!secondaryText) return { primary: primaryText, secondaryMissing: true }

  return { primary: primaryText, secondary: secondaryText }
}
