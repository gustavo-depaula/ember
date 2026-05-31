import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { ensureManifestBody, getEntriesByKind, getEntry } from '@/content/contentIndex'
import type { CatalogEntry, PlanOfLifeTemplateManifest } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'

// The v1 browse ordering, sized to the likely audience (spec §6). Anything not
// listed sorts after, alphabetically — so a newly-authored template still shows.
const v1Order = [
  'beginner-minimum',
  'salesian',
  'opus-dei',
  'ignatian',
  'little-way',
  'marian-consecration',
  'sacred-heart',
  'carmelite',
  'dominican',
  'franciscan',
  'benedictine',
  'cursillo',
  'legion-of-mary',
  'sulpician',
  'byzantine',
]

export type TemplateListItem = { id: string; entry: CatalogEntry }

/**
 * List all `plan-of-life-template` catalog entries in the v1 ordering. Derived
 * from the live catalog, so the list fills in as deferred manifests warm
 * (keyed on `useCatalogVersion`). No manifest fetch — the catalog entry carries
 * the localized name / description / icon needed for the browse row.
 */
export function useTemplateList(): TemplateListItem[] {
  const catalogVersion = useCatalogVersion()
  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal.
  return useMemo(() => {
    const items = getEntriesByKind('plan-of-life-template').map(([id, entry]) => ({ id, entry }))
    const rank = (id: string) => {
      const slug = id.slice(id.indexOf('/') + 1)
      const i = v1Order.indexOf(slug)
      return i === -1 ? v1Order.length : i
    }
    return items.sort((a, b) => {
      const r = rank(a.id) - rank(b.id)
      return r !== 0 ? r : a.id.localeCompare(b.id)
    })
  }, [catalogVersion])
}

/**
 * Resolve a template's full manifest by bare id, fetching eagerly on mount so an
 * unwarmed template resolves fast (templates are a deferred kind). `entryExists`
 * is keyed on the catalog version, so a detail screen can tell "still warming"
 * from "genuinely unknown id" once the catalog has loaded.
 */
export function useTemplateManifest(bareId: string | undefined) {
  const catalogVersion = useCatalogVersion()
  const id = bareId ? `plan-of-life-template/${bareId}` : undefined
  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal.
  const entry = useMemo(() => (id ? getEntry(id) : undefined), [id, catalogVersion])
  const query = useQuery({
    queryKey: ['template-manifest', entry?.hash],
    queryFn: () => ensureManifestBody<PlanOfLifeTemplateManifest>(entry?.hash ?? ''),
    enabled: !!entry,
    staleTime: Number.POSITIVE_INFINITY,
  })
  // Catalog is warmed once any template entry is present; if none match this id
  // by then, treat it as unknown rather than perpetually loading.
  const catalogReady = getEntriesByKind('plan-of-life-template').length > 0
  return { ...query, entryExists: !!entry, catalogReady }
}
