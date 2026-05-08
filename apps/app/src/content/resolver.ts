/**
 * Catalog-driven resolver. Sync APIs serve the engine's prayer/canticle/prose
 * Proxies from manifests warmed at boot; async APIs fetch flow/chapter/mass
 * content on demand. Public surface mirrors the v1 `registry.ts` so callsites
 * mostly stay put — except the load* functions are now async.
 */

import { batchedLoad } from '@/lib/async'
import { fetchHearth } from '@/lib/hearth'
import { localizeContent } from '@/lib/i18n'
import {
  canonicalize,
  getCatalog,
  getEntriesByKind,
  getEntry,
  getRememberedManifest,
  search as indexSearch,
  invalidateMemberOfIndex,
  isHiddenPractice,
  notifyManifestsWarmed,
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
import { mergeLangs } from './mergeLangs'
import { getJson, getText } from './store'
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

// `qualifyId` and `parseQualifiedId` are kept for callsite back-compat — the
// libraryId arg is now ignored since v2 ids are kind-prefixed (e.g. `practice/rosary`).
export function qualifyId(_libraryId: string, id: string): string {
  if (id.includes('/')) return id
  return `practice/${id}`
}

export function parseQualifiedId(id: string): { libraryId: string; practiceId: string } {
  if (id.includes('/')) {
    const idx = id.indexOf('/')
    return { libraryId: id.slice(0, idx), practiceId: id.slice(idx + 1) }
  }
  return { libraryId: '', practiceId: id }
}

export async function loadCatalogFromHearth(): Promise<Catalog> {
  const catalog = await fetchHearth<Catalog>('catalog.json', { networkFirst: true })
  setCatalog(catalog)
  return catalog
}

const PRACTICE_FRAGMENTS_CACHE = new Map<string, FlowDefinition>()

const CRITICAL_KINDS = ['prayer', 'practice'] as const
const DEFERRED_KINDS = ['chapter', 'book', 'collection'] as const

async function warmKinds(
  kinds: ReadonlyArray<'prayer' | 'practice' | 'chapter' | 'book' | 'collection'>,
): Promise<void> {
  const hashes: string[] = []
  for (const kind of kinds) {
    for (const [, entry] of getEntriesByKind(kind)) {
      if (getRememberedManifest(entry.hash) === undefined) hashes.push(entry.hash)
    }
  }
  await batchedLoad(
    hashes,
    async (hash) => {
      try {
        rememberManifestBody(hash, await getJson<unknown>(hash))
      } catch (err) {
        console.warn(`[resolver] warm ${hash.slice(0, 8)}:`, err)
      }
    },
    16,
  )
}

/** Block boot only on what synchronous resolvers (engine Proxies) need. */
export async function warmCriticalManifests(): Promise<void> {
  await warmKinds(CRITICAL_KINDS)
  notifyManifestsWarmed()
}

/** Runs in parallel with first paint; populates collection / book / chapter manifests. */
export async function warmDeferredManifests(): Promise<void> {
  await warmKinds(DEFERRED_KINDS)
  invalidateMemberOfIndex()
  notifyManifestsWarmed()
}

/** Back-compat: full warm in one call (no longer used on the boot path). */
export async function warmResidentManifests(): Promise<void> {
  await warmCriticalManifests()
  await warmDeferredManifests()
}

// --- Sync lookups (manifests + prayers + book metadata) ---

function residentFor<T>(id: string): T | undefined {
  const entry = getEntry(id)
  if (!entry) return undefined
  return getRememberedManifest<T>(entry.hash)
}

// v1 PracticeManifest still has required `flow`/`data`/`tracks` path fields;
// v2 references those by hash. Stub the path fields until callers migrate.
function asPracticeManifest(item: PracticeItemManifest): PracticeManifest {
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
  const entry = getEntry(canonical)
  if (entry?.kind !== 'practice') return undefined
  const item = getRememberedManifest<PracticeItemManifest>(entry.hash)
  if (!item) return undefined
  return asPracticeManifest(item)
}

export function getAllManifests(): PracticeManifest[] {
  const out: PracticeManifest[] = []
  for (const [, entry] of getEntriesByKind('practice')) {
    const item = getRememberedManifest<PracticeItemManifest>(entry.hash)
    if (!item) continue
    if (isHiddenPractice(item.id)) continue
    out.push(asPracticeManifest(item))
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
  return getText(ref.hash)
}

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
  const resolved =
    getRememberedManifest<LangSplitItemManifest>(entry.hash) ??
    (await (async () => {
      const item = await getJson<LangSplitItemManifest>(entry.hash)
      rememberManifestBody(entry.hash, item)
      return item
    })())
  const requestedLangs = langs.filter((l) => resolved.langs[l])
  const [shape, ...langPayloads] = await Promise.all([
    getJson<unknown>(resolved.shape.hash),
    ...requestedLangs.map((l) => getJson<unknown>(resolved.langs[l].hash)),
  ])
  const payloadsByLang = Object.fromEntries(
    requestedLangs.map((l, i) => [l, langPayloads[i]] as const),
  )
  return mergeLangs(shape, payloadsByLang)
}

// Back-compat stubs for v1 callers — kept until those callsites are migrated.
export function getLibraryIdForPractice(_id: string): string | undefined {
  return 'corpus'
}

export function getInstalledLibraryIds(): string[] {
  return ['corpus']
}

export function getPracticeIdsForLibrary(_libraryId: string): string[] {
  return getEntriesByKind('practice').map(([id]) => id)
}

export async function readLibraryAsset(_libraryId: string, _path: string): Promise<unknown> {
  return undefined
}

// The book reader still calls this; in v2 there is no extracted-on-disk book
// directory, so callers receive undefined and the existing fallback path runs.
// TODO: rewrite features/libraries/bookReader.ts on top of the blob store.
export function getBookDirUri(_bookId: string, _libraryId?: string): string | undefined {
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
