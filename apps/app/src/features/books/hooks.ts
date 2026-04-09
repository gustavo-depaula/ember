import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  downloadAndInstallBook,
  fetchRegistry,
  getInstalledBooks,
  installFromLocalFile,
  removeBook,
  type InstalledBook,
  type RegistryEntry,
} from './bookManager'

export function useInstalledBooks() {
  return useQuery({
    queryKey: ['installed-books'],
    queryFn: getInstalledBooks,
  })
}

export function useAvailableBooks() {
  const { data: installed = [] } = useInstalledBooks()
  const installedIds = new Set(installed.map((b) => b.book_id))

  return useQuery({
    queryKey: ['available-books'],
    queryFn: fetchRegistry,
    select: (registry) => registry.books.filter((b) => !installedIds.has(b.id)),
  })
}

export function useDownloadBook() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<Record<string, number>>({})

  const mutation = useMutation({
    mutationFn: (entry: RegistryEntry) =>
      downloadAndInstallBook(entry, (p) => {
        setProgress((prev) => ({ ...prev, [entry.id]: p }))
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-books'] })
      queryClient.invalidateQueries({ queryKey: ['available-books'] })
    },
  })

  return { ...mutation, progress }
}

export function useImportBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (filePath: string) => installFromLocalFile(filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-books'] })
      queryClient.invalidateQueries({ queryKey: ['available-books'] })
    },
  })
}

export function useRemoveBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: string) => removeBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-books'] })
      queryClient.invalidateQueries({ queryKey: ['available-books'] })
    },
  })
}

export function isBookUpdateAvailable(
  installed: InstalledBook,
  registry: RegistryEntry[],
): string | undefined {
  const entry = registry.find((r) => r.id === installed.book_id)
  if (!entry) return undefined
  return entry.version !== installed.version ? entry.version : undefined
}
