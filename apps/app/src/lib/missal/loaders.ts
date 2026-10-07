// Loaders for the Ordinary Form missal in the corpus. Every item is one
// multilingual blob whose catalog entry points straight at the data.

import {
  type Doc,
  type Formulary,
  type Lectionary,
  type MissalCalendar,
  type MissalSource,
  type Transfers,
  transfersFor,
} from '@ember/missal'
import { getEntry } from '@/content/contentIndex'
import { getJson } from '@/content/store'

async function loadById<T>(id: string): Promise<T | undefined> {
  const entry = getEntry(id)
  if (!entry) return undefined
  return getJson<T>(entry.hash)
}

export const loadMissalCalendar = (): Promise<MissalCalendar | undefined> =>
  loadById<MissalCalendar>('mass-calendar')

export const loadMassFormulary = (id: string): Promise<Formulary | undefined> =>
  loadById<Formulary>(`mass-formulary/${id}`)

export const loadMassLectionary = (id: string): Promise<Lectionary | undefined> =>
  loadById<Lectionary>(`mass-lectionary/${id}`)

export const loadMassOrder = (id: string): Promise<Doc | undefined> =>
  loadById<Doc>(`mass-order/${id}`)

export const loadEucharisticPrayer = (id: string): Promise<Doc | undefined> =>
  loadById<Doc>(`mass-eucharistic-prayer/${id}`)

export const corpusMissal: MissalSource = {
  formulary: loadMassFormulary,
  lectionary: loadMassLectionary,
  prefaces: async () => (await loadById<Record<string, Doc>>('mass-prefaces')) ?? {},
}

// The national calendar a jurisdiction follows: the reader's "calendar region"
// setting, which the fasting rules follow too. Without one, the General Roman
// Calendar.
const jurisdictionRegions: Record<string, string[]> = {
  BR: ['brazil'],
  US: ['united-states'],
}

export function regionsForJurisdiction(jurisdiction: string | undefined): string[] {
  return (jurisdiction && jurisdictionRegions[jurisdiction]) || []
}

// Where that calendar keeps Epiphany, the Ascension and Corpus Christi. Every
// surface that names a day or a season passes this on, so none of them places
// a day differently from the Mass.
export function transfersForJurisdiction(jurisdiction: string | undefined): Transfers {
  return transfersFor({ regions: regionsForJurisdiction(jurisdiction) })
}
