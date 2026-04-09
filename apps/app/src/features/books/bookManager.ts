import { Directory, File, Paths } from 'expo-file-system'
import JSZip from 'jszip'
import { getPracticeIdsForBook, registerSource, unregisterSource } from '@/content/registry'
import { createFileSystemSource, type PrayerBook } from '@/content/sources/filesystem'
import { getDb } from '@/db/client'
import { deleteBookPractices } from '@/db/repositories/practices'
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
  size: number
  file: string
}

export type Registry = {
  version: number
  books: RegistryEntry[]
}

export type InstalledBook = {
  book_id: string
  version: string
  installed_at: number
  updated_at: number
  manifest: string
}

function booksDir(): Directory {
  return new Directory(Paths.document, 'books/')
}

function bookDir(bookId: string): Directory {
  return new Directory(Paths.document, 'books/', `${bookId}/`)
}

function ensureBooksDir() {
  const dir = booksDir()
  if (!dir.exists) dir.create()
}

function ensureDir(dir: Directory) {
  if (!dir.exists) dir.create()
}

async function extractZip(zipData: ArrayBuffer, destDir: Directory) {
  const zip = await JSZip.loadAsync(zipData)
  const created = new Set<string>()

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
      const content = await zipEntry.async('string')
      new File(destDir, relativePath).write(content)
    }
  }
}

async function upsertInstalledBook(bookId: string, version: string, manifestJson: string) {
  const now = Date.now()
  await getDb().runAsync(
    `INSERT INTO installed_books (book_id, version, installed_at, updated_at, manifest)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (book_id) DO UPDATE SET version = excluded.version, updated_at = excluded.updated_at, manifest = excluded.manifest`,
    [bookId, version, now, now, manifestJson],
  )
}

export async function fetchRegistry(): Promise<Registry> {
  return fetchHearth<Registry>('books/registry.json')
}

export async function getInstalledBooks(): Promise<InstalledBook[]> {
  return getDb().getAllAsync<InstalledBook>('SELECT * FROM installed_books')
}

export async function getInstalledBook(bookId: string): Promise<InstalledBook | undefined> {
  const row = await getDb().getFirstAsync<InstalledBook>(
    'SELECT * FROM installed_books WHERE book_id = ?',
    [bookId],
  )
  return row ?? undefined
}

export async function downloadAndInstallBook(
  entry: RegistryEntry,
  onProgress?: (progress: number) => void,
): Promise<void> {
  ensureBooksDir()

  const url = hearthUrl(`books/${entry.file}`)
  const dest = bookDir(entry.id)

  if (onProgress) onProgress(0.1)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed: ${response.status}`)
  const zipData = await response.arrayBuffer()
  if (onProgress) onProgress(0.6)

  if (dest.exists) dest.delete()
  dest.create()

  await extractZip(zipData, dest)
  if (onProgress) onProgress(0.9)

  const bookJsonFile = new File(dest, 'book.json')
  const bookJson = await bookJsonFile.text()

  await upsertInstalledBook(entry.id, entry.version, bookJson)

  const source = await createFileSystemSource(dest.uri)
  registerSource(source)
  if (onProgress) onProgress(1)
}

export async function installFromLocalFile(filePath: string): Promise<PrayerBook> {
  ensureBooksDir()

  const file = new File(filePath)
  const zipData = await file.arrayBuffer()

  const tempDir = new Directory(Paths.cache, 'pray-import/')
  if (tempDir.exists) tempDir.delete()
  tempDir.create()
  await extractZip(zipData, tempDir)

  const bookJson = await new File(tempDir, 'book.json').text()
  const book = JSON.parse(bookJson) as PrayerBook

  const dest = bookDir(book.id)
  if (dest.exists) dest.delete()
  tempDir.move(dest)

  await upsertInstalledBook(book.id, book.version, bookJson)

  const source = await createFileSystemSource(dest.uri)
  registerSource(source)

  return book
}

export async function removeBook(bookId: string): Promise<void> {
  const practiceIds = getPracticeIdsForBook(bookId)
  await deleteBookPractices(practiceIds)
  unregisterSource(bookId)
  const dest = bookDir(bookId)
  if (dest.exists) dest.delete()
  await getDb().runAsync('DELETE FROM installed_books WHERE book_id = ?', [bookId])
}

export async function loadInstalledBooks(): Promise<void> {
  ensureBooksDir()
  const installed = await getInstalledBooks()
  const results = await Promise.all(
    installed.map(async (row) => {
      try {
        return await createFileSystemSource(bookDir(row.book_id).uri)
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
): string | undefined {
  const entry = registry.find((r) => r.id === installed.book_id)
  if (!entry) return undefined
  return entry.version !== installed.version ? entry.version : undefined
}
