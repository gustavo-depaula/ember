/**
 * Pinning — the only persistent personal-content state besides plan-of-life slots.
 *
 * Anyone can open any item from the corpus; pinning marks an item (a single
 * prayer/practice/book or a whole collection) as "keep available offline." All
 * referenced blobs are bulk-prefetched and the pinned-items list lives in
 * `preferences['pinned-items']` (a JSON array, kept tiny).
 */

import { getEntry, getRememberedManifest, rememberManifestBody } from '@/content/contentIndex'
import type {
  BookItemManifest,
  CatalogEntry,
  ChapterItemManifest,
  CollectionItemManifest,
  LangSplitItemManifest,
  PracticeItemManifest,
} from '@/content/manifestTypes'
import { getJson, type PrefetchEntry, prefetch } from '@/content/store'
import { getPreference, setPreference } from '@/db/repositories/preferences'

const PINNED_KEY = 'pinned-items'

type PinnedItem = { id: string; pinnedAt: number }

let pinned: PinnedItem[] = []

export async function rehydratePinned(): Promise<void> {
  const raw = await getPreference(PINNED_KEY)
  if (!raw) return
  try {
    pinned = JSON.parse(raw) as PinnedItem[]
  } catch {
    pinned = []
  }
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

/** Walk an item recursively, collecting every blob hash it references. */
async function collectBlobsFor(id: string): Promise<PrefetchEntry[]> {
  const out: PrefetchEntry[] = []
  const seen = new Set<string>()

  async function visitItem(itemId: string): Promise<void> {
    const entry = getEntry(itemId)
    if (!entry) return
    if (seen.has(entry.hash)) return
    seen.add(entry.hash)
    out.push({ hash: entry.hash, size: entry.size })

    let body = getRememberedManifest<unknown>(entry.hash)
    if (!body) {
      try {
        body = await getJson<unknown>(entry.hash)
        rememberManifestBody(entry.hash, body)
      } catch {
        return
      }
    }

    await visitBody(entry, body)
  }

  async function visitBody(entry: CatalogEntry, body: unknown): Promise<void> {
    switch (entry.kind) {
      case 'collection': {
        const c = body as CollectionItemManifest
        for (const item of c.items ?? []) {
          await visitItem(item.ref)
        }
        return
      }
      case 'practice': {
        const p = body as PracticeItemManifest
        if (p.flowHash) addBlob(p.flowHash.hash, p.flowHash.size)
        for (const f of p.fragments ?? []) addBlob(f.hash, f.size)
        for (const d of p.dataHashes ?? []) addBlob(d.hash, d.size)
        for (const t of p.trackHashes ?? []) addBlob(t.hash, t.size)
        for (const day of Object.values(p.perDay ?? {})) addBlob(day.hash, day.size)
        for (const im of p.images ?? []) addBlob(im.hash, im.size)
        return
      }
      case 'chapter': {
        const c = body as ChapterItemManifest
        if (c.contentHash) addBlob(c.contentHash.hash, c.contentHash.size)
        for (const p of c.prose ?? []) addBlob(p.hash, p.size)
        return
      }
      case 'book': {
        const b = body as BookItemManifest
        if (b.style) addBlob(b.style.hash, b.style.size)
        for (const langs of Object.values(b.chapters ?? {})) {
          for (const ref of Object.values(langs)) addBlob(ref.hash, ref.size)
        }
        for (const im of b.images ?? []) addBlob(im.hash, im.size)
        return
      }
      case 'mass':
      case 'of-ordinary':
      case 'of-preface':
      case 'of-eucharistic-prayer': {
        const m = body as LangSplitItemManifest
        if (m.shape) addBlob(m.shape.hash, m.shape.size)
        for (const ref of Object.values(m.langs ?? {})) addBlob(ref.hash, ref.size)
        return
      }
      // prayer / of-data / checkup: only the manifest blob (already added).
      default:
        return
    }
  }

  function addBlob(hash: string, size: number): void {
    if (seen.has(hash)) return
    seen.add(hash)
    out.push({ hash, size })
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
}

export async function unpinItem(id: string): Promise<void> {
  pinned = pinned.filter((p) => p.id !== id)
  await persist()
  // Note: we don't actively delete blobs here. The next eviction pass clears
  // anything no longer referenced by a pinned item.
}

/**
 * Compute the union of blob hashes referenced by every pinned item. Used by
 * GC to know what to keep when evicting.
 */
export async function pinnedHashes(): Promise<Set<string>> {
  const out = new Set<string>()
  for (const item of pinned) {
    const blobs = await collectBlobsFor(item.id)
    for (const b of blobs) out.add(b.hash)
  }
  return out
}
