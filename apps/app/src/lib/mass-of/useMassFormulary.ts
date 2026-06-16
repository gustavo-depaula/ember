import type { MassFormulary } from '@ember/missal-schema'
import { useQuery } from '@tanstack/react-query'
import { loadMassFormulary } from './loaders'

/**
 * The day's Mass formulary, the canonical source of a celebration's title and
 * "about this celebration" description. Keyed by the celebration's id (which is
 * its formulary ref). Returns undefined while warming or for non-OF refs (e.g.
 * EF celebrations, which carry their title from the Divinum Officium engine).
 */
export function useMassFormulary(ref: string | undefined) {
  return useQuery<MassFormulary | undefined>({
    queryKey: ['mass-formulary', ref],
    enabled: ref !== undefined,
    queryFn: () => (ref ? loadMassFormulary(ref) : Promise.resolve(undefined)),
    staleTime: Number.POSITIVE_INFINITY,
  })
}
