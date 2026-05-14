import type { ContentLanguage, EngineContext } from '@ember/content-engine'
import { windowFor } from '@ember/liturgical'
import {
  getBookEntry,
  getProseText,
  loadBookChapterText,
  resolveCanticle,
  resolvePrayer,
} from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { pickActive, pickPending } from '@/features/resolutions/selectors'
import { getToday } from '@/hooks/useToday'
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
    // No fetchOwnAsset — let the engine fall through to context.cycleData,
    // which is populated by loadPracticeData() and indexed by data name (e.g.
    // 'liturgical-map'). Cross-practice data (OF Mass propers, prefaces) is
    // wired into the `mass-of` DataSource at construction time, not here.
  }
}

/**
 * Augment an EngineContext with movement / resolution / window deps,
 * snapshotting store state and the current time at call. The returned
 * context is a fresh object — the input is not mutated. Resolution
 * lookups close over the snapshot, so a single `resolveFlow` pass sees
 * a consistent view even if the store mutates while it runs. Re-call
 * this helper to refresh.
 */
export function withSpiritualThreads(ec: EngineContext): EngineContext {
  const snapshot = useEventStore.getState()
  // Honor the user's selected day. `getToday()` already applies the 4am
  // cutoff in live mode, so resolutions, the day carousel, and the wall
  // all agree on what day it is.
  const today = getToday()
  const now = today.getTime()

  return {
    ...ec,
    supportsMovements: true,
    windowFor: (level, forward) => windowFor(level, today, forward),
    resolutions: {
      active(level) {
        const r = pickActive(snapshot.resolutions, snapshot.resolutionsByLevel.get(level), now)
        return r ? { id: r.id, text: r.text, level: r.level } : undefined
      },
      pending(level) {
        const r = pickPending(
          snapshot.resolutions,
          snapshot.resolutionReviews,
          snapshot.resolutionsByLevel.get(level),
          now,
        )
        return r ? { id: r.id, text: r.text, level: r.level } : undefined
      },
    },
  }
}
