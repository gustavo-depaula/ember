/**
 * Catalog-driven resolver. Sync APIs serve the engine's prayer/canticle/prose
 * Proxies from manifests warmed at boot; async APIs fetch flow/chapter/mass
 * content on demand.
 */

import { batchedLoad } from '@/lib/async'
import { fetchHearth } from '@/lib/hearth'
import { localizeContent } from '@/lib/i18n'
import {
  canonicalize,
  ensureManifestBody,
  getEntriesByKind,
  getEntry,
  getRememberedManifest,
  invalidateMemberOfIndex,
  isHiddenPractice,
  notifyManifestsWarmed,
  rememberManifestBody,
  setCatalog,
} from './contentIndex'
import { pickAvailableLang } from './langAliases'
import type {
  BlobRef,
  BookEntry,
  Catalog,
  ChapterManifest,
  CreatorManifest,
  LangSplitItemManifest,
  PracticeManifest,
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
  LocalizedText,
} from './types'

export type { TocNode } from './manifestTypes'

export type PrayerAsset = {
  title: LocalizedText
  body: FlowSection[]
  subtitle?: LocalizedText
  source?: LocalizedText
}

export async function loadCatalogFromHearth(): Promise<Catalog> {
  const catalog = await fetchHearth<Catalog>('catalog.json', { networkFirst: true })
  setCatalog(catalog)
  return catalog
}

const PRACTICE_FRAGMENTS_CACHE = new Map<string, FlowDefinition>()
const proseCache = new Map<string, LocalizedContent>()

function buildImageRefMap(
  images: { rel: string; hash: string; mime: string }[] | undefined,
): Map<string, string> | undefined {
  if (!images?.length) return undefined
  const map = new Map<string, string>()
  for (const img of images) {
    const ext = (img.mime?.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg')
    map.set(`images/${img.rel}`, `corpus://${img.hash}.${ext}`)
  }
  return map
}

// Practices reference images by their `images/<rel>` path in flow.json. The
// corpus addresses them by hash, so rewrite every matching string in the
// loaded flow up front; useResolvedImageUri then resolves `corpus://` to a
// platform-appropriate URI lazily when each image is rendered.
function rewriteImagePaths(value: unknown, refs: Map<string, string>): void {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const v = value[i]
      if (typeof v === 'string') {
        const replaced = refs.get(v)
        if (replaced) value[i] = replaced
      } else {
        rewriteImagePaths(v, refs)
      }
    }
    return
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const k of Object.keys(obj)) {
      const v = obj[k]
      if (typeof v === 'string') {
        const replaced = refs.get(v)
        if (replaced) obj[k] = replaced
      } else {
        rewriteImagePaths(v, refs)
      }
    }
  }
}

const canticleRefs = new Set(['benedictus', 'magnificat', 'nunc-dimittis'])

const CRITICAL_KINDS = ['prayer', 'practice'] as const
const DEFERRED_KINDS = ['chapter', 'book', 'collection', 'creator'] as const

async function warmKinds(
  kinds: ReadonlyArray<'prayer' | 'practice' | 'chapter' | 'book' | 'collection' | 'creator'>,
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
        // Aborts are expected on unmount/hot-reload — only the original
        // network failures are interesting noise.
        if (err instanceof Error && err.name === 'AbortError') return
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

/**
 * Resolve `id` to a canonical `kind/id` and read the warmed manifest body.
 * Returns both so callers can dispatch async loads off `canonical` without
 * re-canonicalizing. Returns `undefined` for both when the id is unknown.
 */
function residentItem<T>(
  id: string,
  kind: 'prayer' | 'practice' | 'chapter' | 'book' | 'mass' | 'creator',
): { canonical: string; item: T | undefined } {
  const canonical = canonicalize(id, kind)
  if (!canonical) return { canonical: '', item: undefined }
  const entry = getEntry(canonical)
  if (entry?.kind !== kind) return { canonical, item: undefined }
  return { canonical, item: getRememberedManifest<T>(entry.hash) }
}

export function loadCreator(id: string): CreatorManifest | undefined {
  return residentItem<CreatorManifest>(id, 'creator').item
}

export function getManifest(id: string): PracticeManifest | undefined {
  return residentItem<PracticeManifest>(id, 'practice').item
}

export function getAllManifests(): PracticeManifest[] {
  const out: PracticeManifest[] = []
  for (const [, entry] of getEntriesByKind('practice')) {
    const item = getRememberedManifest<PracticeManifest>(entry.hash)
    if (!item) continue
    if (isHiddenPractice(item.id)) continue
    out.push(item)
  }
  return out
}

export function getManifestIconKey(id: string): string {
  return getManifest(id)?.icon ?? 'prayer'
}

export function getManifestCategories(): string[] {
  const cats = new Set<string>()
  for (const m of getAllManifests()) for (const c of m.categories ?? []) cats.add(c)
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

function fetchPrayerSync(id: string): PrayerAsset | undefined {
  const { item } = residentItem<PrayerItemManifest>(id, 'prayer')
  if (!item) return undefined
  return {
    title: item.title,
    body: item.body as FlowSection[],
    subtitle: item.subtitle,
    source: item.source,
  }
}

export function resolvePrayer(ref: string): PrayerAsset | undefined {
  if (canticleRefs.has(ref)) return undefined
  return fetchPrayerSync(ref)
}

export function resolveCanticle(ref: string): PrayerAsset | undefined {
  const bare = ref.replace(/^prayer\//, '')
  if (!canticleRefs.has(bare)) return undefined
  return fetchPrayerSync(ref)
}

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

export async function loadFlow(id: string): Promise<FlowDefinition | undefined> {
  const { canonical, item } = residentItem<PracticeManifest>(id, 'practice')
  if (!item?.flowHash) return undefined
  const cached = PRACTICE_FRAGMENTS_CACHE.get(canonical)
  if (cached) return cached

  const flow = await getJson<FlowDefinition>(item.flowHash.hash)
  const imageRefs = buildImageRefMap(item.images)
  if (!item.fragments?.length) {
    if (imageRefs) rewriteImagePaths(flow, imageRefs)
    PRACTICE_FRAGMENTS_CACHE.set(canonical, flow)
    return flow
  }
  const fragmentsList = await Promise.all(
    item.fragments.map(async (f: { hash: string }) => {
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
  if (imageRefs) rewriteImagePaths(final, imageRefs)
  PRACTICE_FRAGMENTS_CACHE.set(canonical, final)
  return final
}

export async function loadPerDayFlow(id: string, day: number): Promise<FlowDefinition | undefined> {
  const { item } = residentItem<PracticeManifest>(id, 'practice')
  if (!item?.perDay) return undefined
  const padded = String(day + 1).padStart(2, '0')
  const candidates = [`day-${padded}`, padded, String(day + 1), String(day)]
  for (const key of candidates) {
    const ref = item.perDay[key]
    if (!ref) continue
    const flow = await getJson<FlowDefinition>(ref.hash)
    const imageRefs = buildImageRefMap(item.images)
    if (imageRefs) rewriteImagePaths(flow, imageRefs)
    return flow
  }
  return undefined
}

async function loadHashedRecord<T>(
  refs: ReadonlyArray<{ name: string; hash: string }> | undefined,
): Promise<Record<string, T> | undefined> {
  if (!refs?.length) return undefined
  const out: Record<string, T> = {}
  await Promise.all(
    refs.map(async (r) => {
      out[r.name.replace(/\.json$/, '')] = await getJson<T>(r.hash)
    }),
  )
  return out
}

export function loadPracticeData(id: string): Promise<Record<string, CycleData> | undefined> {
  return loadHashedRecord<CycleData>(
    residentItem<PracticeManifest>(id, 'practice').item?.dataHashes,
  )
}

export function loadPracticeTracks(
  id: string,
): Promise<Record<string, LectioTrackDef> | undefined> {
  return loadHashedRecord<LectioTrackDef>(
    residentItem<PracticeManifest>(id, 'practice').item?.trackHashes,
  )
}

export function getChapterManifest(chapterId: string): ChapterManifest | undefined {
  return residentItem<ChapterManifest>(chapterId, 'chapter').item
}

export function getAllChapterManifests(): ChapterManifest[] {
  const out: ChapterManifest[] = []
  for (const [, entry] of getEntriesByKind('chapter')) {
    const item = getRememberedManifest<ChapterManifest>(entry.hash)
    if (item) out.push(item)
  }
  return out
}

export async function loadChapterContent(chapterId: string): Promise<FlowDefinition | undefined> {
  const { item } = residentItem<ChapterManifest>(chapterId, 'chapter')
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
  const { item } = residentItem<ChapterManifest>(chapterId, 'chapter')
  if (!item?.prose) return new Map()
  const out = new Map<string, LocalizedContent>()
  await Promise.all(
    item.prose
      .filter((p: { lang: string }) => !langs.length || langs.includes(p.lang))
      .map(async (p: { file: string; lang: string; hash: string }) => {
        const raw = await getText(p.hash)
        const key = `${chapterId}/${p.file}`
        const existing = out.get(key) ?? {}
        ;(existing as Record<string, string>)[p.lang] = raw
        out.set(key, existing)
      }),
  )
  for (const [k, v] of out) proseCache.set(k, v)
  return out
}

export function getProseText(filePath: string): LocalizedContent | undefined {
  return proseCache.get(filePath)
}

export function getBookEntry(bookId: string): BookEntry | undefined {
  return residentItem<BookEntry>(bookId, 'book').item
}

export function getAllBookEntries(): BookEntry[] {
  const out: BookEntry[] = []
  for (const [, entry] of getEntriesByKind('book')) {
    const item = getRememberedManifest<BookEntry>(entry.hash)
    if (item) out.push(item)
  }
  return out
}

export async function loadBookChapterText(
  bookId: string,
  chapterId: string,
  lang: string,
): Promise<string | undefined> {
  const { item } = residentItem<BookEntry>(bookId, 'book')
  if (!item) return undefined
  const ref = item.chapters[chapterId]?.[lang]
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
  const resolved = await ensureManifestBody<LangSplitItemManifest>(entry.hash)

  const fetched: Array<{ requested: string; available: string }> = []
  for (const l of langs) {
    const avail = pickAvailableLang(l, resolved.langs)
    if (avail) fetched.push({ requested: l, available: avail })
  }
  const [shape, ...langPayloads] = await Promise.all([
    getJson<unknown>(resolved.shape.hash),
    ...fetched.map(({ available }) =>
      getJson<unknown>((resolved.langs[available] as BlobRef).hash),
    ),
  ])
  const payloadsByLang = Object.fromEntries(
    fetched.map(({ requested }, i) => [requested, langPayloads[i]] as const),
  )
  return mergeLangs(shape, payloadsByLang)
}
