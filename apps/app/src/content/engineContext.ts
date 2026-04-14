import type { ContentLanguage, EngineContext } from '@ember/content-engine'
import {
  getBookEntry,
  getProseText,
  loadBookChapterText,
  resolveCanticle,
  resolvePrayer,
} from '@/content/registry'
import i18n, { localizeBilingual, localizeContent } from '@/lib/i18n'
import { parseTrackEntry } from '@/lib/lectio'
import { parsePsalmRef } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

function findTocTitle(
  toc: Array<{ id: string; title: Record<string, string>; children?: unknown[] }>,
  chapterId: string,
): Record<string, string> | undefined {
  for (const node of toc) {
    if (node.id === chapterId) return node.title
    if (Array.isArray(node.children)) {
      const found = findTocTitle(
        node.children as Array<{ id: string; title: Record<string, string>; children?: unknown[] }>,
        chapterId,
      )
      if (found) return found
    }
  }
  return undefined
}

export function createEngineContext(
  libraryId?: string,
  chapterId?: string,
  languagePrefs?: { contentLanguage: ContentLanguage; secondaryLanguage?: ContentLanguage },
): EngineContext {
  const state = usePreferencesStore.getState()
  const contentLanguage = languagePrefs?.contentLanguage ?? state.contentLanguage
  const secondaryLanguage = languagePrefs?.secondaryLanguage ?? state.secondaryLanguage

  // Build prayers map with scoped resolution via Proxy
  const prayers = new Proxy({} as Record<string, import('@ember/content-engine').PrayerAsset>, {
    get(_, ref: string) {
      return resolvePrayer(ref, libraryId)
    },
    has(_, ref: string) {
      return resolvePrayer(ref, libraryId) !== undefined
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
      if (!libraryId) return undefined
      const key = chapterId ? `${chapterId}/${filePath}` : filePath
      return getProseText(key, libraryId)
    },
    has(_, filePath: string) {
      if (!libraryId) return false
      const key = chapterId ? `${chapterId}/${filePath}` : filePath
      return getProseText(key, libraryId) !== undefined
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
    getBookChapterTitle: (book, chapter, lang) => {
      if (!libraryId) return undefined
      const entry = getBookEntry(book, libraryId)
      if (!entry?.toc) return undefined
      const title = findTocTitle(
        entry.toc as Array<{ id: string; title: Record<string, string>; children?: unknown[] }>,
        chapter,
      )
      if (!title) return undefined
      return title[lang] ?? title['pt-BR'] ?? title['en-US'] ?? Object.values(title)[0]
    },
    getBookLanguages: (book) => {
      if (!libraryId) return []
      return getBookEntry(book, libraryId)?.languages ?? []
    },
    loadBookChapterTextAsync: async (book, chapter, lang) => {
      if (!libraryId) return undefined
      const text = await loadBookChapterText(libraryId, book, chapter, lang)
      if (!text) return undefined
      return { [lang]: text }
    },
  }
}
