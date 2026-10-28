import { useQuery } from '@tanstack/react-query'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageHeader, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import type { CollectionBlock, CollectionItemManifest } from '@/content/manifestTypes'
import {
  BookThumb,
  bookHref,
  type ShelfBook,
  useReadingTime,
  useShelf,
} from '@/features/books/shelf'
import { localizeContent } from '@/lib/i18n'

type Item = { ref: string; why?: string }

function itemsOf(blocks: CollectionBlock[]): Item[] {
  return blocks.flatMap((block): Item[] => {
    if (block.kind === 'section') return itemsOf(block.blocks)
    if (block.kind !== 'item') return []
    const why = block.annotation?.context
    return [{ ref: block.ref, why: why ? localizeContent(why) : undefined }]
  })
}

/** A written reading list: its books numbered, in the order to read them, each saying why it's there. */
export default function ReadingListScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>()
  const { t } = useTranslation()
  const shelf = useShelf()
  const readingTime = useReadingTime()
  const entry = getEntry(`collection/${listId}`)
  const title = localizeContent((entry?.name ?? {}) as Record<string, string>)

  const { data: manifest } = useQuery({
    queryKey: ['collection-manifest', entry?.hash],
    queryFn: () => ensureManifestBody<CollectionItemManifest>(entry?.hash ?? ''),
    enabled: !!entry,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const byId = new Map(shelf.books.map((b) => [b.id, b]))
  const items = manifest ? manifest.sections.flatMap((s) => itemsOf(s.blocks)) : []

  return (
    <ScreenLayout measure="column">
      <Stack.Screen options={{ title }} />
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={title || t('shelf.lists')} />
        {manifest?.prologue ? (
          <Typography variant="caption" fontSize="$3" lineHeight={24}>
            {localizeContent(manifest.prologue.body)}
          </Typography>
        ) : null}
        <YStack gap="$lg">
          {items.map((item, i) => {
            const book = byId.get(item.ref)
            if (!book) return null
            return (
              <ListEntry
                key={item.ref}
                number={i + 1}
                book={book}
                byline={[book.author, readingTime(book.minutes)].filter(Boolean).join(' · ')}
                why={item.why}
              />
            )
          })}
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}

// The number and the cover stand centred on the entry's text.
const titleLine = 24

function ListEntry({
  number,
  book,
  byline,
  why,
}: {
  number: number
  book: ShelfBook
  byline: string
  why?: string
}) {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <AnimatedPressable
      onPress={() => router.push(bookHref(book))}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.openShelfItem', { name: book.title })}
    >
      <XStack gap="$md" alignItems="flex-start">
        <Typography
          variant="label"
          color="$accent"
          fontSize="$5"
          lineHeight={titleLine}
          width={22}
          alignSelf="center"
          fontVariant={['tabular-nums']}
        >
          {number}
        </Typography>
        <YStack alignSelf="center">
          <BookThumb book={book} />
        </YStack>
        <YStack flex={1} gap={2}>
          <Typography fontSize="$3" lineHeight={titleLine}>
            {book.title}
          </Typography>
          {byline ? <Typography variant="caption">{byline}</Typography> : null}
          {why ? (
            <Typography tone="muted" fontSize="$2" lineHeight={20} paddingTop="$xs">
              {why}
            </Typography>
          ) : null}
        </YStack>
      </XStack>
    </AnimatedPressable>
  )
}
