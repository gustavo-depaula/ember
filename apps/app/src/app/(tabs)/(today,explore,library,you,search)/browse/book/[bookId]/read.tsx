import { useLocalSearchParams } from 'expo-router'
import { BookReader } from '@/features/books/reader/BookReader'

export default function BookReaderScreen() {
  const { bookId, chapter } = useLocalSearchParams<{
    bookId: string
    chapter?: string
  }>()
  if (!bookId) return null
  return <BookReader bookId={bookId} initialChapterParam={chapter} />
}
