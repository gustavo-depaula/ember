import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createEventsTable, replayAll } from '@/db/events'
import { setDb } from '@/db/instance'
import initialMigration from '@/db/migrations/0001_initial.sql'
import {
  archiveCommitment,
  createCommitment,
  createSession,
  endSession,
  getCommitment,
  listCommitments,
  listEventsForCommitment,
  listRecentSessions,
  reconcileAbandonedSessions,
  recordEvent,
  updateCommitment,
} from '@/db/repositories/custody'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import { isFenceActive, nextActivation, nextDeactivation } from './schedule'
import { mapShieldEventType } from './shieldEvents'
import type { CommitmentInput, Target } from './types'

async function boot() {
  resetAllTestDbs()
  const db = await openDatabaseAsync('ember.db')
  setDb(db as never)
  await db.execAsync(initialMigration)
  await createEventsTable(db as never)
  await replayAll()
}

const sampleTargets: Target[] = [{ kind: 'domain', domain: 'instagram.com' }]

function baseInput(overrides: Partial<CommitmentInput> = {}): CommitmentInput {
  return {
    name: 'No Instagram',
    kind: 'abstain',
    targets: sampleTargets,
    schedule: { type: 'daily' },
    friction: 'none',
    ...overrides,
  }
}

beforeEach(async () => {
  await boot()
})

afterEach(async () => {
  resetAllTestDbs()
})

describe('Custody repository', () => {
  it('creates a commitment and reads it back with JSON columns intact', async () => {
    const created = await createCommitment(baseInput())
    expect(created.id).toBeTruthy()
    expect(created.targets).toEqual(sampleTargets)
    expect(created.schedule).toEqual({ type: 'daily' })

    const fetched = await getCommitment(created.id)
    expect(fetched?.name).toBe('No Instagram')
    expect(fetched?.targets).toEqual(sampleTargets)
  })

  it('filters archived commitments from default list', async () => {
    const a = await createCommitment(baseInput({ name: 'A' }))
    await createCommitment(baseInput({ name: 'B' }))
    await archiveCommitment(a.id)

    const active = await listCommitments()
    expect(active.map((c) => c.name)).toEqual(['B'])

    const all = await listCommitments({ includeArchived: true })
    expect(all.map((c) => c.name).sort()).toEqual(['A', 'B'])
  })

  it('updates a commitment patchwise', async () => {
    const c = await createCommitment(baseInput())
    const updated = await updateCommitment(c.id, {
      name: 'Renamed',
      friction: 'wait',
      frictionConfig: { kind: 'wait', waitSeconds: 600 },
    })
    expect(updated.name).toBe('Renamed')
    expect(updated.friction).toBe('wait')
    expect(updated.friction_config).toEqual({ kind: 'wait', waitSeconds: 600 })
  })

  it('records events and lists them in occurred_at DESC order', async () => {
    const c = await createCommitment(baseInput())
    await recordEvent({ commitmentId: c.id, type: 'kept', occurredAt: 1000 })
    await recordEvent({ commitmentId: c.id, type: 'overrode', occurredAt: 3000, note: 'gave in' })
    await recordEvent({ commitmentId: c.id, type: 'kept', occurredAt: 2000 })

    const events = await listEventsForCommitment(c.id)
    expect(events.map((e) => e.occurred_at)).toEqual([3000, 2000, 1000])
    expect(events[0].note).toBe('gave in')
  })

  it('creates and ends sessions', async () => {
    const session = await createSession({
      anchorRef: 'Vigilate et orate',
      anchorType: 'text',
      plannedSeconds: 300,
    })
    expect(session.completed_at).toBeNull()

    const completed = await endSession(session.id, 'completed', session.started_at + 300_000)
    expect(completed.ended_reason).toBe('completed')

    const recent = await listRecentSessions()
    expect(recent[0].ended_reason).toBe('completed')
  })

  it('reconciles abandoned sessions to app-killed', async () => {
    const session = await createSession({
      anchorRef: 'x',
      anchorType: 'text',
      plannedSeconds: 1,
    })
    // started_at is now, planned 1s — wait 1.1s real time would be flaky;
    // instead reach into SQLite to backdate started_at.
    const { getDb } = await import('@/db/instance')
    await getDb().runAsync('UPDATE custody_sessions SET started_at = ? WHERE id = ?', [
      Date.now() - 10_000,
      session.id,
    ])
    await reconcileAbandonedSessions()
    const recent = await listRecentSessions()
    expect(recent[0].ended_reason).toBe('app-killed')
  })

  it('throws when targets JSON is not an array', async () => {
    const c = await createCommitment(baseInput())
    const { getDb } = await import('@/db/instance')
    await getDb().runAsync('UPDATE commitments SET targets = ? WHERE id = ?', [
      '"oops not an array"',
      c.id,
    ])
    await expect(getCommitment(c.id)).rejects.toThrow(/targets JSON is not an array/)
  })

  it('throws when schedule JSON has no .type field', async () => {
    const c = await createCommitment(baseInput())
    const { getDb } = await import('@/db/instance')
    await getDb().runAsync('UPDATE commitments SET schedule = ? WHERE id = ?', [
      '{"days":[1,2,3]}',
      c.id,
    ])
    await expect(getCommitment(c.id)).rejects.toThrow(/schedule JSON missing\/invalid \.type/)
  })
})

describe('mapShieldEventType', () => {
  it('passes through the three valid event types', () => {
    expect(mapShieldEventType('kept')).toBe('kept')
    expect(mapShieldEventType('overrode')).toBe('overrode')
    expect(mapShieldEventType('paused')).toBe('paused')
  })

  it('returns undefined for unknown event types', () => {
    expect(mapShieldEventType('confessed')).toBeUndefined()
    expect(mapShieldEventType('fell')).toBeUndefined()
    expect(mapShieldEventType('')).toBeUndefined()
    expect(mapShieldEventType('KEPT')).toBeUndefined()
  })
})

describe('Custody schedule helpers', () => {
  const overnightCommitment = {
    id: 'x',
    name: 'overnight',
    description: null,
    kind: 'time-fence' as const,
    targets: sampleTargets,
    schedule: { type: 'daily' as const },
    friction: 'none' as const,
    friction_config: null,
    fence_start: '21:00',
    fence_end: '07:00',
    limit_seconds: null,
    archived: 0,
    created_at: 0,
    updated_at: 0,
  }

  it('detects overnight fence as active at 23:00', () => {
    const at23 = new Date(2026, 0, 14, 23, 0, 0)
    expect(isFenceActive(overnightCommitment, at23)).toBe(true)
  })

  it('detects overnight fence as active at 03:00 (next day)', () => {
    const at03 = new Date(2026, 0, 15, 3, 0, 0)
    expect(isFenceActive(overnightCommitment, at03)).toBe(true)
  })

  it('detects overnight fence as inactive at 14:00', () => {
    const at14 = new Date(2026, 0, 14, 14, 0, 0)
    expect(isFenceActive(overnightCommitment, at14)).toBe(false)
  })

  it('returns next activation in the future', () => {
    const at14 = new Date(2026, 0, 14, 14, 0, 0)
    const next = nextActivation(overnightCommitment, at14)
    expect(next?.getHours()).toBe(21)
    expect(next?.getDate()).toBe(14)
  })

  it('returns next deactivation while inside fence', () => {
    const at23 = new Date(2026, 0, 14, 23, 0, 0)
    const next = nextDeactivation(overnightCommitment, at23)
    expect(next?.getHours()).toBe(7)
    expect(next?.getDate()).toBe(15)
  })

  it('returns undefined activation/deactivation for non-fence commitments', () => {
    const dailyCommitment = { ...overnightCommitment, kind: 'abstain' as const }
    expect(nextActivation(dailyCommitment)).toBeUndefined()
    expect(nextDeactivation(dailyCommitment)).toBeUndefined()
  })
})
