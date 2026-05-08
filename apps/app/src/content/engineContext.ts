import type { ContentLanguage, EngineContext } from '@ember/content-engine'
import { getEntry, getRememberedManifest, rememberManifestBody } from '@/content/contentIndex'
import {
  getBookEntry,
  getProseText,
  loadBookChapterText,
  loadMassProper,
  resolveCanticle,
  resolvePrayer,
} from '@/content/registry'
import { getJson } from '@/content/store'
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

/**
 * Translate a v1-style asset path (e.g. `of/masses/tempore/...json`,
 * `of/library/preface/preface.pf001.json`) into a v2 corpus id, fetch the
 * shape + per-language blobs, and recombine them so callers see the same
 * multilingual JSON shape they used to receive.
 */
async function fetchOfAsset(path: string, langs: string[]): Promise<unknown | undefined> {
  // Drop trailing .json and any leading of/
  let trimmed = path.replace(/\.json$/, '').replace(/^\/+/, '')
  if (trimmed.startsWith('of/')) trimmed = trimmed.slice(3)

  // calendar/saints/igmr/sacerdotale → of-data/...
  for (const sub of ['calendar', 'saints', 'igmr', 'sacerdotale']) {
    if (trimmed.startsWith(`${sub}/`) || trimmed === sub) {
      const id = `of-data/${trimmed}`
      const entry = getEntry(id)
      if (!entry) return undefined
      const item = await ensureManifest(entry.hash)
      const inner = (item as { data?: { hash: string } }).data
      if (!inner) return item
      return getJson(inner.hash)
    }
  }

  // library/{ordinary,preface,eucharistic-prayer}/<id> → of/{kind}/<id>
  if (trimmed.startsWith('library/')) {
    const rest = trimmed.slice('library/'.length)
    const id = `of/${rest}`
    return loadMassProperLike(id, langs)
  }

  // masses/<...> → mass/of/<...>
  if (trimmed.startsWith('masses/')) {
    const id = `mass/of/${trimmed.slice('masses/'.length)}`
    return loadMassProperLike(id, langs)
  }

  return undefined
}

async function loadMassProperLike(id: string, langs: string[]): Promise<unknown | undefined> {
  const entry = getEntry(id)
  if (!entry) return undefined
  return loadMassProper(id, langs)
}

async function ensureManifest(hash: string): Promise<unknown> {
  const cached = getRememberedManifest<unknown>(hash)
  if (cached) return cached
  const fetched = await getJson<unknown>(hash)
  rememberManifestBody(hash, fetched)
  return fetched
}

export function createEngineContext(
  libraryId?: string,
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
      const text = await loadBookChapterText(undefined, book, chapter, lang)
      if (!text) return undefined
      return { [lang]: text }
    },
    fetchAsset: async (_libId, path) => fetchOfAsset(path, requestedLangs),
    fetchOwnAsset: async (path) => fetchOfAsset(path, requestedLangs),
  }
}
