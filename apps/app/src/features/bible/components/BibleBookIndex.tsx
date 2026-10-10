import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { useGridCells } from '@/components'
import { Typography } from '@/components/typography'
import type { Book } from '@/lib/content'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { type CanonDivisionId, divisionStartingAt } from '../canon'
import { useBooks } from '../hooks'
import { useOpenBiblePlace } from '../useOpenBiblePlace'

const columnGap = 32

/**
 * Every book of the Bible on the page, in columns under its division of the
 * canon — the website's Bible page. For a window with room; a phone reaches
 * the same list through the reader's drawer.
 */
export function BibleBookIndex() {
  const { t } = useTranslation()
  const translation = usePreferencesStore((s) => s.translation)
  const { data: books } = useBooks(translation)
  const openPlace = useOpenBiblePlace()
  const { cell } = useGridCells(190, columnGap, 2)

  const divisions = useMemo(() => {
    const out: Array<{ id: CanonDivisionId | undefined; books: Book[] }> = []
    for (const book of books ?? []) {
      const starts = divisionStartingAt(book.id)
      if (starts || out.length === 0) out.push({ id: starts, books: [] })
      out[out.length - 1].books.push(book)
    }
    return out
  }, [books])

  return (
    <YStack gap="$lg">
      {divisions.map((division) => (
        <YStack key={division.id ?? 'books'} gap="$xs">
          {division.id && (
            <Typography variant="marker" textAlign="left" fontSize={11}>
              {t(`bible.divisions.${division.id}`)}
            </Typography>
          )}
          <XStack flexWrap="wrap" columnGap={columnGap}>
            {division.books.map((book) => {
              const name = t(`bookName.${book.id}`, { defaultValue: book.name })
              return (
                <Pressable
                  key={book.id}
                  style={{ width: cell }}
                  onPress={() => openPlace(book.id, 1)}
                  accessibilityRole="link"
                  accessibilityLabel={name}
                >
                  <XStack
                    minHeight={44}
                    alignItems="center"
                    justifyContent="space-between"
                    borderBottomWidth={0.5}
                    borderBottomColor="$borderColor"
                  >
                    <Typography fontSize="$3" numberOfLines={1} flexShrink={1}>
                      {name}
                    </Typography>
                    <Typography variant="annotation">{book.chapters}</Typography>
                  </XStack>
                </Pressable>
              )
            })}
          </XStack>
        </YStack>
      ))}
    </YStack>
  )
}
