import { existsSync } from 'node:fs'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { proposalJsonSchema, proposalSchema, type Resolution } from '@ember/api/src/moderation'
import { type Church, church as churchTable } from '@ember/api/src/schema'
import { toPrefixMatchQuery } from '@ember/backend/src/lib/fts'
import {
  boundingBox,
  coveringPrefixes,
  haversineKm,
  prefixRanges,
} from '@ember/backend/src/lib/geo'
import { slugify } from '@ember/backend/src/lib/import'
import { planResolution, restoreToSql } from '@ember/backend/src/lib/moderation'
import { runClaude } from './claude'
import { type D1, fromRow, lit, type Row } from './d1'
import { appRoot, safeName } from './paths'
import { caseFile, refinePrompt, reviewPrompt } from './prompt'
import { caseDir, clearCase, readHistory, readReview, writeHistory, writeReview } from './store'
import type {
  Case,
  Desk,
  DeskEvent,
  HistoryEntry,
  OtherChurch,
  Review,
  Run,
  StoredHistoryEntry,
  Suggestion,
} from './types'

// The moderation desk: the pending queue as read from D1, Claude's draft for each church, and the
// two things a moderator can do with one (apply it, undo it). Everything here is in memory and
// rebuilt from the database on load; nothing reaches D1 except through `apply` and `undo`.

const concurrentReviews = 3
// How far from a church the desk looks for chapels its parish may be answerable for.
const nearbyKm = 2.5
const nearbyLimit = 20
const searchLimit = 12
const imageTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

export type DeskApi = ReturnType<typeof createDesk>

// `url` is where this desk answers on this machine, for the tools it hands a review.
export function createDesk(d1: D1, url: string) {
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

    const reviews = new Map(
      await Promise.all(
        [...byChurch.keys()].map(async (id) => [id, await readReview(id)] as const),
      ),
    )
    const others = await loadOthers([...churchById.values()], reviews).catch((error: Error) => {
      // The parish column arrives with migration 0005; a database without it can't be moderated.
      if (!error.message.includes('parish_id')) throw error
      throw new Error(
        'This database has no church.parish_id column yet. Apply migration 0005_church_parish (it runs with the backend deploy, or: pnpm --filter @ember/backend db:migrate:remote).',
      )
    })

    // Oldest suggestion first: `corrections` is in arrival order, and so is the map built from it.
    cases = [...byChurch].map(([churchId, suggestions]) => ({
      churchId,
      church: churchById.get(churchId),
      others: others.get(churchId) ?? [],
      suggestions,
      verifications: verified.get(churchId) ?? 0,
      review: reviews.get(churchId),
    }))
    await loadHistory()
    loadedAt = new Date().toISOString()
    emitDesk()
    return snapshot()
  }

  // For each church with suggestions waiting: the rest of its parish, wherever they stand, the
  // churches around it, and any church further off that its saved review names (found by search).
  async function loadOthers(
    churches: Church[],
    reviews: Map<string, Review | undefined>,
  ): Promise<Map<string, OtherChurch[]>> {
    if (churches.length === 0) return new Map()
    const parishOf = (c: Church) => c.parishId ?? c.id
    const parishes = [...new Set(churches.map(parishOf))].map(lit).join(', ')
    const namedBy = (c: Church) => {
      const proposal = reviews.get(c.id)?.proposal
      const related = proposal?.related ?? []
      return [
        proposal?.fields.parishId,
        ...related.flatMap((r) => [r.churchId, r.fields.parishId]),
      ].filter((id): id is string => Boolean(id))
    }
    const named = churches.flatMap(namedBy).map(lit).join(', ') || "''"
    const [kin, found, ...around] = await d1.query(
      `SELECT * FROM church WHERE parish_id IN (${parishes}) OR id IN (${parishes})`,
      `SELECT * FROM church WHERE id IN (${named})`,
      ...churches.map((c) => {
        const cells = coveringPrefixes(boundingBox(c.lat, c.lng, nearbyKm), 5)
        const ranges = prefixRanges(cells).map(
          ([lo, hi]) => `(geohash >= ${lit(lo)} AND geohash < ${lit(hi)})`,
        )
        return `SELECT * FROM church WHERE ${ranges.join(' OR ')}`
      }),
    )
    const kinRows = kin.map((row) => fromRow(churchTable, row))
    const foundRows = found.map((row) => fromRow(churchTable, row))

    return new Map(
      churches.map((c, index) => {
        const family = kinRows.filter((k) => k.id !== c.id && parishOf(k) === parishOf(c))
        const nearby = around[index]
          .map((row) => fromRow(churchTable, row))
          .filter((n) => distanceKm(c, n) <= nearbyKm)
          .sort((a, b) => distanceKm(c, a) - distanceKm(c, b))
          .slice(0, nearbyLimit)
        const further = foundRows.filter((f) => namedBy(c).includes(f.id))
        const rest = [...nearby, ...further].filter(
          (n, i, all) =>
            n.id !== c.id &&
            !family.some((k) => k.id === n.id) &&
            all.findIndex((other) => other.id === n.id) === i,
        )
        return [c.id, [...family.map(asOther(c, true)), ...rest.map(asOther(c, false))]]
      }),
    )
  }

  // Name search over the whole directory, nearest the case's church first. What it finds joins the
  // case, so it can be diffed and changed like a neighbour.
  async function search(churchId: string, query: string): Promise<OtherChurch[]> {
    const item = find(churchId)
    const match = toPrefixMatchQuery(query)
    if (!item.church || !match) return []
    const { lat, lng } = item.church
    const k = Math.cos((lat * Math.PI) / 180) ** 2
    // The equirectangular square, as the public search ranks: D1 may lack SQLite's math functions.
    const [rows] = await d1.query(
      `SELECT c.* FROM church c JOIN church_fts ON church_fts.rowid = c.rowid
       WHERE church_fts MATCH ${lit(match)} AND c.id != ${lit(churchId)}
       ORDER BY ((c.lat - ${lat}) * (c.lat - ${lat}) + (c.lng - ${lng}) * (c.lng - ${lng}) * ${k}), rank
       LIMIT ${searchLimit}`,
    )
    const matches = rows.map((row) => {
      const church = fromRow(churchTable, row)
      const known = item.others.find((other) => other.church.id === church.id)
      return known ?? asOther(item.church as Church, false)(church)
    })
    const fresh = matches.filter((match) => !item.others.includes(match))
    if (fresh.length) {
      item.others = [...item.others, ...fresh]
      emitDesk()
    }
    return matches
  }

  async function loadHistory() {
    const entries = await readHistory()
    history = entries
      .slice(0, 30)
      .map(({ records, resolution, basis, sharedAt, ...entry }) => entry)
    log = entries.filter((entry) => entry.records.length > 0 && !entry.undoneAt)
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
        mcp: {
          directory: {
            command: 'node',
            args: [path.join(appRoot, 'server/directory-mcp.mjs')],
            env: { DESK_URL: url, CHURCH_ID: churchId },
          },
        },
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

  // Write a resolution to D1. Every church it names is read again first: what gets saved for undo,
  // and what the resolution is compared against, is the row as it is now, and a row that moved
  // since the moderator saw it is refused rather than overwritten.
  async function apply(churchId: string, resolution: Resolution): Promise<Desk> {
    const item = find(churchId)
    const waitingIds = new Set(item.suggestions.map((suggestion) => suggestion.id))
    const unknown = resolution.verdicts.find((verdict) => !waitingIds.has(verdict.id))
    if (unknown) throw new Error(`Suggestion ${unknown.id} is not waiting on this church.`)

    const loaded = new Map(item.others.map((other) => [other.church.id, other.church]))
    if (item.church) loaded.set(churchId, item.church)
    const named = [churchId, ...(resolution.related ?? []).map((related) => related.churchId)]
    const [rows] = await d1.query(`SELECT * FROM church WHERE id IN (${named.map(lit).join(', ')})`)
    const fresh = new Map(rows.map((row) => [row.id as string, fromRow(churchTable, row)]))
    for (const id of named) {
      if (fresh.get(id)?.updatedAt !== loaded.get(id)?.updatedAt) {
        throw new Error(`${id} changed in the database since the desk loaded it. Refresh.`)
      }
    }

    const current = fresh.get(churchId)
    const now = new Date()
    const { statements, records } = planResolution(resolution, {
      churchId,
      current,
      known: [...loaded.values()].map((c) => fresh.get(c.id) ?? c),
      createdIds: await reserveIds(resolution, current),
      now,
    })
    if (statements.length === 0) throw new Error('Nothing to apply.')
    await d1.execute(statements)

    const count = (status: string) =>
      resolution.verdicts.filter((verdict) => verdict.status === status).length
    const changed = records.length === 1 ? '1 church updated' : `${records.length} churches updated`
    await writeHistory({
      id: `${now.toISOString()}-${churchId}`,
      churchId,
      churchName: current?.name ?? churchId,
      appliedAt: now.toISOString(),
      summary: [
        records.length ? changed : '',
        ...['accepted', 'rejected', 'duplicate'].map((status) =>
          count(status) ? `${count(status)} ${status}` : '',
        ),
      ]
        .filter(Boolean)
        .join(' · '),
      records,
      resolution,
      basis: item.review?.proposal.summary,
    })
    if (resolution.verdicts.length === item.suggestions.length) await clearCase(churchId)
    return load()
  }

  // An id nobody holds for each church the resolution creates, slugged the way the import does.
  async function reserveIds(resolution: Resolution, near: Church | undefined): Promise<string[]> {
    const taken = new Set<string>()
    const ids: string[] = []
    for (const created of resolution.created ?? []) {
      const base =
        slugify(
          [created.name, created.city ?? near?.city, created.region ?? near?.region]
            .filter(Boolean)
            .join(' '),
        ) || 'church'
      const [rows] = await d1.query(
        `SELECT id FROM church WHERE id = ${lit(base)} OR id LIKE ${lit(`${base}-%`)}`,
      )
      for (const row of rows) taken.add(row.id as string)
      let id = base
      for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
      taken.add(id)
      ids.push(id)
    }
    return ids
  }

  // Put every church a resolution touched back as it was, remove the ones it created, and reopen
  // its suggestions. Only the latest resolution to touch a church can be undone: restoring an
  // older one would take newer changes with it.
  async function undo(historyId: string): Promise<Desk> {
    const entries = await readHistory()
    const entry = entries.find((candidate) => candidate.id === historyId)
    if (!entry || entry.undoneAt) throw new Error('That change was already undone.')
    const touched = new Set([entry.churchId, ...entry.records.map((record) => record.after.id)])
    const later = entries
      .slice(0, entries.indexOf(entry))
      .find(
        (other) =>
          !other.undoneAt &&
          [other.churchId, ...other.records.map((r) => r.after.id)].some((id) => touched.has(id)),
      )
    if (later) throw new Error(`The later change to ${later.churchName} has to be undone first.`)

    await d1.execute(
      restoreToSql(
        entry.records.flatMap((record) => record.before ?? []),
        entry.records.filter((record) => !record.before).map((record) => record.after.id),
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
    search,
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

function distanceKm(from: Church, to: Church): number {
  return haversineKm(from.lat, from.lng, to.lat, to.lng)
}

function asOther(from: Church, sameParish: boolean) {
  return (church: Church): OtherChurch => ({
    church,
    distanceKm: Math.round(distanceKm(from, church) * 100) / 100,
    sameParish,
  })
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
