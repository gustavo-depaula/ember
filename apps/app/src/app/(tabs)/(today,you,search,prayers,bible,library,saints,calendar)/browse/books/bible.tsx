import { Stack, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageHeader, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { useBooks } from '@/features/bible'
import {
  BookRow,
  commentaries,
  languagesOf,
  roman,
  ShelfLabel,
  useShelf,
} from '@/features/books/shelf'

/**
 * The Bible, commented: pick one of its books and the commentaries on it line
 * up, the oldest voice first — Chrysostom and Augustine on St. John, then
 * Thomas, then Denis.
 */
export default function BibleCommentariesScreen() {
  const { t } = useTranslation()
  const params = useLocalSearchParams<{ book?: string }>()
  const shelf = useShelf()
  const { data: canon } = useBooks('drb')

  const { books: all, authorById } = shelf
  const centuryOf = (ref: string | undefined) => (ref ? authorById.get(ref)?.century : undefined)
  const byBibleBook = useMemo(
    () =>
      commentaries(all, (b) => (b.authorRef ? authorById.get(b.authorRef)?.century : undefined)),
    [all, authorById],
  )
  const busiest = [...byBibleBook].sort((a, b) => b[1].length - a[1].length)[0]?.[0]
  const [chosen, setChosen] = useState<string | undefined>(params.book)
  const selected = chosen ?? busiest

  const books = (canon ?? []).filter((b) => byBibleBook.has(b.id))
  const firstNew = books.findIndex((b) => b.id === 'matthew')
  const testaments = [
    { label: t('shelf.oldTestament'), books: books.slice(0, firstNew) },
    { label: t('shelf.newTestament'), books: books.slice(firstNew) },
  ]
  const voices = selected ? (byBibleBook.get(selected) ?? []) : []

  return (
    <ScreenLayout measure="wide">
      <Stack.Screen options={{ title: t('shelf.bible') }} />
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('shelf.bible')} />
        {testaments.map(({ label, books: testament }) => (
          <YStack key={label} gap="$sm">
            <ShelfLabel>{label}</ShelfLabel>
            <XStack flexWrap="wrap" columnGap="$md" rowGap="$xs">
              {testament.map((b) => {
                const isSelected = b.id === selected
                const name = t(`bookName.${b.id}`)
                return (
                  <AnimatedPressable
                    key={b.id}
                    onPress={() => setChosen(b.id)}
                    accessibilityRole="tab"
                    accessibilityLabel={name}
                    accessibilityState={{ selected: isSelected }}
                    hitSlop={6}
                  >
                    <XStack alignItems="baseline" gap={3} minHeight={30}>
                      <Typography
                        fontSize="$3"
                        color={isSelected ? '$accent' : undefined}
                        textDecorationLine={isSelected ? 'underline' : 'none'}
                      >
                        {name}
                      </Typography>
                      <Typography variant="caption" fontSize={11}>
                        {byBibleBook.get(b.id)?.length}
                      </Typography>
                    </XStack>
                  </AnimatedPressable>
                )
              })}
            </XStack>
          </YStack>
        ))}

        {selected ? (
          <YStack gap="$sm">
            <ShelfLabel>
              {t('shelf.commentaries', {
                book: t(`bookName.${selected}`),
                count: voices.length,
              })}
            </ShelfLabel>
            {voices.map((book) => {
              const century = centuryOf(book.authorRef)
              return (
                <BookRow
                  key={book.id}
                  book={book}
                  detail={[
                    book.author,
                    century ? t('shelf.century', { range: roman(century) }) : undefined,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  trailing={languagesOf(book)}
                />
              )
            })}
          </YStack>
        ) : (
          <Typography variant="caption">{t('shelf.pickBibleBook')}</Typography>
        )}
      </YStack>
    </ScreenLayout>
  )
}
