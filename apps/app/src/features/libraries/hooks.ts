import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchRegistry, getInstalledLibraries } from './libraryManager'

export function useInstalledLibraries() {
  return useQuery({
    queryKey: ['installed-libraries'],
    queryFn: getInstalledLibraries,
  })
}

export function useAvailableLibraries() {
  const { data: installed = [] } = useInstalledLibraries()
  const installedIds = useMemo(() => new Set(installed.map((l) => l.book_id)), [installed])

  return useQuery({
    queryKey: ['available-libraries', [...installedIds]],
    queryFn: fetchRegistry,
    select: (registry) => registry.libraries.filter((l) => !installedIds.has(l.id)),
  })
}
