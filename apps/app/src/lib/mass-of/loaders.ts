/**
 * Loaders for the new OF Mass corpus (`@ember/missal-schema` shape). Each item
 * is a single multilingual blob whose catalog entry points straight at the
 * data, so a load is one `getJson` — no shape/per-language recombination.
 */

import type { CycleKey, MassFormulary, OfCalendarStatics, OrderOfMass } from '@ember/missal-schema'
import { getEntry } from '@/content/contentIndex'
import { getJson } from '@/content/store'

/** Sanctoral scope from the content language ('en' and 'en-US' both → US). */
export function scopeForContentLang(lang: string): string {
  if (lang === 'pt-BR') return 'brazil'
  if (lang === 'en' || lang === 'en-US') return 'united-states'
  return 'universal'
}

/** The cycle key a formulary carries for the day's Sunday/weekday cycles. */
export function cycleKeyFor(
  f: MassFormulary,
  sunday: 'A' | 'B' | 'C',
  weekday: 'I' | 'II',
): CycleKey | undefined {
  const r = f.readings
  if (!r) return undefined
  if (f.cycleScheme === 'sunday' && r[sunday]) return sunday
  if (f.cycleScheme === 'weekday' && r[weekday]) return weekday
  if (r.default) return 'default'
  return Object.keys(r)[0] as CycleKey | undefined
}

async function loadById<T>(id: string): Promise<T | undefined> {
  const entry = getEntry(id)
  if (!entry) return undefined
  return getJson<T>(entry.hash)
}

export async function loadOfCalendar(): Promise<OfCalendarStatics | undefined> {
  const [temporal, sanctoral] = await Promise.all([
    loadById<OfCalendarStatics['temporal']>('of-calendar/temporal'),
    loadById<OfCalendarStatics['sanctoral']>('of-calendar/sanctoral'),
  ])
  if (!temporal || !sanctoral) return undefined
  return { temporal, sanctoral }
}

export const loadOrderOfMass = (): Promise<OrderOfMass | undefined> =>
  loadById<OrderOfMass>('order-of-mass')

export const loadMassFormulary = (ref: string): Promise<MassFormulary | undefined> =>
  loadById<MassFormulary>(`mass-formulary/${ref}`)
