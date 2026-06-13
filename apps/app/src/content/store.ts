/**
 * Content-addressed blob cache. Hashes never change for a given content, so
 * cache hits never expire. Native: filesystem under `documentDirectory/blobs/`.
 * Web: IndexedDB at key `blob:{hash}`.
 */

import * as expoFs from 'expo-file-system'
import { Platform } from 'react-native'
import { yieldToUI } from '@/lib/async'
import { hearthUrl } from '@/lib/hearth'
import { idbDeletePrefix, idbReadBinary, idbWriteFile } from '@/lib/idb-fs'

// Static import (expo-file-system ships a web variant) so vitest's module
// mock can intercept it; the Platform guard keeps every native call gated.
const nativeFs = Platform.OS !== 'web' ? expoFs : undefined

// Concurrent ensureBlobCached/getBlob calls for the same hash share one
// download pipeline instead of racing each other.
const inflight = new Map<string, Promise<void>>()

const TEXT_DECODER = new TextDecoder()

export function blobPath(hash: string): string {
  return `blobs/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}`
}

function blobsDir() {
  if (!nativeFs) throw new Error('blobsDir() called on web')
  const { Directory, Paths } = nativeFs
  return new Directory(Paths.document, 'blobs/')
}

function blobFile(hash: string) {
  if (!nativeFs) throw new Error('blobFile() called on web')
  const { File: NativeFile, Paths } = nativeFs
  return new NativeFile(Paths.document, blobPath(hash))
}

export async function hasBlob(hash: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    const bytes = await idbReadBinary(`blob:${hash}`)
    return bytes !== undefined
  }
  return blobFile(hash).exists
}

async function readFromCache(hash: string): Promise<Uint8Array | undefined> {
  if (Platform.OS === 'web') {
    return idbReadBinary(`blob:${hash}`)
  }
  const f = blobFile(hash)
  if (!f.exists) return undefined
  try {
    return await f.bytes()
  } catch {
    return undefined
  }
}

function shardDir(hash: string) {
  const { Directory, Paths } = nativeFs!
  return new Directory(Paths.document, `blobs/${hash.slice(0, 2)}/${hash.slice(2, 4)}/`)
}

async function writeToCache(hash: string, data: Uint8Array): Promise<void> {
  if (Platform.OS === 'web') {
    await idbWriteFile(`blob:${hash}`, data)
    return
  }
  shardDir(hash).create({ intermediates: true, idempotent: true })
  blobFile(hash).write(data)
}

// Staging area for native downloads. Lives OUTSIDE blobs/ so the eviction walk
// and cache stats never see partial files; a same-volume move into blobs/ is
// atomic, so a truncated download can never appear as a (permanently) cached
// blob — hashes are immutable and cache hits are trusted forever.
const TMP_DIR = 'blobs-tmp/'

function tmpFile(hash: string) {
  const { File: NativeFile, Paths } = nativeFs!
  return new NativeFile(Paths.document, `${TMP_DIR}${hash}`)
}

/** Remove leftover partial downloads (app killed mid-download). Native only. */
export async function clearBlobTmp(): Promise<void> {
  if (Platform.OS === 'web') return
  const { Directory, Paths } = nativeFs!
  const dir = new Directory(Paths.document, TMP_DIR)
  if (dir.exists) dir.delete()
}

/**
 * Native disk-to-disk download: the bytes never cross the JS bridge, unlike
 * fetch + arrayBuffer + write, which blocks the JS thread for the whole body.
 * Rejects on non-2xx (verified in FileSystemModule's downloadFileAsync), on a
 * zero-byte body, and on a size mismatch when the manifest told us the size.
 */
async function downloadToCache(hash: string, expectedSize?: number): Promise<void> {
  const { Directory, File: NativeFile, Paths } = nativeFs!
  new Directory(Paths.document, TMP_DIR).create({ intermediates: true, idempotent: true })
  const tmp = tmpFile(hash)
  try {
    await NativeFile.downloadFileAsync(hearthUrl(blobPath(hash)), tmp, { idempotent: true })
    const size = tmp.size ?? 0
    if (size <= 0) throw new Error('empty download')
    if (expectedSize !== undefined && size !== expectedSize) {
      throw new Error(`size mismatch: got ${size}, expected ${expectedSize}`)
    }
    shardDir(hash).create({ intermediates: true, idempotent: true })
    tmp.move(blobFile(hash))
  } catch (err) {
    try {
      if (tmp.exists) tmp.delete()
    } catch {
      // best-effort cleanup; clearBlobTmp sweeps leftovers daily
    }
    throw err
  }
}

/**
 * Ensure a blob is in the local cache without reading its bytes into JS.
 * Preferred over getBlob whenever the caller doesn't need the bytes
 * (prefetch, image URIs). Falls back to the JS fetch path if the native
 * download fails.
 */
export async function ensureBlobCached(hash: string, expectedSize?: number): Promise<void> {
  const pending = inflight.get(hash)
  if (pending) return pending
  const work = ensureCachedUnshared(hash, expectedSize)
  inflight.set(hash, work)
  try {
    await work
  } finally {
    inflight.delete(hash)
  }
}

async function ensureCachedUnshared(hash: string, expectedSize?: number): Promise<void> {
  if (await hasBlob(hash)) return
  if (Platform.OS !== 'web') {
    try {
      await downloadToCache(hash, expectedSize)
      return
    } catch (err) {
      console.warn(`[store] native download failed for ${hash.slice(0, 8)}, falling back:`, err)
    }
  }
  const data = await fetchBlob(hash)
  await writeToCache(hash, data)
}

async function fetchBlob(hash: string): Promise<Uint8Array> {
  const url = hearthUrl(blobPath(hash))
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`blob ${hash.slice(0, 8)}: ${res.status}`)
    const buf = await res.arrayBuffer()
    return new Uint8Array(buf)
  } finally {
    clearTimeout(timeout)
  }
}

export async function getBlob(hash: string): Promise<Uint8Array> {
  const cached = await readFromCache(hash)
  if (cached) return cached
  await ensureBlobCached(hash)
  const data = await readFromCache(hash)
  if (data) return data
  // ensureBlobCached succeeded but the read failed (e.g. write quota on web) —
  // serve the bytes straight from the network rather than failing the caller.
  return fetchBlob(hash)
}

export async function getJson<T>(hash: string): Promise<T> {
  const bytes = await getBlob(hash)
  return JSON.parse(TEXT_DECODER.decode(bytes)) as T
}

export async function getText(hash: string): Promise<string> {
  const bytes = await getBlob(hash)
  return TEXT_DECODER.decode(bytes)
}

/** A URI that can be passed to Image source.uri (file:// on native, blob: on web). */
export async function blobUri(hash: string, mime = 'application/octet-stream'): Promise<string> {
  if (Platform.OS === 'web') {
    const bytes = await getBlob(hash)
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    return URL.createObjectURL(new Blob([buffer as ArrayBuffer], { type: mime }))
  }
  await ensureBlobCached(hash)
  return blobFile(hash).uri
}

export type PrefetchEntry = { hash: string; size?: number }

const PREFETCH_CONCURRENCY = 8

export async function prefetch(
  entries: PrefetchEntry[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  let done = 0
  let cursor = 0
  const total = entries.length

  async function worker(): Promise<void> {
    while (cursor < entries.length) {
      const i = cursor++
      try {
        // ensureBlobCached, not getBlob: pinned blobs (incl. multi-MB images)
        // go disk-to-disk and never cross the JS bridge.
        await ensureBlobCached(entries[i].hash, entries[i].size)
      } catch (err) {
        console.warn(`[store] prefetch ${entries[i].hash.slice(0, 8)}:`, err)
      }
      done++
      onProgress?.(done, total)
    }
  }

  await Promise.all(Array.from({ length: Math.min(PREFETCH_CONCURRENCY, total) }, worker))
}

type FsNode = {
  list?: () => FsNode[]
  name?: string
  size?: number
  modificationTime?: number | null
}

export type CachedBlob = { hash: string; size: number; mtime: number }

/** Lists every cached blob with its size + last-modified time. Native only. */
export async function listCachedBlobs(): Promise<CachedBlob[]> {
  if (Platform.OS === 'web') return []
  const root = blobsDir()
  if (!root.exists) return []
  const out: CachedBlob[] = []
  for (const lvl1 of root.list() as FsNode[]) {
    if (!lvl1.list) continue
    for (const lvl2 of lvl1.list()) {
      if (!lvl2.list) continue
      for (const f of lvl2.list()) {
        if (!f.list) {
          out.push({
            hash: f.name ?? '',
            size: f.size ?? 0,
            mtime: f.modificationTime ?? 0,
          })
        }
      }
    }
    // list() and the size/modificationTime getters are synchronous JSI calls;
    // a near-200MB cache means thousands of sync stats. Yield after each
    // level-1 shard so each uninterrupted burst is ~1/256th of the tree.
    await yieldToUI()
  }
  return out
}

export type CacheStats = {
  totalBytes: number
  blobCount: number
  pinnedBytes: number
}

/**
 * LRU eviction. Iterates oldest blobs first, deletes until total cache size
 * is under `budgetBytes`. Pinned blobs (hashes from `protectedHashes`) are
 * never deleted.
 *
 * Returns the new total size after eviction. Native only — on web the
 * browser's IndexedDB quota handles eviction natively and we no-op.
 */
export async function evictTo(
  budgetBytes: number,
  protectedHashes: ReadonlySet<string>,
): Promise<{ totalBytes: number; deleted: number }> {
  if (Platform.OS === 'web') {
    return { totalBytes: 0, deleted: 0 }
  }

  const blobs = await listCachedBlobs()
  let total = blobs.reduce((s, b) => s + b.size, 0)
  if (total <= budgetBytes) return { totalBytes: total, deleted: 0 }

  blobs.sort((a, b) => a.mtime - b.mtime)

  let deleted = 0
  for (const b of blobs) {
    if (total <= budgetBytes) break
    if (protectedHashes.has(b.hash)) continue
    try {
      await deleteBlob(b.hash)
      total -= b.size
      deleted++
      // delete() is a sync JSI call — yield periodically on big evictions.
      if (deleted % 32 === 0) await yieldToUI()
    } catch (err) {
      console.warn(`[store] evict ${b.hash.slice(0, 8)}:`, err)
    }
  }
  return { totalBytes: total, deleted }
}

export async function getCacheStats(protectedHashes: ReadonlySet<string>): Promise<CacheStats> {
  if (Platform.OS === 'web') {
    // Best-effort: use the Storage API if available
    try {
      const est = await (
        navigator as unknown as { storage?: { estimate?: () => Promise<{ usage?: number }> } }
      ).storage?.estimate?.()
      return { totalBytes: est?.usage ?? 0, blobCount: 0, pinnedBytes: 0 }
    } catch {
      return { totalBytes: 0, blobCount: 0, pinnedBytes: 0 }
    }
  }
  const blobs = await listCachedBlobs()
  let totalBytes = 0
  let pinnedBytes = 0
  for (const b of blobs) {
    totalBytes += b.size
    if (protectedHashes.has(b.hash)) pinnedBytes += b.size
  }
  return { totalBytes, blobCount: blobs.length, pinnedBytes }
}

export async function deleteBlob(hash: string): Promise<void> {
  if (Platform.OS === 'web') {
    await idbDeletePrefix(`blob:${hash}`)
    return
  }
  const f = blobFile(hash)
  if (f.exists) f.delete()
}
