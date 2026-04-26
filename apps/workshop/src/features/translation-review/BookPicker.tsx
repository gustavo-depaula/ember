import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as api from '@/fs/contentFs'
import { loc } from '@/lib/localize'
import type { BookManifest } from '@/types/content'
import styles from './TranslationReview.module.css'

export type BookOption = {
  libraryId: string
  bookId: string
  label: string
  languages: string[]
}

export function BookPicker({
  selected,
  onSelect,
}: {
  selected: { libraryId: string; bookId: string } | undefined
  onSelect: (opt: BookOption) => void
}) {
  const { data: libraries } = useQuery({
    queryKey: ['libraries'],
    queryFn: api.listLibraries,
  })

  const libraryDetails = useQueries({
    queries: (libraries ?? []).map((lib) => ({
      queryKey: ['library', lib.id],
      queryFn: () => api.getLibrary(lib.id),
    })),
  })

  const options: BookOption[] = useMemo(() => {
    const out: BookOption[] = []
    for (const result of libraryDetails) {
      const lib = result.data
      if (!lib?._books) continue
      for (const book of lib._books as BookManifest[]) {
        if (!book.languages || book.languages.length < 2) continue
        out.push({
          libraryId: lib.id,
          bookId: book.id,
          label: loc(book.name) || book.id,
          languages: book.languages,
        })
      }
    }
    return out
  }, [libraryDetails])

  const selectedKey = selected ? `${selected.libraryId}::${selected.bookId}` : ''

  return (
    <label className={styles.bookPicker}>
      <span className={styles.pickerLabel}>Book</span>
      <select
        className={styles.pickerSelect}
        value={selectedKey}
        onChange={(e) => {
          const key = e.target.value
          if (!key) return
          const opt = options.find((o) => `${o.libraryId}::${o.bookId}` === key)
          if (opt) onSelect(opt)
        }}
      >
        <option value="">Select a book…</option>
        {options.map((opt) => (
          <option key={`${opt.libraryId}::${opt.bookId}`} value={`${opt.libraryId}::${opt.bookId}`}>
            {opt.label} ({opt.languages.join(', ')})
          </option>
        ))}
      </select>
    </label>
  )
}
