import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { dataDir, safeName } from './paths'
import type { Review, StoredHistoryEntry } from './types'

// The desk's working state on disk (apps/moderation/.data, untracked): a folder per church holding
// what Claude reads and the draft it wrote, plus the log that undo replays. The database stays the
// only record of what was decided; losing this folder loses drafts and undo, nothing else.

const historyDir = path.join(dataDir, 'history')

export function caseDir(churchId: string): string {
  return path.join(dataDir, 'cases', safeName(churchId))
}

async function readJson<T>(file: string): Promise<T | undefined> {
  if (!existsSync(file)) return undefined
  return JSON.parse(await readFile(file, 'utf8')) as T
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(value, undefined, 2)}\n`)
}

export function readReview(churchId: string): Promise<Review | undefined> {
  return readJson<Review>(path.join(caseDir(churchId), 'review.json'))
}

export function writeReview(churchId: string, review: Review): Promise<void> {
  return writeJson(path.join(caseDir(churchId), 'review.json'), review)
}

export function clearCase(churchId: string): Promise<void> {
  return rm(caseDir(churchId), { recursive: true, force: true })
}

// Newest first.
export async function readHistory(): Promise<StoredHistoryEntry[]> {
  if (!existsSync(historyDir)) return []
  const files = (await readdir(historyDir)).filter((name) => name.endsWith('.json')).sort()
  const entries = await Promise.all(
    files.map((name) => readJson<StoredHistoryEntry>(path.join(historyDir, name))),
  )
  return entries.filter((entry) => entry !== undefined).reverse()
}

export function writeHistory(entry: StoredHistoryEntry): Promise<void> {
  return writeJson(path.join(historyDir, `${safeName(entry.id)}.json`), entry)
}
