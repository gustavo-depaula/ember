import { File, Directory, Paths } from 'expo-file-system'
import JSZip from 'jszip'
import { getDb } from '@/db/client'
import { fetchHearth, hearthUrl } from '@/lib/hearth'
import {
  createFileSystemSource,
  type PrayerBook,
} from '@/content/sources/filesystem'
import { registerSource, unregisterSource } from '@/content/registry'

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

async function extractZip(zipData: ArrayBuffer, destDir: Directory) {
  const zip = await JSZip.loadAsync(zipData)

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) {
      const dir = new Directory(destDir, relativePath)
      if (!dir.exists) dir.create()
    } else {
      // Ensure parent directory exists
      const parts = relativePath.split('/')
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join('/')
        const parentDir = new Directory(destDir, parentPath)
        if (!parentDir.exists) parentDir.create()
      }
      const content = await zipEntry.async('string')
      const file = new File(destDir, relativePath)
      file.write(content)
    }
  }
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

  // Download .pray file as binary
  if (onProgress) onProgress(0.1)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed: ${response.status}`)
  const zipData = await response.arrayBuffer()
  if (onProgress) onProgress(0.6)

  // Remove existing book dir if updating
  if (dest.exists) dest.delete()
  dest.create()

  // Extract .pray (zip)
  await extractZip(zipData, dest)
  if (onProgress) onProgress(0.9)

  // Validate book.json exists
  const bookJsonFile = new File(dest, 'book.json')
  if (!bookJsonFile.exists) {
    dest.delete()
    throw new Error('Invalid .pray: no book.json found')
  }

  // Register in DB
  const bookJson = await bookJsonFile.text()
  const now = Date.now()
  await getDb().runAsync(
    `INSERT INTO installed_books (book_id, version, installed_at, updated_at, manifest)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (book_id) DO UPDATE SET version = excluded.version, updated_at = excluded.updated_at, manifest = excluded.manifest`,
    [entry.id, entry.version, now, now, bookJson],
  )

  // Register content source
  const source = await createFileSystemSource(dest.uri)
  registerSource(source)
  if (onProgress) onProgress(1)
}

export async function installFromLocalFile(filePath: string): Promise<PrayerBook> {
  ensureBooksDir()

  // Read the file as binary
  const file = new File(filePath)
  const zipData = await file.arrayBuffer()

  // Extract to temp dir to read book.json
  const tempDir = new Directory(Paths.cache, 'pray-import/')
  if (tempDir.exists) tempDir.delete()
  tempDir.create()
  await extractZip(zipData, tempDir)

  const bookJsonFile = new File(tempDir, 'book.json')
  if (!bookJsonFile.exists) {
    tempDir.delete()
    throw new Error('Invalid .pray file: no book.json found')
  }

  const bookJson = await bookJsonFile.text()
  const book = JSON.parse(bookJson) as PrayerBook

  // Move to final location
  const dest = bookDir(book.id)
  if (dest.exists) dest.delete()
  tempDir.move(dest)

  // Register in DB
  const now = Date.now()
  await getDb().runAsync(
    `INSERT INTO installed_books (book_id, version, installed_at, updated_at, manifest)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (book_id) DO UPDATE SET version = excluded.version, updated_at = excluded.updated_at, manifest = excluded.manifest`,
    [book.id, book.version, now, now, bookJson],
  )

  // Register content source
  const source = await createFileSystemSource(dest.uri)
  registerSource(source)

  return book
}

export async function removeBook(bookId: string): Promise<void> {
  unregisterSource(bookId)
  const dest = bookDir(bookId)
  if (dest.exists) dest.delete()
  await getDb().runAsync('DELETE FROM installed_books WHERE book_id = ?', [bookId])
}

export async function loadInstalledBooks(): Promise<void> {
  ensureBooksDir()
  const installed = await getInstalledBooks()
  for (const row of installed) {
    const dest = bookDir(row.book_id)
    const bookJsonFile = new File(dest, 'book.json')
    if (!bookJsonFile.exists) continue
    const source = await createFileSystemSource(dest.uri)
    registerSource(source)
  }
}
