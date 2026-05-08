/**
 * Content-addressed blob cache. Hashes never change for a given content, so
 * cache hits never expire. Native: filesystem under `documentDirectory/blobs/`.
 * Web: IndexedDB at key `blob:{hash}`.
 */

import { Platform } from 'react-native'
import { hearthUrl } from '@/lib/hearth'
import { idbDeletePrefix, idbReadBinary, idbWriteFile } from '@/lib/idb-fs'

const nativeFs =
  Platform.OS !== 'web'
    ? (require('expo-file-system') as typeof import('expo-file-system'))
    : undefined

const inlineBlobs = new Map<string, Uint8Array>()

// Concurrent getBlob(h) calls share one fetch.
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
  const dir = new Directory(Paths.document, `blobs/${hash.slice(0, 2)}/${hash.slice(2, 4)}/`)
  dir.create({ intermediates: true, idempotent: true })
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
  await getBlob(hash)
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
        await getBlob(entries[i].hash)
      } catch (err) {
        console.warn(`[store] prefetch ${entries[i].hash.slice(0, 8)}:`, err)
      }
      done++
      onProgress?.(done, total)
    }
  }

  await Promise.all(Array.from({ length: Math.min(PREFETCH_CONCURRENCY, total) }, worker))
}

type FsNode = { list?: () => FsNode[]; name?: string; size?: number }

/** Lists every cached blob with its size. Native only — web returns []. */
export async function listCachedBlobs(): Promise<{ hash: string; size: number }[]> {
  if (Platform.OS === 'web') return []
  const root = blobsDir()
  if (!root.exists) return []
  const out: { hash: string; size: number }[] = []
  for (const lvl1 of root.list() as FsNode[]) {
    if (!lvl1.list) continue
    for (const lvl2 of lvl1.list()) {
      if (!lvl2.list) continue
      for (const f of lvl2.list()) {
        if (!f.list) out.push({ hash: f.name ?? '', size: f.size ?? 0 })
      }
    }
  }
  return out
}

export async function deleteBlob(hash: string): Promise<void> {
  if (Platform.OS === 'web') {
    await idbDeletePrefix(`blob:${hash}`)
    return
  }
  const f = blobFile(hash)
  if (f.exists) f.delete()
}
