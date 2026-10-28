import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BookRow,
  languagesOf,
  ShelfPage,
  shortReads,
  useReadingTime,
  useShelf,
} from '@/features/books/shelf'

/** "Numa tarde só": every book under an hour, the shortest first. Nobody writes this list; reading time does. */
export default function ShortReadsScreen() {
  const { t } = useTranslation()
  const shelf = useShelf()
  const readingTime = useReadingTime()
  const books = useMemo(() => shortReads(shelf.books), [shelf.books])

  return (
    <ShelfPage
      title={t('shelf.shortReads')}
      lede={t('shelf.shortReadsLede')}
      data={books}
      keyExtractor={(book) => book.id}
      renderItem={({ item }) => (
        <BookRow
          book={item}
          detail={[item.author, languagesOf(item)].filter(Boolean).join(' · ')}
          trailing={readingTime(item.minutes)}
        />
      )}
    />
  )
}
