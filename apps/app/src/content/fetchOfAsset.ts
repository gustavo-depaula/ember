/**
 * Path-string → corpus-id router. The `mass-of` package builds its asset
 * references as paths (`of/masses/tempore/...json`, `of/library/preface/...json`)
 * via `EngineContext.fetchAsset(path)`. This module maps those paths to corpus
 * ids, fetches the relevant blobs, and recombines per-language Mass-proper
 * splits back into the multilingual shape mass-of expects.
 */

import { ensureManifestBody, getEntry } from './contentIndex'
import type { DataItemManifest } from './manifestTypes'
import { loadMassProper } from './resolver'
import { getJson } from './store'

const OF_DATA_SUBPATHS = new Set(['calendar', 'saints', 'igmr', 'sacerdotale'])

export async function fetchOfAsset(path: string, langs: string[]): Promise<unknown | undefined> {
  let trimmed = path.replace(/\.json$/, '').replace(/^\/+/, '')
  if (trimmed.startsWith('of/')) trimmed = trimmed.slice(3)

  const root = trimmed.split('/', 1)[0]
  if (OF_DATA_SUBPATHS.has(root)) {
    const id = `of-data/${trimmed}`
    const entry = getEntry(id)
    if (!entry) return undefined
    const item = await ensureManifestBody<DataItemManifest>(entry.hash)
    return item.data ? getJson(item.data.hash) : item
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
