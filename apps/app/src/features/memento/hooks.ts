import { useEffect, useState } from 'react'

import { useToday } from '@/hooks/useToday'

import { type Reflection, reflectionForDay } from './reflections'

export function useTodayReflection(): Reflection {
  const today = useToday()
  return reflectionForDay(today)
}

export function useIsMementoEvening(): boolean {
  const [evening, setEvening] = useState(() => new Date().getHours() >= 19)
  useEffect(() => {
    const id = setInterval(() => setEvening(new Date().getHours() >= 19), 60_000)
    return () => clearInterval(id)
  }, [])
  return evening
}
