import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'
import { YStack } from 'tamagui'
import { Skeleton, Typography } from '@/components'
import { useChurchSearch } from '@/lib/mass-times'
import { useDebounced } from '@/lib/useDebounced'
import { AnimatedRow } from './AnimatedRow'
import { ChurchSearchRow } from './ChurchSearchRow'
import { QueryError } from './QueryError'

const minLength = 2

// Full-text search results. The query comes from the native header search bar (see the search route);
// this just debounces it and renders the rows, filling the screen under the search bar.
export function ChurchSearch({ query }: { query: string }) {
  const { t } = useTranslation()
  const debounced = useDebounced(query.trim(), 300)
  const { data, isLoading, isError, refetch } = useChurchSearch(debounced)
  const active = debounced.length >= minLength

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlatList
        data={active && !isLoading && !isError ? (data ?? []) : []}
        keyExtractor={(c) => c.id}
        renderItem={({ item, index }) => (
          <AnimatedRow index={index}>
            <ChurchSearchRow church={item} />
          </AnimatedRow>
        )}
        ItemSeparatorComponent={() => <YStack height="$sm" />}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 120 }}
        ListEmptyComponent={
          <YStack paddingTop="$xl" alignItems="center">
            {!active ? (
              <Typography variant="annotation">{t('massTimes.searchHint')}</Typography>
            ) : isLoading ? (
              <YStack gap="$sm" alignSelf="stretch">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} height={72} borderRadius={12} />
                ))}
              </YStack>
            ) : isError ? (
              <QueryError onRetry={refetch} />
            ) : (
              <Typography variant="annotation">{t('massTimes.noResults')}</Typography>
            )}
          </YStack>
        }
      />
    </YStack>
  )
}
