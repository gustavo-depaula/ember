import type { Book } from '@/lib/content'

export function findAdjacentChapter(
  bookId: string,
  chapter: number,
  books: Book[],
  direction: 'prev' | 'next',
): { bookId: string; chapter: number } | undefined {
  const bookIndex = books.findIndex((b) => b.id === bookId)
  if (bookIndex === -1) return undefined

  const book = books[bookIndex]

  if (direction === 'next') {
    if (chapter < book.chapters) return { bookId, chapter: chapter + 1 }
    const nextBook = books[bookIndex + 1]
    if (nextBook) return { bookId: nextBook.id, chapter: 1 }
    return undefined
  }

  if (chapter > 1) return { bookId, chapter: chapter - 1 }
  const prevBook = books[bookIndex - 1]
  if (prevBook) return { bookId: prevBook.id, chapter: prevBook.chapters }
  return undefined
}

export function getBookName(bookId: string, books: Book[]): string {
  return books.find((b) => b.id === bookId)?.name ?? bookId
}
