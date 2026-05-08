import { useSyncExternalStore } from 'react'

import { getCatalogVersion, subscribeCatalog } from './contentIndex'

/**
 * Bumps whenever the catalog or a manifest body changes — e.g. after the
 * deferred warm completes. Components that read derived data from
 * contentIndex (like `getCollectionsForItem`) should depend on this so they
 * re-render once the data they need has arrived.
 */
export function useCatalogVersion(): number {
  return useSyncExternalStore(subscribeCatalog, getCatalogVersion, getCatalogVersion)
}
