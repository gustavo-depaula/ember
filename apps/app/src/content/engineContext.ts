import type { EngineContext } from '@ember/content-engine'
import { resolveCanticle, resolvePrayer } from '@/content/registry'
import i18n, { localizeBilingual, localizeContent } from '@/lib/i18n'
import { parseTrackEntry } from '@/lib/lectio'
import { parsePsalmRef } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

export function createEngineContext(bookId?: string): EngineContext {
  const { contentLanguage, secondaryLanguage } = usePreferencesStore.getState()

  // Build prayers map with scoped resolution via Proxy
  const prayers = new Proxy(
    {} as Record<string, { title: Record<string, string>; body: Record<string, string> }>,
    {
      get(_, ref: string) {
        return resolvePrayer(ref, bookId)
      },
      has(_, ref: string) {
        return resolvePrayer(ref, bookId) !== undefined
      },
    },
  )

  const canticles = new Proxy(
    {} as Record<string, { title: Record<string, string>; body: Record<string, string> }>,
    {
      get(_, ref: string) {
        return resolveCanticle(ref)
      },
      has(_, ref: string) {
        return resolveCanticle(ref) !== undefined
      },
    },
  )

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
  }
}
