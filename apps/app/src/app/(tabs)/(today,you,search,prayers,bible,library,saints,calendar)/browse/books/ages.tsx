import { useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import {
  type Age,
  AuthorTile,
  ageOf,
  ageRange,
  ages,
  BookRow,
  ShelfLabel,
  ShelfPage,
  ShelfTabs,
  useReadingTime,
  useShelf,
} from '@/features/books/shelf'

/** The library sliced by age: pick one, see its authors, then its books, the shortest first. */
export default function AgesScreen() {
  const { t } = useTranslation()
  const params = useLocalSearchParams<{ age?: string }>()
  const shelf = useShelf()
  const readingTime = useReadingTime()
  const [chosen, setChosen] = useState<Age['id'] | undefined>(params.age as Age['id'] | undefined)

  const authorsByAge = useMemo(() => {
    const out = new Map<Age['id'], typeof shelf.authors>()
    for (const author of shelf.authors) {
      const age = author.century ? ageOf(author.century) : undefined
      if (!age) continue
      out.set(age.id, [...(out.get(age.id) ?? []), author])
    }
    return out
  }, [shelf.authors])

  const present = ages.filter((a) => authorsByAge.has(a.id))
  const selected = chosen ?? present[0]?.id
  const authors = (selected ? (authorsByAge.get(selected) ?? []) : []).sort(
    (a, b) => b.books.length - a.books.length,
  )
  const books = authors
    .flatMap((a) => a.books)
    .sort((a, b) => (a.minutes ?? Infinity) - (b.minutes ?? Infinity))
  const count = (id: Age['id']) =>
    (authorsByAge.get(id) ?? []).reduce((n, a) => n + a.books.length, 0)

  return (
    <ShelfPage
      title={t('shelf.ages')}
      header={
        <YStack gap="$lg">
          <ShelfTabs
            options={present.map((age) => ({
              value: age.id,
              label: ageRange(age),
              detail: String(count(age.id)),
            }))}
            value={selected}
            onChange={setChosen}
          />
          <XStack flexWrap="wrap" columnGap="$sm" rowGap="$md">
            {authors.map((author) => (
              <AuthorTile key={author.id} author={author} />
            ))}
          </XStack>
          <ShelfLabel>{t('shelf.shortestFirst')}</ShelfLabel>
        </YStack>
      }
      data={books}
      keyExtractor={(book) => book.id}
      renderItem={({ item }) => (
        <BookRow book={item} detail={item.author} trailing={readingTime(item.minutes)} />
      )}
    />
  )
}
