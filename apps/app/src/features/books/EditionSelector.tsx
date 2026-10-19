import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PillSelector } from '@/components/PillSelector'
import type { BookEdition } from './editions'

/** The texts a book can be read in; nothing for a book with one. */
export function EditionSelector({
  editions,
  edition,
  onChange,
}: {
  editions: BookEdition[]
  edition: string
  onChange: (edition: string) => void
}) {
  const { t } = useTranslation()
  // The pill moves on the tap, ahead of the reader reopening on the new text.
  const [picked, setPicked] = useState(edition)
  useEffect(() => setPicked(edition), [edition])
  if (editions.length < 2) return null
  return (
    <PillSelector
      label={t('book.edition')}
      options={editions.map((e) => {
        const language = t(`languages.${e.language}`, { defaultValue: e.language })
        return { value: e.id, label: e.label ? `${language} — ${e.label}` : language }
      })}
      value={picked}
      onChange={(id) => {
        setPicked(id)
        onChange(id)
      }}
    />
  )
}
