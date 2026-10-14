// `@/lib/hearth` in the browser: the corpus is published beside the site.
const hearthBase = '/hearth/v2'

export async function initHearth(): Promise<void> {}

export function isLocalHearth(): boolean {
  return false
}

export function hearthUrl(path: string): string {
  return `${hearthBase}/${path.replace(/^\//, '')}`
}

export function hearthAssetUrl(path: string): string {
  return hearthUrl(path)
}

const cache = new Map<string, Promise<unknown>>()

export function fetchHearth<T>(path: string): Promise<T> {
  let pending = cache.get(path)
  if (!pending) {
    pending = fetch(hearthUrl(path)).then((res) => {
      if (!res.ok) throw new Error(`${path}: ${res.status}`)
      return res.json()
    })
    cache.set(path, pending)
  }
  return pending as Promise<T>
}
