import type { MassFormulary } from '@ember/missal-schema'
import { useQuery } from '@tanstack/react-query'
import { loadMassFormulary } from './loaders'

/**
 * The day's Mass formulary, the canonical source of a celebration's title and
 * "about this celebration" description. Keyed by the celebration's id (which is
 * its formulary ref). Empty while warming and null for non-OF refs (e.g. EF
 * celebrations, which carry their title from the Divinum Officium engine).
 */
export function useMassFormulary(ref: string | undefined) {
  return useQuery<MassFormulary | null>({
    queryKey: ['mass-formulary', ref],
    enabled: ref !== undefined,
    queryFn: async () => (ref ? ((await loadMassFormulary(ref)) ?? null) : null),
    staleTime: Number.POSITIVE_INFINITY,
  })
}
