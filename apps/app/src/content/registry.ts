import { localizeContent } from '@/lib/i18n'
import type { ChapterManifest, PracticeManifest } from './manifest-types'
import type { ContentSource, EpubEntry, PrayerAsset } from './sources/filesystem'
import type { CycleData, FlowDefinition, LectioTrackDef, LocalizedContent, Variant } from './types'

const sources: ContentSource[] = []
const practiceToBook = new Map<string, string>()
const bookIdToSource = new Map<string, ContentSource>()

export function registerSource(source: ContentSource) {
  const existing = sources.findIndex((s) => s.bookId === source.bookId)
  if (existing !== -1) sources.splice(existing, 1)
  sources.push(source)
  bookIdToSource.set(source.bookId, source)
  for (const m of source.getAllManifests()) {
    practiceToBook.set(m.id, source.bookId)
  }
}

export function unregisterSource(bookId: string) {
  const idx = sources.findIndex((s) => s.bookId === bookId)
  if (idx === -1) return
  const source = sources[idx]
  for (const m of source.getAllManifests()) {
    practiceToBook.delete(m.id)
  }
  sources.splice(idx, 1)
  bookIdToSource.delete(bookId)
}

export function clearSources() {
  sources.length = 0
  practiceToBook.clear()
  bookIdToSource.clear()
}

function findSource(practiceId: string): ContentSource | undefined {
  const bookId = practiceToBook.get(practiceId)
  if (bookId) return bookIdToSource.get(bookId)
  for (const source of sources) {
    if (source.getManifest(practiceId)) return source
  }
  return undefined
}

export function getBookIdForPractice(practiceId: string): string | undefined {
  return practiceToBook.get(practiceId)
}

export function getManifest(id: string): PracticeManifest | undefined {
  return findSource(id)?.getManifest(id)
}

export function getAllManifests(): PracticeManifest[] {
  return sources.flatMap((s) => s.getAllManifests())
}

export function loadFlowForSlot(practiceId: string, flowId: string): FlowDefinition | undefined {
  const source = findSource(practiceId)
  if (!source) return undefined
  const flow = source.loadFlow(practiceId, flowId)
  if (flow) return flow
  const manifest = source.getManifest(practiceId)
  if (manifest?.flows.length) {
    return source.loadFlow(practiceId, manifest.flows[0].id)
  }
  return undefined
}

export function loadVariant(manifestId: string, variantId: string): Variant | undefined {
  return findSource(manifestId)?.loadVariant(manifestId, variantId)
}

export function getDefaultVariant(manifestId: string): Variant | undefined {
  const source = findSource(manifestId)
  if (!source) return undefined
  const manifest = source.getManifest(manifestId)
  if (!manifest?.variants?.length) return undefined
  return source.loadVariant(manifestId, manifest.variants[0].id)
}

export function loadPerDayFlow(practiceId: string, day: number): FlowDefinition | undefined {
  return findSource(practiceId)?.loadPerDayFlow(practiceId, day)
}

export function loadPracticeData(practiceId: string): Record<string, CycleData> | undefined {
  return findSource(practiceId)?.loadData(practiceId)
}

export function loadPracticeTracks(practiceId: string): Record<string, LectioTrackDef> | undefined {
  return findSource(practiceId)?.loadTracks(practiceId)
}

export function getManifestIconKey(manifestId: string): string {
  return getManifest(manifestId)?.icon ?? 'prayer'
}

export function getManifestCategories(): string[] {
  const cats = new Set<string>()
  for (const m of getAllManifests()) {
    for (const c of m.categories) cats.add(c)
  }
  return Array.from(cats).sort()
}

export function searchManifests(query: string): PracticeManifest[] {
  const q = query.toLowerCase()
  return getAllManifests().filter((m) => {
    if (localizeContent(m.name).toLowerCase().includes(q)) return true
    if (m.tags?.some((t) => t.toLowerCase().includes(q))) return true
    if (m.description && localizeContent(m.description).toLowerCase().includes(q)) return true
    return false
  })
}

export function resolvePrayer(ref: string, bookId?: string): PrayerAsset | undefined {
  if (bookId) {
    const source = bookIdToSource.get(bookId)
    if (source) {
      const prayer = source.getPrayer(ref)
      if (prayer) return prayer
      if (source.book.dependencies) {
        for (const depId of source.book.dependencies) {
          const depPrayer = bookIdToSource.get(depId)?.getPrayer(ref)
          if (depPrayer) return depPrayer
        }
      }
    }
  }
  for (const s of sources) {
    const prayer = s.getPrayer(ref)
    if (prayer) return prayer
  }
  return undefined
}

export function resolveCanticle(ref: string): PrayerAsset | undefined {
  for (const s of sources) {
    const canticle = s.getCanticle(ref)
    if (canticle) return canticle
  }
  return undefined
}

export function getPracticeIdsForBook(bookId: string): string[] {
  const source = bookIdToSource.get(bookId)
  if (!source) return []
  return source.getAllManifests().map((m) => m.id)
}

export function getInstalledBookIds(): string[] {
  return sources.map((s) => s.bookId)
}

export function getChapterManifest(chapterId: string, bookId: string): ChapterManifest | undefined {
  return bookIdToSource.get(bookId)?.getChapterManifest(chapterId)
}

export function getAllChapterManifestsForBook(bookId: string): ChapterManifest[] {
  return bookIdToSource.get(bookId)?.getAllChapterManifests() ?? []
}

export function loadChapterContent(chapterId: string, bookId: string): FlowDefinition | undefined {
  return bookIdToSource.get(bookId)?.loadChapterContent(chapterId)
}

export function getProseText(filePath: string, bookId: string): LocalizedContent | undefined {
  return bookIdToSource.get(bookId)?.getProseText(filePath)
}

export function getEpubEntry(epubId: string, bookId: string): EpubEntry | undefined {
  return bookIdToSource.get(bookId)?.getEpubEntry(epubId)
}

export function getAllEpubEntriesForBook(bookId: string): EpubEntry[] {
  return bookIdToSource.get(bookId)?.getAllEpubEntries() ?? []
}

export function getEpubFilePath(epubId: string, lang: string, bookId: string): string | undefined {
  const source = bookIdToSource.get(bookId)
  if (!source) return undefined
  const entry = source.getEpubEntry(epubId)
  if (!entry) return undefined
  return `${source.bookDirUri}epubs/${epubId}/${epubId}.${lang}.epub`
}
