import { env } from 'cloudflare:test'
import { type Church, church, type Resolution, resolutionSchema } from '@ember/api'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { createDb } from '../src/db'
import { buildRows, importRows } from '../src/lib/import'
import { resolutionToSql, restoreToSql } from '../src/lib/moderation'
import { resetTables } from './helpers'

const churchId = 'st-marys-newark-nj'
const now = new Date('2026-10-10T12:00:00.000Z')

const db = () => createDb(env.DB)

async function readChurch(): Promise<Church> {
  const [row] = await db().select().from(church).where(eq(church.id, churchId))
  return row
}

// The desk hands these to wrangler as one batch; here each runs against the real D1.
async function run(statements: string[]) {
  for (const statement of statements) await env.DB.prepare(statement).run()
}

async function correctionStatuses(): Promise<Record<string, string>> {
  const { results } = await env.DB.prepare('SELECT id, status FROM correction').all<{
    id: string
    status: string
  }>()
  return Object.fromEntries(results.map((row) => [row.id, row.status]))
}

async function cellKinds(): Promise<string[]> {
  const { results } = await env.DB.prepare(
    'SELECT DISTINCT kind FROM church_cell ORDER BY kind',
  ).all<{ kind: string }>()
  return results.map((row) => row.kind)
}

const resolve = (resolution: Partial<Resolution>) =>
  resolutionSchema.parse({ fields: {}, verdicts: [], ...resolution })

beforeEach(async () => {
  await resetTables('correction', 'church')
  await importRows(
    db(),
    buildRows([
      {
        name: "St. Mary's",
        city: 'Newark',
        region: 'NJ',
        lat: 40.73,
        lng: -74.17,
        timezone: 'America/New_York',
        verifiedSource: 'import',
        services: [
          { kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '10:00', source: 'import' },
          { kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SA', startTime: '17:00', source: 'import' },
        ],
      },
    ]),
  )
  for (const id of ['c1', 'c2']) {
    await env.DB.prepare(
      "INSERT INTO correction (id, church_id, kind, payload) VALUES (?, ?, 'note', '{}')",
    )
      .bind(id, churchId)
      .run()
  }
})

describe('resolutionToSql', () => {
  it('moves a Mass, adds a service and settles the corrections', async () => {
    const before = await readChurch()
    const [sunday, saturday] = before.services ?? []

    await run(
      resolutionToSql(
        churchId,
        before,
        resolve({
          fields: { address: "12 O'Brien St" },
          services: [
            { ...sunday, kind: 'mass', startTime: '10:30' },
            { ...saturday, kind: 'mass' },
            { kind: 'confession', rrule: 'FREQ=WEEKLY;BYDAY=SA', startTime: '16:00' },
          ],
          verdicts: [
            { id: 'c1', status: 'accepted' },
            { id: 'c2', status: 'duplicate' },
          ],
        }),
        now,
      ),
    )

    const after = await readChurch()
    expect(after.address).toBe("12 O'Brien St")
    expect(after.services?.map((s) => [s.kind, s.startTime, s.source])).toEqual([
      ['mass', '10:30', 'manual'],
      ['mass', '17:00', 'import'],
      ['confession', '16:00', 'manual'],
    ])
    // An untouched slot keeps its id; a moved one takes the id of its new slot.
    expect(after.services?.[1].id).toBe(saturday.id)
    expect(after.services?.[0].id).not.toBe(sunday.id)
    expect(after.verifiedSource).toBe('moderator')
    expect(after.lastVerifiedAt).toBe(now.toISOString())
    expect(await correctionStatuses()).toEqual({ c1: 'accepted', c2: 'duplicate' })
    // The map's per-kind counts follow, through the church triggers.
    expect(await cellKinds()).toEqual(['', 'confession', 'mass'])
  })

  it('leaves the church alone when every correction is rejected', async () => {
    const before = await readChurch()
    await run(
      resolutionToSql(
        churchId,
        before,
        resolve({ services: before.services ?? [], verdicts: [{ id: 'c1', status: 'rejected' }] }),
        now,
      ),
    )
    expect(await readChurch()).toEqual(before)
    expect(await correctionStatuses()).toEqual({ c1: 'rejected', c2: 'pending' })
  })

  it('refuses two entries for the same slot', async () => {
    const before = await readChurch()
    const slot = { kind: 'mass' as const, rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '10:00' }
    expect(() =>
      resolutionToSql(churchId, before, resolve({ services: [slot, slot] }), now),
    ).toThrow(/same service/)
  })
})

describe('restoreToSql', () => {
  it('undoes a resolution', async () => {
    const before = await readChurch()
    await run(
      resolutionToSql(
        churchId,
        before,
        resolve({
          fields: { status: 'closed' },
          services: [],
          verdicts: [{ id: 'c1', status: 'accepted' }],
        }),
        now,
      ),
    )
    expect((await readChurch()).services).toBeNull()
    expect(await cellKinds()).toEqual([''])

    await run(restoreToSql(before, ['c1']))
    expect(await readChurch()).toEqual(before)
    expect(await correctionStatuses()).toEqual({ c1: 'pending', c2: 'pending' })
    expect(await cellKinds()).toEqual(['', 'mass'])
  })
})

describe('resolutionSchema', () => {
  it('rejects a schedule entry that is not one rrule at one time', () => {
    const entry = { kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '10:00' }
    const parse = (override: object) =>
      resolutionSchema.safeParse({
        fields: {},
        verdicts: [],
        services: [{ ...entry, ...override }],
      })
    expect(parse({}).success).toBe(true)
    expect(parse({ rrule: 'every Sunday' }).success).toBe(false)
    expect(parse({ rrule: 'BYDAY=SU' }).success).toBe(false)
    expect(parse({ startTime: '10h30' }).success).toBe(false)
  })
})
