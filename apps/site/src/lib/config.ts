/**
 * Whether pages carry the Ordinary Form Mass texts (propers, readings, the
 * Order of Mass) from the corpus. `EMBER_SITE_OF_TEXTS=0` builds without them:
 * the Mass of the day then gives the celebration and the readings' citations,
 * linked into the Douay-Rheims.
 */
export const ofTexts = process.env.EMBER_SITE_OF_TEXTS !== '0'

/**
 * The app's numeric App Store id. With it, iPhone Safari shows its own
 * "open in the App Store" bar on every page. Unset until the app is listed.
 */
export const appStoreId = process.env.EMBER_APP_STORE_ID || undefined
