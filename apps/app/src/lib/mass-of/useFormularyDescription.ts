import type { Localized } from '@ember/missal-schema'
import { useQuery } from '@tanstack/react-query'
import { loadMassFormulary } from './loaders'

/**
 * The "about this celebration" text from the day's Mass formulary — the same
 * canonical MR description the Mass renders. Keyed by the celebration's id
 * (which is its formulary ref). Returns `undefined` while warming, or when the
 * formulary carries no description (most are pt-BR only, so en-US callers should
 * fall back to the saint-of-the-day reflection).
 */
export function useFormularyDescription(ref: string | undefined) {
  return useQuery<Localized | undefined>({
    queryKey: ['formulary-description', ref],
    enabled: ref !== undefined,
    queryFn: async () => {
      if (!ref) return undefined
      const formulary = await loadMassFormulary(ref)
      return formulary?.description
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
}
