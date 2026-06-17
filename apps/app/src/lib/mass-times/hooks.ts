import { useQuery } from '@tanstack/react-query'
import { fetchChurch, fetchNearbyChurches, type NearbyParams, searchChurches } from './client'

// Directory data is slow-changing; cache generously and let pinned favorites / details share it.
const staleTime = 5 * 60 * 1000

export function useNearbyChurches(params: NearbyParams | undefined) {
  return useQuery({
    queryKey: ['mass-times', 'near', params],
    queryFn: () => fetchNearbyChurches(params as NearbyParams),
    enabled: !!params,
    staleTime,
  })
}

export function useChurch(id: string | undefined) {
  return useQuery({
    queryKey: ['mass-times', 'church', id],
    queryFn: () => fetchChurch(id as string),
    enabled: !!id,
    staleTime,
  })
}

export function useChurchSearch(query: string) {
  const q = query.trim()
  return useQuery({
    queryKey: ['mass-times', 'search', q],
    queryFn: () => searchChurches(q),
    enabled: q.length >= 2,
    staleTime,
  })
}
