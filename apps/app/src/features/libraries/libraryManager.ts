import JSZip from 'jszip'
import { Platform } from 'react-native'
import { getPracticeIdsForLibrary, registerSource, unregisterSource } from '@/content/registry'
import { createIdbSource } from '@/content/sources/idb'
import { getDb } from '@/db/client'
import { deleteBookPractices } from '@/db/repositories/practices'
import { yieldToUI } from '@/lib/async'
import { fetchHearth, hearthUrl } from '@/lib/hearth'
import { idbDeletePrefix, idbWriteBatch } from '@/lib/idb-fs'

// expo-file-system is native-only — conditionally import on iOS/Android
const nativeFs =
  Platform.OS !== 'web'
    ? (require('expo-file-system') as typeof import('expo-file-system'))
    : undefined
const nativeSource =
  Platform.OS !== 'web'
    ? (require('@/content/sources/filesystem') as typeof import('@/content/sources/filesystem'))
    : undefined

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

// --- Native-only filesystem helpers ---

function librariesDir() {
  const { Directory, Paths } = nativeFs!
  return new Directory(Paths.document, 'books/')
}

function libraryDir(libraryId: string) {
  const { Directory, Paths } = nativeFs!
  return new Directory(Paths.document, 'books/', `${libraryId}/`)
}

function ensureLibrariesDir() {
  const dir = librariesDir()
  if (!dir.exists) dir.create()
}

function ensureDir(dir: { exists: boolean; create: () => void }) {
  if (!dir.exists) dir.create()
}

// biome-ignore lint: native-only, typed via expo-file-system Directory
async function extractZipToFs(zipData: ArrayBuffer, destDir: any) {
  const { Directory: Dir, File: NativeFile } = nativeFs!
  const zip = await JSZip.loadAsync(zipData)
  const created = new Set<string>()
  let fileCount = 0

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) {
      if (!created.has(relativePath)) {
        ensureDir(new Dir(destDir, relativePath))
        created.add(relativePath)
      }
    } else {
      const parts = relativePath.split('/')
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join('/')
        if (!created.has(parentPath)) {
          ensureDir(new Dir(destDir, parentPath))
          created.add(parentPath)
        }
      }
      const isBinary = /\.(jpg|jpeg|png|webp|gif|mp3|ogg|wav|pdf)$/i.test(relativePath)
      if (isBinary) {
        const bytes = await zipEntry.async('uint8array')
        new NativeFile(destDir, relativePath).write(bytes)
      } else {
        const content = await zipEntry.async('string')
        new NativeFile(destDir, relativePath).write(content)
      }

      fileCount++
      if (fileCount % 5 === 0) await yieldToUI()
    }
  }
}

// --- Web: extract zip into IndexedDB ---

async function extractZipToIdb(zipData: ArrayBuffer, prefix: string) {
  const zip = await JSZip.loadAsync(zipData)
  const entries: [string, string | Uint8Array][] = []

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue
    const isBinary = /\.(jpg|jpeg|png|webp|gif|mp3|ogg|wav|pdf)$/i.test(relativePath)
    if (isBinary) {
      const bytes = await zipEntry.async('uint8array')
      entries.push([`${prefix}${relativePath}`, bytes])
    } else {
      const content = await zipEntry.async('string')
      entries.push([`${prefix}${relativePath}`, content])
    }
  }

  await idbWriteBatch(entries)
}

async function upsertInstalledLibrary(
  libraryId: string,
  version: string,
  manifestJson: string,
  contentHash: string,
) {
  const now = Date.now()
  await getDb().runAsync(
    `INSERT INTO installed_books (book_id, version, installed_at, updated_at, manifest, content_hash)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (book_id) DO UPDATE SET version = excluded.version, updated_at = excluded.updated_at, manifest = excluded.manifest, content_hash = excluded.content_hash`,
    [libraryId, version, now, now, manifestJson, contentHash],
  )
}

const hearthLibrariesPath = 'libraries'

export async function fetchRegistry(): Promise<Registry> {
  return fetchHearth<Registry>(`${hearthLibrariesPath}/registry.json`, { networkFirst: true })
}

export async function getInstalledLibraries(): Promise<InstalledLibrary[]> {
  return getDb().getAllAsync<InstalledLibrary>('SELECT * FROM installed_books')
}

export async function getInstalledLibrary(
  libraryId: string,
): Promise<InstalledLibrary | undefined> {
  const row = await getDb().getFirstAsync<InstalledLibrary>(
    'SELECT * FROM installed_books WHERE book_id = ?',
    [libraryId],
  )
  return row ?? undefined
}

export async function downloadAndInstallLibrary(
  entry: RegistryEntry,
  onProgress?: (progress: number) => void,
): Promise<void> {
  const url = hearthUrl(`${hearthLibrariesPath}/${entry.file}`)

  if (onProgress) onProgress(0.1)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed: ${response.status}`)
  const zipData = await response.arrayBuffer()
  if (onProgress) onProgress(0.6)

  if (Platform.OS === 'web') {
    const prefix = `books/${entry.id}/`
    await idbDeletePrefix(prefix)
    await extractZipToIdb(zipData, prefix)
    if (onProgress) onProgress(0.9)

    const zip = await JSZip.loadAsync(zipData)
    const libraryJson = await zip.file('library.json')!.async('string')
    await upsertInstalledLibrary(entry.id, entry.version, libraryJson, entry.contentHash)

    const source = await createIdbSource(entry.id)
    registerSource(source)
  } else {
    ensureLibrariesDir()
    const dest = libraryDir(entry.id)
    if (dest.exists) dest.delete()
    dest.create()

    await extractZipToFs(zipData, dest)
    if (onProgress) onProgress(0.9)

    const { File: NativeFile } = nativeFs!
    const libraryJson = await new NativeFile(dest, 'library.json').text()
    await upsertInstalledLibrary(entry.id, entry.version, libraryJson, entry.contentHash)

    const source = await nativeSource!.createFileSystemSource(dest.uri)
    registerSource(source)
  }

  if (onProgress) onProgress(1)
}

export async function installFromLocalFile(filePath: string) {
  if (Platform.OS === 'web') {
    throw new Error('installFromLocalFile is not supported on web')
  }

  const { Directory: Dir, File: NativeFile, Paths } = nativeFs!
  ensureLibrariesDir()

  const file = new NativeFile(filePath)
  const zipData = await file.arrayBuffer()

  const tempDir = new Dir(Paths.cache, 'pray-import/')
  if (tempDir.exists) tempDir.delete()
  tempDir.create()
  await extractZipToFs(zipData, tempDir)

  const libraryJson = await new NativeFile(tempDir, 'library.json').text()
  const library = JSON.parse(libraryJson) as import('@/content/sources/filesystem').Library

  const dest = libraryDir(library.id)
  if (dest.exists) dest.delete()
  tempDir.move(dest)

  await upsertInstalledLibrary(library.id, library.version, libraryJson, '')

  const source = await nativeSource!.createFileSystemSource(dest.uri)
  registerSource(source)

  return library
}

export async function removeLibrary(libraryId: string): Promise<void> {
  const practiceIds = getPracticeIdsForLibrary(libraryId)
  await deleteBookPractices(practiceIds)
  unregisterSource(libraryId)

  if (Platform.OS === 'web') {
    await idbDeletePrefix(`books/${libraryId}/`)
  } else {
    const dest = libraryDir(libraryId)
    if (dest.exists) dest.delete()
  }

  await getDb().runAsync('DELETE FROM installed_books WHERE book_id = ?', [libraryId])
}

export async function loadInstalledLibraries(): Promise<void> {
  if (Platform.OS !== 'web') ensureLibrariesDir()

  const installed = await getInstalledLibraries()
  const results = await Promise.all(
    installed.map(async (row) => {
      try {
        if (Platform.OS === 'web') {
          return await createIdbSource(row.book_id)
        }
        return await nativeSource!.createFileSystemSource(libraryDir(row.book_id).uri)
      } catch (err) {
        console.error(`[library] failed to load installed library "${row.book_id}":`, err)
        return undefined
      }
    }),
  )
  for (const source of results) {
    if (source) registerSource(source)
  }
}

export function isLibraryUpdateAvailable(
  installed: InstalledLibrary,
  registry: RegistryEntry[],
): RegistryEntry | undefined {
  const entry = registry.find((r) => r.id === installed.book_id)
  if (!entry) return undefined
  if (entry.contentHash && entry.contentHash !== installed.content_hash) return entry
  if (!entry.contentHash && entry.version !== installed.version) return entry
  return undefined
}

export async function updateLibrary(
  entry: RegistryEntry,
  onProgress?: (progress: number) => void,
): Promise<void> {
  await downloadAndInstallLibrary(entry, onProgress)
}

export async function checkAndUpdateLibraries(): Promise<boolean> {
  const [installed, registry] = await Promise.all([getInstalledLibraries(), fetchRegistry()])
  let updated = false

  for (const library of installed) {
    const entry = isLibraryUpdateAvailable(library, registry.libraries)
    if (entry) {
      await updateLibrary(entry)
      updated = true
    }
  }

  return updated
}
