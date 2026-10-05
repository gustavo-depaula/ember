import {
  loadCatalogFromHearth,
  warmCriticalManifests,
  warmDeferredManifests,
} from '@/content/resolver'

let booted: Promise<void> | undefined

/** Load the catalog and warm the manifests the app warms at boot. Idempotent. */
export function bootCorpus(): Promise<void> {
  booted ??= (async () => {
    await loadCatalogFromHearth()
    await warmCriticalManifests()
    await warmDeferredManifests()
  })()
  return booted
}
