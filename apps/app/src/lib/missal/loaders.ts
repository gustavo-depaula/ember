// Loaders for the Ordinary Form missal in the corpus. Every item is one
// multilingual blob whose catalog entry points straight at the data.

import type { Doc, Formulary, Lectionary, MissalCalendar, MissalSource } from '@ember/missal'
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

// The calendar a content language follows. The national calendars upstream
// carries are keyed by region; until there is a setting for it, the language
// stands in for where the user is.
export function regionsForContentLang(lang: string): string[] {
  if (lang === 'pt-BR') return ['brazil']
  if (lang === 'en' || lang === 'en-US') return ['united-states']
  return []
}
