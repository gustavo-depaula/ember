import type { Localized } from '@ember/missal-schema'

/**
 * Fixed assembly responses of the Order of Mass — universal liturgical
 * constants the prayer says back. Sourced verbatim from the Missale Romanum
 * ordinary in all seven languages, so they pair correctly whatever the user's
 * primary/secondary languages are. The per-reading propers carry the priest's
 * line (`conclusion`); the people's reply is the same every day, so it lives
 * here rather than being duplicated across 950 formularies.
 */

/** People's "Amen" after every oration (Collect, Offerings, Postcommunion…). */
export const amen: Localized = {
  'pt-BR': 'Amém.',
  la: 'Amen.',
  'en-US': 'Amen.',
  es: 'Amén.',
  it: 'Amen.',
  fr: 'Amen.',
  de: 'Amen.',
}

/** People's reply to "The Word of the Lord" (first/second reading). */
export const deoGratias: Localized = {
  'pt-BR': 'Graças a Deus.',
  la: 'Deo grátias.',
  'en-US': 'Thanks be to God.',
  es: 'Te alabamos, Señor.',
  it: 'Rendiamo grazie a Dio.',
  fr: 'Nous rendons grâce à Dieu.',
  de: 'Dank sei Gott.',
}

/** People's reply to the Gospel announcement, before the text is read. */
export const gloryToYou: Localized = {
  'pt-BR': 'Glória a vós, Senhor.',
  la: 'Glória tibi, Dómine.',
  'en-US': 'Glory to you, O Lord.',
  es: 'Gloria a ti, Señor.',
  it: 'Gloria a te, o Signore.',
  fr: 'Gloire à toi, Seigneur !',
  de: 'Ehre sei dir, o Herr.',
}

/** People's reply to "The Gospel of the Lord", after the text is read. Only
 * pt-BR repeats the announcement's reply here; the other Missals have a
 * distinct one (Laus tibi, Christe). */
export const praiseToYou: Localized = {
  'pt-BR': 'Glória a vós, Senhor.',
  la: 'Laus tibi, Christe.',
  'en-US': 'Praise to you, Lord Jesus Christ.',
  es: 'Gloria a ti, Señor Jesús.',
  it: 'Lode a te, o Cristo.',
  fr: 'Louange à toi, Seigneur Jésus !',
  de: 'Lob sei dir, Christus.',
}
