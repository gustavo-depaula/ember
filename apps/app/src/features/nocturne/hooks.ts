import { useMutation } from '@tanstack/react-query'

import { useEventStore } from '@/db/events'
import { prayCompline, revokeCompline } from '@/db/repositories'
import { useCurrentHour } from '@/hooks/useCurrentHour'
import { useLiturgicalTheme } from '@/hooks/useLiturgicalTheme'

import { type MarianAntiphon, marianAntiphonForSeason } from './antiphon'

export function useIsNocturneWindow(): boolean {
  return useCurrentHour() >= 21
}

export function useMarianAntiphon(): MarianAntiphon {
  const { season } = useLiturgicalTheme()
  return marianAntiphonForSeason(season)
}

export function useComplinePrayed(date: string): number | undefined {
  return useEventStore((s) => s.complinePrayed.get(date))
}

export function usePrayCompline() {
  return useMutation({ mutationFn: (date: string) => prayCompline(date) })
}

export function useRevokeCompline() {
  return useMutation({ mutationFn: (date: string) => revokeCompline(date) })
}
