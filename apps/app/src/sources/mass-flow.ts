import {
  type ContentLanguage,
  type FlowContext,
  type FlowDefinition,
  type FlowSection,
  resolveFlowAsync,
} from '@ember/content-engine'
import { buildEFFlow } from '@ember/mass'
import { getCatalog } from '@/content/contentIndex'
import type { Primitive } from '@/content/primitives'
import { getPsalmNumbering } from '@/lib/bolls'
import { fetchHearth } from '@/lib/hearth'
import type { ContentSource, SourceFetchContext } from './types'

// `@/content/preprocessFlow` imports the source registry (it resolves `include`s),
// so importing it here statically would create a registry → mass-flow →
// preprocessFlow → registry cycle (massFlowSource undefined at registration).
// Load these lazily inside fetch instead — they're only needed there.
const lazyEngine = () =>
  Promise.all([import('@/content/preprocessFlow'), import('@/content/engineContext')])

type MassFragments = { fragments: Record<string, FlowSection[]> }

/**
 * producer/mass — the Extraordinary Form Mass as a code-built flow.
 *
 * `buildEFFlow` (the view switch + Order-of-Mass sequence) is decided in code;
 * EF is slot-centric (propers resolve per-slot at render). It fetches the EF
 * Order-of-Mass content fragments, resolves the computed flow through the
 * engine, and returns the final primitives. The Ordinary Form is now its own
 * producer (`producer/mass-of`), built directly to primitives without the
 * engine — see `sources/of-mass-flow.ts`.
 */
export const massFlowSource: ContentSource<Primitive[]> = {
  id: 'producer/mass',
  // Corpus generation in the version so a rebuilt corpus invalidates the cached
  // flow (the EF fragments change on every build). See of-mass-flow.ts.
  get version() {
    return `3:${getCatalog().generated}`
  },
  prefsDeps: ['lang', 'translation'],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const { fragments } = await fetchHearth<MassFragments>('liturgical/mass-fragments.json')
    const sections = buildEFFlow()

    const flow: FlowDefinition = { fragments, sections }
    const flowContext: FlowContext = {
      date: ctx.date,
      liturgicalCalendar: 'ef',
      numbering: getPsalmNumbering(ctx.prefs.translation),
      flowData: {},
    }
    const [{ preprocessFlow }, { createEngineContext, withSpiritualThreads }] = await lazyEngine()
    const ec = withSpiritualThreads(
      createEngineContext(undefined, { contentLanguage: ctx.prefs.lang as ContentLanguage }),
    )

    const rendered = await resolveFlowAsync(flow, flowContext, ec)
    return preprocessFlow(rendered, {
      queryClient: ctx.queryClient,
      prefs: ctx.prefs,
      date: ctx.date,
      programDay: ctx.programDay,
    })
  },
}
