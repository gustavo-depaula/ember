import { MapPin, Navigation } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { Skeleton, Typography } from '@/components'
import { useNearbyChurches } from '@/lib/mass-times'
import type { DeviceLocation } from '../useDeviceLocation'
import { useDeviceLocation } from '../useDeviceLocation'
import { ChurchListItem } from './ChurchListItem'
import { QueryError } from './QueryError'

const radiusKm = 15
const fetchLimit = 60

export function MassTimesNearby() {
  const { t, i18n } = useTranslation()
  const location = useDeviceLocation()
  const { data, isLoading, isError, refetch } = useNearbyChurches({
    lat: location.coords.lat,
    lng: location.coords.lng,
    radiusKm,
    limit: fetchLimit,
  })

  return (
    <YStack flex={1} gap="$md">
      <LocationBar location={location} />
      {isLoading ? (
        <LoadingList />
      ) : isError ? (
        <QueryError onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <YStack gap="$xs" paddingTop="$lg" alignItems="center">
          <Typography variant="interface">{t('massTimes.empty')}</Typography>
          <Typography variant="annotation">{t('massTimes.emptyHint')}</Typography>
        </YStack>
      ) : (
        <FlatList
          data={data}
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

// Whether we're showing the user's real position or the São Paulo default, plus a tap target to ask
// for (or refresh) GPS.
function LocationBar({ location }: { location: DeviceLocation }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const labelKey =
    location.status === 'locating'
      ? 'massTimes.locating'
      : location.isFallback
        ? 'massTimes.nearDefault'
        : 'massTimes.near'

  return (
    <Pressable onPress={() => location.request()} disabled={location.status === 'locating'}>
      <XStack alignItems="center" gap="$xs">
        <MapPin size={14} color={theme.colorSecondary?.val} />
        <Typography variant="reference">{t(labelKey)}</Typography>
        {location.isFallback && location.status !== 'locating' ? (
          <XStack alignItems="center" gap={2} marginLeft="$xs">
            <Navigation size={12} color={theme.accent?.val} />
            <Typography variant="reference" color="$accent">
              {t('massTimes.useMyLocation')}
            </Typography>
          </XStack>
        ) : null}
      </XStack>
    </Pressable>
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
