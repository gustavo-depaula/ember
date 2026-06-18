import { env } from 'cloudflare:test'
import type { ChurchDump } from '@ember/api'
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

beforeEach(() => resetTables('service', 'church_text', 'church_link', 'church'))

describe('buildRows', () => {
  it('derives a human-friendly slug id and disambiguates collisions', () => {
    const rows = buildRows(dump)
    expect(rows.churches.map((c) => c.id)).toEqual([
      'st-marys-springfield-il',
      'st-marys-springfield-il-2',
    ])
  })

  it('computes the geohash from lat/lng and links children to the church id', () => {
    const rows = buildRows(dump)
    expect(rows.churches[0].geohash).toBe(encodeGeohash(39.8, -89.65))
    expect(rows.services[0].churchId).toBe('st-marys-springfield-il')
    expect(rows.links[0].churchId).toBe('st-marys-springfield-il')
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
    // id is held stable by sourceId, not re-slugged from the new name/city
    expect(rows.churches[0].id).toBe('st-marys-springfield-il')
    expect(rows.mapping).toEqual([{ sourceId: 'SRC-1', id: 'st-marys-springfield-il' }])
  })

  it('slugs a new sourceId clear of every reserved prior id', () => {
    const prior = [{ sourceId: 'SRC-1', id: 'st-marys-springfield-il' }]
    // a different church that happens to slug to the same base → must disambiguate, not collide
    const fresh: ChurchDump[] = [{ ...dump[0], sourceId: 'SRC-NEW' }]
    const rows = buildRows(fresh, prior)
    expect(rows.churches[0].id).toBe('st-marys-springfield-il-2')
  })
})

describe('importRows', () => {
  it('inserts churches + children into D1 with geohash populated', async () => {
    const db = createDb(env.DB)
    await importRows(db, buildRows(dump))

    const churches = await env.DB.prepare('SELECT id, geohash FROM church ORDER BY id').all<{
      id: string
      geohash: string
    }>()
    expect(churches.results.map((c) => c.id)).toEqual([
      'st-marys-springfield-il',
      'st-marys-springfield-il-2',
    ])
    expect(churches.results[0].geohash).toBe(encodeGeohash(39.8, -89.65))

    const { count: svc } = await env.DB.prepare('SELECT COUNT(*) AS count FROM service').first<{
      count: number
    }>()
    const { count: links } = await env.DB.prepare(
      'SELECT COUNT(*) AS count FROM church_link',
    ).first<{
      count: number
    }>()
    expect(svc).toBe(1)
    expect(links).toBe(1)
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

    const counts = async (sql: string) => (await env.DB.prepare(sql).first<{ n: number }>()).n
    expect(await counts('SELECT COUNT(*) AS n FROM church')).toBe(2)
    expect(await counts('SELECT COUNT(*) AS n FROM service')).toBe(1)
    expect(await counts('SELECT COUNT(*) AS n FROM church_link')).toBe(1)
  })

  it('re-import updates a church in place and replaces its children, keyed by sourceId', async () => {
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
    const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM service WHERE church_id = ?')
      .bind('st-marys-springfield-il')
      .first<{ n: number }>()
    expect(n).toBe(2) // old single Mass replaced by the two new ones
  })
})

describe('rowsToSql', () => {
  it('emits INSERT statements and escapes single quotes', () => {
    const sql = rowsToSql(buildRows(dump))
    expect(sql).toMatch(/insert into .?church.?/i)
    expect(sql).toContain("St. Mary''s") // single quote doubled
  })

  it('emits idempotent upsert + child-replace SQL when upsert is set', () => {
    const sql = rowsToSql(buildRows(dump), { upsert: true })
    expect(sql).toMatch(/on conflict.+do update/i)
    expect(sql).toMatch(/delete from .?service.? where/i)
  })
})
