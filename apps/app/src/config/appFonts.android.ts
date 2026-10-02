// Android has every app font built in as a native font family
// (`plugins/androidFonts.js`), under the names `appFonts.ts` lists. Loading the
// files again at runtime would ship each of them twice, so nothing loads here.

/** The fonts `useFonts` loads at launch: none, on Android. */
export const appFonts: Record<string, number> = {}
