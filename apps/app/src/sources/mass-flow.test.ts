import { QueryClient } from '@tanstack/react-query'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadCatalogFromHearth } from '@/content/resolver'
import { registerDataSources } from '@/lib/data-sources/register'
import { massFlowSource } from './mass-flow'

// End-to-end against the built corpus: producer/mass loads the day via the
// mass-of DataSource, fetches the Order-of-Mass fragments, and resolves
// buildMassFlow through the engine into final primitives.
describe('producer/mass', () => {
  beforeAll(async () => {
    registerDataSources()
    await loadCatalogFromHearth()
  })

  it('assembles the OF Mass into primitives for an Ordinary Time Sunday', async () => {
    const primitives = await massFlowSource.fetch({
      params: {},
      prefs: { lang: 'en-US', translation: 'DRB' },
      date: new Date(2026, 5, 14), // 2026-06-14, a Sunday in Ordinary Time
      sources: { fetch: async () => [] as never },
      queryClient: new QueryClient(),
    })

    expect(primitives.length).toBeGreaterThan(0)
    const json = JSON.stringify(primitives)
    expect(json).toContain('celebration-banner') // the day's hero banner
    expect(json).toMatch(/And with your spirit/) // greeting response → assembled through the dialogues
  })

  it('assembles the EF Mass (form: ef) — slot-centric, no OF banner', async () => {
    const primitives = await massFlowSource.fetch({
      params: { form: 'ef' },
      prefs: { lang: 'en-US', translation: 'DRB' },
      date: new Date(2026, 5, 14),
      sources: { fetch: async () => [] as never },
      queryClient: new QueryClient(),
    })

    expect(primitives.length).toBeGreaterThan(0)
    const json = JSON.stringify(primitives)
    // EF is slot-centric: the day's propers are `proper` interactions…
    expect(json).toContain('"proper"')
    // …and there's no OF celebration banner (confirms the form dispatch).
    expect(json).not.toContain('celebration-banner')
  })
})
