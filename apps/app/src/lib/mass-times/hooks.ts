import type { CorrectionBody, ServiceKind } from '@ember/api'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import {
  type Bbox,
  fetchChurch,
  fetchViewport,
  searchChurches,
  submitCorrection,
  uploadAttachment,
  verifyChurch,
} from './client'
import { getClientId } from './clientId'

// Directory data is slow-changing; cache generously and let pinned favorites / details share it.
const staleTime = 5 * 60 * 1000

// Rounded to ~100 m so tiny camera jitter reuses the cached viewport instead of refetching.
const round = (n: number) => Math.round(n * 1000) / 1000

export function useViewport(bbox: Bbox, kind?: ServiceKind, limit?: number) {
  const key = [round(bbox.minLng), round(bbox.minLat), round(bbox.maxLng), round(bbox.maxLat)]
  return useQuery({
    queryKey: ['mass-times', 'viewport', key, kind, limit],
    queryFn: () => fetchViewport(bbox, { kind, limit }),
    staleTime,
    // Keep the current pins while panning/zooming to a new viewport refetches — no flicker.
    placeholderData: keepPreviousData,
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

export function useChurchSearch(query: string, kind?: ServiceKind) {
  const q = query.trim()
  return useQuery({
    queryKey: ['mass-times', 'search', q, kind],
    queryFn: () => searchChurches(q, { kind }),
    enabled: q.length >= 2,
    staleTime,
  })
}

// Crowd-correction writes. The stable client id is resolved per call (cached after first read).
export function useVerifyChurch(id: string) {
  return useMutation({
    mutationFn: async () => verifyChurch(id, await getClientId()),
  })
}

export function useSubmitCorrection(id: string) {
  return useMutation({
    mutationFn: async (body: CorrectionBody) => submitCorrection(id, body, await getClientId()),
  })
}

export function useUploadAttachment(id: string) {
  return useMutation({
    mutationFn: async ({ uri, contentType }: { uri: string; contentType: string }) =>
      uploadAttachment(id, uri, contentType, await getClientId()),
  })
}
