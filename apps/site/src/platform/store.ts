// Node stand-in for the app's on-device blob store: reads the built corpus
// from disk, and hands the browser the Hearth URL of a blob instead of a
// local file URI.
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { corpusRoot, hearthBase } from './paths'

export function blobPath(hash: string): string {
  return `blobs/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}`
}

const jsonCache = new Map<string, Promise<unknown>>()

export async function getBlob(hash: string): Promise<Uint8Array> {
  return new Uint8Array(await readFile(resolve(corpusRoot, blobPath(hash))))
}

export function getText(hash: string): Promise<string> {
  return readFile(resolve(corpusRoot, blobPath(hash)), 'utf-8')
}

export function getJson<T>(hash: string): Promise<T> {
  let pending = jsonCache.get(hash)
  if (!pending) {
    pending = getText(hash).then((text) => JSON.parse(text))
    jsonCache.set(hash, pending)
  }
  return pending as Promise<T>
}

export async function hasBlob(): Promise<boolean> {
  return true
}

export async function ensureBlobCached(): Promise<void> {}

export async function blobUri(hash: string): Promise<string> {
  return blobUrl(hash)
}

export function blobUrl(hash: string): string {
  return `${hearthBase}/${blobPath(hash)}`
}

export type PrefetchEntry = { hash: string; size?: number }

export async function prefetch(): Promise<void> {}
