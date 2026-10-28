/**
 * Catalog-driven resolver. Sync APIs serve the engine's prayer/canticle/prose
 * Proxies from manifests warmed at boot; async APIs fetch flow/chapter/mass
 * content on demand.
 */

import { hasCached } from '@/db/repositories/cache'
import { pooledLoad } from '@/lib/async'
import { fetchHearth } from '@/lib/hearth'
import { localizeContent } from '@/lib/i18n'
import {
  canonicalize,
  ensureManifestBody,
  getCatalog,
  getEntriesByKind,
  getEntry,
  getRememberedManifest,
  invalidateMemberOfIndex,
  notifyManifestsWarmed,
  rememberManifestBody,
  setCatalog,
} from './contentIndex'
import { readManifestSnapshot, writeManifestSnapshot } from './manifestSnapshot'
import type {
  BlobRef,
  Catalog,
  ChapterManifest,
  CreatorManifest,
  PracticeManifest,
} from './manifestTypes'
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

export async function loadCatalogFromHearth({
  networkFirst = true,
}: {
  networkFirst?: boolean
} = {}): Promise<Catalog> {
  const catalog = await fetchHearth<Catalog>('catalog.json', { networkFirst })
  setCatalog(catalog)
  return catalog
}

/** Returning launches have the catalog cached in SQLite; first launch does not. */
export function hasCachedCatalog(): Promise<boolean> {
  // An existence check — parsing the ~600KB catalog here would double the one
  // parse boot already pays in loadCatalogFromHearth.
  return hasCached('hearth:catalog.json')
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

const CRITICAL_KINDS = ['practice'] as const
// Books are not warmed: 500+ manifests (~7MB) nobody reads synchronously —
// tiles and search fall back to the catalog entry's name/author, and readers
// resolve the manifest on demand (useBookManifest, the engine's prepareBooks).
const DEFERRED_KINDS = ['chapter', 'collection', 'plan-of-life-template', 'creator'] as const
const WARMED_KINDS = [...CRITICAL_KINDS, ...DEFERRED_KINDS]

type WarmedKind = (typeof WARMED_KINDS)[number]

let snapshotRestore: Promise<number> | undefined

/**
 * Remember every body in the on-disk snapshot, once per session. Resolves to
 * how many were new for the first caller only, so later warms still report a
 * no-op refresh as zero.
 */
async function restoreSnapshot(): Promise<number> {
  if (snapshotRestore) {
    await snapshotRestore
    return 0
  }
  snapshotRestore = readManifestSnapshot().then((bodies) => {
    let restored = 0
    for (const [hash, body] of Object.entries(bodies ?? {})) {
      if (getRememberedManifest(hash) !== undefined) continue
      rememberManifestBody(hash, body)
      restored++
    }
    return restored
  })
  return snapshotRestore
}

function persistSnapshot(): Promise<void> {
  const bodies: Record<string, unknown> = {}
  const hearthItems = getCatalog().items
  for (const kind of WARMED_KINDS) {
    for (const [id, entry] of getEntriesByKind(kind)) {
      if (!(id in hearthItems)) continue
      const body = getRememberedManifest(entry.hash)
      if (body !== undefined) bodies[entry.hash] = body
    }
  }
  return writeManifestSnapshot(bodies)
}

// The boot warm and the post-boot catalog refresh overlap; without sharing,
// both would read the same blobs.
const inflightWarms = new Map<string, Promise<void>>()

function warmOne(hash: string): Promise<void> {
  const pending = inflightWarms.get(hash)
  if (pending) return pending
  const work = getJson<unknown>(hash)
    .then((body) => rememberManifestBody(hash, body))
    .catch((err) => {
      // Aborts are expected on unmount/hot-reload — only the original
      // network failures are interesting noise.
      if (err instanceof Error && err.name === 'AbortError') return
      console.warn(`[resolver] warm ${hash.slice(0, 8)}:`, err)
    })
    .finally(() => inflightWarms.delete(hash))
  inflightWarms.set(hash, work)
  return work
}

/** Returns how many manifests were newly warmed (zero on a no-change refresh). */
async function warmKinds(kinds: ReadonlyArray<WarmedKind>): Promise<number> {
  const restored = await restoreSnapshot()
  const hashes: string[] = []
  const hearthItems = getCatalog().items
  for (const kind of kinds) {
    for (const [id, entry] of getEntriesByKind(kind)) {
      // External entries (Escrivá, the Catechism) carry synthetic hashes the
      // store has never held; they are built on demand when opened.
      if (!(id in hearthItems)) continue
      if (getRememberedManifest(entry.hash) === undefined) hashes.push(entry.hash)
    }
  }
  await pooledLoad(hashes, warmOne, 16)
  const loaded = hashes.filter((h) => getRememberedManifest(h) !== undefined).length
  if (loaded > 0) {
    persistSnapshot().catch((err) => console.warn('[resolver] manifest snapshot write:', err))
  }
  return restored + loaded
}

/** Block boot only on what synchronous resolvers (engine Proxies) need. */
export async function warmCriticalManifests(): Promise<void> {
  // Only notify when something new loaded — the background refresh calls this
  // on every launch, and a no-op warm must not re-render the whole app.
  if ((await warmKinds(CRITICAL_KINDS)) > 0) notifyManifestsWarmed()
}

/** Runs in parallel with first paint. */
export async function warmDeferredManifests(): Promise<void> {
  if ((await warmKinds(DEFERRED_KINDS)) === 0) return
  invalidateMemberOfIndex()
  notifyManifestsWarmed()
}

// Returns `canonical` alongside the warmed body so callers can dispatch async
// loads without re-canonicalizing.
function residentItem<T>(
  id: string,
  kind: 'practice' | 'chapter' | 'book' | 'creator',
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
    out.push(item)
  }
  return out
}

// A non-primary member of an alternativeTo group (the primary's bare id is the
// group id). Catalog lists show only the primary; the rest are reached through
// its Form list.
export function isAlternateForm(manifest: PracticeManifest): boolean {
  if (!manifest.alternativeTo) return false
  const slash = manifest.id.indexOf('/')
  const unqualified = slash === -1 ? manifest.id : manifest.id.slice(slash + 1)
  return unqualified !== manifest.alternativeTo.id
}

export function getManifestIconKey(id: string): string {
  return getManifest(id)?.icon ?? 'prayer'
}

export function getManifestCategories(): string[] {
  const cats = new Set<string>()
  for (const m of getAllManifests()) for (const c of m.categories ?? []) cats.add(c)
  return Array.from(cats).sort()
}

function fetchPrayerSync(id: string): PrayerAsset | undefined {
  const { item } = residentItem<PracticeManifest>(id, 'practice')
  if (!item) return undefined
  const sections = item.flow?.sections
  if (!sections) return undefined
  return {
    title: item.name,
    body: sections,
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
  members: Array<{
    manifest: PracticeManifest
    label: string
    description: string
    order: number
  }>
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
        order: m.alternativeTo.order ?? Number.POSITIVE_INFINITY,
      })
    }
  }
  if (members.length < 2) return undefined
  members.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
  return { groupId, members }
}

export function findGroupMemberInSet(
  qualifiedId: string,
  practiceIds: { has(key: string): boolean },
): string | undefined {
  const group = getAlternativeGroup(qualifiedId)
  if (!group) return undefined
  return group.members.find((m) => practiceIds.has(m.manifest.id))?.manifest.id
}

// The flow if loadFlow already fetched it this session; never fetches. Lets a
// synchronous render (a plan row's pinned hour) use the flow once it's warm.
export function getLoadedFlow(id: string): FlowDefinition | undefined {
  const canonical = canonicalize(id, 'practice')
  return canonical ? PRACTICE_FRAGMENTS_CACHE.get(canonical) : undefined
}

export async function loadFlow(id: string): Promise<FlowDefinition | undefined> {
  const { canonical, item } = residentItem<PracticeManifest>(id, 'practice')
  if (!item) return undefined
  const cached = PRACTICE_FRAGMENTS_CACHE.get(canonical)
  if (cached) return cached

  // structuredClone keeps later image-rewriting from mutating the warmed manifest.
  let flow: FlowDefinition
  if (item.flow) {
    flow = structuredClone(item.flow)
  } else if (item.flowHash) {
    flow = await getJson<FlowDefinition>(item.flowHash.hash)
  } else {
    return undefined
  }
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
  const content = await getJson<FlowDefinition>(item.contentHash.hash)
  const imageRefs = buildImageRefMap(item.images)
  if (!content || !imageRefs) return content
  // A copy: the blob cache hands every reader the same object.
  const resolved = structuredClone(content)
  rewriteImagePaths(resolved, imageRefs)
  return resolved
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
