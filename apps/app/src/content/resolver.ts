/**
 * Hearth v2 content resolver — replacement for `registry.ts`.
 *
 * Public API mirrors the registry where possible to keep callsite churn down,
 * but flow / chapter content / mass propers are now async (they fetch on demand
 * and the engine's TanStack Query layer handles loading states).
 *
 * Boot warms a small set of "always-resident" manifests (every prayer item,
 * every practice item-manifest, every chapter item-manifest, every book
 * item-manifest, every collection) so synchronous resolvers (used by
 * `engineContext` Proxies) can return without an async fetch. The catalog
 * itself fits in ~500KB — first-launch cost on a slow connection is acceptable
 * because the embedded starter pack is functional offline.
 */

import { fetchHearth } from '@/lib/hearth'
import { localizeContent } from '@/lib/i18n'
import {
  canonicalize,
  getCatalog,
  getEntriesByKind,
  getEntry,
  getRememberedManifest,
  search as indexSearch,
  rememberManifestBody,
  setCatalog,
} from './contentIndex'
import type { ChapterManifest, PracticeManifest } from './manifest-types'
import type {
  BookItemManifest,
  Catalog,
  CatalogItemKind,
  ChapterItemManifest,
  LangSplitItemManifest,
  PracticeItemManifest,
  PrayerItemManifest,
} from './manifestTypes'
import { getJson } from './store'
import type {
  CycleData,
  FlowDefinition,
  FlowSection,
  LectioTrackDef,
  LocalizedContent,
} from './types'

// --- Types ---

export type PrayerAsset = {
  title: import('./types').LocalizedText
  body: FlowSection[]
  subtitle?: import('./types').LocalizedText
  source?: import('./types').LocalizedText
}

export type BookEntry = {
  id: string
  name: import('./types').LocalizedText
  author?: import('./types').LocalizedText
  description?: import('./types').LocalizedText
  composed?: number | string
  languages: string[]
  image?: string
  toc?: TocNode[]
}

export type TocNode = {
  id: string
  title: import('./types').LocalizedText
  children?: TocNode[]
}

// --- Qualified ID helpers (back-compat) ---

/**
 * In v1 this combined a libraryId + practiceId into a `lib:practice` key.
 * In v2 ids are already qualified by kind (e.g. `practice/rosary`) so the
 * libraryId argument is ignored. Kept for callsite back-compat.
 */
export function qualifyId(_libraryId: string, id: string): string {
  if (id.includes('/')) return id
  return `practice/${id}`
}

export function parseQualifiedId(id: string): { libraryId: string; practiceId: string } {
  // In v2 there is no library; expose the kind as the libraryId for consumers
  // that only use it as a stable bucket-key (e.g. analytics).
  if (id.includes('/')) {
    const idx = id.indexOf('/')
    return { libraryId: id.slice(0, idx), practiceId: id.slice(idx + 1) }
  }
  return { libraryId: '', practiceId: id }
}

// --- Catalog management ---

export async function loadCatalogFromHearth(): Promise<Catalog> {
  const catalog = await fetchHearth<Catalog>('catalog.json', { networkFirst: true })
  setCatalog(catalog)
  return catalog
}

// --- Boot warming: always-resident manifests ---

const PRACTICE_FRAGMENTS_CACHE = new Map<string, FlowDefinition>()

/**
 * Fetch all "always-resident" item manifests so synchronous resolvers work.
 * Each manifest blob is small (<2KB typical), and once cached in `cache` table
 * + the on-disk blob store, subsequent boots are reads only.
 */
export async function warmResidentManifests(opts?: {
  onProgress?: (done: number, total: number) => void
}): Promise<void> {
  const tasks: Array<{ id: string; hash: string }> = []
  for (const kind of ['prayer', 'practice', 'chapter', 'book', 'collection'] as const) {
    for (const [id, entry] of getEntriesByKind(kind)) {
      if (getRememberedManifest(entry.hash) === undefined) {
        tasks.push({ id, hash: entry.hash })
      }
    }
  }
  let done = 0
  const concurrency = 16
  let cursor = 0
  async function worker() {
    while (cursor < tasks.length) {
      const i = cursor++
      try {
        const body = await getJson<unknown>(tasks[i].hash)
        rememberManifestBody(tasks[i].hash, body)
      } catch (err) {
        console.warn(`[resolver] warm ${tasks[i].id}:`, err)
      }
      done++
      opts?.onProgress?.(done, tasks.length)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker))
}

// --- Sync lookups (manifests + prayers + book metadata) ---

function residentFor<T>(id: string): T | undefined {
  const entry = getEntry(id)
  if (!entry) return undefined
  return getRememberedManifest<T>(entry.hash)
}

/** Convert a v2 PracticeItemManifest into the v1 PracticeManifest shape that callers expect. */
function asPracticeManifest(item: PracticeItemManifest): PracticeManifest {
  // Path-based fields (`flow`, `data`, `tracks`) are no longer used at runtime;
  // we keep them in the type for compatibility but stub them.
  return {
    id: item.id,
    name: item.name,
    categories: item.categories ?? [],
    estimatedMinutes: item.estimatedMinutes ?? 0,
    icon: item.icon,
    image: item.image,
    thumbnail: item.thumbnail,
    description: item.description ?? ({} as never),
    history: item.history ?? ({} as never),
    howToPray: item.howToPray ?? ({} as never),
    flowMode: item.flowMode ?? 'scroll',
    completion: item.completion ?? 'flow-end',
    program: item.program as never,
    theme: item.theme,
    flow: '',
    alternativeTo: item.alternativeTo,
    pack: item.pack,
    tags: item.tags ?? [],
    defaults: item.defaults as never,
  }
}

function asChapterManifest(item: ChapterItemManifest): ChapterManifest {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    image: item.image,
    estimatedMinutes: item.estimatedMinutes,
    tags: item.tags,
  }
}

function asBookEntry(item: BookItemManifest): BookEntry {
  return {
    id: item.id,
    name: item.name,
    author: item.author,
    description: item.description,
    composed: item.composed,
    languages: item.languages ?? [],
    image: item.image,
    toc: item.toc as TocNode[] | undefined,
  }
}

export function getManifest(id: string): PracticeManifest | undefined {
  const canonical = canonicalize(id, 'practice') ?? id
  const item = residentFor<PracticeItemManifest>(canonical)
  if (!item) return undefined
  return asPracticeManifest(item)
}

export function getAllManifests(): PracticeManifest[] {
  const out: PracticeManifest[] = []
  for (const [, entry] of getEntriesByKind('practice')) {
    const item = getRememberedManifest<PracticeItemManifest>(entry.hash)
    if (item) out.push(asPracticeManifest(item))
  }
  return out
}

export function getManifestIconKey(id: string): string {
  return getManifest(id)?.icon ?? 'prayer'
}

export function getManifestCategories(): string[] {
  const cats = new Set<string>()
  for (const m of getAllManifests()) for (const c of m.categories) cats.add(c)
  return Array.from(cats).sort()
}

export function searchManifests(query: string): PracticeManifest[] {
  const q = query.toLowerCase()
  return getAllManifests().filter((m) => {
    if (localizeContent(m.name).toLowerCase().includes(q)) return true
    if (m.tags?.some((t) => t.toLowerCase().includes(q))) return true
    if (m.description && localizeContent(m.description).toLowerCase().includes(q)) return true
    return false
  })
}

// --- Prayer / canticle resolution ---

const canticleRefs = new Set(['benedictus', 'magnificat', 'nunc-dimittis'])

function fetchPrayerSync(id: string): PrayerAsset | undefined {
  const item = residentFor<PrayerItemManifest>(id)
  if (!item) return undefined
  return {
    title: item.title,
    body: item.body as FlowSection[],
    subtitle: item.subtitle,
    source: item.source,
  }
}

export function resolvePrayer(ref: string, _libraryId?: string): PrayerAsset | undefined {
  if (canticleRefs.has(ref)) return undefined
  const canonical = canonicalize(ref, 'prayer') ?? `prayer/${ref}`
  return fetchPrayerSync(canonical)
}

export function resolveCanticle(ref: string): PrayerAsset | undefined {
  const canonical = canonicalize(ref, 'prayer') ?? `prayer/${ref}`
  if (!canticleRefs.has(ref) && !canticleRefs.has(canonical.replace('prayer/', '')))
    return undefined
  return fetchPrayerSync(canonical)
}

// --- Alternative groups ---

export type AlternativeGroup = {
  groupId: string
  members: Array<{ manifest: PracticeManifest; label: string; description: string }>
}

export function getAlternativeGroup(id: string): AlternativeGroup | undefined {
  const manifest = getManifest(id)
  if (!manifest?.alternativeTo) return undefined
  const groupId = manifest.alternativeTo.id
  const members: AlternativeGroup['members'] = []
  for (const m of getAllManifests()) {
    if (m.alternativeTo?.id === groupId) {
      members.push({
        manifest: m,
        label: localizeContent(m.alternativeTo.label),
        description: localizeContent(m.alternativeTo.description),
      })
    }
  }
  if (members.length < 2) return undefined
  members.sort((a, b) => a.label.localeCompare(b.label))
  return { groupId, members }
}

export function findGroupMemberInSet(
  qualifiedId: string,
  practiceIds: { has(key: string): boolean },
): string | undefined {
  const group = getAlternativeGroup(qualifiedId)
  if (!group) return undefined
  for (const m of group.members) if (practiceIds.has(m.manifest.id)) return m.manifest.id
  return undefined
}

// --- Async leaf loaders ---

export async function loadFlow(id: string): Promise<FlowDefinition | undefined> {
  const canonical = canonicalize(id, 'practice') ?? id
  const item = residentFor<PracticeItemManifest>(canonical)
  if (!item?.flowHash) return undefined
  const cached = PRACTICE_FRAGMENTS_CACHE.get(canonical)
  if (cached) return cached

  const flow = await getJson<FlowDefinition>(item.flowHash.hash)
  if (!item.fragments?.length) {
    PRACTICE_FRAGMENTS_CACHE.set(canonical, flow)
    return flow
  }
  const fragmentsList = await Promise.all(
    item.fragments.map(async (f) => {
      const partial = await getJson<{ fragments?: Record<string, FlowSection[]> }>(f.hash)
      return partial?.fragments
    }),
  )
  const merged: Record<string, FlowSection[]> = { ...(flow.fragments ?? {}) }
  for (const frags of fragmentsList) {
    if (!frags) continue
    for (const [name, sections] of Object.entries(frags)) merged[name] = sections
  }
  const final = { ...flow, fragments: merged }
  PRACTICE_FRAGMENTS_CACHE.set(canonical, final)
  return final
}

export async function loadPerDayFlow(id: string, day: number): Promise<FlowDefinition | undefined> {
  const canonical = canonicalize(id, 'practice') ?? id
  const item = residentFor<PracticeItemManifest>(canonical)
  if (!item?.perDay) return undefined
  // perDay keys may be 'day-01', '01', or just day numbers — try a few.
  const padded = String(day + 1).padStart(2, '0')
  const candidates = [`day-${padded}`, padded, String(day + 1), String(day)]
  for (const key of candidates) {
    const ref = item.perDay[key]
    if (ref) return getJson<FlowDefinition>(ref.hash)
  }
  return undefined
}

export async function loadPracticeData(id: string): Promise<Record<string, CycleData> | undefined> {
  const canonical = canonicalize(id, 'practice') ?? id
  const item = residentFor<PracticeItemManifest>(canonical)
  if (!item?.dataHashes?.length) return undefined
  const out: Record<string, CycleData> = {}
  await Promise.all(
    item.dataHashes.map(async (d) => {
      const stem = d.name.replace(/\.json$/, '')
      out[stem] = await getJson<CycleData>(d.hash)
    }),
  )
  return out
}

export async function loadPracticeTracks(
  id: string,
): Promise<Record<string, LectioTrackDef> | undefined> {
  const canonical = canonicalize(id, 'practice') ?? id
  const item = residentFor<PracticeItemManifest>(canonical)
  if (!item?.trackHashes?.length) return undefined
  const out: Record<string, LectioTrackDef> = {}
  await Promise.all(
    item.trackHashes.map(async (t) => {
      const stem = t.name.replace(/\.json$/, '')
      out[stem] = await getJson<LectioTrackDef>(t.hash)
    }),
  )
  return out
}

// --- Chapters & books ---

export function getChapterManifest(
  chapterId: string,
  _libraryId?: string,
): ChapterManifest | undefined {
  const canonical = canonicalize(chapterId, 'chapter') ?? `chapter/${chapterId}`
  const item = residentFor<ChapterItemManifest>(canonical)
  if (!item) return undefined
  return asChapterManifest(item)
}

export function getAllChapterManifestsForLibrary(_libraryId?: string): ChapterManifest[] {
  const out: ChapterManifest[] = []
  for (const [, entry] of getEntriesByKind('chapter')) {
    const item = getRememberedManifest<ChapterItemManifest>(entry.hash)
    if (item) out.push(asChapterManifest(item))
  }
  return out
}

export async function loadChapterContent(
  chapterId: string,
  _libraryId?: string,
): Promise<FlowDefinition | undefined> {
  const canonical = canonicalize(chapterId, 'chapter') ?? `chapter/${chapterId}`
  const item = residentFor<ChapterItemManifest>(canonical)
  if (!item?.contentHash) return undefined
  return getJson<FlowDefinition>(item.contentHash.hash)
}

/**
 * Bulk-prefetch all prose blobs for a chapter (called when a chapter screen
 * mounts so getProseText can return synchronously thereafter).
 */
export async function prefetchChapterProse(
  chapterId: string,
  langs: string[],
): Promise<Map<string, LocalizedContent>> {
  const canonical = canonicalize(chapterId, 'chapter') ?? `chapter/${chapterId}`
  const item = residentFor<ChapterItemManifest>(canonical)
  if (!item?.prose) return new Map()
  const out = new Map<string, LocalizedContent>()
  const { getText } = await import('./store')
  await Promise.all(
    item.prose
      .filter((p) => !langs.length || langs.includes(p.lang))
      .map(async (p) => {
        const raw = await getText(p.hash)
        const key = `${chapterId}/${p.file}`
        const existing = out.get(key) ?? {}
        ;(existing as Record<string, string>)[p.lang] = raw
        out.set(key, existing)
      }),
  )
  // Stash for synchronous reads from the engine's prose Proxy.
  for (const [k, v] of out) proseCache.set(k, v)
  return out
}

const proseCache = new Map<string, LocalizedContent>()

export function rememberProse(key: string, content: LocalizedContent): void {
  proseCache.set(key, content)
}

export function getProseText(filePath: string, _libraryId?: string): LocalizedContent | undefined {
  return proseCache.get(filePath)
}

export function getBookEntry(bookId: string, _libraryId?: string): BookEntry | undefined {
  const canonical = canonicalize(bookId, 'book') ?? `book/${bookId}`
  const item = residentFor<BookItemManifest>(canonical)
  if (!item) return undefined
  return asBookEntry(item)
}

export function getAllBookEntries(_libraryId?: string): BookEntry[] {
  const out: BookEntry[] = []
  for (const [, entry] of getEntriesByKind('book')) {
    const item = getRememberedManifest<BookItemManifest>(entry.hash)
    if (item) out.push(asBookEntry(item))
  }
  return out
}

export async function loadBookChapterText(
  _libraryId: string | undefined,
  bookId: string,
  chapterId: string,
  lang: string,
): Promise<string | undefined> {
  const canonical = canonicalize(bookId, 'book') ?? `book/${bookId}`
  const item = residentFor<BookItemManifest>(canonical)
  if (!item) return undefined
  const langMap = item.chapters[chapterId]
  if (!langMap) return undefined
  const ref = langMap[lang]
  if (!ref) return undefined
  const { getText } = await import('./store')
  return getText(ref.hash)
}

// --- Mass propers (used by mass-of) ---

/**
 * Load an OF mass proper, recombining shape + per-language blobs into a
 * single object that mass-of can consume.
 */
export async function loadMassProper(
  massId: string,
  langs: string[],
): Promise<unknown | undefined> {
  const canonical = canonicalize(massId, 'mass') ?? massId
  const entry = getEntry(canonical)
  if (!entry) return undefined
  let item = getRememberedManifest<LangSplitItemManifest>(entry.hash)
  if (!item) {
    item = await getJson<LangSplitItemManifest>(entry.hash)
    rememberManifestBody(entry.hash, item)
  }
  const shape = await getJson<unknown>(item.shape.hash)
  const langPayloads = await Promise.all(
    langs
      .filter((l) => item!.langs[l])
      .map(async (l) => [l, await getJson<unknown>(item!.langs[l].hash)] as const),
  )
  return mergeLangs(shape, Object.fromEntries(langPayloads))
}

function mergeLangs(shape: unknown, payloads: Record<string, unknown>): unknown {
  // For each non-shape value (i.e. shape was `null`), use the lang payload's value.
  // Reconstruct a multilingual map by walking shape and payloads in parallel.
  if (shape === null) {
    const merged: Record<string, unknown> = {}
    for (const [lang, payload] of Object.entries(payloads)) {
      if (payload !== null && payload !== undefined) merged[lang] = payload
    }
    return merged
  }
  if (Array.isArray(shape)) {
    return shape.map((v, i) =>
      mergeLangs(
        v,
        Object.fromEntries(Object.entries(payloads).map(([l, p]) => [l, (p as unknown[])?.[i]])),
      ),
    )
  }
  if (shape && typeof shape === 'object') {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(shape)) {
      out[k] = mergeLangs(
        (shape as Record<string, unknown>)[k],
        Object.fromEntries(
          Object.entries(payloads).map(([l, p]) => [
            l,
            (p as Record<string, unknown> | null | undefined)?.[k],
          ]),
        ),
      )
    }
    return out
  }
  return shape
}

// --- Library-scoped lookups (kept for back-compat; ignore libraryId) ---

export function getLibraryIdForPractice(_id: string): string | undefined {
  return 'corpus'
}

export function getInstalledLibraryIds(): string[] {
  return ['corpus']
}

export function getPracticeIdsForLibrary(_libraryId: string): string[] {
  return getEntriesByKind('practice').map(([id]) => id)
}

export function getBookDirUri(_bookId: string, _libraryId?: string): string | undefined {
  // No longer applicable in v2 (no per-book extracted directory).
  return undefined
}

// In v2 there's no library-asset path concept; mass-of should use loadMassProper
// directly. This stub remains for any straggler callers.
export async function readLibraryAsset(_libraryId: string, _path: string): Promise<unknown> {
  return undefined
}

// --- Misc ---

export function clearSources(): void {
  PRACTICE_FRAGMENTS_CACHE.clear()
  proseCache.clear()
}

export function search(query: string, kindFilter?: CatalogItemKind) {
  return indexSearch(query, kindFilter)
}

export { setCatalog }

export function getCatalogVersion(): number {
  return getCatalog().version
}
