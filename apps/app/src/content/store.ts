/**
 * Content-addressed blob store for Hearth v2.
 *
 * Blobs are addressed by SHA-256 hash. Once fetched, a blob is cached forever
 * (the bytes never change for a given hash). Native uses the filesystem at
 * `documentDirectory/blobs/{ab}/{cd}/{hash}`; web uses IndexedDB at key
 * `blob:{hash}`.
 *
 * Pinning + LRU eviction is intentionally NOT tracked in SQLite — instead,
 * the pinned-items list lives in `preferences['pinned-items']` and pinned
 * hashes are recomputed from manifests when needed.
 */

import { Platform } from 'react-native'
import { hearthUrl } from '@/lib/hearth'
import { idbReadBinary, idbWriteFile } from '@/lib/idb-fs'

// Native-only — conditionally required so this module can compile on web
const nativeFs =
  Platform.OS !== 'web'
    ? (require('expo-file-system') as typeof import('expo-file-system'))
    : undefined

/** Synthetic blobs registered in-memory (e.g. starter pack). */
const inlineBlobs = new Map<string, Uint8Array>()

/** In-flight fetch dedup so concurrent getBlob('abc') calls share one fetch. */
const inflight = new Map<string, Promise<Uint8Array>>()

const TEXT_DECODER = new TextDecoder()

function blobPath(hash: string): string {
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

export function registerStaticBlob(hash: string, data: Uint8Array): void {
  inlineBlobs.set(hash, data)
}

export async function hasBlob(hash: string): Promise<boolean> {
  if (inlineBlobs.has(hash)) return true
  if (Platform.OS === 'web') {
    const bytes = await idbReadBinary(`blob:${hash}`)
    return bytes !== undefined
  }
  return blobFile(hash).exists
}

async function readFromCache(hash: string): Promise<Uint8Array | undefined> {
  if (inlineBlobs.has(hash)) return inlineBlobs.get(hash)!
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

async function writeToCache(hash: string, data: Uint8Array): Promise<void> {
  if (Platform.OS === 'web') {
    await idbWriteFile(`blob:${hash}`, data)
    return
  }
  const { Directory, Paths } = nativeFs!
  const root = blobsDir()
  if (!root.exists) root.create()
  const lvl1 = new Directory(Paths.document, `blobs/${hash.slice(0, 2)}/`)
  if (!lvl1.exists) lvl1.create()
  const lvl2 = new Directory(Paths.document, `blobs/${hash.slice(0, 2)}/${hash.slice(2, 4)}/`)
  if (!lvl2.exists) lvl2.create()
  blobFile(hash).write(data)
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

  let pending = inflight.get(hash)
  if (!pending) {
    pending = (async () => {
      const data = await fetchBlob(hash)
      try {
        await writeToCache(hash, data)
      } catch (err) {
        console.warn(`[store] write failed for ${hash.slice(0, 8)}:`, err)
      }
      return data
    })()
    inflight.set(hash, pending)
    try {
      return await pending
    } finally {
      inflight.delete(hash)
    }
  }
  return pending
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
  // Ensure the blob is on disk so the file:// URI is valid.
  await getBlob(hash)
  return blobFile(hash).uri
}

export type PrefetchEntry = { hash: string; size?: number }

export async function prefetch(
  entries: PrefetchEntry[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  let done = 0
  const total = entries.length
  // Cap concurrency to avoid hammering the network.
  const concurrency = 8
  let cursor = 0

  async function worker(): Promise<void> {
    while (cursor < entries.length) {
      const i = cursor++
      try {
        await getBlob(entries[i].hash)
      } catch (err) {
        console.warn(`[store] prefetch ${entries[i].hash.slice(0, 8)}:`, err)
      }
      done++
      onProgress?.(done, total)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, worker))
}

/**
 * Walk all blob files (native) or IDB entries (web), return a list with sizes.
 * Used by GC and offline-mode bookkeeping.
 */
export async function listCachedBlobs(): Promise<{ hash: string; size: number }[]> {
  if (Platform.OS === 'web') {
    // No efficient prefix-list with sizes from the existing idb-fs API; skip
    // for v0. GC on web can simply rebuild the blob set on demand.
    return []
  }
  const root = blobsDir()
  if (!root.exists) return []
  const out: { hash: string; size: number }[] = []
  for (const lvl1 of root.list() as Array<{
    list?: () => any[]
    uri?: string
    name?: string
  }>) {
    if (!lvl1.list) continue
    for (const lvl2 of lvl1.list()) {
      if (!lvl2.list) continue
      for (const f of lvl2.list()) {
        if (!f.list) {
          out.push({ hash: f.name ?? '', size: f.size ?? 0 })
        }
      }
    }
  }
  return out
}

export async function deleteBlob(hash: string): Promise<void> {
  if (Platform.OS === 'web') {
    // idb-fs does not expose a single-key delete; using prefix delete is
    // workable since key is exactly `blob:{hash}`.
    const { idbDeletePrefix } = await import('@/lib/idb-fs')
    await idbDeletePrefix(`blob:${hash}`)
    return
  }
  const f = blobFile(hash)
  if (f.exists) f.delete()
}
