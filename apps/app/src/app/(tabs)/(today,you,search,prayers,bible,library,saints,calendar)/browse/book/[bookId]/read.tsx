import { useLocalSearchParams } from 'expo-router'

import { WindowInsets } from '@/components/TabBarInsets'
import { BookReader } from '@/features/books/reader'

export default function BookReaderScreen() {
  const { bookId, chapter } = useLocalSearchParams<{ bookId: string; chapter?: string }>()
  if (!bookId) return null
  // Router `navigate` reuses this screen when only params change; a new book
  // must not inherit the previous one's WebView, cursor and chapter index.
  return (
    // A full-screen modal: it covers the tab bar, wherever that floats.
    <WindowInsets>
      <BookReader key={bookId} bookId={bookId} chapter={chapter} />
    </WindowInsets>
  )
}
