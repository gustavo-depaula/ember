import { QueryClient } from '@tanstack/react-query'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadCatalogFromHearth } from '@/content/resolver'
import { registerDataSources } from '@/lib/data-sources/register'
import { massFlowSource } from './mass-flow'

// End-to-end against the built corpus: producer/mass now builds only the
// Extraordinary Form (the Ordinary Form moved to producer/mass-of, built
// directly to primitives — see of-mass-flow.ts + sources/of/).
describe('producer/mass (EF)', () => {
  beforeAll(async () => {
    registerDataSources()
    await loadCatalogFromHearth()
  })

  it('assembles the EF Mass — slot-centric, no OF banner', async () => {
    const primitives = await massFlowSource.fetch({
      params: {},
      prefs: { lang: 'en-US', translation: 'DRB' },
      date: new Date(2026, 5, 14),
      sources: { fetch: async () => [] as never },
      queryClient: new QueryClient(),
    })

    expect(primitives.length).toBeGreaterThan(0)
    const json = JSON.stringify(primitives)
    // EF is slot-centric: the day's propers are `proper` interactions…
    expect(json).toContain('"proper"')
    // …and there's no OF celebration banner.
    expect(json).not.toContain('celebration-banner')
  })
})
