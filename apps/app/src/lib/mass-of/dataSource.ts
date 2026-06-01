/**
 * Host implementation of `MassOfDataSource` — translates each typed
 * accessor call into a corpus read by id.
 *
 * Mass propers + OF library blobs are language-split (shape + per-language
 * blobs) and recombined via `loadMassProper`. OF data items (calendar,
 * saints, IGMR, sacerdotale) are single-blob payloads keyed with 2-letter
 * lang codes; we normalize those keys to BCP47 on the way out so callers
 * see the same `pt-BR`/`en-US` shape as the rest of the corpus.
 */

import type { LiturgicalEntry } from '@ember/liturgical'
import type { MassOfDataSource } from '@ember/mass-of'
import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import { normalizeLangKeys } from '@/content/langAliases'
import type { DataItemManifest } from '@/content/manifestTypes'
import { loadMassProper } from '@/content/resolver'
import { getJson } from '@/content/store'
import { fetchHearth } from '@/lib/hearth'

/**
 * Build a `MassOfDataSource` whose lang preferences are resolved at the
 * moment of each fetch — passing a getter rather than a snapshot lets the
 * source pick up runtime preference changes (the boot-time registration in
 * `register.ts` happens before the user can change languages, so we'd
 * otherwise be pinned to the bootstrap lang set forever).
 */
export function createCorpusMassOfDataSource(getLangs: () => string[]): MassOfDataSource {
  async function fetchLangSplit(id: string): Promise<unknown | undefined> {
    return getEntry(id) ? loadMassProper(id, getLangs()) : undefined
  }

  return {
    fetchMassProper: fetchLangSplit,
    fetchOrdinary: fetchLangSplit,
    fetchPreface: fetchLangSplit,
    fetchOfData: async (id) => {
      const entry = getEntry(id)
      if (!entry) return undefined
      const item = await ensureManifestBody<DataItemManifest>(entry.hash)
      const data = item.data ? await getJson(item.data.hash) : item
      return normalizeLangKeys(data)
    },
    fetchOfCalendar: () => fetchHearth<LiturgicalEntry[]>('liturgical/of-calendar.json'),
  }
}
