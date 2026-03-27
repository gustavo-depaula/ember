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
})

export default i18n
