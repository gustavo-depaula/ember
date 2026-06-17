import { env } from 'cloudflare:test'
import type { ChurchDump } from '@ember/api'
import { beforeEach, describe, expect, it } from 'vitest'
import { createDb } from '../src/db'
import { encodeGeohash } from '../src/lib/geo'
import { buildRows, importRows, rowsToSql } from '../src/lib/import'
import { resetTables } from './helpers'

const dump: ChurchDump[] = [
  {
    name: "St. Mary's",
    city: 'Springfield',
    region: 'IL',
    lat: 39.8,
    lng: -89.65,
    timezone: 'America/Chicago',
    services: [{ kind: 'mass', rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '09:00' }],
    links: [{ kind: 'website', url: 'https://stmarys.example' }],
  },
  // same name + city + region → slug collision, must disambiguate
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
})

describe('rowsToSql', () => {
  it('emits INSERT statements and escapes single quotes', () => {
    const sql = rowsToSql(buildRows(dump))
    expect(sql).toMatch(/insert into .?church.?/i)
    expect(sql).toContain("St. Mary''s") // single quote doubled
  })
})
