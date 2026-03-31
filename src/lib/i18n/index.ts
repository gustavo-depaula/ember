import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en'
import ptBR from './locales/pt-BR'

export const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Portugu\u00eas' },
] as const

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
  lng: 'en',
  fallbackLng: 'en',
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

export function localizeAsset(obj: { english: string; portuguese?: string }): string {
  if (i18n.language === 'pt-BR' && obj.portuguese) return obj.portuguese
  return obj.english
}

export function localizeContent(text: { en: string; 'pt-BR'?: string }): string {
  if (i18n.language === 'pt-BR' && text['pt-BR']) return text['pt-BR']
  return text.en
}
