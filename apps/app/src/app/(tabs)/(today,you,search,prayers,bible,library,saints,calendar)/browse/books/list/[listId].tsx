import { useQuery } from '@tanstack/react-query'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import type { CollectionBlock, CollectionItemManifest } from '@/content/manifestTypes'
import { BookRow, useReadingTime, useShelf } from '@/features/books/shelf'
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
        <YStack gap="$md">
          {items.map((item, i) => {
            const book = byId.get(item.ref)
            if (!book) return null
            return (
              <XStack key={item.ref} gap="$md" alignItems="flex-start">
                <Typography
                  variant="label"
                  color="$accent"
                  fontSize="$5"
                  lineHeight={28}
                  width={22}
                  paddingTop="$sm"
                  fontVariant={['tabular-nums']}
                >
                  {i + 1}
                </Typography>
                <YStack flex={1}>
                  <BookRow
                    book={book}
                    detail={[book.author, readingTime(book.minutes)].filter(Boolean).join(' · ')}
                  />
                  {item.why ? (
                    <Typography tone="muted" fontSize="$2" lineHeight={20} paddingLeft={56}>
                      {item.why}
                    </Typography>
                  ) : null}
                </YStack>
              </XStack>
            )
          })}
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
