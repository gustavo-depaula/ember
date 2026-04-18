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
