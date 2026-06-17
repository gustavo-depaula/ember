import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'
import { YStack } from 'tamagui'
import { Skeleton, Typography } from '@/components'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { ChurchListItem } from './ChurchListItem'
import { LocationBar } from './LocationBar'
import { QueryError } from './QueryError'

// The nearby churches as a distance-sorted list. Presentational: the shared location + query come in
// via `nearby` (see useMassTimesNearby) so the list and map stay in sync.
export function MassTimesList({ nearby }: { nearby: MassTimesNearby }) {
  const { t, i18n } = useTranslation()
  const { location, churches, isLoading, isError, refetch } = nearby

  return (
    <YStack flex={1} gap="$md">
      <LocationBar location={location} />
      {isLoading ? (
        <LoadingList />
      ) : isError ? (
        <QueryError onRetry={refetch} />
      ) : !churches || churches.length === 0 ? (
        <YStack gap="$xs" paddingTop="$lg" alignItems="center">
          <Typography variant="interface">{t('massTimes.empty')}</Typography>
          <Typography variant="annotation">{t('massTimes.emptyHint')}</Typography>
        </YStack>
      ) : (
        <FlatList
          data={churches}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ChurchListItem church={item} locale={i18n.language} />}
          ItemSeparatorComponent={() => <YStack height="$sm" />}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </YStack>
  )
}

function LoadingList() {
  return (
    <YStack gap="$sm">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} height={92} borderRadius={12} />
      ))}
    </YStack>
  )
}
