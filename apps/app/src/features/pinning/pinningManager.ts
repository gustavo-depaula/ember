/**
 * Pinning — the only persistent personal-content state besides plan-of-life slots.
 *
 * Anyone can open any item from the corpus; pinning marks an item (a single
 * prayer/practice/book or a whole collection) as "keep available offline." All
 * referenced blobs are bulk-prefetched and the pinned-items list lives in
 * `preferences['pinned-items']` (a JSON array, kept tiny).
 */

import {
  flattenCollectionItems,
  getEntry,
  getRememberedManifest,
  rememberManifestBody,
} from '@/content/contentIndex'
import type {
  BookEntry,
  CatalogEntry,
  ChapterManifest,
  CollectionItemManifest,
  CreatorManifest,
  DoDataItemManifest,
  LangSplitItemManifest,
  PracticeManifest,
} from '@/content/manifestTypes'
import { getJson, type PrefetchEntry, prefetch } from '@/content/store'
import { pinnedFeedItemHashes } from '@/db/repositories/feedItems'
import { getPreference, setPreference } from '@/db/repositories/preferences'
import { saveItem } from '@/db/repositories/savedItems'

const PINNED_KEY = 'pinned-items'

type PinnedItem = { id: string; pinnedAt: number }

let pinned: PinnedItem[] = []

export async function rehydratePinned(): Promise<void> {
  const raw = await getPreference(PINNED_KEY)
  if (!raw) {
    pinned = []
    return
  }
  try {
    pinned = JSON.parse(raw) as PinnedItem[]
  } catch {
    pinned = []
  }
}

/** Reset the in-memory pinned list — used by tests. */
export function resetPinned(): void {
  pinned = []
}

async function persist() {
  await setPreference(PINNED_KEY, JSON.stringify(pinned))
}

export function getPinnedItems(): PinnedItem[] {
  return [...pinned]
}

export function isPinned(id: string): boolean {
  return pinned.some((p) => p.id === id)
}

type CollectBody = (body: unknown, add: (ref: { hash: string; size: number }) => void) => string[]

/** Per-kind body walker. Returns child item-ids to visit; pushes leaf BlobRefs to `add`. */
const COLLECTORS: Partial<Record<CatalogEntry['kind'], CollectBody>> = {
  collection: (body) =>
    flattenCollectionItems((body as CollectionItemManifest).sections).map((i) => i.ref),
  practice: (body, add) => {
    const p = body as PracticeManifest
    if (p.flowHash) add(p.flowHash)
    p.fragments?.forEach(add)
    p.dataHashes?.forEach(add)
    p.trackHashes?.forEach(add)
    if (p.perDay) Object.values(p.perDay).forEach(add)
    p.images?.forEach(add)
    return []
  },
  chapter: (body, add) => {
    const c = body as ChapterManifest
    if (c.contentHash) add(c.contentHash)
    c.prose?.forEach(add)
    return []
  },
  book: (body, add) => {
    const b = body as BookEntry
    if (b.style) add(b.style)
    if (b.chapters) {
      for (const langs of Object.values(b.chapters)) Object.values(langs).forEach(add)
    }
    b.images?.forEach(add)
    return []
  },
  creator: (body, add) => {
    const c = body as CreatorManifest
    if (c.avatarHash) add(c.avatarHash)
    if (c.bannerHash) add(c.bannerHash)
    return []
  },
  mass: (body, add) => addLangSplit(body as LangSplitItemManifest, add),
  'of-ordinary': (body, add) => addLangSplit(body as LangSplitItemManifest, add),
  'of-preface': (body, add) => addLangSplit(body as LangSplitItemManifest, add),
  'of-eucharistic-prayer': (body, add) => addLangSplit(body as LangSplitItemManifest, add),
  'do-data': (body, add) => {
    const m = body as DoDataItemManifest
    if (m.localized === true) {
      for (const langs of Object.values(m.files)) for (const ref of Object.values(langs)) add(ref)
    } else if (m.localized === false) {
      for (const ref of Object.values(m.files)) add(ref)
    }
    return []
  },
}

function addLangSplit(
  m: LangSplitItemManifest,
  add: (ref: { hash: string; size: number }) => void,
): string[] {
  if (m.shape) add(m.shape)
  if (m.langs) Object.values(m.langs).forEach(add)
  return []
}

/** Walk an item recursively, collecting every blob hash it references. */
async function collectBlobsFor(id: string): Promise<PrefetchEntry[]> {
  const out: PrefetchEntry[] = []
  const seen = new Set<string>()

  function add(ref: { hash: string; size: number }): void {
    if (seen.has(ref.hash)) return
    seen.add(ref.hash)
    out.push({ hash: ref.hash, size: ref.size })
  }

  async function visitItem(itemId: string): Promise<void> {
    const entry = getEntry(itemId)
    if (!entry || seen.has(entry.hash)) return
    add({ hash: entry.hash, size: entry.size })

    let body = getRememberedManifest<unknown>(entry.hash)
    if (!body) {
      try {
        body = await getJson<unknown>(entry.hash)
        if (body) rememberManifestBody(entry.hash, body)
      } catch {
        return
      }
    }
    if (!body) return

    const collector = COLLECTORS[entry.kind]
    if (!collector) return
    const children = collector(body, add)
    await Promise.all(children.map(visitItem))
  }

  await visitItem(id)
  return out
}

export async function pinItem(
  id: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (!getEntry(id)) {
    throw new Error(`Cannot pin unknown item: ${id}`)
  }

  const blobs = await collectBlobsFor(id)
  await prefetch(blobs, onProgress)

  if (!pinned.some((p) => p.id === id)) {
    pinned = [...pinned, { id, pinnedAt: Date.now() }]
    await persist()
  }

  // Offline implies in-library: an item you keep for offline is always saved.
  // (The reverse does not hold — saving never pins.) Best-effort — a failure to
  // mirror into the Saved shelf must not fail the pin itself.
  const entry = getEntry(id)
  if (entry) {
    try {
      await saveItem(id, entry.kind)
    } catch (err) {
      console.warn('[pinning] could not mirror pin into saved items:', err)
    }
  }
}

export async function unpinItem(id: string): Promise<void> {
  pinned = pinned.filter((p) => p.id !== id)
  await persist()
  // Note: we don't actively delete blobs here. The next eviction pass clears
  // anything no longer referenced by a pinned item.
}

/**
 * Compute the union of blob hashes referenced by every pinned item plus
 * pinned creator feed-item media + image. Used by GC to know what to keep.
 */
export async function pinnedHashes(): Promise<Set<string>> {
  const out = new Set<string>()
  for (const item of pinned) {
    const blobs = await collectBlobsFor(item.id)
    for (const b of blobs) out.add(b.hash)
  }
  for (const h of await pinnedFeedItemHashes()) out.add(h)
  return out
}
