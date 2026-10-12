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
import { createD1, fromRow, lit, type Row } from './d1'
import type { Env } from './env'
import { briefVersion, caseFile, refinePrompt, reviewPrompt, revisePrompt } from './prompt'
import { type ReviewJob, reviewer } from './reviewer'
import { createStore, type RunRow } from './store'
import type {
  Case,
  Desk,
  OtherChurch,
  Progress,
  Review,
  Run,
  Seen,
  StoredHistoryEntry,
  Suggestion,
} from './types'

// The moderation desk: the pending queue as read from D1, Claude's draft for each church, and the
// two things a moderator can do with one (apply it, undo it). The Worker remembers nothing between
// requests: every call reads what it needs, and nothing reaches the directory except through
// `apply` and `undo`.

// How far from a church the desk looks for chapels its parish may be answerable for.
const nearbyKm = 2.5
const nearbyLimit = 20
const searchLimit = 12
// The reviewer reports at least this often while a run lives (see reviewer/runner.mjs); a run
// silent for longer has lost its container.
const silentAfterMs = 3 * 60 * 1000
const imageTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

export type DeskApi = ReturnType<typeof createDesk>

export function createDesk(env: Env, target: Desk['target']) {
  const d1 = createD1(env.DB)
  const store = createStore(env.DB)

  async function load(): Promise<Desk> {
    const pending = "SELECT church_id FROM correction WHERE status = 'pending'"
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const [[corrections, churches, verifications, senders], reviews, runs, changes] =
      await Promise.all([
        d1.query(
          "SELECT * FROM correction WHERE status = 'pending' ORDER BY created_at",
          `SELECT * FROM church WHERE id IN (${pending})`,
          `SELECT church_id, COUNT(*) AS n FROM verification_event
           WHERE created_at >= ${lit(since)} AND church_id IN (${pending}) GROUP BY church_id`,
          `SELECT fingerprint, status, COUNT(*) AS n FROM correction
           WHERE fingerprint IN (SELECT fingerprint FROM correction WHERE status = 'pending')
           GROUP BY fingerprint, status`,
        ),
        store.reviews(),
        store.runs(),
        store.changes(),
      ])

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

    const others = await loadOthers([...churchById.values()], reviews)
    const runOf = new Map(runs.map((row) => [row.churchId, asRun(row)]))

    return {
      target,
      loadedAt: new Date().toISOString(),
      // Oldest suggestion first: `corrections` is in arrival order, and so is the map built from it.
      cases: [...byChurch].map(([churchId, suggestions]) => {
        const review = reviews.get(churchId)
        return {
          churchId,
          church: churchById.get(churchId),
          others: others.get(churchId) ?? [],
          suggestions,
          verifications: verified.get(churchId) ?? 0,
          review: review && { ...review, outdated: review.brief !== briefVersion },
          run: runOf.get(churchId),
        }
      }),
      history: changes
        .slice(0, 30)
        .map(({ records, resolution, basis, sharedAt, ...entry }) => entry),
      log: changes.filter((entry) => entry.records.length > 0 && !entry.undoneAt),
    }
  }

  async function find(churchId: string): Promise<Case> {
    const item = (await load()).cases.find((candidate) => candidate.churchId === churchId)
    if (!item) throw new Error(`No suggestions are waiting for ${churchId}. Refresh the desk.`)
    return item
  }

  // For each church with suggestions waiting: the rest of its parish, wherever they stand, the
  // churches around it, and any church further off that its saved review names (found by search).
  async function loadOthers(
    churches: Church[],
    reviews: Map<string, Review>,
  ): Promise<Map<string, OtherChurch[]>> {
    if (churches.length === 0) return new Map()
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
        return [c.id, [...family.map(asOther(c)), ...rest.map(asOther(c))]]
      }),
    )
  }

  // Name search over the whole directory, nearest the given church first. A church found this way
  // can be changed like a neighbour once a resolution or a saved review names it.
  async function search(churchId: string, query: string): Promise<OtherChurch[]> {
    const match = toPrefixMatchQuery(query)
    const [[row]] = await d1.query(`SELECT * FROM church WHERE id = ${lit(churchId)}`)
    if (!row || !match) return []
    const from = fromRow(churchTable, row)
    const { lat, lng } = from
    const k = Math.cos((lat * Math.PI) / 180) ** 2
    // The equirectangular square, as the public search ranks: D1 may lack SQLite's math functions.
    const [rows] = await d1.query(
      `SELECT c.* FROM church c JOIN church_fts ON church_fts.rowid = c.rowid
       WHERE church_fts MATCH ${lit(match)} AND c.id != ${lit(churchId)}
       ORDER BY ((c.lat - ${lat}) * (c.lat - ${lat}) + (c.lng - ${lng}) * (c.lng - ${lng}) * ${k}), rank
       LIMIT ${searchLimit}`,
    )
    return rows.map((found) => asOther(from)(fromRow(churchTable, found)))
  }

  // A bulletin photo. Undefined when the suggestion names an attachment that was never uploaded.
  async function photo(
    churchId: string,
    key: string,
  ): Promise<{ bytes: Uint8Array<ArrayBuffer>; base64: string; type?: string } | undefined> {
    const [[row]] = await d1.query(
      `SELECT content_type, data FROM attachment WHERE id = ${lit(key)} AND church_id = ${lit(churchId)}`,
    )
    if (!row) return undefined
    const base64 = row.data as string
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
    return { bytes, base64, type: imageFormat(bytes) }
  }

  async function photoResponse(churchId: string, key: string): Promise<Response> {
    const found = await photo(churchId, key)
    if (!found)
      return Response.json({ error: 'That photo is not in the database.' }, { status: 404 })
    return new Response(found.bytes, {
      headers: {
        'Content-Type': found.type ? imageTypes[found.type] : 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  }

  // Every run and every draft's date, for the page to follow reviews without reloading the desk.
  async function progress(): Promise<Progress> {
    const [runs, reviews] = await Promise.all([store.runs(), store.reviews()])
    return {
      runs: Object.fromEntries(runs.map((row) => [row.churchId, asRun(row)])),
      reviewedAt: Object.fromEntries([...reviews].map(([id, review]) => [id, review.reviewedAt])),
    }
  }

  // Have Claude draft (or, given an instruction, redraft) the proposal for a church. This hands the
  // case to the reviewer and returns; the draft arrives through `finish`.
  async function review(item: Case, instruction?: string) {
    const { churchId } = item
    const under = item.run?.status
    if (under === 'queued' || under === 'running') return

    const id = crypto.randomUUID()
    const row: RunRow = {
      churchId,
      id,
      status: 'queued',
      suggestionIds: item.suggestions.map((suggestion) => suggestion.id),
      activity: [],
      error: null,
      updatedAt: new Date().toISOString(),
    }
    await store.writeRun(row)
    try {
      const files: ReviewJob['files'] = []
      const photos = new Map<string, string>()
      for (const key of item.suggestions.flatMap((suggestion) => suggestion.attachmentKeys)) {
        const found = await photo(churchId, key)
        if (!found) continue
        // Claude's reader goes by the extension and refuses one it doesn't know as binary.
        const name = `photo-${photos.size + 1}.${found.type ?? 'bin'}`
        photos.set(key, name)
        files.push({ name, base64: found.base64 })
      }
      files.push({ name: 'case.json', text: caseFile(item, photos, new Date()) })

      // An instruction continues the conversation that produced the draft it is about, when the
      // reviewer still has it.
      const prior = instruction ? item.review : undefined
      const job: ReviewJob = {
        id,
        churchId,
        files,
        prompt: (() => {
          if (!instruction) return reviewPrompt
          if (prior) return revisePrompt(prior.proposal, instruction)
          return `${reviewPrompt}\n\nThe moderator adds:\n\n${instruction}`
        })(),
        resume:
          prior && instruction
            ? { sessionId: prior.sessionId, prompt: refinePrompt(instruction) }
            : undefined,
        schema: proposalJsonSchema(),
        model: env.MODERATION_MODEL || undefined,
      }
      const response = await reviewer(env).fetch('http://reviewer/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      })
      if (!response.ok) throw new Error(`The reviewer refused the case: ${await response.text()}`)
    } catch (error) {
      await store.updateRun(id, { status: 'failed', error: message(error) })
    }
  }

  async function reviewOne(churchId: string, instruction?: string) {
    await review(await find(churchId), instruction)
  }

  async function reviewAll() {
    for (const item of (await load()).cases) {
      const fresh =
        item.review?.brief === briefVersion && sameIds(item.review.suggestionIds, item.suggestions)
      if (!fresh) await review(item)
    }
  }

  async function stop(churchId: string) {
    const row = (await store.runs()).find((candidate) => candidate.churchId === churchId)
    if (!row) return
    // Forgetting the run is what stops it for the page; the reviewer is told so it stops paying
    // for it, and learns anyway at its next report.
    await store.deleteRun(row.id)
    if (row.status !== 'failed') {
      await reviewer(env).fetch(`http://reviewer/runs/${row.id}`, { method: 'DELETE' })
    }
  }

  // What the reviewer says while a run is under way. False once the run is no longer wanted.
  async function report(id: string, lines: string[]): Promise<boolean> {
    const row = await store.run(id)
    if (!row || row.status === 'failed') return false
    await store.updateRun(id, {
      status: 'running',
      activity: [...row.activity, ...lines],
      updatedAt: new Date().toISOString(),
    })
    return true
  }

  // How a run ended: with Claude's proposal, or with why there is none.
  async function finish(
    id: string,
    result: { output?: unknown; sessionId?: string; costUsd?: number; error?: string },
  ) {
    const row = await store.run(id)
    if (!row) return
    const parsed = proposalSchema.safeParse(result.output)
    const error = (() => {
      if (result.error) return result.error
      if (!result.sessionId) return 'The reviewer returned no session.'
      if (!parsed.success)
        return `Claude's proposal doesn't fit the record: ${issues(parsed.error)}`
      return undefined
    })()
    if (error || !parsed.success || !result.sessionId) {
      await store.updateRun(id, { status: 'failed', error: error ?? 'The review failed.' })
      return
    }
    await store.writeReview(row.churchId, {
      proposal: parsed.data,
      sessionId: result.sessionId,
      suggestionIds: row.suggestionIds,
      reviewedAt: new Date().toISOString(),
      costUsd: result.costUsd,
      brief: briefVersion,
    })
    await store.deleteRun(id)
  }

  async function searchFor(id: string, query: string): Promise<OtherChurch[]> {
    const row = await store.run(id)
    if (!row) throw new Error('This review was stopped.')
    return search(row.churchId, query)
  }

  // Write a resolution to the directory. Every church it names is read again first: what gets
  // saved for undo, and what the resolution is compared against, is the row as it is now, and a
  // row that moved since the moderator saw it is refused rather than overwritten.
  async function apply(churchId: string, resolution: Resolution, seen: Seen): Promise<Desk> {
    const named = [churchId, ...(resolution.related ?? []).map((related) => related.churchId)]
    const parishes = [resolution, ...(resolution.related ?? [])].flatMap(
      (record) => record.fields.parishId || [],
    )
    const ids = [...new Set([...named, ...parishes])].map(lit).join(', ')
    const [rows, waiting, [review]] = await d1.query(
      `SELECT * FROM church WHERE id IN (${ids})`,
      `SELECT id FROM correction WHERE church_id = ${lit(churchId)} AND status = 'pending'`,
      `SELECT proposal FROM moderation_review WHERE church_id = ${lit(churchId)}`,
    )
    const waitingIds = new Set(waiting.map((row) => row.id as string))
    const unknown = resolution.verdicts.find((verdict) => !waitingIds.has(verdict.id))
    if (unknown) throw new Error(`Suggestion ${unknown.id} is not waiting on this church.`)

    const fresh = new Map(rows.map((row) => [row.id as string, fromRow(churchTable, row)]))
    for (const id of named) {
      if ((fresh.get(id)?.updatedAt ?? null) !== (seen[id] ?? null)) {
        throw new Error(`${id} changed in the database since the desk loaded it. Refresh.`)
      }
    }

    const current = fresh.get(churchId)
    const now = new Date()
    const { statements, records } = planResolution(resolution, {
      churchId,
      current,
      known: [...fresh.values()].filter((c) => c.id !== churchId),
      createdIds: await reserveIds(resolution, current),
      now,
    })
    if (statements.length === 0) throw new Error('Nothing to apply.')
    await d1.execute(statements)

    const count = (status: string) =>
      resolution.verdicts.filter((verdict) => verdict.status === status).length
    const changed = records.length === 1 ? '1 church updated' : `${records.length} churches updated`
    const basis = review && (JSON.parse(review.proposal as string) as { summary?: string }).summary
    await store.writeChange({
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
      basis,
    })
    if (resolution.verdicts.length === waitingIds.size) await store.clearCase(churchId)
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
  async function undo(changeId: string): Promise<Desk> {
    const entries = await store.changes()
    const entry = entries.find((candidate) => candidate.id === changeId)
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
    await store.writeChange({ ...entry, undoneAt: new Date().toISOString() })
    return load()
  }

  // Record that a logged change was (or, unticked, was not) passed on to other directories.
  async function markShared(changeId: string, shared: boolean): Promise<Desk> {
    const entry = (await store.changes()).find((candidate) => candidate.id === changeId)
    if (!entry) throw new Error('That change is not in the log.')
    const sharedAt = shared ? new Date().toISOString() : undefined
    await store.writeChange({ ...entry, sharedAt } as StoredHistoryEntry)
    return load()
  }

  return {
    load,
    photoResponse,
    search,
    progress,
    review: reviewOne,
    reviewAll,
    stop,
    report,
    finish,
    searchFor,
    apply,
    undo,
    markShared,
  }
}

// A run as the page shows it. One that has said nothing for too long is shown as what it is.
function asRun(row: RunRow): Run {
  const silent = Date.now() - Date.parse(row.updatedAt) > silentAfterMs
  if (row.status !== 'failed' && silent) {
    return {
      status: 'failed',
      activity: row.activity,
      error: 'The reviewer stopped answering. Start the review again.',
    }
  }
  return {
    status: row.status as Run['status'],
    activity: row.activity,
    error: row.error ?? undefined,
  }
}

// What an attachment is, read from its first bytes. The stored content type can't be trusted for
// this: the app uploads photos as application/octet-stream.
function imageFormat(bytes: Uint8Array): string | undefined {
  const starts = (signature: number[], at = 0) =>
    signature.every((byte, index) => bytes[at + index] === byte)
  if (starts([0xff, 0xd8, 0xff])) return 'jpg'
  if (starts([0x89, 0x50, 0x4e, 0x47])) return 'png'
  if (starts([0x47, 0x49, 0x46, 0x38])) return 'gif'
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return 'webp'
  return undefined
}

const parishOf = (c: Church) => c.parishId ?? c.id

function distanceKm(from: Church, to: Church): number {
  return haversineKm(from.lat, from.lng, to.lat, to.lng)
}

function asOther(from: Church) {
  return (church: Church): OtherChurch => ({
    church,
    distanceKm: Math.round(distanceKm(from, church) * 100) / 100,
    sameParish: parishOf(church) === parishOf(from),
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
