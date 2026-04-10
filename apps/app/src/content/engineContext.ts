import type { EngineContext } from '@ember/content-engine'
import { getProseText, resolveCanticle, resolvePrayer } from '@/content/registry'
import i18n, { localizeBilingual, localizeContent } from '@/lib/i18n'
import { parseTrackEntry } from '@/lib/lectio'
import { parsePsalmRef } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

export function createEngineContext(bookId?: string, chapterId?: string): EngineContext {
  const { contentLanguage, secondaryLanguage } = usePreferencesStore.getState()

  // Build prayers map with scoped resolution via Proxy
  const prayers = new Proxy({} as Record<string, import('@ember/content-engine').PrayerAsset>, {
    get(_, ref: string) {
      return resolvePrayer(ref, bookId)
    },
    has(_, ref: string) {
      return resolvePrayer(ref, bookId) !== undefined
    },
  })

  const canticles = new Proxy({} as Record<string, import('@ember/content-engine').PrayerAsset>, {
    get(_, ref: string) {
      return resolveCanticle(ref)
    },
    has(_, ref: string) {
      return resolveCanticle(ref) !== undefined
    },
  })

  const prose = new Proxy({} as Record<string, { 'en-US'?: string; 'pt-BR'?: string }>, {
    get(_, filePath: string) {
      if (!bookId) return undefined
      const key = chapterId ? `${chapterId}/${filePath}` : filePath
      return getProseText(key, bookId)
    },
    has(_, filePath: string) {
      if (!bookId) return false
      const key = chapterId ? `${chapterId}/${filePath}` : filePath
      return getProseText(key, bookId) !== undefined
    },
  })

  return {
    language: i18n.language,
    contentLanguage,
    localize: (text) => localizeBilingual(text, contentLanguage, secondaryLanguage),
    localizeUI: localizeContent,
    t: (k, o) => i18n.t(k, o) as string,
    parsePsalmRef,
    parseTrackEntry,
    prayers,
    canticles,
    prose,
  }
}
