/**
 * Whether pages carry the Ordinary Form Mass texts (propers, readings, the
 * Order of Mass) from the corpus. Off by default: the vernacular missal and
 * lectionary translations are their publishers' copyright (see
 * docs/content/content-sources.md), and a public page redistributes them more
 * plainly than the app does. With it off, the Mass of the day still gives the
 * celebration and the readings' citations, linked into the Douay-Rheims.
 */
export const ofTexts = process.env.EMBER_SITE_OF_TEXTS === '1'
