import { useQuery } from '@tanstack/react-query'

import { loadCcc } from '@/lib/catechism'

import { buildSegments, type CccSegment } from './segments'

export function useSegments() {
  return useQuery({
    queryKey: ['catechism', 'segments'],
    queryFn: () => buildSegments(),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useSegment(segment: CccSegment | undefined) {
  return useQuery({
    queryKey: ['catechism', 'segment', segment?.startParagraph],
    queryFn: async () => {
      if (!segment) return []
      const ccc = await loadCcc()
      const startIndex = segment.startParagraph - 1
      return ccc.slice(startIndex, startIndex + segment.paragraphCount)
    },
    enabled: !!segment,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
