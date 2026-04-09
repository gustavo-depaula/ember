import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  downloadAndInstallBook,
  fetchRegistry,
  getInstalledBooks,
  installFromLocalFile,
  isBookUpdateAvailable,
  type RegistryEntry,
  removeBook,
  updateBook,
} from './bookManager'

export function useInstalledBooks() {
  return useQuery({
    queryKey: ['installed-books'],
    queryFn: getInstalledBooks,
  })
}

export function useAvailableBooks() {
  const { data: installed = [] } = useInstalledBooks()
  const installedIds = useMemo(() => new Set(installed.map((b) => b.book_id)), [installed])

  return useQuery({
    queryKey: ['available-books', [...installedIds]],
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
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}

export function useBookUpdates() {
  const { data: installed = [] } = useInstalledBooks()

  return useQuery({
    queryKey: ['book-updates', installed.map((b) => b.content_hash)],
    queryFn: async () => {
      const registry = await fetchRegistry()
      const updates: RegistryEntry[] = []
      for (const book of installed) {
        const entry = isBookUpdateAvailable(book, registry.books)
        if (entry) updates.push(entry)
      }
      return updates
    },
    enabled: installed.length > 0,
  })
}

export function useUpdateBook() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<Record<string, number>>({})

  const mutation = useMutation({
    mutationFn: (entry: RegistryEntry) =>
      updateBook(entry, (p) => {
        setProgress((prev) => ({ ...prev, [entry.id]: p }))
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installed-books'] })
      queryClient.invalidateQueries({ queryKey: ['available-books'] })
      queryClient.invalidateQueries({ queryKey: ['book-updates'] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })

  return { ...mutation, progress }
}
