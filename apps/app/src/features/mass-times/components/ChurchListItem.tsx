import type { ServiceKind } from '@ember/api'
import { useTranslation } from 'react-i18next'
import { Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { nextService, wallClockNow } from '@/lib/mass-times'
import { dayLabel, formatDistanceKm, formatTimeOfDay, kindLabel } from '../format'
import { ChurchRow } from './ChurchRow'

// One church in the nearby list (and the map's tap card): name, its next upcoming service (Mass by
// default, or the filtered kind) as a gold highlight line, then address · distance, muted.
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
  const where = [church.address, formatDistanceKm(church.distanceKm, locale)]
    .filter(Boolean)
    .join(' · ')

  return (
    <ChurchRow name={church.name} onPress={() => onSelect(church)}>
      {upcoming ? (
        <Typography variant="interface" fontSize="$2" color="$accent" numberOfLines={1}>
          {nextLabel} · {dayLabel(upcoming.occurrence.date, now, t, locale)}{' '}
          {formatTimeOfDay(upcoming.occurrence.startTime, locale)}
        </Typography>
      ) : (
        <Typography variant="caption" tone="muted">
          {church.services.length > 0 ? t('massTimes.noUpcoming') : t('massTimes.notListed')}
        </Typography>
      )}
      <Typography variant="annotation" numberOfLines={1}>
        {where}
      </Typography>
    </ChurchRow>
  )
}
