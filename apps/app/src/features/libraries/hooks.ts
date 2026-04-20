import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  downloadAndInstallLibrary,
  fetchRegistry,
  getInstalledLibraries,
  installFromLocalFile,
  isLibraryUpdateAvailable,
  type RegistryEntry,
  removeLibrary,
  updateLibrary,
} from './libraryManager'

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

export function useDownloadLibrary() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<Record<string, number>>({})

  const mutation = useMutation({
    mutationFn: (entry: RegistryEntry) =>
      downloadAndInstallLibrary(entry, (p) => {
        setProgress((prev) => ({ ...prev, [entry.id]: p }))
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-libraries'] })
      queryClient.invalidateQueries({ queryKey: ['available-libraries'] })
    },
  })

  return { ...mutation, progress }
}

export function useImportLibrary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (filePath: string) => installFromLocalFile(filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-libraries'] })
      queryClient.invalidateQueries({ queryKey: ['available-libraries'] })
    },
  })
}

export function useRemoveLibrary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (libraryId: string) => removeLibrary(libraryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-libraries'] })
      queryClient.invalidateQueries({ queryKey: ['available-libraries'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}

export function useLibraryUpdates() {
  const { data: installed = [] } = useInstalledLibraries()

  return useQuery({
    queryKey: ['library-updates', installed.map((l) => l.content_hash)],
    queryFn: async () => {
      const registry = await fetchRegistry()
      const updates: RegistryEntry[] = []
      for (const library of installed) {
        const entry = isLibraryUpdateAvailable(library, registry.libraries)
        if (entry) updates.push(entry)
      }
      return updates
    },
    enabled: installed.length > 0,
  })
}

export function useUpdateLibrary() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<Record<string, number>>({})

  const mutation = useMutation({
    mutationFn: (entry: RegistryEntry) =>
      updateLibrary(entry, (p) => {
        setProgress((prev) => ({ ...prev, [entry.id]: p }))
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-libraries'] })
      queryClient.invalidateQueries({ queryKey: ['available-libraries'] })
      queryClient.invalidateQueries({ queryKey: ['library-updates'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })

  return { ...mutation, progress }
}
