import type { ServiceKind } from '@ember/api'
import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack } from 'tamagui'
import { Card, Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { nextService, wallClockNow } from '@/lib/mass-times'
import { dayLabel, formatDistanceKm, formatTimeOfDay, kindLabel } from '../format'
import { KindChips } from './KindChips'

// One church in the nearby list: name + distance, address, the single next upcoming service (Mass by
// default, or whichever kind is filtered), and chips for which kinds it offers. Tapping pushes the
// detail route with a native slide.
export function ChurchListItem({
  church,
  locale,
  kind = 'mass',
}: {
  church: NearbyChurch
  locale: string
  kind?: ServiceKind
}) {
  const { t } = useTranslation()
  const now = wallClockNow(church.timezone)
  const upcoming = nextService(church.services, { timezone: church.timezone, kind, now })
  const nextLabel = kind === 'mass' ? t('massTimes.nextMass') : kindLabel(kind, t)

  return (
    <Link href={{ pathname: '/mass-times/[churchId]', params: { churchId: church.id } }} asChild>
      <Pressable>
        <Card gap="$sm">
          <XStack justifyContent="space-between" alignItems="flex-start" gap="$sm">
            <Typography variant="interface" fontSize="$4" fontWeight="600" flexShrink={1}>
              {church.name}
            </Typography>
            <Typography variant="reference">
              {formatDistanceKm(church.distanceKm, locale)}
            </Typography>
          </XStack>

          {church.address ? (
            <Typography variant="annotation" numberOfLines={1}>
              {church.address}
            </Typography>
          ) : null}

          <XStack gap="$xs" alignItems="baseline">
            <Typography variant="label">{nextLabel}</Typography>
            {upcoming ? (
              <Typography variant="interface" fontSize="$3">
                {dayLabel(upcoming.occurrence.date, now, t, locale)} ·{' '}
                {formatTimeOfDay(upcoming.occurrence.startTime, locale)}
              </Typography>
            ) : (
              <Typography variant="annotation">
                {church.services.length > 0 ? t('massTimes.noUpcoming') : t('massTimes.notListed')}
              </Typography>
            )}
          </XStack>

          <KindChips services={church.services} />
        </Card>
      </Pressable>
    </Link>
  )
}
