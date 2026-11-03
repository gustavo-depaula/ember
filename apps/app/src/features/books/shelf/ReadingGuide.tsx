import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import { localizeContent } from '@/lib/i18n'
import type { ShelfAuthor } from './catalog'
import { type AuthorGuide, type GuideEntry, type GuideSection, resolveGuide } from './guide'
import { bookHref, languagesOf, RowCover, useReadingTime } from './parts'

/**
 * An author's works in their guide's order, or undefined while the author's
 * file loads or when it has no guide (the page then lists the works by title).
 */
export function useReadingGuide(author: ShelfAuthor | undefined): {
  sections: GuideSection[] | undefined
  pending: boolean
} {
  const { t } = useTranslation()
  const hash = author ? getEntry(`author/${author.id}`)?.hash : undefined
  const { data, isPending } = useQuery({
    queryKey: ['author-guide', hash],
    queryFn: async () =>
      (await ensureManifestBody<{ guide?: AuthorGuide }>(hash ?? '')).guide ?? null,
    enabled: !!hash,
    staleTime: Number.POSITIVE_INFINITY,
  })
  if (!author || !data) return { sections: undefined, pending: !!hash && isPending }
  return {
    sections: resolveGuide(data, author.books, localizeContent, t('shelf.otherWorks')),
    pending: false,
  }
}

// A section longer than this becomes a carousel of columns this tall.
const columnRows = 4
const carouselOver = 5
// How much of the next column shows at the edge, so the row reads as swipeable.
const peek = 36

/**
 * One section of a reading guide: its title, its works in a grouped block
 * (a carousel of blocks when it runs long), and its note.
 */
export function GuideSectionView({ section }: { section: GuideSection }) {
  const [width, setWidth] = useState(0)
  const long = section.entries.length > carouselOver
  const columns: GuideEntry[][] = []
  for (let i = 0; i < section.entries.length; i += columnRows)
    columns.push(section.entries.slice(i, i + columnRows))
  const column = width - peek

  return (
    <YStack gap="$xs" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <XStack justifyContent="space-between" alignItems="baseline" paddingHorizontal="$sm">
        <Typography variant="label" textTransform="uppercase" letterSpacing={1.2} tone="muted">
          {section.title}
        </Typography>
        {long ? (
          <Typography variant="annotation" tone="muted" fontVariant={['tabular-nums']}>
            {section.entries.length}
          </Typography>
        ) : null}
      </XStack>
      {long ? (
        width > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={column + 12}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 12 }}
          >
            {columns.map((entries) => (
              <YStack key={entries[0].book.id} width={column}>
                <GroupBlock entries={entries} />
              </YStack>
            ))}
          </ScrollView>
        )
      ) : (
        <GroupBlock entries={section.entries} />
      )}
      {section.note ? (
        <Typography variant="caption" tone="muted" paddingHorizontal="$sm">
          {section.note}
        </Typography>
      ) : null}
    </YStack>
  )
}

/** Every section of a guide, one under the other. */
export function ReadingGuide({ sections }: { sections: GuideSection[] }) {
  return (
    <YStack gap="$lg">
      {sections.map((section) => (
        <GuideSectionView key={section.title} section={section} />
      ))}
    </YStack>
  )
}

// The inset grouped block: rows on one surface, hairlines between them
// starting past the covers.
function GroupBlock({ entries }: { entries: GuideEntry[] }) {
  return (
    <YStack backgroundColor="$backgroundSurface" borderRadius={12} overflow="hidden">
      {entries.map((entry, i) => (
        <Fragment key={entry.book.id}>
          {i > 0 && (
            <YStack
              height={0.5}
              backgroundColor="$borderColor"
              marginLeft={68}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          )}
          <GuideRow entry={entry} />
        </Fragment>
      ))}
    </YStack>
  )
}

function GuideRow({ entry: { book, why } }: { entry: GuideEntry }) {
  const { t } = useTranslation()
  const router = useRouter()
  const readingTime = useReadingTime()
  const detail = [readingTime(book.minutes), languagesOf(book)].filter(Boolean).join(' · ')
  return (
    <AnimatedPressable
      onPress={() => router.push(bookHref(book))}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.openShelfItem', { name: book.title })}
    >
      <XStack
        gap="$md"
        alignItems="center"
        paddingHorizontal="$md"
        paddingVertical="$sm"
        minHeight={72}
      >
        <RowCover book={book} />
        <YStack flex={1} gap={2}>
          <Typography fontSize="$3" numberOfLines={2}>
            {book.title}
          </Typography>
          {why ? (
            <Typography variant="caption" numberOfLines={2}>
              {why}
            </Typography>
          ) : null}
          {detail ? (
            <Typography variant="annotation" tone="muted">
              {detail}
            </Typography>
          ) : null}
        </YStack>
        <Typography tone="muted" accessibilityElementsHidden importantForAccessibility="no">
          ›
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
