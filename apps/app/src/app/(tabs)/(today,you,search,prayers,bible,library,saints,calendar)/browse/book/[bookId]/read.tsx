import { useLocalSearchParams } from 'expo-router'

import { WindowInsets } from '@/components/TabBarInsets'
import { BookReader } from '@/features/books/reader'

export default function BookReaderScreen() {
  const { bookId, chapter, lang } = useLocalSearchParams<{
    bookId: string
    chapter?: string
    lang?: string
  }>()
  if (!bookId) return null
  // Router `navigate` reuses this screen when only params change; a new book
  // must not inherit the previous one's WebView, cursor and chapter index.
  return (
    // A full-screen modal: it covers the tab bar, wherever that floats.
    <WindowInsets>
      <BookReader key={`${bookId}/${lang ?? ''}`} bookId={bookId} chapter={chapter} lang={lang} />
    </WindowInsets>
  )
}
