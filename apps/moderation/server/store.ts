import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Church } from '@ember/api/src/schema'
import { dataDir, safeName } from './paths'
import type { Review, StoredHistoryEntry } from './types'

// The desk's working state on disk (apps/moderation/.data, untracked): a folder per church holding
// what Claude reads and the draft it wrote, plus the log that undo replays. The database stays the
// only record of what was decided; losing this folder loses drafts and undo, nothing else.

// The production database and the local one each keep their own drafts and log, so a trial run
// against `wrangler dev` never shows up in the record of what was done to the real directory.
let root = dataDir

export function openStore(target: 'remote' | 'local') {
  root = path.join(dataDir, target)
}

const historyDir = () => path.join(root, 'history')

export function caseDir(churchId: string): string {
  return path.join(root, 'cases', safeName(churchId))
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

// An entry written before a resolution could span churches holds its one church at the top level.
type LegacyEntry = Partial<StoredHistoryEntry> & { before?: Church; after?: Church }

function readEntry({ before, after, ...entry }: LegacyEntry): StoredHistoryEntry {
  const legacy = after ? [{ before, after }] : []
  return { ...entry, records: entry.records ?? legacy } as StoredHistoryEntry
}

// Newest first.
export async function readHistory(): Promise<StoredHistoryEntry[]> {
  if (!existsSync(historyDir())) return []
  const files = (await readdir(historyDir())).filter((name) => name.endsWith('.json')).sort()
  const entries = await Promise.all(
    files.map((name) => readJson<LegacyEntry>(path.join(historyDir(), name))),
  )
  return entries
    .filter((entry) => entry !== undefined)
    .map(readEntry)
    .reverse()
}

export function writeHistory(entry: StoredHistoryEntry): Promise<void> {
  return writeJson(path.join(historyDir(), `${safeName(entry.id)}.json`), entry)
}
