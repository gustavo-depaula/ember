import {
  addDays,
  assembleMass,
  type Celebration,
  type Doc,
  type Lang,
  type MassPlan,
  type MassRef,
  type OfDay,
  resolveOfDay,
} from '@ember/missal'
import { getCatalog } from '@/content/contentIndex'
import type { ContainerOption, Primitive } from '@/content/primitives'
import {
  corpusMissal,
  loadEucharisticPrayer,
  loadMassOrder,
  loadMissalCalendar,
  regionsForJurisdiction,
} from '@/lib/missal/loaders'
import { buildMass, buildProper, massLabel } from './missal/buildMass'
import type { LangPrefs } from './missal/render'
import type { ContentSource, SourceFetchContext } from './types'

const eucharisticPrayerIds = [
  'eucharistic-prayer.1',
  'eucharistic-prayer.2',
  'eucharistic-prayer.3',
  'eucharistic-prayer.4',
  'eucharistic-prayer.reconciliation-1',
  'eucharistic-prayer.reconciliation-2',
  'eucharistic-prayer.various-needs-1',
  'eucharistic-prayer.various-needs-2',
  'eucharistic-prayer.various-needs-3',
  'eucharistic-prayer.various-needs-4',
]

/**
 * A memorial on a privileged weekday is not celebrated, only commemorated:
 * the Mass is the weekday's, and the saint's collect may replace its own.
 */
async function commemoration(day: OfDay, saint: Celebration): Promise<MassPlan | undefined> {
  const weekday = day.temporal.masses[0]
  if (!weekday) return undefined
  const [plan, own] = await Promise.all([
    assembleMass(day, day.temporal, weekday, corpusMissal),
    assembleMass(day, saint, saint.masses[0], corpusMissal),
  ])
  const collect = own.parts.collect?.filter((o) => o.source === 'proper') ?? []
  if (collect.length === 0) return undefined
  return { ...plan, parts: { ...plan.parts, collect: [...collect, ...(plan.parts.collect ?? [])] } }
}

/**
 * The Masses the day offers, each built by `build` and all behind one selector:
 * `resolveOfDay` over the corpus calendar gives the celebrations, and each Mass
 * of each is assembled from the corpus.
 */
async function massesOfDay(
  ctx: SourceFetchContext,
  build: (plan: MassPlan, lang: LangPrefs) => Primitive[],
): Promise<Primitive[]> {
  const calendar = await loadMissalCalendar()
  if (!calendar) return []
  const primary = ctx.prefs.lang as Lang
  // Latin rides as the second language, as in the Extraordinary Form.
  const lang: LangPrefs = primary === 'la' ? { primary } : { primary, secondary: 'la' }
  const options = { regions: regionsForJurisdiction(ctx.prefs.jurisdiction) }
  const day = resolveOfDay(ctx.date, calendar, options)

  const masses: ContainerOption[] = []
  const add = (plan: MassPlan, celebration: Celebration, mass: MassRef, many: boolean) => {
    masses.push({
      // A day with several Masses (Christmas, Holy Thursday) tells them apart
      // by formulary; otherwise the celebration names the option.
      id: `${many && mass.key !== 'day' ? (mass.formulary ?? celebration.id) : celebration.id}#${mass.key}`,
      label: massLabel(plan, celebration, mass, many, lang),
      children: build(plan, lang),
    })
  }
  for (const celebration of day.celebrations) {
    if (celebration.commemoration) {
      const plan = await commemoration(day, celebration)
      if (plan) add({ ...plan, celebration }, celebration, plan.mass, false)
      continue
    }
    for (const mass of celebration.masses) {
      const plan = await assembleMass(day, celebration, mass, corpusMissal)
      add(plan, celebration, mass, celebration.masses.length > 1)
    }
  }
  if (day.anticipated) {
    // The vigil Mass of tomorrow's solemnity, said this evening.
    const tomorrow = resolveOfDay(addDays(ctx.date, 1), calendar, options)
    const celebration = tomorrow.celebrations[0]
    const plan = await assembleMass(tomorrow, celebration, day.anticipated, corpusMissal)
    add(plan, celebration, day.anticipated, true)
  }

  if (masses.length === 0) return []
  if (masses.length === 1) return masses[0].children
  return [
    {
      type: 'container',
      behavior: {
        kind: 'select',
        label: { primary: primary === 'pt-BR' || primary === 'la' ? 'Missa' : 'Mass' },
        // One key for both practices: the Mass chosen in one is the Mass the
        // other opens on.
        overrideKey: 'missal.mass',
        selectedId: masses[0].id,
        pickerStyle: 'cards',
        options: masses,
      },
    },
  ]
}

// The cached flow embeds corpus text whose blobs change with every corpus
// build; the catalog's `generated` stamp invalidates it.
const corpusVersion = (version: number) => `${version}:${getCatalog().generated}`

/**
 * producer/mass-of — the Ordinary Form Mass of the day as final primitives:
 * each of the day's Masses woven into the Order of Mass.
 */
export const missalMassSource: ContentSource<Primitive[]> = {
  id: 'producer/mass-of',
  get version() {
    return corpusVersion(12)
  },
  prefsDeps: ['lang', 'jurisdiction'],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const [order, prayers] = await Promise.all([
      loadMassOrder('order.ordinary'),
      Promise.all(eucharisticPrayerIds.map(loadEucharisticPrayer)),
    ])
    if (!order) return []
    const docs = { order, eucharisticPrayers: prayers.filter((p): p is Doc => p !== undefined) }
    return massesOfDay(ctx, (plan, lang) => buildMass(plan, docs, lang))
  },
}

/**
 * producer/mass-proper-of — the same Masses of the day, each as its proper
 * alone: the antiphons, the collect and the readings.
 */
export const missalProperSource: ContentSource<Primitive[]> = {
  id: 'producer/mass-proper-of',
  get version() {
    return corpusVersion(2)
  },
  prefsDeps: ['lang', 'jurisdiction'],
  dateScoped: true,
  fetch: (ctx: SourceFetchContext) => massesOfDay(ctx, buildProper),
}
