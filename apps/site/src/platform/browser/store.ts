// `@/content/store` in the browser: the corpus is published beside the site,
// and its blobs never change for a hash, so the browser's own HTTP cache is
// the blob cache.
const hearthBase = '/hearth/v2'

export function blobPath(hash: string): string {
  return `blobs/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}`
}

async function fetchBlob(hash: string): Promise<Response> {
  const res = await fetch(`${hearthBase}/${blobPath(hash)}`)
  if (!res.ok) throw new Error(`blob ${hash.slice(0, 8)}: ${res.status}`)
  return res
}

const jsonCache = new Map<string, Promise<unknown>>()

export async function getBlob(hash: string): Promise<Uint8Array> {
  return new Uint8Array(await (await fetchBlob(hash)).arrayBuffer())
}

export async function getText(hash: string): Promise<string> {
  return (await fetchBlob(hash)).text()
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
  return false
}

export async function ensureBlobCached(): Promise<void> {}

export async function blobUri(hash: string): Promise<string> {
  return `${hearthBase}/${blobPath(hash)}`
}

export type PrefetchEntry = { hash: string; size?: number }

export async function prefetch(): Promise<void> {}
