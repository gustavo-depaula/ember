/**
 * In-memory catalog index for Hearth v2.
 *
 * Built at boot from `catalog.json` (cached in the SQLite `cache` table by
 * fetchHearth) plus any statically-registered items (the embedded starter pack).
 * Provides O(1) lookups by stable id (e.g. `prayer/our-father`) plus convenience
 * iteration by kind.
 *
 * In addition to the catalog itself, manifests for "always-resident" items
 * (prayers, practice manifests, chapter manifests, book manifests, collections)
 * may be eagerly fetched and stashed here so synchronous resolvers (used inside
 * the engine's Proxies) can return without an async fetch.
 */

import type {
  Catalog,
  CatalogEntry,
  CatalogItemKind,
  CollectionItemManifest,
} from './manifestTypes'

let catalog: Catalog = { version: 2, generated: '', items: {} }

/** Static items registered (e.g. starter pack). Take priority over the loaded catalog. */
const staticOverrides = new Map<string, CatalogEntry>()

/** Eagerly-loaded manifest bodies, keyed by manifest blob hash. */
const manifestBodies = new Map<string, unknown>()

// --- Catalog management ---

export function setCatalog(next: Catalog): void {
  catalog = next
}

export function getCatalog(): Catalog {
  return catalog
}

export function registerStaticEntry(id: string, entry: CatalogEntry, manifestBody?: unknown): void {
  staticOverrides.set(id, entry)
  if (manifestBody !== undefined) manifestBodies.set(entry.hash, manifestBody)
}

export function rememberManifestBody(hash: string, body: unknown): void {
  manifestBodies.set(hash, body)
}

export function getRememberedManifest<T>(hash: string): T | undefined {
  return manifestBodies.get(hash) as T | undefined
}

// --- Lookups ---

export function getEntry(id: string): CatalogEntry | undefined {
  return staticOverrides.get(id) ?? catalog.items[id]
}

export function hasEntry(id: string): boolean {
  return staticOverrides.has(id) || id in catalog.items
}

export function getAllEntries(): Map<string, CatalogEntry> {
  const out = new Map<string, CatalogEntry>()
  for (const [id, entry] of Object.entries(catalog.items)) out.set(id, entry)
  for (const [id, entry] of staticOverrides) out.set(id, entry)
  return out
}

export function getEntriesByKind(kind: CatalogItemKind): Array<[string, CatalogEntry]> {
  const out: Array<[string, CatalogEntry]> = []
  for (const [id, entry] of getAllEntries()) {
    if (entry.kind === kind) out.push([id, entry])
  }
  return out
}

export function getCollections(): CatalogEntry[] {
  return getEntriesByKind('collection').map(([_, e]) => e)
}

// --- Local id helpers (for back-compat with the registry's qualifyId pattern) ---

/**
 * Coerce an id into its canonical `kind/id` form when possible.
 *
 * Accepts:
 *   - `prayer/our-father` → `prayer/our-father` (already canonical)
 *   - `our-father` → `prayer/our-father` (if a prayer/our-father exists in the catalog)
 *   - any other string is returned unchanged
 */
export function canonicalize(id: string, hintKind?: CatalogItemKind): string | undefined {
  if (hasEntry(id)) return id
  if (hintKind) {
    const candidate = `${hintKind}/${id}`
    if (hasEntry(candidate)) return candidate
  }
  // Try common kinds in priority order
  for (const kind of ['prayer', 'practice', 'chapter', 'book', 'collection'] as const) {
    const candidate = `${kind}/${id}`
    if (hasEntry(candidate)) return candidate
  }
  return undefined
}

// --- Search (text + tags) ---

export function search(query: string, kindFilter?: CatalogItemKind): CatalogEntry[] {
  const q = query.toLowerCase()
  const results: CatalogEntry[] = []
  for (const [, entry] of getAllEntries()) {
    if (kindFilter && entry.kind !== kindFilter) continue
    let hit = false
    const localized = (lt: typeof entry.name) =>
      lt
        ? Object.values(lt).some((v) => typeof v === 'string' && v.toLowerCase().includes(q))
        : false
    if (localized(entry.name) || localized(entry.title) || localized(entry.description)) hit = true
    if (entry.tags?.some((t) => t.toLowerCase().includes(q))) hit = true
    if (hit) results.push(entry)
  }
  return results
}

// --- Iteration helpers for collection screens ---

export function getCollectionItems(collectionId: string): { ref: string; entry?: CatalogEntry }[] {
  const collEntry = getEntry(collectionId)
  if (!collEntry) return []
  const body = getRememberedManifest<CollectionItemManifest>(collEntry.hash)
  if (!body) return []
  return body.items.map((it) => ({ ref: it.ref, entry: getEntry(it.ref) }))
}
