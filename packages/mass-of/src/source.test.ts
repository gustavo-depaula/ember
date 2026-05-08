import type { SourceContext } from '@ember/content-engine'
import { describe, expect, it } from 'vitest'
import { massOfSource } from './source'
import type { DayLiturgies } from './types'

function makeCtx(
  files: Record<string, unknown>,
  date = new Date(2026, 3, 2), // Holy Thursday 2026
): SourceContext {
  return {
    fetchAsset: async (path) => files[path],
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

    const ctx = makeCtx({
      'of/masses/tempore/holy-week/chrism-mass.json': chrismMass,
      'of/masses/tempore/holy-week/lords-supper.json': lordsSupperMass,
      'of/library/ordinary/ordinario.json': orderOfMass,
    })

    const result = (await massOfSource.load({}, ctx)) as DayLiturgies
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

    const ctx = makeCtx({
      'of/masses/tempore/holy-week/chrism-mass.json': formulary,
      'of/masses/tempore/holy-week/lords-supper.json': formulary, // dummy
      'of/library/preface/pf-chrism.json': fullPreface,
      'of/library/ordinary/ordinario.json': {},
    })

    const result = (await massOfSource.load({}, ctx)) as DayLiturgies
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
    const ctx = makeCtx({
      'of/masses/tempore/holy-week/chrism-mass.json': {
        id: 'tempore.holy-week.chrism-mass',
        source: 'tempore',
        rite: 'chrism-mass',
        title: { 'en-US': 'Chrism Mass' },
      },
      'library/ordinary/ordinario.json': {},
    })
    const result = (await massOfSource.load({}, ctx)) as DayLiturgies
    expect(result.celebrations).toHaveLength(1)
    expect(result.celebrations[0].id).toBe('tempore.holy-week.chrism-mass')
  })

  it('returns the picked cycle for the date', async () => {
    const ctx = makeCtx(
      {
        'of/masses/tempore/ordinary-time/week-23/tuesday.json': {
          id: 'tempore.ordinary-time.week-23.tuesday',
          source: 'tempore',
          title: {},
        },
        'of/library/ordinary/ordinario.json': {},
      },
      new Date(2026, 5, 9), // Tuesday in OT
    )
    const result = (await massOfSource.load({}, ctx)) as DayLiturgies
    expect(['I', 'II']).toContain(result.cycle)
  })
})
