import type { LocalizedText } from '@ember/liturgical'

/**
 * Display titles for the *named* temporal celebrations the display calendar
 * surfaces (the temporal solemnities + the few feasts of the Lord that aren't
 * sanctoral entries). Sanctoral celebrations carry their own title in the
 * calendar statics; the temporal cycle does not, so these are the single place
 * the display names of Christmas/Easter/Trinity/… live.
 *
 * Crucially this map is also the *notability filter*: a temporal day that
 * resolves to neither a ref in {@link solemnityTitles} nor a `specialDay` in
 * {@link specialDayTitles} is an ordinary Sunday or feria and is NOT shown on
 * the celebration card or month grid (the season header conveys it instead).
 *
 * Names mirror the curated bilingual strings the app shipped before the calendar
 * was unified onto `resolveOfDay`; the *dates* now come from the canonical MR
 * pipeline, only the display strings are kept here.
 */

/** Keyed by the `tempore.*` formulary ref `ofTemporeIds` emits. */
const solemnityTitles: Record<string, LocalizedText> = {
  'tempore.solemnity.most-holy-trinity': {
    la: 'Sanctissimae Trinitatis',
    'en-US': 'Most Holy Trinity',
    'pt-BR': 'Santíssima Trindade',
  },
  'tempore.solemnity.corpus-christi': {
    la: 'Sanctissimi Corporis et Sanguinis Christi',
    'en-US': 'Most Holy Body and Blood of Christ (Corpus Christi)',
    'pt-BR': 'Santíssimo Corpo e Sangue de Cristo (Corpus Christi)',
  },
  'tempore.solemnity.sacred-heart-of-jesus': {
    la: 'Sacratissimi Cordis Iesu',
    'en-US': 'Most Sacred Heart of Jesus',
    'pt-BR': 'Sagrado Coração de Jesus',
  },
  'tempore.solemnity.christ-the-king': {
    la: 'Domini Nostri Iesu Christi Universorum Regis',
    'en-US': 'Our Lord Jesus Christ, King of the Universe',
    'pt-BR': 'Nosso Senhor Jesus Cristo, Rei do Universo',
  },
  'tempore.christmas.holy-family': {
    la: 'Sanctae Familiae Iesu, Mariae et Ioseph',
    'en-US': 'Holy Family of Jesus, Mary, and Joseph',
    'pt-BR': 'Sagrada Família de Jesus, Maria e José',
  },
  // The Second Sunday of Easter — Divine Mercy is the only Easter Sunday besides
  // Easter itself that the display names (the rest are ordinary Sundays).
  'tempore.easter.week-2.sunday': {
    la: 'Dominica II Paschae seu de Divina Misericordia',
    'en-US': 'Divine Mercy Sunday / Second Sunday of Easter',
    'pt-BR': 'Domingo da Divina Misericórdia / 2º Domingo da Páscoa',
  },
}

/** Keyed by `getOfLiturgicalPosition().specialDay` for the date-anchored days. */
const specialDayTitles: Record<string, LocalizedText> = {
  christmas: {
    la: 'In Nativitate Domini',
    'en-US': 'Nativity of the Lord (Christmas)',
    'pt-BR': 'Natal do Senhor',
  },
  'mary-mother-of-god': {
    la: 'Sanctae Dei Genetricis Mariae',
    'en-US': 'Mary, the Holy Mother of God',
    'pt-BR': 'Santa Maria, Mãe de Deus',
  },
  epiphany: {
    la: 'In Epiphania Domini',
    'en-US': 'Epiphany of the Lord',
    'pt-BR': 'Epifania do Senhor',
  },
  'baptism-of-the-lord': {
    la: 'In Baptismate Domini',
    'en-US': 'Baptism of the Lord',
    'pt-BR': 'Batismo do Senhor',
  },
  'palm-sunday': {
    la: 'Dominica in Palmis de Passione Domini',
    'en-US': 'Palm Sunday of the Passion of the Lord',
    'pt-BR': 'Domingo de Ramos da Paixão do Senhor',
  },
  'holy-thursday': {
    la: 'Feria V in Cena Domini',
    'en-US': "Holy Thursday (Mass of the Lord's Supper)",
    'pt-BR': 'Quinta-feira Santa (Missa da Ceia do Senhor)',
  },
  'good-friday': {
    la: 'Feria VI in Passione Domini',
    'en-US': "Good Friday (Celebration of the Lord's Passion)",
    'pt-BR': 'Sexta-feira Santa (Celebração da Paixão do Senhor)',
  },
  'holy-saturday': {
    la: 'Sabbato Sancto',
    'en-US': 'Holy Saturday / Easter Vigil',
    'pt-BR': 'Sábado Santo / Vigília Pascal',
  },
  'easter-sunday': {
    la: 'Dominica Paschae in Resurrectione Domini',
    'en-US': 'Easter Sunday (Resurrection of the Lord)',
    'pt-BR': 'Domingo de Páscoa (Ressurreição do Senhor)',
  },
  ascension: {
    la: 'In Ascensione Domini',
    'en-US': 'Ascension of the Lord',
    'pt-BR': 'Ascensão do Senhor',
  },
  pentecost: {
    la: 'Dominica Pentecostes',
    'en-US': 'Pentecost Sunday',
    'pt-BR': 'Domingo de Pentecostes',
  },
}

/**
 * The display title for a temporal celebration, or `undefined` when the day is
 * an ordinary Sunday/feria that the display should not surface as a celebration.
 */
export function temporalDisplayTitle(
  ref: string,
  specialDay: string | undefined,
): LocalizedText | undefined {
  return solemnityTitles[ref] ?? (specialDay ? specialDayTitles[specialDay] : undefined)
}
