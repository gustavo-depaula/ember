import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { getEntriesByKind } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

type BookRow = {
  id: string
  bareId: string
  title: string
  author?: string
}

// A shelf of book-shaped covers. ScreenLayout caps content at 640 and pads $lg
// (24) each side; three covers fit a phone comfortably, more on a wide column.
const columns = 3
const gutter = 14
function useCoverSize(): number {
  const { width } = useWindowDimensions()
  const content = Math.min(width, 640) - 24 * 2
  return Math.floor((content - gutter * (columns - 1)) / columns)
}

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export default function AllBooksScreen() {
  const { t } = useTranslation()
  const size = useCoverSize()
  const catalogVersion = useCatalogVersion()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const books = useMemo<BookRow[]>(() => {
    const out: BookRow[] = []
    for (const [id, entry] of getEntriesByKind('book')) {
      if (/example|starter|sandbox/.test(id)) continue
      const author = entry.author ? localizeContent(entry.author as Record<string, string>) : ''
      out.push({
        id,
        bareId: bareId(id),
        title: localizeContent(entry.name ?? entry.title ?? {}) || bareId(id),
        author: author || undefined,
      })
    }
    out.sort((a, b) => a.title.localeCompare(b.title))
    return out
  }, [catalogVersion])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('pray.allBooks')} />

        {books.length === 0 ? (
          <YStack alignItems="center" gap="$sm" paddingVertical="$lg" paddingHorizontal="$lg">
            <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
              {t('browse.emptyState')}
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="$colorSecondary"
              textAlign="center"
              fontStyle="italic"
            >
              {t('browse.registryOffline')}
            </Text>
          </YStack>
        ) : (
          <XStack flexWrap="wrap" gap={gutter}>
            {books.map((b) => (
              <ArtCoverCard
                key={b.id}
                title={b.title}
                subtitle={b.author}
                image={artFor(b.id)}
                tone={toneForKey(b.id)}
                size={size}
                aspectRatio={1.5}
                radius={6}
                href={{ pathname: '/browse/book/[bookId]', params: { bookId: b.bareId } }}
              />
            ))}
          </XStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
