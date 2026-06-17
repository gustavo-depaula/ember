import { MapPin, Navigation } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'
import type { DeviceLocation } from '../useDeviceLocation'

// Whether we're showing the user's real position or the São Paulo default, plus a tap target to ask
// for (or refresh) GPS. Shared by the list and map views.
export function LocationBar({ location }: { location: DeviceLocation }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const labelKey =
    location.status === 'locating'
      ? 'massTimes.locating'
      : location.isFallback
        ? 'massTimes.nearDefault'
        : 'massTimes.near'

  return (
    <AnimatedPressable
      onPress={() => {
        void lightTap()
        location.request()
      }}
      disabled={location.status === 'locating'}
    >
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
    </AnimatedPressable>
  )
}
