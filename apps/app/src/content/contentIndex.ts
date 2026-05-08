/**
 * In-memory catalog index for Hearth v2.
 *
 * `getAllEntries` and `getEntriesByKind` are called from React render paths;
 * results are cached and invalidated on `setCatalog` so we don't rebuild the
 * merged map for every read.
 */

import type {
  Catalog,
  CatalogEntry,
  CatalogItemKind,
  CollectionItemManifest,
} from './manifestTypes'

export const RESIDENT_KINDS = [
  'prayer',
  'practice',
  'chapter',
  'book',
  'collection',
] as const satisfies ReadonlyArray<CatalogItemKind>

// Items kept in the corpus for engine-feature documentation but never shown to
// end users. Filter at every read site that powers browse, search, or list UIs.
const HIDDEN_COLLECTION_IDS = new Set(['collection/examples'])
const exampleIdPattern = /^\d+-/

export function isHiddenCollection(id: string): boolean {
  return HIDDEN_COLLECTION_IDS.has(id)
}

export function isHiddenPractice(id: string): boolean {
  const bare = id.startsWith('practice/') ? id.slice('practice/'.length) : id
  return exampleIdPattern.test(bare)
}

let catalog: Catalog = { version: 2, generated: '', items: {} }
const manifestBodies = new Map<string, unknown>()

let mergedEntries: Map<string, CatalogEntry> | undefined
let entriesByKind: Map<CatalogItemKind, Array<[string, CatalogEntry]>> | undefined
let memberOfCache: Map<string, string[]> | undefined

function invalidateEntryCaches(): void {
  mergedEntries = undefined
  entriesByKind = undefined
  memberOfCache = undefined
}

// Bumped after the catalog or any manifest body changes. React components can
// subscribe via useSyncExternalStore + getCatalogVersion to re-render once
// deferred manifests (collections, books, chapters) finish warming.
let catalogVersion = 0
const versionListeners = new Set<() => void>()

export function getCatalogVersion(): number {
  return catalogVersion
}

export function subscribeCatalog(listener: () => void): () => void {
  versionListeners.add(listener)
  return () => {
    versionListeners.delete(listener)
  }
}

function bumpCatalogVersion(): void {
  catalogVersion++
  for (const fn of versionListeners) fn()
}

export function setCatalog(next: Catalog): void {
  catalog = next
  invalidateEntryCaches()
  bumpCatalogVersion()
}

export function getCatalog(): Catalog {
  return catalog
}

export function notifyManifestsWarmed(): void {
  bumpCatalogVersion()
}

export function rememberManifestBody(hash: string, body: unknown): void {
  manifestBodies.set(hash, body)
}

export function getRememberedManifest<T>(hash: string): T | undefined {
  return manifestBodies.get(hash) as T | undefined
}

/** Read a manifest body, fetching + remembering it on miss. */
export async function ensureManifestBody<T>(hash: string): Promise<T> {
  const cached = manifestBodies.get(hash) as T | undefined
  if (cached !== undefined) return cached
  const { getJson } = await import('./store')
  const fetched = await getJson<T>(hash)
  manifestBodies.set(hash, fetched)
  return fetched
}

export function resetContentIndex(): void {
  catalog = { version: 2, generated: '', items: {} }
  manifestBodies.clear()
  invalidateEntryCaches()
}

export function getEntry(id: string): CatalogEntry | undefined {
  return catalog.items[id]
}

export function hasEntry(id: string): boolean {
  return id in catalog.items
}

export function getAllEntries(): Map<string, CatalogEntry> {
  if (mergedEntries) return mergedEntries
  const out = new Map<string, CatalogEntry>()
  for (const [id, entry] of Object.entries(catalog.items)) out.set(id, entry)
  mergedEntries = out
  return out
}

export function getEntriesByKind(kind: CatalogItemKind): Array<[string, CatalogEntry]> {
  if (!entriesByKind) {
    const map = new Map<CatalogItemKind, Array<[string, CatalogEntry]>>()
    for (const [id, entry] of getAllEntries()) {
      const list = map.get(entry.kind)
      if (list) list.push([id, entry])
      else map.set(entry.kind, [[id, entry]])
    }
    entriesByKind = map
  }
  return entriesByKind.get(kind) ?? []
}

export function getCollections(): CatalogEntry[] {
  return getEntriesByKind('collection').map(([, e]) => e)
}

/**
 * Coerce a possibly-bare id into its canonical `kind/id` form. When `hintKind`
 * is provided it acts as a hard filter — the caller wants only that kind, so
 * we don't fall through to other kinds and silently return e.g. a prayer when
 * the caller asked for a practice.
 */
export function canonicalize(id: string, hintKind?: CatalogItemKind): string | undefined {
  if (hintKind) {
    if (id.startsWith(`${hintKind}/`) && hasEntry(id)) return id
    const candidate = `${hintKind}/${id.replace(/^[^/]+\//, '')}`
    if (hasEntry(candidate)) return candidate
    return undefined
  }
  if (hasEntry(id)) return id
  for (const kind of RESIDENT_KINDS) {
    const candidate = `${kind}/${id}`
    if (hasEntry(candidate)) return candidate
  }
  return undefined
}

function localizedMatches(text: unknown, q: string): boolean {
  if (!text || typeof text !== 'object') return false
  return Object.values(text as Record<string, unknown>).some(
    (v) => typeof v === 'string' && v.toLowerCase().includes(q),
  )
}

export function search(query: string, kindFilter?: CatalogItemKind): CatalogEntry[] {
  const q = query.toLowerCase()
  const results: CatalogEntry[] = []
  for (const [, entry] of getAllEntries()) {
    if (kindFilter && entry.kind !== kindFilter) continue
    if (
      localizedMatches(entry.name, q) ||
      localizedMatches(entry.title, q) ||
      localizedMatches(entry.description, q) ||
      entry.tags?.some((t) => t.toLowerCase().includes(q))
    ) {
      results.push(entry)
    }
  }
  return results
}

export function getCollectionItems(collectionId: string): { ref: string; entry?: CatalogEntry }[] {
  const collEntry = getEntry(collectionId)
  if (!collEntry) return []
  const body = getRememberedManifest<CollectionItemManifest>(collEntry.hash)
  if (!body) return []
  return body.items.map((it) => ({ ref: it.ref, entry: getEntry(it.ref) }))
}

export function invalidateMemberOfIndex(): void {
  memberOfCache = undefined
}

export function getCollectionsForItem(itemId: string): string[] {
  if (!memberOfCache) {
    const out = new Map<string, string[]>()
    for (const [collectionId, entry] of getEntriesByKind('collection')) {
      const body = getRememberedManifest<CollectionItemManifest>(entry.hash)
      if (!body) continue
      for (const item of body.items ?? []) {
        const list = out.get(item.ref)
        if (list) list.push(collectionId)
        else out.set(item.ref, [collectionId])
      }
    }
    memberOfCache = out
  }
  return memberOfCache.get(itemId) ?? []
}
