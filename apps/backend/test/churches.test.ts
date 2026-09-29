import { env } from 'cloudflare:test'
import { beforeEach, describe, expect, it } from 'vitest'
import app from '../src/app'
import { encodeGeohash } from '../src/lib/geo'
import { resetTables } from './helpers'

const center = { lat: 40.0, lng: -74.0 }

// 3 within 10 km of center, 1 ~111 km away.
const churches = [
  { id: 'st-mary-a', name: 'Saint Mary', lat: 40.001, lng: -74.001 }, // ~0.1 km
  { id: 'st-joseph-b', name: 'Saint Joseph', lat: 40.02, lng: -74.02 }, // ~2.6 km
  { id: 'st-peter-c', name: 'Saint Peter', lat: 40.05, lng: -74.0 }, // ~5.6 km
  { id: 'st-far-d', name: 'Holy Faraway', lat: 41.0, lng: -74.0 }, // ~111 km
]

async function seed() {
  await resetTables('verification_event', 'correction', 'church')
  for (const c of churches) {
    // Only Saint Mary has a TLM, embedded as JSON; used to prove kind/rite service-filtering.
    const services =
      c.id === 'st-mary-a'
        ? JSON.stringify([
            {
              id: 'svc-mary',
              kind: 'mass',
              rite: 'latin_tridentine',
              rrule: 'FREQ=WEEKLY;BYDAY=SU',
              startTime: '09:00',
            },
          ])
        : null
    await env.DB.prepare(
      'INSERT INTO church (id, name, lat, lng, geohash, timezone, services) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(c.id, c.name, c.lat, c.lng, encodeGeohash(c.lat, c.lng), 'America/New_York', services)
      .run()
  }
}

const json = async (res: Response) => res.json() as Promise<{ churches: { id: string }[] }>

beforeEach(seed)

describe('GET /churches/near', () => {
  it('returns churches inside the radius, nearest first, excluding far ones', async () => {
    const res = await app.request(
      `/churches/near?lat=${center.lat}&lng=${center.lng}&radiusKm=10`,
      {},
      env,
    )
    expect(res.status).toBe(200)
    const ids = (await json(res)).churches.map((c) => c.id)
    expect(ids).toEqual(['st-mary-a', 'st-joseph-b', 'st-peter-c'])
  })

  it('attaches service rules and filters by rite', async () => {
    const res = await app.request(
      `/churches/near?lat=${center.lat}&lng=${center.lng}&radiusKm=10&rite=latin_tridentine`,
      {},
      env,
    )
    const body = (await json(res)).churches as Array<{ id: string; services: unknown[] }>
    expect(body.map((c) => c.id)).toEqual(['st-mary-a'])
    expect(body[0].services).toHaveLength(1)
  })

  it('rejects an out-of-range radius (Zod 400)', async () => {
    const res = await app.request(
      `/churches/near?lat=${center.lat}&lng=${center.lng}&radiusKm=9999`,
      {},
      env,
    )
    expect(res.status).toBe(400)
  })
})

describe('GET /churches (viewport + FTS)', () => {
  // Box around the center: contains the 3 near churches, excludes the ~111 km one.
  const nearBox = '-74.1,39.9,-73.9,40.1' // minLng,minLat,maxLng,maxLat

  it('matches a partial token as a prefix (search-as-you-type)', async () => {
    const res = await app.request('/churches?q=Jos', {}, env)
    const ids = (await json(res)).churches.map((c) => c.id)
    expect(ids).toEqual(['st-joseph-b'])
  })

  it('returns churches inside the viewport box and excludes far ones', async () => {
    const res = await app.request(`/churches?bbox=${nearBox}`, {}, env)
    expect(res.status).toBe(200)
    const ids = (await json(res)).churches.map((c) => c.id)
    expect(ids).toEqual(expect.arrayContaining(['st-mary-a', 'st-joseph-b', 'st-peter-c']))
    expect(ids).not.toContain('st-far-d')
  })

  it('applies kind/rite service-filter on the viewport path too', async () => {
    const res = await app.request(`/churches?bbox=${nearBox}&rite=latin_tridentine`, {}, env)
    const ids = (await json(res)).churches.map((c) => c.id)
    expect(ids).toEqual(['st-mary-a'])
  })

  it('rejects an unbounded list with neither q nor bbox (Zod 400)', async () => {
    const res = await app.request('/churches?rite=latin_tridentine', {}, env)
    expect(res.status).toBe(400)
  })
})

describe('GET /churches viewport at any zoom', () => {
  type Viewport = {
    churches: { id: string }[]
    clusters: { lat: number; lng: number; count: number; church?: { id: string; name: string } }[]
  }

  // A 9×9 grid of churches 0.05° apart around the center (~5.5 km spacing), plus one far away. Only
  // the church at the exact center offers confession.
  async function seedGrid() {
    await resetTables('verification_event', 'correction', 'church')
    for (let i = -4; i <= 4; i++) {
      for (let j = -4; j <= 4; j++) {
        const lat = center.lat + i * 0.05
        const lng = center.lng + j * 0.05
        const kind = i === 0 && j === 0 ? 'confession' : 'mass'
        const services = JSON.stringify([
          { id: `s${i}${j}`, kind, rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '09:00' },
        ])
        await env.DB.prepare(
          'INSERT INTO church (id, name, lat, lng, geohash, timezone, services) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
          .bind(`g${i}_${j}`, `Grid ${i} ${j}`, lat, lng, encodeGeohash(lat, lng), 'UTC', services)
          .run()
      }
    }
  }

  const gridBox = '-74.25,39.75,-73.75,40.25'
  const viewport = async (query: string) => {
    const res = await app.request(`/churches?${query}`, {}, env)
    expect(res.status).toBe(200)
    return (await res.json()) as Viewport
  }

  beforeEach(seedGrid)

  it('lists every church, nearest the view center first, when they fit under the limit', async () => {
    const body = await viewport(`bbox=${gridBox}&limit=100`)
    expect(body.churches).toHaveLength(81)
    expect(body.churches[0].id).toBe('g0_0')
    expect(body.clusters).toEqual([])
  })

  it('over the limit, lists the churches nearest the center and clusters the whole box', async () => {
    const body = await viewport(`bbox=${gridBox}&limit=9`)
    const ids = body.churches.map((c) => c.id)
    expect(ids[0]).toBe('g0_0')
    // The 3×3 block around the center — not whichever 9 the index happens to return first.
    for (const id of ['g-1_-1', 'g-1_0', 'g0_1', 'g1_1']) expect(ids).toContain(id)
    expect(body.clusters.length).toBeGreaterThan(1)
    expect(body.clusters.reduce((sum, c) => sum + c.count, 0)).toBe(81)
  })

  it('names the church behind a single-church cluster', async () => {
    const body = await viewport(`bbox=${gridBox}&limit=9`)
    for (const cluster of body.clusters) {
      if (cluster.count === 1) expect(cluster.church?.name).toMatch(/^Grid /)
      else expect(cluster.church).toBeUndefined()
    }
  })

  it('filters by service kind before capping', async () => {
    const body = await viewport(`bbox=${gridBox}&limit=5&kind=confession`)
    expect(body.churches.map((c) => c.id)).toEqual(['g0_0'])
  })

  it('answers a continent-sized box', async () => {
    const body = await viewport('bbox=-130,20,-60,55&limit=9')
    expect(body.clusters.reduce((sum, c) => sum + c.count, 0)).toBe(81)
  })
})

describe('GET /churches/:id', () => {
  it('returns detail with services, texts, links', async () => {
    const res = await app.request('/churches/st-mary-a', {}, env)
    expect(res.status).toBe(200)
    const detail = (await res.json()) as { id: string; services: unknown[] }
    expect(detail.id).toBe('st-mary-a')
    expect(detail.services).toHaveLength(1)
  })

  it('404s an unknown church', async () => {
    const res = await app.request('/churches/nope', {}, env)
    expect(res.status).toBe(404)
  })
})

describe('geohash query uses the index', () => {
  it('EXPLAIN QUERY PLAN on a prefix range hits church_geohash_idx', async () => {
    const prefix = encodeGeohash(center.lat, center.lng, 4)
    const plan = await env.DB.prepare(
      'EXPLAIN QUERY PLAN SELECT * FROM church WHERE geohash >= ? AND geohash < ?',
    )
      .bind(prefix, `${prefix}{`)
      .all<{ detail: string }>()
    const detail = plan.results.map((r) => r.detail).join(' ')
    expect(detail).toMatch(/church_geohash_idx/)
  })
})
