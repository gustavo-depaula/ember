import type { Church } from '@ember/api'
import { describe, expect, it } from 'vitest'
import { cellsCovering, drawView, planView, ringAround, tilePath } from '../tiles'

// São Paulo's centre, and a city-sized view around it.
const se = { lat: -23.5505, lng: -46.6333 }
const city = { minLat: -23.62, maxLat: -23.49, minLng: -46.72, maxLng: -46.55 }

function church(id: string, lat: number, lng: number, kind = 'mass'): Church {
  return { id, name: id, lat, lng, services: [{ id: `${id}-s`, kind }] } as unknown as Church
}

describe('cellsCovering', () => {
  it('names the geohash cell a point falls in', () => {
    const point = { minLat: se.lat, maxLat: se.lat, minLng: se.lng, maxLng: se.lng }
    expect(cellsCovering(point, 5)).toEqual(['6gyf4'])
    expect(cellsCovering(point, 2)).toEqual(['6g'])
  })

  it('covers a box that crosses cells, with no cell twice', () => {
    const cells = cellsCovering(city, 5)
    expect(cells).toContain('6gyf4')
    expect(new Set(cells).size).toBe(cells.length)
    expect(cells).toHaveLength(20)
  })
})

describe('planView', () => {
  it('draws a city from detail tiles', () => {
    expect(planView(city)).toMatchObject({ mode: 'detail' })
  })

  it('draws a region from the counts under a few coarser tiles', () => {
    const region = { minLat: -24, maxLat: -23, minLng: -47.2, maxLng: -46 }
    expect(planView(region)).toEqual({ mode: 'counts', tiles: ['6gw', '6gx', '6gy', '6gz'] })
  })

  it('draws the whole world from one tile', () => {
    const world = { minLat: -80, maxLat: 80, minLng: -170, maxLng: 170 }
    expect(planView(world)).toEqual({ mode: 'counts', tiles: ['root'] })
  })

  it('addresses a detail tile alike whatever the filter, a count tile by its kind', () => {
    expect(tilePath('6gyf4', 'detail', 'confession')).toBe('/churches/tiles/6gyf4')
    expect(tilePath('6gy', 'counts', 'confession')).toBe('/churches/tiles/6gy?kind=confession')
    expect(tilePath('6gy', 'counts')).toBe('/churches/tiles/6gy')
  })

  it('rings a detail view with the tiles around it, none of its own', () => {
    const plan = planView(city)
    const ring = ringAround(city, plan)
    expect(ring.length).toBeGreaterThan(0)
    expect(ring.some((cell) => plan.tiles.includes(cell))).toBe(false)
    expect(ringAround(city, { mode: 'counts', tiles: ['6gy'] })).toEqual([])
  })
})

describe('drawView', () => {
  const plan = planView(city)
  // 1000 px across the city view.
  const pxPerDeg = 1000 / (city.maxLng - city.minLng)
  const draw = (churches: Church[], kind?: 'mass' | 'confession') =>
    drawView({
      plan,
      tiles: plan.tiles.map((_, i) => (i ? {} : { churches })),
      bbox: city,
      pxPerDeg,
      kind,
    })

  it('lists the churches in view nearest the centre first, each its own pin', () => {
    const view = draw([
      church('edge', -23.6, -46.7),
      church('centre', -23.555, -46.635),
      church('outside', -23.3, -46.635),
    ])
    expect(view.churches.map((c) => c.id)).toEqual(['centre', 'edge'])
    expect(view.clusters).toEqual([])
    expect(view.complete).toBe(true)
  })

  it('counts churches whose pins would sit on one another, and still pins the rest', () => {
    const view = draw([
      church('a', -23.55, -46.63),
      church('b', -23.5501, -46.6301),
      church('c', -23.6, -46.7),
    ])
    expect(view.churches).toHaveLength(3)
    expect(view.clusters).toHaveLength(2)
    expect(view.clusters.find((c) => c.count === 2)?.church).toBeUndefined()
    expect(view.clusters.find((c) => c.count === 1)?.church).toEqual({ id: 'c', name: 'c' })
  })

  it('keeps only the churches offering the chosen service', () => {
    const view = draw(
      [church('m', -23.55, -46.63), church('c', -23.56, -46.64, 'confession')],
      'confession',
    )
    expect(view.churches.map((c) => c.id)).toEqual(['c'])
  })

  it('reports a view whose tiles have not all arrived', () => {
    const view = drawView({ plan, tiles: plan.tiles.map(() => undefined), bbox: city, pxPerDeg })
    expect(view).toMatchObject({ churches: [], clusters: [], complete: false })
  })

  it('merges the counts of neighbouring cells when zoomed out, and lists nothing', () => {
    const region = { minLat: -24, maxLat: -23, minLng: -47.2, maxLng: -46 }
    const view = drawView({
      plan: planView(region),
      tiles: [
        {
          cells: [
            { id: '6gyf', lat: -23.55, lng: -46.63, count: 500 },
            { id: '6gyc', lat: -23.56, lng: -46.64, count: 40 },
            { id: '6gy9', lat: -23.9, lng: -46.9, count: 1, church: { id: 'x', name: 'X' } },
          ],
        },
        {},
        {},
        {},
      ],
      bbox: region,
      pxPerDeg: 1000 / 1.2,
    })
    expect(view.churches).toEqual([])
    expect(view.clusters.map((c) => c.count).sort((a, b) => b - a)).toEqual([540, 1])
    expect(view.clusters.find((c) => c.count === 1)?.church).toEqual({ id: 'x', name: 'X' })
  })
})
