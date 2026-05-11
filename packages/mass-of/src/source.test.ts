import type { SourceContext } from '@ember/content-engine'
import { describe, expect, it } from 'vitest'
import type { MassOfDataSource } from './dataSource'
import { createMassOfSource } from './source'
import type { DayLiturgies } from './types'

type DataMap = {
  masses?: Record<string, unknown>
  ordinaries?: Record<string, unknown>
  prefaces?: Record<string, unknown>
  ofData?: Record<string, unknown>
}

function makeData(map: DataMap): MassOfDataSource {
  return {
    fetchMassProper: async (id) => map.masses?.[id],
    fetchOrdinary: async (id) => map.ordinaries?.[id],
    fetchPreface: async (id) => map.prefaces?.[id],
    fetchOfData: async (id) => map.ofData?.[id],
  }
}

function makeCtx(date = new Date(2026, 3, 2)): SourceContext {
  // Holy Thursday 2026 default
  return {
    fetchOwnAsset: async () => undefined,
    localize: (text) => ({ primary: text['pt-BR'] ?? text['en-US'] ?? '' }),
    t: (key) => key,
    now: () => date,
  }
}

describe('massOfSource', () => {
  it('builds celebrations from enumerated formulary IDs', async () => {
    const chrismMass = {
      id: 'tempore.holy-week.chrism-mass',
      source: 'tempore',
      rite: 'chrism-mass',
      title: { 'en-US': 'Chrism Mass' },
      entranceAntiphon: { body: { lines: { en: [] } } },
    }
    const lordsSupperMass = {
      id: 'tempore.holy-week.lords-supper',
      source: 'tempore',
      rite: 'lords-supper',
      title: { 'en-US': 'Mass of the Lords Supper' },
    }
    const orderOfMass = { id: 'order-of-mass' }

    const source = createMassOfSource(
      makeData({
        masses: {
          'mass/of/tempore/holy-week/chrism-mass': chrismMass,
          'mass/of/tempore/holy-week/lords-supper': lordsSupperMass,
        },
        ordinaries: {
          'of/ordinary/ordinario': orderOfMass,
        },
      }),
    )

    const result = (await source.load({}, makeCtx())) as DayLiturgies
    expect(result.celebrations).toHaveLength(2)
    expect(result.celebrations[0].id).toBe('tempore.holy-week.chrism-mass')
    expect(result.celebrations[0].rite).toBe('chrism-mass')
    expect(result.celebrations[1].id).toBe('tempore.holy-week.lords-supper')
    expect(result.celebrations[1].rite).toBe('lords-supper')
    expect(result.ordinary).toEqual(orderOfMass)
  })

  it('hydrates prefaceRefs into the celebration primary', async () => {
    const formulary = {
      id: 'tempore.holy-week.chrism-mass',
      source: 'tempore',
      rite: 'chrism-mass',
      title: { 'en-US': 'Chrism Mass' },
      preface: { prefaceRefs: ['preface.pf-chrism'] },
    }
    const fullPreface = {
      id: 'preface.pf-chrism',
      title: { 'en-US': 'The Priesthood of Christ...' },
      body: { plain: { en: 'It is truly right...' } },
    }

    const source = createMassOfSource(
      makeData({
        masses: {
          'mass/of/tempore/holy-week/chrism-mass': formulary,
          'mass/of/tempore/holy-week/lords-supper': formulary, // dummy
        },
        prefaces: {
          'of/preface/pf-chrism': fullPreface,
        },
        ordinaries: {
          'of/ordinary/ordinario': {},
        },
      }),
    )

    const result = (await source.load({}, makeCtx())) as DayLiturgies
    // Preface hydrated under `alternatives[]`, with a `label` derived from the
    // title. The body is the original full preface payload.
    const hydratedPreface = result.celebrations[0].primary.preface as {
      alternatives?: Array<Record<string, unknown>>
    }
    expect(hydratedPreface.alternatives).toHaveLength(1)
    const first = hydratedPreface.alternatives![0]
    expect(first.id).toBe('preface.pf-chrism')
    expect(first.body).toEqual(fullPreface.body)
  })

  it('skips celebrations whose primary fetch returns undefined', async () => {
    // Holy Thursday enumerates 2 celebrations; supply only one
    const source = createMassOfSource(
      makeData({
        masses: {
          'mass/of/tempore/holy-week/chrism-mass': {
            id: 'tempore.holy-week.chrism-mass',
            source: 'tempore',
            rite: 'chrism-mass',
            title: { 'en-US': 'Chrism Mass' },
          },
        },
        ordinaries: {},
      }),
    )
    const result = (await source.load({}, makeCtx())) as DayLiturgies
    expect(result.celebrations).toHaveLength(1)
    expect(result.celebrations[0].id).toBe('tempore.holy-week.chrism-mass')
  })

  it('returns the picked cycle for the date', async () => {
    const source = createMassOfSource(
      makeData({
        masses: {
          'mass/of/tempore/ordinary-time/week-23/tuesday': {
            id: 'tempore.ordinary-time.week-23.tuesday',
            source: 'tempore',
            title: {},
          },
        },
        ordinaries: { 'of/ordinary/ordinario': {} },
      }),
    )
    const result = (await source.load({}, makeCtx(new Date(2026, 5, 9)))) as DayLiturgies
    expect(['I', 'II']).toContain(result.cycle)
  })
})
