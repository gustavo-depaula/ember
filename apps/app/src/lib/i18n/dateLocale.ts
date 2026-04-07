import { format, type Locale } from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'

import i18n from './index'

const localeMap: Record<string, Locale> = {
  'en-US': enUS,
  'pt-BR': ptBR,
}

export function getDateLocale(): Locale {
  return localeMap[i18n.language] ?? enUS
}

export function formatLocalized(date: Date, formatStr: string): string {
  return format(date, formatStr, { locale: getDateLocale() })
}
