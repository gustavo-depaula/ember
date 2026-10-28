import type { Formulary } from '@ember/missal'
import { useQuery } from '@tanstack/react-query'
import { loadMassFormulary } from './loaders'

export function useMassFormulary(id: string | undefined) {
  return useQuery<Formulary | null>({
    queryKey: ['mass-formulary', id],
    enabled: id !== undefined,
    queryFn: async () => (id ? ((await loadMassFormulary(id)) ?? null) : null),
    staleTime: Number.POSITIVE_INFINITY,
  })
}
