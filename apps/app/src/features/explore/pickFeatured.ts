import type { LiturgicalSeason } from '@ember/liturgical'

import { getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { pickSpotlight } from '@/features/collections/seasonalSpotlight'

export type Featured = {
  /** The season's hero collection (`collection/…`) for the "For this Season" block. */
  seasonCollectionId: string
  seasonTaglineKey: string
  /** Curated collection rows, rendered as cover-card carousels. */
  devotionRow: string[]
  traditionRow: string[]
}

// The same curated rows feed both /explore and /practices — single source of
// truth keeps the editorial heart of the app consistent. Ids are filtered
// against the live catalog at render, so a missing collection simply drops out.
export const devotionRow = [
  'collection/sacred-heart',
  'collection/divine-mercy',
  'collection/marian',
  'collection/eucharistic',
  'collection/holy-spirit',
  'collection/way-of-the-cross',
  'collection/for-the-dead',
]

export const traditionRow = [
  'collection/carmelite',
  'collection/alphonsus-liguori',
  'collection/montfort-spirituality',
  'collection/spiritual-classics',
  'collection/mental-prayer',
  'collection/novenas',
  'collection/litanies',
]

/** Resolve a list of collection ids against the live catalog, dropping any that
 *  aren't present yet (or aren't collections). Pure — depends only on the catalog. */
export function collectionRow(ids: string[]): [string, CatalogEntry][] {
  return ids
    .map((id) => [id, getEntry(id)] as const)
    .filter((pair): pair is [string, CatalogEntry] => !!pair[1] && pair[1].kind === 'collection')
}

// The traditional weekly devotional cycle (dies domini) — one curated
// collection per weekday, each with its own short prayer guide + go-deeper.
export type WeekdayDevotion = { collectionId: string; themeKey: string }

const weekdayDevotions: Record<number, WeekdayDevotion> = {
  0: { collectionId: 'collection/dies-sunday', themeKey: 'sun' },
  1: { collectionId: 'collection/dies-monday', themeKey: 'mon' },
  2: { collectionId: 'collection/dies-tuesday', themeKey: 'tue' },
  3: { collectionId: 'collection/dies-wednesday', themeKey: 'wed' },
  4: { collectionId: 'collection/dies-thursday', themeKey: 'thu' },
  5: { collectionId: 'collection/dies-friday', themeKey: 'fri' },
  6: { collectionId: 'collection/dies-saturday', themeKey: 'sat' },
}

/** The day's traditional devotion. Defined for every day of the week. */
export function weekdayDevotion(date: Date): WeekdayDevotion {
  return weekdayDevotions[date.getDay()]
}

/** The editorial picks for the day — seasonal hero + the curated collection rows. */
export function pickFeatured(season: LiturgicalSeason, date: Date): Featured {
  const spotlight = pickSpotlight(season, date)
  return {
    seasonCollectionId: spotlight.collectionId,
    seasonTaglineKey: spotlight.taglineKey,
    devotionRow,
    traditionRow,
  }
}
