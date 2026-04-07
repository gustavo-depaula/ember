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
  if (i18n.language === 'pt-BR' && text['pt-BR']) return text['pt-BR']
  return text['en-US'] ?? ''
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
  text: { 'en-US'?: string; 'pt-BR'?: string; la?: string },
  primary: ContentLanguage,
  secondary: ContentLanguage | undefined,
): BilingualText {
  const primaryText = resolveLanguage(text, primary) ?? resolveLanguage(text, 'en-US') ?? ''

  if (!secondary) return { primary: primaryText }

  const secondaryText = resolveLanguage(text, secondary)
  if (!secondaryText) return { primary: primaryText, secondaryMissing: true }

  return { primary: primaryText, secondary: secondaryText }
}
