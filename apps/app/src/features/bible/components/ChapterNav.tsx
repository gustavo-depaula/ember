import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

import type { Book } from '@/lib/content'

import { findAdjacentChapter, getBookName } from '../bookNav'

export function ChapterNav({
  bookId,
  chapter,
  books,
  onNavigate,
}: {
  bookId: string
  chapter: number
  books: Book[]
  onNavigate: (bookId: string, chapter: number) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const prev = findAdjacentChapter(bookId, chapter, books, 'prev')
  const next = findAdjacentChapter(bookId, chapter, books, 'next')

  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$md">
      {prev ? (
        <Pressable
          onPress={() => onNavigate(prev.bookId, prev.chapter)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.prevChapter')}
        >
          <XStack alignItems="center" gap="$xs">
            <ChevronLeft size={16} color={theme.accent.val} />
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {prev.bookId !== bookId
                ? getBookName(prev.bookId, t)
                : t('bible.chapterAbbr', { n: prev.chapter })}
            </Text>
          </XStack>
        </Pressable>
      ) : (
        <XStack />
      )}

      {next ? (
        <Pressable
          onPress={() => onNavigate(next.bookId, next.chapter)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.nextChapter')}
        >
          <XStack alignItems="center" gap="$xs">
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {next.bookId !== bookId
                ? getBookName(next.bookId, t)
                : t('bible.chapterAbbr', { n: next.chapter })}
            </Text>
            <ChevronRight size={16} color={theme.accent.val} />
          </XStack>
        </Pressable>
      ) : (
        <XStack />
      )}
    </XStack>
  )
}
