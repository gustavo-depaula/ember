import { Directory, File, Paths } from 'expo-file-system'
import JSZip from 'jszip'
import { getPracticeIdsForLibrary, registerSource, unregisterSource } from '@/content/registry'
import { createFileSystemSource, type Library } from '@/content/sources/filesystem'
import { getDb } from '@/db/client'
import { deleteBookPractices } from '@/db/repositories/practices'
import { yieldToUI } from '@/lib/async'
import { fetchHearth, hearthUrl } from '@/lib/hearth'

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

export type InstalledBook = {
  book_id: string
  version: string
  installed_at: number
  updated_at: number
  manifest: string
  content_hash: string | undefined
}

function librariesDir(): Directory {
  return new Directory(Paths.document, 'books/')
}

function libraryDir(libraryId: string): Directory {
  return new Directory(Paths.document, 'books/', `${libraryId}/`)
}

function ensureLibrariesDir() {
  const dir = librariesDir()
  if (!dir.exists) dir.create()
}

function ensureDir(dir: Directory) {
  if (!dir.exists) dir.create()
}

async function extractZip(zipData: ArrayBuffer, destDir: Directory) {
  const zip = await JSZip.loadAsync(zipData)
  const created = new Set<string>()
  let fileCount = 0

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) {
      if (!created.has(relativePath)) {
        ensureDir(new Directory(destDir, relativePath))
        created.add(relativePath)
      }
    } else {
      const parts = relativePath.split('/')
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join('/')
        if (!created.has(parentPath)) {
          ensureDir(new Directory(destDir, parentPath))
          created.add(parentPath)
        }
      }
      const isBinary = /\.(jpg|jpeg|png|webp|gif|mp3|ogg|wav|pdf)$/i.test(relativePath)
      if (isBinary) {
        const bytes = await zipEntry.async('uint8array')
        new File(destDir, relativePath).write(bytes)
      } else {
        const content = await zipEntry.async('string')
        new File(destDir, relativePath).write(content)
      }

      fileCount++
      if (fileCount % 5 === 0) await yieldToUI()
    }
  }
}

async function upsertInstalledBook(
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

export async function getInstalledBooks(): Promise<InstalledBook[]> {
  return getDb().getAllAsync<InstalledBook>('SELECT * FROM installed_books')
}

export async function getInstalledBook(libraryId: string): Promise<InstalledBook | undefined> {
  const row = await getDb().getFirstAsync<InstalledBook>(
    'SELECT * FROM installed_books WHERE book_id = ?',
    [libraryId],
  )
  return row ?? undefined
}

export async function downloadAndInstallBook(
  entry: RegistryEntry,
  onProgress?: (progress: number) => void,
): Promise<void> {
  ensureLibrariesDir()

  const url = hearthUrl(`${hearthLibrariesPath}/${entry.file}`)
  const dest = libraryDir(entry.id)

  if (onProgress) onProgress(0.1)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed: ${response.status}`)
  const zipData = await response.arrayBuffer()
  if (onProgress) onProgress(0.6)

  if (dest.exists) dest.delete()
  dest.create()

  await extractZip(zipData, dest)
  if (onProgress) onProgress(0.9)

  const libraryJsonFile = new File(dest, 'library.json')
  const libraryJson = await libraryJsonFile.text()

  await upsertInstalledBook(entry.id, entry.version, libraryJson, entry.contentHash)

  const source = await createFileSystemSource(dest.uri)
  registerSource(source)
  if (onProgress) onProgress(1)
}

export async function installFromLocalFile(filePath: string): Promise<Library> {
  ensureLibrariesDir()

  const file = new File(filePath)
  const zipData = await file.arrayBuffer()

  const tempDir = new Directory(Paths.cache, 'pray-import/')
  if (tempDir.exists) tempDir.delete()
  tempDir.create()
  await extractZip(zipData, tempDir)

  const libraryJson = await new File(tempDir, 'library.json').text()
  const library = JSON.parse(libraryJson) as Library

  const dest = libraryDir(library.id)
  if (dest.exists) dest.delete()
  tempDir.move(dest)

  await upsertInstalledBook(library.id, library.version, libraryJson, '')

  const source = await createFileSystemSource(dest.uri)
  registerSource(source)

  return library
}

export async function removeBook(libraryId: string): Promise<void> {
  const practiceIds = getPracticeIdsForLibrary(libraryId)
  await deleteBookPractices(practiceIds)
  unregisterSource(libraryId)
  const dest = libraryDir(libraryId)
  if (dest.exists) dest.delete()
  await getDb().runAsync('DELETE FROM installed_books WHERE book_id = ?', [libraryId])
}

export async function loadInstalledBooks(): Promise<void> {
  ensureLibrariesDir()
  const installed = await getInstalledBooks()
  const results = await Promise.all(
    installed.map(async (row) => {
      try {
        return await createFileSystemSource(libraryDir(row.book_id).uri)
      } catch {
        return undefined
      }
    }),
  )
  for (const source of results) {
    if (source) registerSource(source)
  }
}

export function isBookUpdateAvailable(
  installed: InstalledBook,
  registry: RegistryEntry[],
): RegistryEntry | undefined {
  const entry = registry.find((r) => r.id === installed.book_id)
  if (!entry) return undefined
  if (entry.contentHash && entry.contentHash !== installed.content_hash) return entry
  if (!entry.contentHash && entry.version !== installed.version) return entry
  return undefined
}

export async function updateBook(
  entry: RegistryEntry,
  onProgress?: (progress: number) => void,
): Promise<void> {
  await downloadAndInstallBook(entry, onProgress)
}

export async function checkAndUpdateBooks(): Promise<boolean> {
  const [installed, registry] = await Promise.all([getInstalledBooks(), fetchRegistry()])
  let updated = false

  for (const book of installed) {
    const entry = isBookUpdateAvailable(book, registry.libraries)
    if (entry) {
      await updateBook(entry)
      updated = true
    }
  }

  return updated
}
