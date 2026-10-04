/**
 * The shelves of the collections screen, top to bottom, and what stands on
 * each, left to right. Like `artMap`, this is keyed by collection id: a
 * collection not named here falls to the last, unlabelled-by-theme shelf, in
 * alphabetical order, until it is given a place.
 */
export const collectionShelves: { key: string; ids: string[] }[] = [
  {
    key: 'devotions',
    ids: [
      'collection/marian',
      'collection/sacred-heart',
      'collection/eucharistic',
      'collection/divine-mercy',
      'collection/holy-spirit',
      'collection/way-of-the-cross',
      'collection/for-the-dead',
      'collection/confession-and-conversion',
    ],
  },
  {
    key: 'prayerBooks',
    ids: [
      'collection/base',
      'collection/novenario',
      'collection/novenas',
      'collection/litanies',
      'collection/hymnal',
      'collection/little-offices',
      'collection/liturgical-year',
      'collection/mental-prayer',
      'collection/opus-dei',
      'collection/opus-dei-prayerbook',
      'collection/anglican-patrimony',
    ],
  },
  {
    key: 'week',
    ids: [
      'collection/dies-sunday',
      'collection/dies-monday',
      'collection/dies-tuesday',
      'collection/dies-wednesday',
      'collection/dies-thursday',
      'collection/dies-friday',
      'collection/dies-saturday',
    ],
  },
  {
    key: 'schools',
    ids: [
      'collection/spiritual-classics',
      'collection/thomas-aquinas',
      'collection/carmelite',
      'collection/alphonsus-liguori',
      'collection/montfort-spirituality',
      'collection/josemaria-escriva',
    ],
  },
  {
    key: 'fathers',
    ids: [
      'collection/church-fathers',
      'collection/tertullian',
      'collection/origen',
      'collection/cyprian-of-carthage',
      'collection/athanasius',
      'collection/gregory-of-nyssa',
      'collection/ambrose-of-milan',
      'collection/john-chrysostom',
      'collection/jerome',
      'collection/augustine-of-hippo',
      'collection/gregory-the-great',
    ],
  },
  {
    key: 'reference',
    ids: ['collection/papal-magisterium', 'collection/catholic-encyclopedia'],
  },
]

export const unshelvedKey = 'other'
