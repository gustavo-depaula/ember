import { describe, expect, it } from 'vitest'
import liguoriLiturgicalMapFixture from '../../../../content/libraries/alphonsus-liguori/practices/meditacoes-ligorio/data/liturgical-map.json'
import type { SourceContext } from '../data-sources'
import { liturgicalDaySource } from './liturgical-day'

function makeCtx(overrides: Partial<SourceContext> = {}): SourceContext {
  return {
    fetchAsset: async () => undefined,
    fetchOwnAsset: async () => liguoriLiturgicalMapFixture,
    localize: (text) => ({ primary: text['pt-BR'] ?? '' }),
    t: (key) => key,
    now: () => new Date('2026-12-25'), // Christmas Day
    ...overrides,
  }
}

describe('liturgical-day DataSource', () => {
  it('resolves the day name and alternatives for a given date', async () => {
    const ctx = makeCtx({ now: () => new Date('2026-12-25') })
    const result = await liturgicalDaySource.load({ data: 'liturgical-map', calendar: 'ef' }, ctx)
    expect(result).toMatchObject({
      liturgicalLabel: expect.any(String),
      alternatives: expect.any(Array),
    })
    const r = result as { liturgicalLabel: string; alternatives: unknown[] }
    expect(r.liturgicalLabel).toBeTruthy()
    // Christmas Day should always have at least one matching entry in Liguori's map
    expect(r.alternatives.length).toBeGreaterThan(0)
  })

  it('returns undefined when the data arg is missing', async () => {
    const result = await liturgicalDaySource.load({}, makeCtx())
    expect(result).toBeUndefined()
  })

  it('returns undefined when fetchOwnAsset returns a non-LiturgicalDayMap', async () => {
    const ctx = makeCtx({ fetchOwnAsset: async () => ({ junk: true }) })
    const result = await liturgicalDaySource.load({ data: 'whatever' }, ctx)
    expect(result).toBeUndefined()
  })

  it('passes the configured calendar through to the day-name resolver', async () => {
    const ctx = makeCtx({ now: () => new Date('2026-04-12') })
    const result = await liturgicalDaySource.load({ data: 'liturgical-map', calendar: 'of' }, ctx)
    expect(result).toMatchObject({ liturgicalLabel: expect.any(String) })
  })

  it('exposes alternatives as RepeatEntry objects with chapterId', async () => {
    const ctx = makeCtx({ now: () => new Date('2026-12-25') })
    const result = (await liturgicalDaySource.load({ data: 'liturgical-map' }, ctx)) as {
      alternatives: { chapterId?: unknown }[]
    }
    for (const entry of result.alternatives) {
      expect(typeof entry.chapterId).toBe('string')
    }
  })
})
