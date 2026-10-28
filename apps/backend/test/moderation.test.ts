import { env } from 'cloudflare:test'
import { type Church, church, type Resolution, resolutionSchema } from '@ember/api'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { createDb } from '../src/db'
import { buildRows, importRows } from '../src/lib/import'
import { planResolution, restoreToSql } from '../src/lib/moderation'
import { resetTables } from './helpers'

const churchId = 'st-marys-newark-nj'
const now = new Date('2026-10-10T12:00:00.000Z')

const db = () => createDb(env.DB)

async function readChurch(id = churchId): Promise<Church> {
  const [row] = await db().select().from(church).where(eq(church.id, id))
  return row
}

// The statements for a resolution about St. Mary's, with `known` the other churches it may name.
const plan = (
  current: Church | undefined,
  resolution: Resolution,
  known: Church[] = [],
  createdIds: string[] = [],
) => planResolution(resolution, { churchId, current, known, createdIds, now })

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

// The service kinds the map counts in the parish's own cell (the chapel stands in another).
async function cellKinds(): Promise<string[]> {
  const { results } = await env.DB.prepare(
    `SELECT kind FROM church_cell
     WHERE precision = 5 AND cell = (SELECT substr(geohash, 1, 5) FROM church WHERE id = ?)
     ORDER BY kind`,
  )
    .bind(churchId)
    .all<{ kind: string }>()
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
      {
        name: 'St. Anne Chapel',
        city: 'Newark',
        region: 'NJ',
        lat: 41.74,
        lng: -74.18,
        timezone: 'America/New_York',
        services: [{ kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '08:00' }],
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

describe('planResolution', () => {
  it('moves a Mass, adds a service and settles the corrections', async () => {
    const before = await readChurch()
    const [sunday, saturday] = before.services ?? []

    await run(
      plan(
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
      ).statements,
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
      plan(
        before,
        resolve({ services: before.services ?? [], verdicts: [{ id: 'c1', status: 'rejected' }] }),
      ).statements,
    )
    expect(await readChurch()).toEqual(before)
    expect(await correctionStatuses()).toEqual({ c1: 'rejected', c2: 'pending' })
  })

  it('refuses two entries for the same slot', async () => {
    const before = await readChurch()
    const slot = { kind: 'mass' as const, rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '10:00' }
    expect(() => plan(before, resolve({ services: [slot, slot] }))).toThrow(/same service/)
  })
})

describe('a parish and its chapels', () => {
  const chapelId = 'st-anne-chapel-newark-nj'

  it('changes a chapel, links it to the parish and creates a missing one, then undoes it all', async () => {
    const parish = await readChurch()
    const chapel = await readChurch(chapelId)
    const resolution = resolve({
      related: [
        {
          churchId: chapelId,
          fields: { parishId: churchId },
          services: [{ kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '08:30' }],
        },
      ],
      created: [
        {
          name: 'St. Clare Chapel',
          lat: 40.75,
          lng: -74.19,
          services: [{ kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=WE', startTime: '19:00' }],
        },
      ],
      verdicts: [{ id: 'c1', status: 'accepted' }],
    })
    const { statements, records } = plan(
      parish,
      resolution,
      [chapel],
      ['st-clare-chapel-newark-nj'],
    )
    await run(statements)

    const linked = await readChurch(chapelId)
    expect(linked.parishId).toBe(churchId)
    expect(linked.services?.map((s) => s.startTime)).toEqual(['08:30'])
    const created = await readChurch('st-clare-chapel-newark-nj')
    expect(created).toMatchObject({
      parishId: churchId,
      timezone: 'America/New_York',
      city: 'Newark',
      verifiedSource: 'moderator',
    })
    expect(created.geohash).toHaveLength(9)
    // The parish itself is stamped as verified by the accepted correction, nothing more.
    expect((await readChurch()).services).toEqual(parish.services)
    expect(records.map((r) => [r.before?.id, r.after.id])).toEqual([
      [churchId, churchId],
      [chapelId, chapelId],
      [undefined, 'st-clare-chapel-newark-nj'],
    ])

    await run(restoreToSql([parish, chapel], ['st-clare-chapel-newark-nj'], ['c1']))
    expect(await readChurch()).toEqual(parish)
    expect(await readChurch(chapelId)).toEqual(chapel)
    expect(await readChurch('st-clare-chapel-newark-nj')).toBeUndefined()
  })

  it('keeps parishes one level deep', async () => {
    const parish = await readChurch()
    const chapel = { ...(await readChurch(chapelId)), parishId: 'somewhere-else' }
    expect(() => plan(parish, resolve({ fields: { parishId: chapelId } }), [chapel])).toThrow(
      /itself a chapel/,
    )
    expect(() => plan(parish, resolve({ fields: { parishId: churchId } }))).toThrow(/its own/)
    expect(() => plan(parish, resolve({ fields: { parishId: 'nowhere' } }))).toThrow(/not a church/)
  })

  it('survives a re-import of the chapel', async () => {
    await env.DB.prepare('UPDATE church SET parish_id = ? WHERE id = ?')
      .bind(churchId, chapelId)
      .run()
    await importRows(
      db(),
      buildRows([
        {
          name: 'St. Anne Chapel',
          city: 'Newark',
          region: 'NJ',
          lat: 41.74,
          lng: -74.18,
          timezone: 'America/New_York',
        },
      ]),
    )
    expect((await readChurch(chapelId)).parishId).toBe(churchId)
  })
})

describe('restoreToSql', () => {
  it('undoes a resolution', async () => {
    const before = await readChurch()
    await run(
      plan(
        before,
        resolve({
          fields: { status: 'closed' },
          services: [],
          verdicts: [{ id: 'c1', status: 'accepted' }],
        }),
      ).statements,
    )
    expect((await readChurch()).services).toBeNull()
    expect(await cellKinds()).toEqual([''])

    await run(restoreToSql([before], [], ['c1']))
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
