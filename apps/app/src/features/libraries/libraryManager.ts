/**
 * V1 → V2 compatibility shim.
 *
 * The old `libraryManager` API (fetchRegistry / downloadAndInstallLibrary /
 * removeLibrary / etc.) is reimplemented over the v2 corpus + pinning model,
 * so existing library-UI screens keep working without a rewrite. New code
 * should import directly from `@/features/pinning/pinningManager`.
 */

import { getAllEntries, getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { CollectionItemManifest, PracticeItemManifest } from '@/content/manifestTypes'
import { getJson } from '@/content/store'
import { getPinnedItems, isPinned, pinItem, unpinItem } from '@/features/pinning/pinningManager'
import { localizeContent } from '@/lib/i18n'

export type PracticePreview = {
  id: string
  name: Record<string, string>
  icon: string
}

export type PrayerPreview = {
  id: string
  title: Record<string, string>
}

export type ChapterPreview = {
  id: string
  title: Record<string, string>
}

export type BookPreview = {
  id: string
  name: Record<string, string>
  author?: Record<string, string>
  image?: string
}

export type RegistryEntry = {
  id: string
  version: string
  name: Record<string, string>
  description: Record<string, string>
  languages: string[]
  tags: string[]
  practiceCount: number
  practices: PracticePreview[]
  prayers: PrayerPreview[]
  chapters?: ChapterPreview[]
  books?: BookPreview[]
  contents?: { type: 'chapter' | 'practice' | 'book'; id: string }[]
  size: number
  file: string
  contentHash: string
}

export type Registry = {
  version: number
  libraries: RegistryEntry[]
}

export type InstalledLibrary = {
  book_id: string
  version: string
  installed_at: number
  updated_at: number
  manifest: string
  content_hash: string | undefined
}

function previewsForCollection(collection: CollectionItemManifest): {
  practices: PracticePreview[]
  prayers: PrayerPreview[]
  chapters: ChapterPreview[]
  books: BookPreview[]
} {
  const out = {
    practices: [] as PracticePreview[],
    prayers: [] as PrayerPreview[],
    chapters: [] as ChapterPreview[],
    books: [] as BookPreview[],
  }
  for (const item of collection.items) {
    const ref = item.ref
    const entry = getEntry(ref)
    if (!entry) continue
    const localId = ref.split('/').slice(1).join('/')
    if (entry.kind === 'practice') {
      out.practices.push({
        id: localId,
        name: (entry.name as Record<string, string>) ?? { 'en-US': localId },
        icon: entry.icon ?? 'prayer',
      })
    } else if (entry.kind === 'prayer') {
      out.prayers.push({
        id: localId,
        title: (entry.title as Record<string, string>) ??
          (entry.name as Record<string, string>) ?? { 'en-US': localId },
      })
    } else if (entry.kind === 'chapter') {
      out.chapters.push({
        id: localId,
        title: (entry.title as Record<string, string>) ?? { 'en-US': localId },
      })
    } else if (entry.kind === 'book') {
      out.books.push({
        id: localId,
        name: (entry.name as Record<string, string>) ?? { 'en-US': localId },
        author: entry.author as Record<string, string> | undefined,
      })
    }
  }
  return out
}

function entryToRegistryEntry(collectionId: string, body: CollectionItemManifest): RegistryEntry {
  const entry = getEntry(collectionId)
  const previews = previewsForCollection(body)
  return {
    id: collectionId.replace(/^collection\//, ''),
    version: body.version ?? '1.0.0',
    name: body.name ?? { 'en-US': collectionId },
    description: body.description ?? {},
    languages: body.languages ?? [],
    tags: body.tags ?? [],
    practiceCount: previews.practices.length,
    practices: previews.practices,
    prayers: previews.prayers,
    chapters: previews.chapters,
    books: previews.books,
    contents: body.items.map((it) => {
      const e = getEntry(it.ref)
      const kind = e?.kind ?? 'practice'
      return {
        type: (kind === 'book' || kind === 'chapter' ? kind : 'practice') as
          | 'chapter'
          | 'practice'
          | 'book',
        id: it.ref.split('/').slice(1).join('/'),
      }
    }),
    size: entry?.size ?? 0,
    file: collectionId,
    contentHash: entry?.hash ?? '',
  }
}

export async function fetchRegistry(): Promise<Registry> {
  const libraries: RegistryEntry[] = []
  for (const [id, entry] of getAllEntries()) {
    if (entry.kind !== 'collection') continue
    let body = getRememberedManifest<CollectionItemManifest>(entry.hash)
    if (!body) {
      try {
        body = await getJson<CollectionItemManifest>(entry.hash)
      } catch {
        continue
      }
    }
    libraries.push(entryToRegistryEntry(id, body))
  }
  // sort by name for stable display
  libraries.sort((a, b) => localizeContent(a.name).localeCompare(localizeContent(b.name)))
  return { version: 2, libraries }
}

export async function getInstalledLibraries(): Promise<InstalledLibrary[]> {
  const items = getPinnedItems().filter((p) => p.id.startsWith('collection/'))
  return items.map((p) => ({
    book_id: p.id.replace(/^collection\//, ''),
    version: '1.0.0',
    installed_at: p.pinnedAt,
    updated_at: p.pinnedAt,
    manifest: '{}',
    content_hash: getEntry(p.id)?.hash ?? '',
  }))
}

export async function getInstalledLibrary(
  libraryId: string,
): Promise<InstalledLibrary | undefined> {
  const collectionId = `collection/${libraryId}`
  if (!isPinned(collectionId)) return undefined
  const item = getPinnedItems().find((p) => p.id === collectionId)
  if (!item) return undefined
  return {
    book_id: libraryId,
    version: '1.0.0',
    installed_at: item.pinnedAt,
    updated_at: item.pinnedAt,
    manifest: '{}',
    content_hash: getEntry(collectionId)?.hash ?? '',
  }
}

export async function downloadAndInstallLibrary(
  entry: RegistryEntry,
  onProgress?: (progress: number) => void,
): Promise<void> {
  const collectionId = entry.file.startsWith('collection/') ? entry.file : `collection/${entry.id}`
  await pinItem(collectionId, (done, total) => {
    onProgress?.(total > 0 ? done / total : 0)
  })
}

export async function installFromLocalFile(_filePath: string) {
  throw new Error('installFromLocalFile is no longer supported in Hearth v2 (use pinning)')
}

export async function removeLibrary(libraryId: string): Promise<void> {
  await unpinItem(`collection/${libraryId}`)
}

export async function loadInstalledLibraries(): Promise<void> {
  // No-op: in v2 the corpus is universal and the pinned items list is the
  // only state we maintain. boot's `rehydratePinned()` already handled it.
}

export function isLibraryUpdateAvailable(
  installed: InstalledLibrary,
  registry: RegistryEntry[],
): RegistryEntry | undefined {
  const entry = registry.find((r) => r.id === installed.book_id)
  if (!entry) return undefined
  if (entry.contentHash && entry.contentHash !== installed.content_hash) return entry
  return undefined
}

export async function updateLibrary(
  entry: RegistryEntry,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return downloadAndInstallLibrary(entry, onProgress)
}

export async function checkAndUpdateLibraries(): Promise<boolean> {
  const [installed, registry] = await Promise.all([getInstalledLibraries(), fetchRegistry()])
  let updated = false
  for (const lib of installed) {
    const entry = isLibraryUpdateAvailable(lib, registry.libraries)
    if (entry) {
      await updateLibrary(entry)
      updated = true
    }
  }
  return updated
}

export function manifestPreviewFromInstall(_installed: InstalledLibrary):
  | {
      practices: PracticePreview[]
      prayers: PrayerPreview[]
      chapters: ChapterPreview[]
      books: BookPreview[]
    }
  | undefined {
  // The legacy library detail screen used this to render a summary. In v2 we
  // already have the collection manifest in memory; let the caller pull it.
  return undefined
}

// Re-exports for code that touches the practice list directly.
export function listAllPractices(): PracticeItemManifest[] {
  const out: PracticeItemManifest[] = []
  for (const [, entry] of getAllEntries()) {
    if (entry.kind !== 'practice') continue
    const body = getRememberedManifest<PracticeItemManifest>(entry.hash)
    if (body) out.push(body)
  }
  return out
}
