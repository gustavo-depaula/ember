import type { LiturgicalSeason } from '@ember/liturgical'

export type CollectionId = `collection/${string}`

export const dailyIds: CollectionId[] = ['collection/base']

export const formationIds: CollectionId[] = [
  'collection/mental-prayer',
  'collection/confession-and-conversion',
]

export const themeIds: CollectionId[] = [
  'collection/sacred-heart',
  'collection/divine-mercy',
  'collection/marian',
  'collection/eucharistic',
  'collection/way-of-the-cross',
  'collection/holy-spirit',
  'collection/for-the-dead',
  'collection/confession-and-conversion',
]

export const genreIds: CollectionId[] = [
  'collection/litanies',
  'collection/novenas',
  'collection/mental-prayer',
]

export const schoolIds: CollectionId[] = [
  'collection/alphonsus-liguori',
  'collection/montfort-spirituality',
  'collection/carmelite',
  'collection/spiritual-classics',
]

export const patrimonyIds: CollectionId[] = [
  'collection/devocionario-claretiano',
  'collection/anglican-patrimony',
]

export const liturgicalYearId: CollectionId = 'collection/liturgical-year'

export type SeasonKey =
  | 'advent'
  | 'christmas'
  | 'lent'
  | 'triduum'
  | 'easter'
  | 'pentecost'
  | 'ordinary'
  | 'christ-the-king'

export const seasonOrder: SeasonKey[] = [
  'advent',
  'christmas',
  'lent',
  'triduum',
  'easter',
  'pentecost',
  'ordinary',
  'christ-the-king',
]

export function activeSeasonKey(season: LiturgicalSeason, monthIndex: number): SeasonKey {
  if (season === 'advent') return 'advent'
  if (season === 'christmas' || season === 'epiphany') return 'christmas'
  if (season === 'lent' || season === 'septuagesima') return 'lent'
  if (season === 'easter') return 'easter'
  if (season === 'post-pentecost' && monthIndex === 4) return 'pentecost'
  return 'ordinary'
}
