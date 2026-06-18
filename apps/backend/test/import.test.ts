import { env } from 'cloudflare:test'
import type { ChurchDump, Service } from '@ember/api'
import { beforeEach, describe, expect, it } from 'vitest'
import { createDb } from '../src/db'
import { encodeGeohash } from '../src/lib/geo'
import { buildRows, importRows, mappingToJsonl, rowsToSql } from '../src/lib/import'
import { resetTables } from './helpers'

const dump: ChurchDump[] = [
  {
    sourceId: 'SRC-1',
    name: "St. Mary's",
    city: 'Springfield',
    region: 'IL',
    lat: 39.8,
    lng: -89.65,
    timezone: 'America/Chicago',
    services: [{ kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '09:00' }],
    links: [{ kind: 'website', url: 'https://stmarys.example' }],
  },
  // same name + city + region → slug collision, must disambiguate. No sourceId → omitted from the map.
  {
    name: "St. Mary's",
    city: 'Springfield',
    region: 'IL',
    lat: 39.81,
    lng: -89.66,
    timezone: 'America/Chicago',
  },
]

beforeEach(() => resetTables('church'))

describe('buildRows', () => {
  it('derives a human-friendly slug id and disambiguates collisions', () => {
    const rows = buildRows(dump)
    expect(rows.churches.map((c) => c.id)).toEqual([
      'st-marys-springfield-il',
      'st-marys-springfield-il-2',
    ])
  })

  it('embeds services/links on the church row with a churchId-scoped deterministic service id', () => {
    const c = buildRows(dump).churches[0]
    expect(c.geohash).toBe(encodeGeohash(39.8, -89.65))
    expect(c.services).toHaveLength(1)
    expect(c.services?.[0]?.id).toMatch(/^st-marys-springfield-il:/)
    expect(c.links).toEqual([{ kind: 'website', url: 'https://stmarys.example' }])
    expect(buildRows(dump).churches[1].services).toBeUndefined() // no services → column omitted
  })

  it('gives a service a stable id across rebuilds (so corrections can target it)', () => {
    const id = (rows: ReturnType<typeof buildRows>) => rows.churches[0].services?.[0]?.id
    expect(id(buildRows(dump))).toBe(id(buildRows(dump)))
  })

  it('maps sourceId → generated id, omitting records with no sourceId', () => {
    const rows = buildRows(dump)
    expect(rows.mapping).toEqual([{ sourceId: 'SRC-1', id: 'st-marys-springfield-il' }])
    expect(mappingToJsonl(rows.mapping)).toBe('{"sourceId":"SRC-1","id":"st-marys-springfield-il"}')
  })

  it('reuses the prior id for a known sourceId even when name/city changed', () => {
    const prior = buildRows(dump).mapping
    const renamed: ChurchDump[] = [{ ...dump[0], name: 'Our Lady of the Snows', city: 'Chatham' }]
    const rows = buildRows(renamed, prior)
    expect(rows.churches[0].id).toBe('st-marys-springfield-il')
    expect(rows.mapping).toEqual([{ sourceId: 'SRC-1', id: 'st-marys-springfield-il' }])
  })

  it('slugs a new sourceId clear of every reserved prior id', () => {
    const prior = [{ sourceId: 'SRC-1', id: 'st-marys-springfield-il' }]
    const fresh: ChurchDump[] = [{ ...dump[0], sourceId: 'SRC-NEW' }]
    expect(buildRows(fresh, prior).churches[0].id).toBe('st-marys-springfield-il-2')
  })
})

const churchServices = async (id: string): Promise<Service[]> => {
  const row = await env.DB.prepare('SELECT services FROM church WHERE id = ?')
    .bind(id)
    .first<{ services: string | null }>()
  return row?.services ? (JSON.parse(row.services) as Service[]) : []
}

describe('importRows', () => {
  it('inserts churches with embedded services + geohash into D1', async () => {
    await importRows(createDb(env.DB), buildRows(dump))

    const churches = await env.DB.prepare('SELECT id, geohash FROM church ORDER BY id').all<{
      id: string
      geohash: string
    }>()
    expect(churches.results.map((c) => c.id)).toEqual([
      'st-marys-springfield-il',
      'st-marys-springfield-il-2',
    ])
    expect(churches.results[0].geohash).toBe(encodeGeohash(39.8, -89.65))

    const services = await churchServices('st-marys-springfield-il')
    expect(services).toHaveLength(1)
    expect(services[0]).toMatchObject({ kind: 'mass', startTime: '09:00' })
    expect(await churchServices('st-marys-springfield-il-2')).toEqual([])
  })

  it('imported churches are findable via FTS (triggers fired on insert)', async () => {
    await importRows(createDb(env.DB), buildRows(dump))
    const hit = await env.DB.prepare(
      'SELECT c.id FROM church c JOIN church_fts ON church_fts.rowid = c.rowid WHERE church_fts MATCH ?',
    )
      .bind('Mary')
      .all<{ id: string }>()
    expect(hit.results.length).toBe(2)
  })

  it('is idempotent — re-applying the same dump converges (no duplicate rows)', async () => {
    const db = createDb(env.DB)
    await importRows(db, buildRows(dump))
    await importRows(db, buildRows(dump))
    const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM church').first<{ n: number }>()
    expect(n).toBe(2)
  })

  it('re-import updates a church in place and replaces its services, keyed by sourceId', async () => {
    const db = createDb(env.DB)
    const prior = buildRows(dump).mapping
    await importRows(db, buildRows(dump))

    // re-scrape: SRC-1 renamed, now two Masses instead of one
    const rescrape: ChurchDump[] = [
      {
        ...dump[0],
        name: 'Our Lady of the Snows',
        services: [
          { kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SA', startTime: '17:00' },
          { kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '09:00' },
        ],
      },
    ]
    await importRows(db, buildRows(rescrape, prior))

    const row = await env.DB.prepare('SELECT name FROM church WHERE id = ?')
      .bind('st-marys-springfield-il')
      .first<{ name: string }>()
    expect(row.name).toBe('Our Lady of the Snows') // updated in place, id preserved
    expect(await churchServices('st-marys-springfield-il')).toHaveLength(2) // replaced wholesale
  })
})

describe('rowsToSql', () => {
  it('emits INSERT statements and escapes single quotes', () => {
    const sql = rowsToSql(buildRows(dump))
    expect(sql).toMatch(/insert into .?church.?/i)
    expect(sql).toContain("St. Mary''s") // single quote doubled
  })

  it('emits ON CONFLICT DO UPDATE when upsert is set (no child tables to delete)', () => {
    const sql = rowsToSql(buildRows(dump), { upsert: true })
    expect(sql).toMatch(/on conflict.+do update/i)
    expect(sql).not.toMatch(/delete from/i)
  })
})
