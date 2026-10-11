import { useQuery } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { InlineRetry, PageHeader, Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { bareId } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { type ChantBookSection, chantSummary, kyrialeId, loadChantBook } from '@/features/chant'
import { localizeContent } from '@/lib/i18n'

// The Kyriale by its table of contents: one row a Mass, which opens on its chants.
export default function KyrialeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const catalogVersion = useCatalogVersion()

  const bookQuery = useQuery({
    queryKey: ['chant-book', kyrialeId, catalogVersion],
    queryFn: async () => (await loadChantBook(kyrialeId)) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const book = bookQuery.data ?? undefined
  const title = book ? localizeContent(book.name) : t('chant.kyriale')

  const renderItem = useCallback(
    ({ item }: { item: ChantBookSection }) => {
      const heading = localizeContent(item.title)
      const names = item.chants.map((id) => chantSummary(id).name).join(' · ')
      return (
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/browse/chant/[chantId]',
              params: { chantId: bareId(item.chants[0]), section: item.id },
            })
          }
          accessibilityRole="link"
          accessibilityLabel={t('a11y.openChants', {
            name: item.name ? `${heading}, ${item.name}` : heading,
          })}
        >
          <YStack paddingVertical="$sm" minHeight={44} justifyContent="center">
            <Typography fontSize="$4">
              {heading}
              {item.name && (
                <Typography fontSize="$4" fontStyle="italic" tone="muted">
                  {`  ${item.name}`}
                </Typography>
              )}
            </Typography>
            <Typography variant="annotation" numberOfLines={1}>
              {item.occasion ? localizeContent(item.occasion) : names}
            </Typography>
          </YStack>
        </Pressable>
      )
    },
    [router, t],
  )

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title }} />
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
        data={book?.sections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <YStack paddingTop="$lg" paddingBottom="$md" gap="$sm">
            <PageHeader title={title} />
            {book && <Typography tone="muted">{localizeContent(book.description)}</Typography>}
            {bookQuery.isError && <InlineRetry onRetry={() => bookQuery.refetch()} />}
          </YStack>
        }
        ListFooterComponent={
          book && (
            <Typography variant="reference" paddingTop="$lg">
              {book.source}
            </Typography>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}

const keyExtractor = (section: ChantBookSection) => section.id
