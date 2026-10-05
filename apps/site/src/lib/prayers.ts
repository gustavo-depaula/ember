import type { CycleData } from '@ember/content-engine'
import { getCollectionsForItem, getEntriesByKind, getEntry, isMetaId } from '@/content/contentIndex'
import type { CatalogEntry, PracticeManifest } from '@/content/manifestTypes'
import type { Primitive } from '@/content/primitives'
import {
  getAlternativeGroup,
  getManifest,
  isAlternateForm,
  loadPracticeData,
} from '@/content/resolver'
import { artFor } from '@/features/explore/artMap'
import { localizeContent } from '@/lib/i18n'
import { bootCorpus } from './corpus'
import { type Locale, withLocale } from './locale'
import { renderPractice } from './practice'
import { today } from './today'

/** A novena has a page per day; a hundred-day course does not. */
const maxDayPages = 12

export type PrayerListing = {
  id: string
  manifest: PracticeManifest
  entry: CatalogEntry
  /** Days with a page of their own, for a novena or triduum. */
  dayCount: number
}

/** Every practice with a page: the catalog's practices, engine examples aside. */
export async function listPrayers(): Promise<PrayerListing[]> {
  await bootCorpus()
  const out: PrayerListing[] = []
  for (const [id, entry] of getEntriesByKind('practice')) {
    if (isMetaId(id)) continue
    const manifest = getManifest(id)
    if (!manifest) continue
    const total = manifest.program?.totalDays ?? 0
    out.push({
      id,
      manifest,
      entry,
      dayCount: total > 1 && total <= maxDayPages ? total : 0,
    })
  }
  return out
}

export type DayEntry = { title: string; excerpt?: string }

function text(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') return localizeContent(value as Record<string, string>)
  return ''
}

function dayEntries(cycleData: Record<string, CycleData> | undefined): DayEntry[] {
  const data = cycleData && Object.values(cycleData).find((d) => d.indexBy === 'program-day')
  const entries = data && (Object.values(data.entries)[0] as Record<string, unknown>[] | undefined)
  return (entries ?? []).map((entry) => ({
    title: text(entry.dayTitle ?? entry.monthTitle ?? entry.title ?? entry.mysteryLabel),
    excerpt: text(entry.meditation ?? entry.intention) || undefined,
  }))
}

export type PrayerPage = {
  id: string
  name: string
  subtitle?: string
  description?: string
  history?: string
  howToPray?: string
  source?: string
  minutes?: number
  art?: string
  primitives: Primitive[]
  hasLatin: boolean
  forms: { id: string; label: string; description: string; current: boolean }[]
  formLabel?: string
  days: DayEntry[]
  dayCount: number
  collections: { id: string; name: string }[]
  isAlternate: boolean
}

export async function loadPrayerPage(
  id: string,
  locale: Locale,
  programDay?: number,
): Promise<PrayerPage | undefined> {
  await bootCorpus()
  const rendered = await renderPractice(id, locale, {
    date: today,
    programDay,
    parallelLatin: true,
  })
  if (!rendered) return undefined
  return withLocale(locale, async () => {
    const manifest = getManifest(id) as PracticeManifest
    const group = getAlternativeGroup(id)
    const total = manifest.program?.totalDays ?? 0
    const days = total > 1 && total <= maxDayPages ? dayEntries(await loadPracticeData(id)) : []
    const opt = (value: Record<string, string | undefined> | undefined) =>
      value ? localizeContent(value) || undefined : undefined
    return {
      id,
      name: localizeContent(manifest.name),
      subtitle: opt(manifest.subtitle),
      description: opt(manifest.description),
      history: opt(manifest.history),
      howToPray: opt(manifest.howToPray),
      source: opt(manifest.source),
      minutes: manifest.estimatedMinutes,
      art: artFor(id)?.uri,
      primitives: rendered.primitives,
      hasLatin: JSON.stringify(rendered.primitives).includes('"secondary":"'),
      forms: (group?.members ?? []).map((m) => ({
        id: m.manifest.id,
        label: m.label,
        description: m.description,
        current: m.manifest.id === manifest.id,
      })),
      formLabel:
        group && manifest.alternativeTo ? localizeContent(manifest.alternativeTo.label) : undefined,
      days,
      dayCount: total > 1 && total <= maxDayPages ? total : 0,
      collections: getCollectionsForItem(manifest.id).flatMap((collectionId) => {
        const entry = getEntry(collectionId)
        return entry?.name ? [{ id: collectionId, name: localizeContent(entry.name) }] : []
      }),
      isAlternate: isAlternateForm(manifest),
    }
  })
}
