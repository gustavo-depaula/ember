/**
 * Back-compat re-exports for callers that still import from `@/content/registry`.
 *
 * The actual implementation lives in `./resolver.ts`. New code should import
 * from there directly.
 *
 * Note: `loadFlow`, `loadPerDayFlow`, `loadPracticeData`, `loadPracticeTracks`,
 * and `loadChapterContent` became async in v2 (they fetch blobs on demand).
 * Callers that previously treated them as synchronous must await.
 */

export type {
  AlternativeGroup,
  BookEntry,
  PrayerAsset,
  TocNode,
} from './resolver'
export {
  clearSources,
  findGroupMemberInSet,
  getAllBookEntries,
  getAllChapterManifestsForLibrary,
  getAllManifests,
  getAlternativeGroup,
  getBookDirUri,
  getBookEntry,
  getChapterManifest,
  getInstalledLibraryIds,
  getLibraryIdForPractice,
  getManifest,
  getManifestCategories,
  getManifestIconKey,
  getPracticeIdsForLibrary,
  getProseText,
  loadBookChapterText,
  loadCatalogFromHearth,
  loadChapterContent,
  loadFlow,
  loadMassProper,
  loadPerDayFlow,
  loadPracticeData,
  loadPracticeTracks,
  parseQualifiedId,
  prefetchChapterProse,
  qualifyId,
  readLibraryAsset,
  rememberProse,
  resolveCanticle,
  resolvePrayer,
  search,
  searchManifests,
  warmCriticalManifests,
  warmDeferredManifests,
  warmResidentManifests,
} from './resolver'

export function registerSource(_source: unknown): void {
  // v2 has no per-library sources; legacy callsites are now no-ops.
}

export function unregisterSource(_libraryId: string): void {}
