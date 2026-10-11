import { existsSync } from 'node:fs'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { proposalJsonSchema, proposalSchema, type Resolution } from '@ember/api/src/moderation'
import { type Church, church as churchTable } from '@ember/api/src/schema'
import { resolutionToSql, resolveChurch, restoreToSql } from '@ember/backend/src/lib/moderation'
import { runClaude } from './claude'
import { type D1, fromRow, lit, type Row } from './d1'
import { safeName } from './paths'
import { caseFile, refinePrompt, reviewPrompt } from './prompt'
import { caseDir, clearCase, readHistory, readReview, writeHistory, writeReview } from './store'
import type {
  Case,
  Desk,
  DeskEvent,
  HistoryEntry,
  Run,
  StoredHistoryEntry,
  Suggestion,
} from './types'

// The moderation desk: the pending queue as read from D1, Claude's draft for each church, and the
// two things a moderator can do with one (apply it, undo it). Everything here is in memory and
// rebuilt from the database on load; nothing reaches D1 except through `apply` and `undo`.

const concurrentReviews = 3
const imageTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

export type DeskApi = ReturnType<typeof createDesk>

export function createDesk(d1: D1) {
  let cases: Case[] = []
  let history: HistoryEntry[] = []
  let log: StoredHistoryEntry[] = []
  let loadedAt: string | undefined
  const runs = new Map<string, Run>()
  const aborts = new Map<string, AbortController>()
  const waiting: Array<{ churchId: string; instruction?: string }> = []
  const listeners = new Set<(event: DeskEvent) => void>()
  let active = 0

  function snapshot(): Desk {
    return {
      target: d1.target,
      loadedAt: loadedAt ?? '',
      cases: cases.map((item) => ({ ...item, run: runs.get(item.churchId) })),
      history,
      log,
    }
  }

  function emit(event: DeskEvent) {
    for (const listener of listeners) listener(event)
  }
  const emitDesk = () => emit({ type: 'desk', desk: snapshot() })
  const emitRun = (churchId: string) => emit({ type: 'run', churchId, run: runs.get(churchId) })

  function find(churchId: string): Case {
    const item = cases.find((candidate) => candidate.churchId === churchId)
    if (!item) throw new Error(`No suggestions are waiting for ${churchId}. Refresh the desk.`)
    return item
  }

  async function load(): Promise<Desk> {
    const pending = "SELECT church_id FROM correction WHERE status = 'pending'"
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const [corrections, churches, verifications, senders] = await d1.query(
      "SELECT * FROM correction WHERE status = 'pending' ORDER BY created_at",
      `SELECT * FROM church WHERE id IN (${pending})`,
      `SELECT church_id, COUNT(*) AS n FROM verification_event
       WHERE created_at >= ${lit(since)} AND church_id IN (${pending}) GROUP BY church_id`,
      `SELECT fingerprint, status, COUNT(*) AS n FROM correction
       WHERE fingerprint IN (SELECT fingerprint FROM correction WHERE status = 'pending')
       GROUP BY fingerprint, status`,
    )

    const churchById = new Map(churches.map((row) => [row.id as string, fromRow(churchTable, row)]))
    const verified = new Map(verifications.map((row) => [row.church_id, Number(row.n)]))
    const settled = (fingerprint: unknown, status: string) =>
      Number(
        senders.find((row) => row.fingerprint === fingerprint && row.status === status)?.n ?? 0,
      )

    const byChurch = new Map<string, Suggestion[]>()
    for (const row of corrections) {
      const churchId = row.church_id as string
      const suggestions = byChurch.get(churchId) ?? []
      suggestions.push({
        ...parsePayload(row),
        id: row.id as string,
        kind: row.kind as string,
        serviceId: (row.service_id as string | null) ?? undefined,
        createdAt: row.created_at as string,
        reporter: {
          accepted: settled(row.fingerprint, 'accepted'),
          rejected: settled(row.fingerprint, 'rejected'),
        },
      })
      byChurch.set(churchId, suggestions)
    }

    // Oldest suggestion first: `corrections` is in arrival order, and so is the map built from it.
    cases = await Promise.all(
      [...byChurch].map(async ([churchId, suggestions]) => ({
        churchId,
        church: churchById.get(churchId),
        suggestions,
        verifications: verified.get(churchId) ?? 0,
        review: await readReview(churchId),
      })),
    )
    await loadHistory()
    loadedAt = new Date().toISOString()
    emitDesk()
    return snapshot()
  }

  async function loadHistory() {
    const entries = await readHistory()
    history = entries
      .slice(0, 30)
      .map(({ before, after, resolution, basis, sharedAt, ...entry }) => entry)
    log = entries.filter((entry) => entry.after && !entry.undoneAt)
  }

  // A bulletin photo, fetched from D1 once and kept in the church's case folder, where Claude
  // reads it too. Undefined when the suggestion names an attachment that was never uploaded.
  async function photo(
    churchId: string,
    key: string,
  ): Promise<{ file: string; contentType: string } | undefined> {
    const dir = caseDir(churchId)
    const stem = `photo-${safeName(key)}.`
    const cached = existsSync(dir) ? (await readdir(dir)).find((name) => name.startsWith(stem)) : ''
    const extension = cached ? cached.slice(stem.length) : ''
    if (cached && imageTypes[extension]) {
      return { file: path.join(dir, cached), contentType: imageTypes[extension] }
    }
    // A copy cached under a name that says nothing of its format is fetched again and renamed.
    if (cached) await rm(path.join(dir, cached))

    const [[row]] = await d1.query(
      `SELECT content_type, data FROM attachment WHERE id = ${lit(key)} AND church_id = ${lit(churchId)}`,
    )
    if (!row) return undefined
    const bytes = Buffer.from(row.data as string, 'base64')
    const format = imageFormat(bytes)
    const file = path.join(dir, `${stem}${format ?? 'bin'}`)
    await mkdir(dir, { recursive: true })
    await writeFile(file, bytes)
    return { file, contentType: format ? imageTypes[format] : (row.content_type as string) }
  }

  function setRun(churchId: string, run: Run | undefined) {
    if (run) runs.set(churchId, run)
    else runs.delete(churchId)
    emitRun(churchId)
  }

  // Have Claude draft (or, given an instruction, redraft) the proposal for a church.
  function review(churchId: string, instruction?: string) {
    find(churchId)
    const current = runs.get(churchId)?.status
    if (current === 'queued' || current === 'running') return
    setRun(churchId, { status: 'queued', activity: [] })
    waiting.push({ churchId, instruction })
    pump()
  }

  function reviewAll() {
    for (const item of cases) {
      const fresh = item.review && sameIds(item.review.suggestionIds, item.suggestions)
      if (!fresh) review(item.churchId)
    }
  }

  function stop(churchId: string) {
    const queued = waiting.findIndex((job) => job.churchId === churchId)
    if (queued >= 0) waiting.splice(queued, 1)
    aborts.get(churchId)?.abort()
    if (runs.get(churchId)?.status === 'queued') setRun(churchId, undefined)
  }

  function pump() {
    while (active < concurrentReviews && waiting.length > 0) {
      const job = waiting.shift()
      if (!job) return
      active++
      void runReview(job.churchId, job.instruction).finally(() => {
        active--
        pump()
      })
    }
  }

  async function runReview(churchId: string, instruction?: string) {
    const abort = new AbortController()
    aborts.set(churchId, abort)
    const run: Run = { status: 'running', activity: [] }
    setRun(churchId, run)
    try {
      const item = find(churchId)
      const photos = new Map<string, string>()
      for (const key of item.suggestions.flatMap((suggestion) => suggestion.attachmentKeys)) {
        const fetched = await photo(churchId, key)
        if (fetched) photos.set(key, path.basename(fetched.file))
      }
      const dir = caseDir(churchId)
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, 'case.json'), caseFile(item, photos, new Date()))

      // An instruction continues the conversation that produced the draft it is about.
      const prior = instruction ? item.review : undefined
      const prompt = (() => {
        if (!instruction) return reviewPrompt
        if (prior) return refinePrompt(instruction)
        return `${reviewPrompt}\n\nThe moderator adds:\n\n${instruction}`
      })()
      const { output, sessionId, costUsd } = await runClaude({
        cwd: dir,
        prompt,
        schema: proposalJsonSchema(),
        resume: prior?.sessionId,
        signal: abort.signal,
        onActivity: (line) => {
          run.activity.push(line)
          emitRun(churchId)
        },
      })

      const parsed = proposalSchema.safeParse(output)
      if (!parsed.success) {
        throw new Error(`Claude's proposal doesn't fit the record: ${issues(parsed.error)}`)
      }
      const reviewed = {
        proposal: parsed.data,
        sessionId,
        suggestionIds: item.suggestions.map((suggestion) => suggestion.id),
        reviewedAt: new Date().toISOString(),
        costUsd,
      }
      await writeReview(churchId, reviewed)
      // The queue may have been reloaded while Claude worked; attach to whatever holds the case now.
      const live = cases.find((candidate) => candidate.churchId === churchId)
      if (live) live.review = reviewed
      runs.delete(churchId)
      emitDesk()
    } catch (error) {
      if (abort.signal.aborted) setRun(churchId, undefined)
      else setRun(churchId, { ...run, status: 'failed', error: message(error) })
    } finally {
      aborts.delete(churchId)
    }
  }

  // Write a resolution to D1. The church is read again first: what gets saved for undo, and what
  // the resolution is compared against, is the row as it is now, and a row that moved since the
  // moderator saw it is refused rather than overwritten.
  async function apply(churchId: string, resolution: Resolution): Promise<Desk> {
    const item = find(churchId)
    const waitingIds = new Set(item.suggestions.map((suggestion) => suggestion.id))
    const unknown = resolution.verdicts.find((verdict) => !waitingIds.has(verdict.id))
    if (unknown) throw new Error(`Suggestion ${unknown.id} is not waiting on this church.`)

    const [[row]] = await d1.query(`SELECT * FROM church WHERE id = ${lit(churchId)}`)
    const current: Church | undefined = row ? fromRow(churchTable, row) : undefined
    if (current?.updatedAt !== item.church?.updatedAt) {
      throw new Error('This church changed in the database since the desk loaded it. Refresh.')
    }

    const now = new Date()
    const update = current ? resolveChurch(current, resolution, now) : undefined
    const statements = resolutionToSql(churchId, current, resolution, now)
    if (statements.length === 0) throw new Error('Nothing to apply.')
    await d1.execute(statements)

    const count = (status: string) =>
      resolution.verdicts.filter((verdict) => verdict.status === status).length
    await writeHistory({
      id: `${now.toISOString()}-${churchId}`,
      churchId,
      churchName: current?.name ?? churchId,
      appliedAt: now.toISOString(),
      summary: [
        statements.length > resolution.verdicts.length ? 'record updated' : '',
        ...['accepted', 'rejected', 'duplicate'].map((status) =>
          count(status) ? `${count(status)} ${status}` : '',
        ),
      ]
        .filter(Boolean)
        .join(' · '),
      before: current,
      after: current && update ? ({ ...current, ...update } as Church) : undefined,
      resolution,
      basis: item.review?.proposal.summary,
    })
    if (resolution.verdicts.length === item.suggestions.length) await clearCase(churchId)
    return load()
  }

  // Put a church back as it was before a resolution and reopen its suggestions. Only the latest
  // resolution of a church can be undone: restoring an older one would take newer changes with it.
  async function undo(historyId: string): Promise<Desk> {
    const entries = await readHistory()
    const entry = entries.find((candidate) => candidate.id === historyId)
    if (!entry || entry.undoneAt) throw new Error('That change was already undone.')
    const latest = entries.find((other) => other.churchId === entry.churchId && !other.undoneAt)
    if (latest?.id !== entry.id) {
      throw new Error('A later change to this church has to be undone first.')
    }
    await d1.execute(
      restoreToSql(
        entry.before,
        entry.resolution.verdicts.map((verdict) => verdict.id),
      ),
    )
    await writeHistory({ ...entry, undoneAt: new Date().toISOString() })
    return load()
  }

  // Record that a logged change was (or, unticked, was not) passed on to other directories.
  async function markShared(historyId: string, shared: boolean): Promise<Desk> {
    const entry = (await readHistory()).find((candidate) => candidate.id === historyId)
    if (!entry) throw new Error('That change is not in the log.')
    await writeHistory({ ...entry, sharedAt: shared ? new Date().toISOString() : undefined })
    await loadHistory()
    emitDesk()
    return snapshot()
  }

  function subscribe(listener: (event: DeskEvent) => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return {
    load,
    snapshot,
    isLoaded: () => loadedAt !== undefined,
    photo,
    review,
    reviewAll,
    stop,
    apply,
    undo,
    markShared,
    subscribe,
  }
}

// What an attachment is, read from its first bytes. The stored content type can't be trusted for
// this: the app uploads photos as application/octet-stream, and Claude's reader goes by the file
// extension and refuses one it doesn't know as binary.
function imageFormat(bytes: Buffer): string | undefined {
  const starts = (signature: number[], at = 0) =>
    signature.every((byte, index) => bytes[at + index] === byte)
  if (starts([0xff, 0xd8, 0xff])) return 'jpg'
  if (starts([0x89, 0x50, 0x4e, 0x47])) return 'png'
  if (starts([0x47, 0x49, 0x46, 0x38])) return 'gif'
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return 'webp'
  return undefined
}

// A correction's payload is the JSON the app sent, minus its routing fields.
function parsePayload(row: Row): Pick<Suggestion, 'comment' | 'changes' | 'attachmentKeys'> {
  const payload = JSON.parse(row.payload as string) as {
    comment?: string
    changes?: Record<string, string>
    attachmentKeys?: string[]
  }
  return {
    comment: payload.comment,
    changes: payload.changes,
    attachmentKeys: payload.attachmentKeys ?? [],
  }
}

function sameIds(ids: string[], suggestions: Suggestion[]): boolean {
  return ids.length === suggestions.length && suggestions.every((s) => ids.includes(s.id))
}

export function issues(error: { issues: Array<{ path: PropertyKey[]; message: string }> }): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
}

export function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
