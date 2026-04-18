import { useCurrentHour } from '@/hooks/useCurrentHour'

export function useIsNocturneWindow(): boolean {
  return useCurrentHour() >= 21
}
