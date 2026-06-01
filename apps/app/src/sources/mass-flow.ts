import {
  type ContentLanguage,
  type FlowContext,
  type FlowDefinition,
  type FlowSection,
  getDataSource,
  resolveFlowAsync,
} from '@ember/content-engine'
import { buildMassFlow, type DayLiturgies } from '@ember/mass'
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

function emberLang(lang: string): string {
  return lang === 'en-US' ? 'en' : lang
}

/**
 * producer/mass — the OF Mass as a code-built flow.
 *
 * The assembly that used to live as nested selects + 32 fragments in
 * `content/practices/mass/flow.json` is now `buildMassFlow` (the celebration
 * picker, rite dispatch, and seasonal blessing — all decided in code). This
 * producer loads the day via the `mass-of` DataSource, fetches the Order-of-Mass
 * content fragments, resolves the computed flow through the engine, and returns
 * the final primitives. The practice's flow.json collapses to
 * `{ include: producer/mass }`.
 */
export const massFlowSource: ContentSource<Primitive[]> = {
  id: 'producer/mass',
  version: '1',
  prefsDeps: ['lang', 'translation'],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const massOf = getDataSource('mass-of')
    if (!massOf) return []

    const lang = emberLang(ctx.prefs.lang)
    const day = (await massOf.load(
      { calendar: 'of' },
      {
        fetchOwnAsset: async () => undefined,
        localize: (text) => ({
          primary: typeof text === 'string' ? text : ((text as Record<string, string>)[lang] ?? ''),
        }),
        t: (key) => key,
        now: () => ctx.date,
      },
    )) as DayLiturgies | undefined
    if (!day?.celebrations?.length) return []

    const { fragments } = await fetchHearth<MassFragments>('liturgical/mass-fragments.json')

    const flow: FlowDefinition = { fragments, sections: buildMassFlow(day) }
    // Preset `day` in flowData so the select/banner/slots bind to it without a
    // second load step.
    const flowContext: FlowContext = {
      date: ctx.date,
      liturgicalCalendar: 'of',
      numbering: getPsalmNumbering(ctx.prefs.translation),
      flowData: { day },
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
