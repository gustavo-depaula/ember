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
