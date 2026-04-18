import { useCurrentHour } from '@/hooks/useCurrentHour'
import { useToday } from '@/hooks/useToday'

import { type Reflection, reflectionForDay } from './reflections'

export function useTodayReflection(): Reflection {
  const today = useToday()
  return reflectionForDay(today)
}

export function useIsMementoEvening(): boolean {
  return useCurrentHour() >= 19
}
