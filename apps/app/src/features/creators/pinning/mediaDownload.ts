/**
 * Download a media URL to the same content-addressed blob store the corpus
 * uses. The hash is `sha256(url)` so re-pinning the same URL is idempotent
 * and survives reinstalls when the documents directory is restored from
 * device backup.
 */

import { Platform } from 'react-native'

import { blobPath } from '@/content/store'
import { idbReadBinary, idbWriteFile } from '@/lib/idb-fs'
import { sha256Hex } from '@/lib/sha256'

const nativeFs =
  Platform.OS !== 'web'
    ? (require('expo-file-system') as typeof import('expo-file-system'))
    : undefined

export async function downloadMediaUrl(url: string): Promise<{ hash: string; size: number }> {
  const hash = await sha256Hex(url)
  if (Platform.OS === 'web') {
    const existing = await idbReadBinary(`blob:${hash}`)
    if (existing) return { hash, size: existing.byteLength }
    const res = await fetch(url)
    if (!res.ok) throw new Error(`media ${url}: ${res.status}`)
    const buf = new Uint8Array(await res.arrayBuffer())
    await idbWriteFile(`blob:${hash}`, buf)
    return { hash, size: buf.byteLength }
  }
  if (!nativeFs) throw new Error('mediaDownload: native fs unavailable')
  const { Directory, File: NativeFile, Paths } = nativeFs
  const file = new NativeFile(Paths.document, blobPath(hash))
  if (file.exists) return { hash, size: file.size ?? 0 }
  const dir = new Directory(Paths.document, `blobs/${hash.slice(0, 2)}/${hash.slice(2, 4)}/`)
  dir.create({ intermediates: true, idempotent: true })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`media ${url}: ${res.status}`)
  const buf = new Uint8Array(await res.arrayBuffer())
  file.write(buf)
  return { hash, size: buf.byteLength }
}

export function pinnedMediaUri(hash: string): string | undefined {
  if (Platform.OS === 'web') return undefined
  if (!nativeFs) return undefined
  const { File: NativeFile, Paths } = nativeFs
  const file = new NativeFile(Paths.document, blobPath(hash))
  return file.exists ? file.uri : undefined
}
