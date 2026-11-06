// Android has the app's fonts built in as native font families
// (`plugins/androidFonts.js`), under the names `appFonts.ts` lists. Loading the
// files again at runtime would ship each of them twice, so those load nowhere.
//
// Ezra SIL is the exception: Hebrew is only ever set upright and regular, the
// one style a runtime-loaded font is known under, so it needs no native family
// and comes with an update rather than a new build.

/** The fonts `useFonts` loads at launch on Android. */
export const appFonts: Record<string, number> = {
  EzraSIL: require('../../assets/fonts/EzraSIL.ttf'),
}
