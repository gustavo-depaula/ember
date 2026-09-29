import type { ServiceKind } from '@ember/api'
import { useTranslation } from 'react-i18next'
import { Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { nextService, wallClockNow } from '@/lib/mass-times'
import { dayLabel, formatDistanceKm, formatTimeOfDay, kindLabel } from '../format'
import { ChurchRow } from './ChurchRow'

// One church in the nearby list: name and distance, its next upcoming service (Mass by default, or
// the filtered kind) as the accent line, then the address, muted.
export function ChurchListItem({
  church,
  locale,
  kind = 'mass',
  onSelect,
}: {
  church: NearbyChurch
  locale: string
  kind?: ServiceKind
  onSelect: (church: NearbyChurch) => void
}) {
  const { t } = useTranslation()
  const now = wallClockNow(church.timezone)
  const upcoming = nextService(church.services, { timezone: church.timezone, kind, now })
  const nextLabel = kind === 'mass' ? t('massTimes.nextMass') : kindLabel(kind, t)
  const where = church.address ?? church.city

  return (
    <ChurchRow
      name={church.name}
      trailing={
        church.distanceKm === undefined ? undefined : formatDistanceKm(church.distanceKm, locale)
      }
      onPress={() => onSelect(church)}
    >
      {upcoming ? (
        <Typography variant="interface" fontSize="$2" color="$accent" numberOfLines={1}>
          {nextLabel} · {dayLabel(upcoming.occurrence.date, now, t, locale)}{' '}
          {formatTimeOfDay(upcoming.occurrence.startTime, locale)}
        </Typography>
      ) : (
        <Typography variant="annotation" numberOfLines={1}>
          {church.services.length > 0 ? t('massTimes.noUpcoming') : t('massTimes.notListed')}
        </Typography>
      )}
      {where ? (
        <Typography variant="annotation" numberOfLines={1}>
          {where}
        </Typography>
      ) : null}
    </ChurchRow>
  )
}
