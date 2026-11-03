import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import {
  AuthorFace,
  BookRow,
  GuideSectionView,
  languagesOf,
  roman,
  ShelfPage,
  useReadingGuide,
  useReadingTime,
  useShelf,
} from '@/features/books/shelf'

/**
 * One author's shelf: their face and century, then every work, in their
 * reading guide's order, or by title for an author with no guide yet.
 */
export default function AuthorScreen() {
  const { authorId } = useLocalSearchParams<{ authorId: string }>()
  const { t } = useTranslation()
  const shelf = useShelf()
  const readingTime = useReadingTime()
  const author = shelf.authorById.get(authorId)
  const guide = useReadingGuide(author)

  const header = author ? (
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

  if (guide.sections) {
    return (
      <ShelfPage
        title={author?.name ?? ''}
        header={header}
        data={guide.sections}
        keyExtractor={(section) => section.title}
        renderItem={({ item }) => (
          <YStack paddingBottom="$lg">
            <GuideSectionView section={item} />
          </YStack>
        )}
      />
    )
  }

  return (
    <ShelfPage
      title={author?.name ?? ''}
      header={header}
      data={guide.pending ? [] : (author?.books ?? [])}
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
