/**
 * v1-asset-path → v2-corpus-id router used by both `engineContext` (during
 * flow rendering) and the standalone gospel-of-the-day hook. Translates legacy
 * paths like `of/masses/tempore/...json` and `of/library/preface/preface.pf001.json`
 * into corpus ids, fetches the relevant blobs, and recombines per-language
 * Mass-proper splits back into the multilingual shape mass-of expects.
 */

import { getEntry, getRememberedManifest, rememberManifestBody } from './contentIndex'
import { loadMassProper } from './resolver'
import { getJson } from './store'

export async function fetchOfAsset(path: string, langs: string[]): Promise<unknown | undefined> {
  let trimmed = path.replace(/\.json$/, '').replace(/^\/+/, '')
  if (trimmed.startsWith('of/')) trimmed = trimmed.slice(3)

  for (const sub of ['calendar', 'saints', 'igmr', 'sacerdotale']) {
    if (trimmed.startsWith(`${sub}/`) || trimmed === sub) {
      const id = `of-data/${trimmed}`
      const entry = getEntry(id)
      if (!entry) return undefined
      const item = await ensureManifest(entry.hash)
      const inner = (item as { data?: { hash: string } }).data
      if (!inner) return item
      return getJson(inner.hash)
    }
  }

  if (trimmed.startsWith('library/')) {
    const id = `of/${trimmed.slice('library/'.length)}`
    return getEntry(id) ? loadMassProper(id, langs) : undefined
  }

  if (trimmed.startsWith('masses/')) {
    const id = `mass/of/${trimmed.slice('masses/'.length)}`
    return getEntry(id) ? loadMassProper(id, langs) : undefined
  }

  return undefined
}

async function ensureManifest(hash: string): Promise<unknown> {
  const cached = getRememberedManifest<unknown>(hash)
  if (cached) return cached
  const fetched = await getJson<unknown>(hash)
  rememberManifestBody(hash, fetched)
  return fetched
}
