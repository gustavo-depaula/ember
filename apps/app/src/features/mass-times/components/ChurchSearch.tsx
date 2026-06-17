import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'
import { YStack } from 'tamagui'
import { SearchInput, Skeleton, Typography } from '@/components'
import { useChurchSearch } from '@/lib/mass-times'
import { useDebounced } from '@/lib/useDebounced'
import { ChurchSearchRow } from './ChurchSearchRow'
import { QueryError } from './QueryError'

const minLength = 2

// Full-text search over church names. Debounced; below `minLength` we show a hint rather than query.
export function ChurchSearch() {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const query = useDebounced(text.trim(), 300)
  const { data, isLoading, isError, refetch } = useChurchSearch(query)
  const active = query.length >= minLength

  return (
    <YStack flex={1} gap="$md">
      <SearchInput
        value={text}
        onChangeText={setText}
        placeholder={t('massTimes.searchPlaceholder')}
        autoFocus
      />
      {!active ? (
        <Centered>{t('massTimes.searchHint')}</Centered>
      ) : isLoading ? (
        <YStack gap="$sm">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={72} borderRadius={12} />
          ))}
        </YStack>
      ) : isError ? (
        <QueryError onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <Centered>{t('massTimes.noResults')}</Centered>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ChurchSearchRow church={item} />}
          ItemSeparatorComponent={() => <YStack height="$sm" />}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </YStack>
  )
}

function Centered({ children }: { children: string }) {
  return (
    <YStack paddingTop="$lg" alignItems="center">
      <Typography variant="annotation">{children}</Typography>
    </YStack>
  )
}
