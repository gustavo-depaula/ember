import { useQuery } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack } from 'tamagui'

import { InlineRetry, PageHeader, Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { bareId } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import {
  type ChantBook,
  type ChantBookSection,
  chantSummary,
  loadChantBooks,
  romanMode,
} from '@/features/chant'
import { localizeContent } from '@/lib/i18n'

type Row =
  | { kind: 'book'; key: string; book: ChantBook }
  // A section sung through, opened as one: a Mass of the Kyriale.
  | { kind: 'section'; key: string; section: ChantBookSection }
  // A section that is a shelf: its name, then each chant on it.
  | { kind: 'shelf'; key: string; section: ChantBookSection }
  | { kind: 'chant'; key: string; section: ChantBookSection; chant: string }

function rowsOf(books: ChantBook[]): Row[] {
  return books.flatMap((book): Row[] => [
    { kind: 'book', key: book.id, book },
    ...book.sections.flatMap((section): Row[] => {
      const key = `${book.id}/${section.id}`
      if (book.list !== 'chants') return [{ kind: 'section', key, section }]
      return [
        { kind: 'shelf', key, section },
        ...section.chants.map(
          (chant): Row => ({ kind: 'chant', key: `${key}/${chant}`, section, chant }),
        ),
      ]
    }),
  ])
}

// The chant library by its tables of contents: each book, then what it holds.
export default function ChantLibraryScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const catalogVersion = useCatalogVersion()

  const booksQuery = useQuery({
    queryKey: ['chant-books', catalogVersion],
    queryFn: loadChantBooks,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const rows = useMemo(() => rowsOf(booksQuery.data ?? []), [booksQuery.data])

  const open = useCallback(
    (chant: string, section: ChantBookSection) =>
      router.push({
        pathname: '/browse/chant/[chantId]',
        params: { chantId: bareId(chant), section: section.id },
      }),
    [router],
  )

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.kind === 'book') {
        return (
          <YStack paddingTop="$lg" paddingBottom="$sm" gap="$xs">
            <Typography variant="section-title">{localizeContent(item.book.name)}</Typography>
            <Typography tone="muted">{localizeContent(item.book.description)}</Typography>
          </YStack>
        )
      }
      if (item.kind === 'shelf') {
        return (
          <Typography variant="label" paddingTop="$md" paddingBottom="$xs">
            {localizeContent(item.section.title)}
          </Typography>
        )
      }
      if (item.kind === 'chant') {
        const { name, mode } = chantSummary(item.chant)
        return (
          <Pressable
            onPress={() => open(item.chant, item.section)}
            accessibilityRole="link"
            accessibilityLabel={t('a11y.openChants', { name })}
          >
            <XStack minHeight={44} alignItems="center" gap="$md">
              <Typography flex={1} fontSize="$4" numberOfLines={1}>
                {name}
              </Typography>
              {mode && <Typography variant="annotation">{romanMode(mode)}</Typography>}
            </XStack>
          </Pressable>
        )
      }
      const { section } = item
      const heading = localizeContent(section.title)
      return (
        <Pressable
          onPress={() => open(section.chants[0], section)}
          accessibilityRole="link"
          accessibilityLabel={t('a11y.openChants', {
            name: section.name ? `${heading}, ${section.name}` : heading,
          })}
        >
          <YStack paddingVertical="$sm" minHeight={44} justifyContent="center">
            <Typography fontSize="$4">
              {heading}
              {section.name && (
                <Typography fontSize="$4" fontStyle="italic" tone="muted">
                  {`  ${section.name}`}
                </Typography>
              )}
            </Typography>
            <Typography variant="annotation" numberOfLines={1}>
              {section.occasion
                ? localizeContent(section.occasion)
                : section.chants.map((id) => chantSummary(id).name).join(' · ')}
            </Typography>
          </YStack>
        </Pressable>
      )
    },
    [open, t],
  )

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title: t('chant.title') }} />
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 640,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + bottomClearance + 24,
        }}
        contentInsetAdjustmentBehavior="never"
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <YStack paddingTop="$lg" gap="$sm">
            <PageHeader title={t('chant.title')} />
            {booksQuery.isError && <InlineRetry onRetry={() => booksQuery.refetch()} />}
          </YStack>
        }
        ListFooterComponent={
          <Typography variant="reference" paddingTop="$lg">
            {t('chant.license')}
          </Typography>
        }
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}

const keyExtractor = (row: Row) => row.key
