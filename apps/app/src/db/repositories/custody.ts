import type {
  Commitment,
  CommitmentEvent,
  CommitmentInput,
  CustodySession,
  EventType,
  FrictionConfig,
  Schedule,
  SessionAnchorType,
  SessionEndReason,
  Target,
} from '@/features/custody/types'
import { randomId } from '@/lib/id'
import { getDb } from '../instance'

type CommitmentRow = {
  id: string
  name: string
  description: string | null
  kind: string
  targets: string
  schedule: string
  friction: string
  friction_config: string | null
  fence_start: string | null
  fence_end: string | null
  limit_seconds: number | null
  archived: number
  created_at: number
  updated_at: number
}

type CommitmentEventRow = {
  id: string
  commitment_id: string
  type: string
  occurred_at: number
  note: string | null
  metadata: string | null
}

type CustodySessionRow = {
  id: string
  anchor_ref: string
  anchor_type: string
  planned_seconds: number
  started_at: number
  completed_at: number | null
  ended_reason: string | null
}

function parseJson<T>(value: string | null): T | null {
  if (!value) return null
  return JSON.parse(value) as T
}

function commitmentFromRow(row: CommitmentRow): Commitment {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    kind: row.kind as Commitment['kind'],
    targets: JSON.parse(row.targets) as Target[],
    schedule: JSON.parse(row.schedule) as Schedule,
    friction: row.friction as Commitment['friction'],
    friction_config: parseJson<FrictionConfig>(row.friction_config),
    fence_start: row.fence_start,
    fence_end: row.fence_end,
    limit_seconds: row.limit_seconds,
    archived: row.archived,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function eventFromRow(row: CommitmentEventRow): CommitmentEvent {
  return {
    id: row.id,
    commitment_id: row.commitment_id,
    type: row.type as EventType,
    occurred_at: row.occurred_at,
    note: row.note,
    metadata: parseJson<Record<string, unknown>>(row.metadata),
  }
}

function sessionFromRow(row: CustodySessionRow): CustodySession {
  return {
    id: row.id,
    anchor_ref: row.anchor_ref,
    anchor_type: row.anchor_type as SessionAnchorType,
    planned_seconds: row.planned_seconds,
    started_at: row.started_at,
    completed_at: row.completed_at,
    ended_reason: row.ended_reason as SessionEndReason | null,
  }
}

// --- Commitments ---

export async function listCommitments(
  opts: { includeArchived?: boolean } = {},
): Promise<Commitment[]> {
  const db = getDb()
  const sql = opts.includeArchived
    ? 'SELECT * FROM commitments ORDER BY created_at DESC'
    : 'SELECT * FROM commitments WHERE archived = 0 ORDER BY created_at DESC'
  const rows = await db.getAllAsync<CommitmentRow>(sql)
  return rows.map(commitmentFromRow)
}

export async function getCommitment(id: string): Promise<Commitment | undefined> {
  const db = getDb()
  const row = await db.getFirstAsync<CommitmentRow>('SELECT * FROM commitments WHERE id = ?', [id])
  return row ? commitmentFromRow(row) : undefined
}

export async function createCommitment(
  input: CommitmentInput & { id?: string },
): Promise<Commitment> {
  const db = getDb()
  const now = Date.now()
  const id = input.id ?? randomId()
  await db.runAsync(
    `INSERT INTO commitments (
      id, name, description, kind, targets, schedule,
      friction, friction_config, fence_start, fence_end,
      limit_seconds, archived, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [
      id,
      input.name,
      input.description ?? null,
      input.kind,
      JSON.stringify(input.targets),
      JSON.stringify(input.schedule),
      input.friction,
      input.frictionConfig ? JSON.stringify(input.frictionConfig) : null,
      input.fenceStart ?? null,
      input.fenceEnd ?? null,
      input.limitSeconds ?? null,
      now,
      now,
    ],
  )
  const created = await getCommitment(id)
  if (!created) throw new Error(`Commitment ${id} disappeared after insert`)
  return created
}

type SqlScalar = string | number | null

// Descriptor for each editable column: which JS field it maps from, the SQL
// column name, and how to serialize. Drives the UPDATE patch loop so the
// per-field if/push ladder lives in one place.
const COMMITMENT_COLUMNS: Array<{
  field: keyof CommitmentInput
  column: string
  serialize: (value: unknown) => SqlScalar
}> = [
  { field: 'name', column: 'name', serialize: (v) => v as string },
  { field: 'description', column: 'description', serialize: (v) => (v as string) ?? null },
  { field: 'kind', column: 'kind', serialize: (v) => v as string },
  { field: 'targets', column: 'targets', serialize: (v) => JSON.stringify(v) },
  { field: 'schedule', column: 'schedule', serialize: (v) => JSON.stringify(v) },
  { field: 'friction', column: 'friction', serialize: (v) => v as string },
  {
    field: 'frictionConfig',
    column: 'friction_config',
    serialize: (v) => (v ? JSON.stringify(v) : null),
  },
  { field: 'fenceStart', column: 'fence_start', serialize: (v) => (v as string) ?? null },
  { field: 'fenceEnd', column: 'fence_end', serialize: (v) => (v as string) ?? null },
  { field: 'limitSeconds', column: 'limit_seconds', serialize: (v) => (v as number) ?? null },
]

export async function updateCommitment(
  id: string,
  patch: Partial<CommitmentInput>,
): Promise<Commitment> {
  const db = getDb()
  const sets: string[] = []
  const params: SqlScalar[] = []

  for (const { field, column, serialize } of COMMITMENT_COLUMNS) {
    if (!(field in patch)) continue
    sets.push(`${column} = ?`)
    params.push(serialize(patch[field]))
  }

  sets.push('updated_at = ?')
  params.push(Date.now())
  params.push(id)
  await db.runAsync(`UPDATE commitments SET ${sets.join(', ')} WHERE id = ?`, params)

  const updated = await getCommitment(id)
  if (!updated) throw new Error(`Commitment ${id} not found after update`)
  return updated
}

export async function archiveCommitment(id: string): Promise<void> {
  const db = getDb()
  await db.runAsync('UPDATE commitments SET archived = 1, updated_at = ? WHERE id = ?', [
    Date.now(),
    id,
  ])
}

export async function unarchiveCommitment(id: string): Promise<void> {
  const db = getDb()
  await db.runAsync('UPDATE commitments SET archived = 0, updated_at = ? WHERE id = ?', [
    Date.now(),
    id,
  ])
}

export async function deleteCommitment(id: string): Promise<void> {
  const db = getDb()
  await db.runAsync('DELETE FROM commitments WHERE id = ?', [id])
}

// --- Events ---

export async function recordEvent(input: {
  commitmentId: string
  type: EventType
  note?: string
  metadata?: Record<string, unknown>
  occurredAt?: number
}): Promise<CommitmentEvent> {
  const db = getDb()
  const id = randomId()
  const occurredAt = input.occurredAt ?? Date.now()
  await db.runAsync(
    `INSERT INTO commitment_events (id, commitment_id, type, occurred_at, note, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.commitmentId,
      input.type,
      occurredAt,
      input.note ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ],
  )
  return {
    id,
    commitment_id: input.commitmentId,
    type: input.type,
    occurred_at: occurredAt,
    note: input.note ?? null,
    metadata: input.metadata ?? null,
  }
}

export async function listEventsForCommitment(
  commitmentId: string,
  opts: { limit?: number } = {},
): Promise<CommitmentEvent[]> {
  const db = getDb()
  const limit = opts.limit ?? 200
  const rows = await db.getAllAsync<CommitmentEventRow>(
    `SELECT * FROM commitment_events
     WHERE commitment_id = ?
     ORDER BY occurred_at DESC
     LIMIT ?`,
    [commitmentId, limit],
  )
  return rows.map(eventFromRow)
}

// --- Sessions ---

export async function createSession(input: {
  anchorRef: string
  anchorType: SessionAnchorType
  plannedSeconds: number
}): Promise<CustodySession> {
  const db = getDb()
  const id = randomId()
  const startedAt = Date.now()
  await db.runAsync(
    `INSERT INTO custody_sessions (id, anchor_ref, anchor_type, planned_seconds, started_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, input.anchorRef, input.anchorType, input.plannedSeconds, startedAt],
  )
  return {
    id,
    anchor_ref: input.anchorRef,
    anchor_type: input.anchorType,
    planned_seconds: input.plannedSeconds,
    started_at: startedAt,
    completed_at: null,
    ended_reason: null,
  }
}

export async function endSession(
  id: string,
  reason: SessionEndReason,
  completedAt?: number,
): Promise<CustodySession> {
  const db = getDb()
  const ts = completedAt ?? Date.now()
  await db.runAsync('UPDATE custody_sessions SET completed_at = ?, ended_reason = ? WHERE id = ?', [
    ts,
    reason,
    id,
  ])
  const row = await db.getFirstAsync<CustodySessionRow>(
    'SELECT * FROM custody_sessions WHERE id = ?',
    [id],
  )
  if (!row) throw new Error(`Session ${id} not found after end`)
  return sessionFromRow(row)
}

export async function listRecentSessions(limit = 20): Promise<CustodySession[]> {
  const db = getDb()
  const rows = await db.getAllAsync<CustodySessionRow>(
    'SELECT * FROM custody_sessions ORDER BY started_at DESC LIMIT ?',
    [limit],
  )
  return rows.map(sessionFromRow)
}

// Reconciliation on boot — closes any session that's been "running" longer than
// its planned duration with `app-killed` so the projection state is consistent.
export async function reconcileAbandonedSessions(): Promise<void> {
  const db = getDb()
  const now = Date.now()
  await db.runAsync(
    `UPDATE custody_sessions
     SET completed_at = started_at + planned_seconds * 1000,
         ended_reason = 'app-killed'
     WHERE completed_at IS NULL
       AND started_at + planned_seconds * 1000 < ?`,
    [now],
  )
}
