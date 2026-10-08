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

/**
 * Who signs the app: the Apple Team ID, and the SHA-256 fingerprints of the
 * Android signing certificates (comma-separated; Play's app-signing key, and
 * the upload key for builds installed outside Play). With them the site
 * publishes the files that let a prayer's link open in the app; unset, the
 * links open the website on every device.
 */
export const appleTeamId = process.env.EMBER_APPLE_TEAM_ID || undefined
export const androidCertSha256 = (process.env.EMBER_ANDROID_CERT_SHA256 ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
