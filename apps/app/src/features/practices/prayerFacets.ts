export type PrayerFacet = { key: string; tags: string[] }

// The two questions a prayer book's index answers: what kind of prayer, and
// to whom. Each option gathers the tags the corpus uses for it.
export const prayerForms: PrayerFacet[] = [
  { key: 'novena', tags: ['novena'] },
  { key: 'office', tags: ['office', 'breviary', 'liturgy-of-the-hours'] },
  { key: 'litany', tags: ['litany'] },
  { key: 'hymn', tags: ['hymn', 'canticle', 'antiphon'] },
  { key: 'rosary', tags: ['rosary', 'chaplet'] },
]

export const prayerDevotions: PrayerFacet[] = [
  { key: 'marian', tags: ['marian'] },
  { key: 'eucharistic', tags: ['eucharistic', 'communion', 'adoration', 'corpus-christi'] },
  { key: 'sacredHeart', tags: ['sacred-heart'] },
  { key: 'holySpirit', tags: ['holy-spirit', 'pentecost'] },
  { key: 'passion', tags: ['passion'] },
  { key: 'dead', tags: ['purgatory', 'dead'] },
  { key: 'saints', tags: ['saints'] },
]
