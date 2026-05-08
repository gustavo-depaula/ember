import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as api from '@/fs/contentFs'
import { loc } from '@/lib/localize'
import styles from './TranslationReview.module.css'

export type BookOption = {
  bookId: string
  label: string
  languages: string[]
}

export function BookPicker({
  selected,
  onSelect,
}: {
  selected: { bookId: string } | undefined
  onSelect: (opt: BookOption) => void
}) {
  const { data: books } = useQuery({ queryKey: ['books'], queryFn: api.listBooks })

  const options: BookOption[] = useMemo(() => {
    const out: BookOption[] = []
    for (const book of books ?? []) {
      if (!book.languages || book.languages.length < 2) continue
      out.push({
        bookId: book.id,
        label: loc(book.name) || book.id,
        languages: book.languages,
      })
    }
    return out
  }, [books])

  const selectedKey = selected?.bookId ?? ''

  return (
    <label className={styles.bookPicker}>
      <span className={styles.pickerLabel}>Book</span>
      <select
        className={styles.pickerSelect}
        value={selectedKey}
        onChange={(e) => {
          const key = e.target.value
          if (!key) return
          const opt = options.find((o) => o.bookId === key)
          if (opt) onSelect(opt)
        }}
      >
        <option value="">Select a book…</option>
        {options.map((opt) => (
          <option key={opt.bookId} value={opt.bookId}>
            {opt.label} ({opt.languages.join(', ')})
          </option>
        ))}
      </select>
    </label>
  )
}
