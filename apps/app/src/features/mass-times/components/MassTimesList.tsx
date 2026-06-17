import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'
import { YStack } from 'tamagui'
import { Skeleton, Typography } from '@/components'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { ChurchListItem } from './ChurchListItem'
import { LocationBar } from './LocationBar'
import { MassLogCard } from './MassLogCard'
import { QueryError } from './QueryError'
import { SavedChurches } from './SavedChurches'

// The nearby churches as a distance-sorted list, with the Saved section pinned above. Presentational:
// the shared location + query come in via `nearby` (see useMassTimesNearby) so list and map stay in
// sync. One FlatList carries it all so Saved + Nearby scroll together and Saved shows in every state.
export function MassTimesList({ nearby }: { nearby: MassTimesNearby }) {
  const { t, i18n } = useTranslation()
  const { location, churches, isLoading, isError, refetch } = nearby
  const data = isLoading || isError ? [] : (churches ?? [])

  return (
    <YStack flex={1} gap="$md">
      <LocationBar location={location} />
      <FlatList
        data={data}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => <ChurchListItem church={item} locale={i18n.language} />}
        ListHeaderComponent={
          <YStack gap="$sm">
            <MassLogCard />
            <SavedChurches />
            {data.length > 0 ? (
              <Typography variant="label">{t('massTimes.nearbyHeading')}</Typography>
            ) : null}
          </YStack>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingList />
          ) : isError ? (
            <QueryError onRetry={refetch} />
          ) : (
            <YStack gap="$xs" paddingTop="$lg" alignItems="center">
              <Typography variant="interface">{t('massTimes.empty')}</Typography>
              <Typography variant="annotation">{t('massTimes.emptyHint')}</Typography>
            </YStack>
          )
        }
        ItemSeparatorComponent={() => <YStack height="$sm" />}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
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
