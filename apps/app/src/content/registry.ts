import { localizeContent } from '@/lib/i18n'
import type { ChapterManifest, PracticeManifest } from './manifest-types'
import type { BookEntry, ContentSource, PrayerAsset } from './sources/filesystem'
import type { CycleData, FlowDefinition, LectioTrackDef, LocalizedContent, Variant } from './types'

const sources: ContentSource[] = []
const practiceToLibrary = new Map<string, string>()
const libraryIdToSource = new Map<string, ContentSource>()

export function registerSource(source: ContentSource) {
  const existing = sources.findIndex((s) => s.libraryId === source.libraryId)
  if (existing !== -1) sources.splice(existing, 1)
  sources.push(source)
  libraryIdToSource.set(source.libraryId, source)
  for (const m of source.getAllManifests()) {
    practiceToLibrary.set(m.id, source.libraryId)
  }
}

export function unregisterSource(libraryId: string) {
  const idx = sources.findIndex((s) => s.libraryId === libraryId)
  if (idx === -1) return
  const source = sources[idx]
  for (const m of source.getAllManifests()) {
    practiceToLibrary.delete(m.id)
  }
  sources.splice(idx, 1)
  libraryIdToSource.delete(libraryId)
}

export function clearSources() {
  sources.length = 0
  practiceToLibrary.clear()
  libraryIdToSource.clear()
}

function findSource(practiceId: string): ContentSource | undefined {
  const libraryId = practiceToLibrary.get(practiceId)
  if (libraryId) return libraryIdToSource.get(libraryId)
  for (const source of sources) {
    if (source.getManifest(practiceId)) return source
  }
  return undefined
}

export function getLibraryIdForPractice(practiceId: string): string | undefined {
  return practiceToLibrary.get(practiceId)
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

export function resolvePrayer(ref: string, libraryId?: string): PrayerAsset | undefined {
  if (libraryId) {
    const source = libraryIdToSource.get(libraryId)
    if (source) {
      const prayer = source.getPrayer(ref)
      if (prayer) return prayer
      if (source.library.dependencies) {
        for (const depId of source.library.dependencies) {
          const depPrayer = libraryIdToSource.get(depId)?.getPrayer(ref)
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

export function getPracticeIdsForLibrary(libraryId: string): string[] {
  const source = libraryIdToSource.get(libraryId)
  if (!source) return []
  return source.getAllManifests().map((m) => m.id)
}

export function getInstalledLibraryIds(): string[] {
  return sources.map((s) => s.libraryId)
}

export function getChapterManifest(
  chapterId: string,
  libraryId: string,
): ChapterManifest | undefined {
  return libraryIdToSource.get(libraryId)?.getChapterManifest(chapterId)
}

export function getAllChapterManifestsForLibrary(libraryId: string): ChapterManifest[] {
  return libraryIdToSource.get(libraryId)?.getAllChapterManifests() ?? []
}

export function loadChapterContent(
  chapterId: string,
  libraryId: string,
): FlowDefinition | undefined {
  return libraryIdToSource.get(libraryId)?.loadChapterContent(chapterId)
}

export function getProseText(filePath: string, libraryId: string): LocalizedContent | undefined {
  return libraryIdToSource.get(libraryId)?.getProseText(filePath)
}

export function getBookEntry(bookId: string, libraryId: string): BookEntry | undefined {
  return libraryIdToSource.get(libraryId)?.getBookEntry(bookId)
}

export function getAllBookEntries(libraryId: string): BookEntry[] {
  return libraryIdToSource.get(libraryId)?.getAllBookEntries() ?? []
}

export function getBookDirUri(bookId: string, libraryId: string): string | undefined {
  const source = libraryIdToSource.get(libraryId)
  if (!source) return undefined
  const entry = source.getBookEntry(bookId)
  if (!entry) return undefined
  return `${source.libraryDirUri}books/${bookId}/`
}
