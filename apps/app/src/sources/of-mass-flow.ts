import { resolveOfDay } from '@ember/mass'
import type { Lang, MassFormulary } from '@ember/missal-schema'
import { getCatalog } from '@/content/contentIndex'
import type { Primitive } from '@/content/primitives'
import {
  loadMassFormulary,
  loadOfCalendar,
  loadOrderOfMass,
  scopeForContentLang,
} from '@/lib/mass-of/loaders'
import { buildOfMassFlow } from './of'
import type { ContentSource, SourceFetchContext } from './types'

/**
 * producer/mass-of — the rebuilt OF Mass as final primitives, no engine.
 *
 * resolveOfDay (over the corpus calendar statics) → fetch the day's formulary
 * closure (each celebration + inherited orations + the temporal sibling for
 * memorial readings) + the Order-of-Mass bundle → buildOfMassFlow. Registered
 * alongside the legacy `producer/mass`; the Mass practice is switched onto it
 * at cutover.
 */
export const ofMassFlowSource: ContentSource<Primitive[]> = {
  id: 'producer/mass-of',
  // The cached flow embeds resolved order/formulary blobs whose hashes change
  // on every corpus build. The cache key omits those hashes, so without the
  // corpus generation here a rebuilt corpus would render stale forever. The
  // catalog's `generated` stamp changes each build → cache auto-invalidates.
  get version() {
    return `2:${getCatalog().generated}`
  },
  prefsDeps: ['lang', 'translation'],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const calendar = await loadOfCalendar()
    const order = await loadOrderOfMass()
    if (!calendar || !order) return []

    const scope = scopeForContentLang(ctx.prefs.lang)
    const day = resolveOfDay(ctx.date, calendar, { scope })

    const formularies: Record<string, MassFormulary> = {}
    const want = new Set<string>()
    for (const c of day.celebrations) want.add(c.ref)
    if (day.temporalRef) want.add(day.temporalRef)

    await Promise.all(
      [...want].map(async (ref) => {
        const f = await loadMassFormulary(ref)
        if (f) formularies[ref] = f
      }),
    )
    // Pull in any inherited-orations Sundays referenced by the loaded set.
    const inherits = Object.values(formularies)
      .map((f) => f.inheritsOrationsFrom)
      .filter((id): id is string => Boolean(id) && !formularies[id as string])
    await Promise.all(
      inherits.map(async (id) => {
        const f = await loadMassFormulary(id)
        if (f) formularies[id] = f
      }),
    )

    const lang = { primary: ctx.prefs.lang as Lang, secondary: 'la' as Lang }
    return buildOfMassFlow({ day, formularies, order, lang })
  },
}
