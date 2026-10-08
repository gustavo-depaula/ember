import type { CorrectionBody, ServiceKind } from '@ember/api'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { clearCacheOlderThan, getCachedWithAge, setCache } from '@/db/repositories'
import {
  type Bbox,
  fetchChurch,
  fetchTile,
  searchChurches,
  submitCorrection,
  uploadAttachment,
  verifyChurch,
} from './client'
import { getClientId } from './clientId'
import { drawView, planView, ringAround, type Tile, tilePath } from './tiles'

// Directory data is slow-changing; cache generously and let pinned favorites / details share it.
const staleTime = 5 * 60 * 1000

// A tile kept on the device is the map's answer for a day without a request: church data changes
// by the day, and opening the map where it was last looked at should not wait on the network.
// Older than that it is asked for again, and still shown if the network has no answer.
const tileKeptMs = 24 * 60 * 60 * 1000
// Tiles nobody has looked at for a month are dropped, so a traveller's map does not grow forever.
const tileDroppedMs = 30 * tileKeptMs
const tileKey = 'mass-times:tile:'

let pruned = false
async function loadTile(path: string): Promise<Tile> {
  if (!pruned) {
    pruned = true
    await clearCacheOlderThan(tileKey, Date.now() - tileDroppedMs)
  }
  const kept = await getCachedWithAge<Tile>(tileKey + path)
  if (kept && Date.now() - kept.cachedAt < tileKeptMs) return kept.data
  const fetched = await fetchTile(path).catch((error: unknown) => {
    if (kept) return kept.data
    throw error
  })
  await setCache(tileKey + path, fetched)
  return fetched
}

const tileQuery = (path: string) => ({
  queryKey: ['mass-times', 'tile', path],
  queryFn: () => loadTile(path),
  staleTime: tileKeptMs,
})

// A map view drawn from church tiles: the churches to list and the markers to draw, from whichever
// of the view's tiles have arrived. Tiles already in hand draw at once, so a pan waits only for the
// cells it uncovers — and those around the view are fetched ahead of it.
export function useMapView(bbox: Bbox, pxPerDeg: number, kind?: ServiceKind) {
  const queryClient = useQueryClient()
  const { minLng, minLat, maxLng, maxLat } = bbox
  // biome-ignore lint/correctness/useExhaustiveDependencies: the box by its edges, not its identity
  const plan = useMemo(() => planView(bbox), [minLng, minLat, maxLng, maxLat])
  const paths = useMemo(
    () => plan.tiles.map((cell) => tilePath(cell, plan.mode, kind)),
    [plan, kind],
  )
  const { tiles, isError, isFetching, refetch } = useQueries({
    queries: paths.map(tileQuery),
    combine: (results) => ({
      tiles: results.map((r) => r.data),
      isError: results.some((r) => r.isError),
      isFetching: results.some((r) => r.isFetching),
      refetch: () => {
        for (const r of results) if (r.isError) void r.refetch()
      },
    }),
  })

  useEffect(() => {
    for (const cell of ringAround({ minLng, minLat, maxLng, maxLat }, plan)) {
      void queryClient.prefetchQuery(tileQuery(tilePath(cell, 'detail')))
    }
  }, [queryClient, plan, minLng, minLat, maxLng, maxLat])

  // biome-ignore lint/correctness/useExhaustiveDependencies: the box by its edges, not its identity
  const view = useMemo(
    () => drawView({ plan, tiles, bbox, pxPerDeg, kind }),
    [plan, tiles, minLng, minLat, maxLng, maxLat, pxPerDeg, kind],
  )
  return { view, isError, isFetching, refetch }
}

export function useChurch(id: string | undefined) {
  return useQuery({
    queryKey: ['mass-times', 'church', id],
    queryFn: () => fetchChurch(id as string),
    enabled: !!id,
    staleTime,
  })
}

// Ranked nearest `near` (the map center) first. Rounded to ~10 km so panning the map doesn't refetch
// a search whose ranking barely changes.
export function useChurchSearch(
  query: string,
  kind?: ServiceKind,
  near?: { lat: number; lng: number },
) {
  const q = query.trim()
  const at = near
    ? { lat: Math.round(near.lat * 10) / 10, lng: Math.round(near.lng * 10) / 10 }
    : undefined
  return useQuery({
    queryKey: ['mass-times', 'search', q, kind, at?.lat, at?.lng],
    queryFn: () => searchChurches(q, { kind, near: at }),
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
