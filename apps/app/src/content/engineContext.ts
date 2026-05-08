import type { ContentLanguage, EngineContext } from '@ember/content-engine'
import { fetchOfAsset } from '@/content/fetchOfAsset'
import {
  getBookEntry,
  getProseText,
  loadBookChapterText,
  resolveCanticle,
  resolvePrayer,
} from '@/content/resolver'
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
  chapterId?: string,
  languagePrefs?: { contentLanguage: ContentLanguage; secondaryLanguage?: ContentLanguage },
): EngineContext {
  const state = usePreferencesStore.getState()
  const contentLanguage = languagePrefs?.contentLanguage ?? state.contentLanguage
  const secondaryLanguage = languagePrefs?.secondaryLanguage ?? state.secondaryLanguage

  // The languages we'll request when merging per-language split blobs (OF
  // Mass propers, ordinaries, prefaces). Always include Latin since the
  // rubrics fall back to it.
  const requestedLangs = Array.from(
    new Set([contentLanguage, secondaryLanguage, 'la'].filter(Boolean) as string[]),
  )

  const prayers = new Proxy({} as Record<string, import('@ember/content-engine').PrayerAsset>, {
    get(_, ref: string) {
      return resolvePrayer(ref)
    },
    has(_, ref: string) {
      return resolvePrayer(ref) !== undefined
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
      const key = chapterId ? `${chapterId}/${filePath}` : filePath
      return getProseText(key)
    },
    has(_, filePath: string) {
      const key = chapterId ? `${chapterId}/${filePath}` : filePath
      return getProseText(key) !== undefined
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
      const entry = getBookEntry(book)
      if (!entry?.toc) return undefined
      const title = findTocTitle(
        entry.toc as Array<{ id: string; title: Record<string, string>; children?: unknown[] }>,
        chapter,
      )
      if (!title) return undefined
      return title[lang] ?? title['pt-BR'] ?? title['en-US'] ?? Object.values(title)[0]
    },
    getBookLanguages: (book) => getBookEntry(book)?.languages ?? [],
    loadBookChapterTextAsync: async (book, chapter, lang) => {
      const text = await loadBookChapterText(book, chapter, lang)
      if (!text) return undefined
      return { [lang]: text }
    },
    fetchAsset: async (path: string) => fetchOfAsset(path, requestedLangs),
    // No fetchOwnAsset — let the engine fall through to context.cycleData,
    // which is populated by loadPracticeData() and indexed by data name (e.g.
    // 'liturgical-map'). The OF asset router is for cross-practice paths
    // only, not this practice's own declared data.
  }
}
