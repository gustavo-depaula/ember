import { AsyncLocalStorage } from 'node:async_hooks'
import i18n from '@/lib/i18n'

export const locales = ['en-US', 'pt-BR'] as const
export type Locale = (typeof locales)[number]

// URL prefix per locale. English lives at the root so the bare domain is a
// real, indexable page.
export const localePrefix: Record<Locale, string> = { 'en-US': '', 'pt-BR': '/pt' }
export const htmlLang: Record<Locale, string> = { 'en-US': 'en', 'pt-BR': 'pt-BR' }

// The app's content code reads one global `i18n.language`. Pages of both
// languages render in the same process, so the "current language" is scoped
// to the async call chain of the page being rendered.
const current = new AsyncLocalStorage<Locale>()

Object.defineProperty(i18n, 'language', {
  configurable: true,
  get: () => current.getStore() ?? 'en-US',
})

const baseT = i18n.t.bind(i18n)
i18n.t = ((key: string, options?: Record<string, unknown>) =>
  baseT(key, { lng: current.getStore() ?? 'en-US', ...options })) as typeof i18n.t

export function withLocale<T>(locale: Locale, fn: () => T): T {
  return current.run(locale, fn)
}

export function translator(locale: Locale) {
  return (key: string, options?: Record<string, unknown>): string =>
    baseT(key, { lng: locale, ...options }) as string
}
