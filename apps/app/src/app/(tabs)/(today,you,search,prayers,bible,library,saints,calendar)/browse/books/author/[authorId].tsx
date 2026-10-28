import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import {
  AuthorFace,
  BookRow,
  languagesOf,
  roman,
  ShelfPage,
  useReadingTime,
  useShelf,
} from '@/features/books/shelf'

/** One author's shelf: their face and century, then every work, by title. */
export default function AuthorScreen() {
  const { authorId } = useLocalSearchParams<{ authorId: string }>()
  const { t } = useTranslation()
  const shelf = useShelf()
  const readingTime = useReadingTime()
  const author = shelf.authorById.get(authorId)

  return (
    <ShelfPage
      title={author?.name ?? ''}
      header={
        author ? (
          <XStack gap="$md" alignItems="center">
            <AuthorFace author={author} size={72} />
            <YStack>
              {author.century ? (
                <Typography variant="caption">
                  {t('shelf.century', { range: roman(author.century) })}
                </Typography>
              ) : null}
              <Typography variant="caption">
                {t('shelf.works', { count: author.books.length })}
              </Typography>
            </YStack>
          </XStack>
        ) : undefined
      }
      data={author?.books ?? []}
      keyExtractor={(book) => book.id}
      renderItem={({ item }) => (
        <BookRow
          book={item}
          detail={[readingTime(item.minutes), languagesOf(item)].filter(Boolean).join(' · ')}
        />
      )}
    />
  )
}
