import {
  type ContentLanguage,
  type FlowContext,
  type FlowDefinition,
  type FlowSection,
  getDataSource,
  resolveFlowAsync,
} from '@ember/content-engine'
import { buildEFFlow, buildMassFlow, type DayLiturgies } from '@ember/mass'
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
 * producer/mass — the Mass as a code-built flow, form-aware.
 *
 * The assembly that used to live as nested selects + fragments in
 * `content/practices/mass/flow.json` is now `buildMassFlow` (OF: celebration
 * picker, rite dispatch, seasonal blessing) and `buildEFFlow` (EF: the view
 * switch + Order-of-Mass sequence) — all decided in code. The form is passed via
 * the include `params.form` ('of' | 'ef'). For OF this loads the day via the
 * `mass-of` DataSource and binds it in flowData; EF is slot-centric (no day
 * object — propers resolve per-slot at render). Either way it fetches the
 * Order-of-Mass content fragments, resolves the computed flow through the engine,
 * and returns the final primitives. The practice's flow.json collapses to a form
 * `select` of `{ include: producer/mass, params: { form } }`.
 */
export const massFlowSource: ContentSource<Primitive[]> = {
  id: 'producer/mass',
  version: '2',
  prefsDeps: ['lang', 'translation'],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const form = ctx.params.form === 'ef' ? 'ef' : 'of'
    const { fragments } = await fetchHearth<MassFragments>('liturgical/mass-fragments.json')

    let sections: FlowSection[]
    let flowData: Record<string, unknown> = {}
    if (form === 'ef') {
      sections = buildEFFlow()
    } else {
      const massOf = getDataSource('mass-of')
      if (!massOf) return []
      const lang = emberLang(ctx.prefs.lang)
      const day = (await massOf.load(
        { calendar: 'of' },
        {
          fetchOwnAsset: async () => undefined,
          localize: (text) => ({
            primary:
              typeof text === 'string' ? text : ((text as Record<string, string>)[lang] ?? ''),
          }),
          t: (key) => key,
          now: () => ctx.date,
        },
      )) as DayLiturgies | undefined
      if (!day?.celebrations?.length) return []
      sections = buildMassFlow(day)
      // Preset `day` in flowData so the select/banner/slots bind to it without a
      // second load step.
      flowData = { day }
    }

    const flow: FlowDefinition = { fragments, sections }
    const flowContext: FlowContext = {
      date: ctx.date,
      liturgicalCalendar: form,
      numbering: getPsalmNumbering(ctx.prefs.translation),
      flowData,
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
