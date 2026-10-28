import type { ServiceKind } from '@ember/api'
import { useTranslation } from 'react-i18next'
import { Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { serviceEnd } from '@/lib/mass-times'
import { clockOf, visitDay, type When } from '../agenda'
import { formatDistanceKm, formatTimeOfDay, kindLabel, serviceKindOrder } from '../format'
import { ChurchRow } from './ChurchRow'

// One church in the visit list, nearest first: what is scheduled there on the chosen day, every kind,
// and what is on right now. It never says open or closed — we hold no opening hours, and many
// churches keep their doors open between services.
export function VisitListItem({
  church,
  when,
  locale,
  onSelect,
}: {
  church: NearbyChurch
  when: When
  locale: string
  onSelect: (church: NearbyChurch) => void
}) {
  const { t } = useTranslation()
  const { services, underway } = visitDay(church, when)
  const where = church.address ?? church.city

  // "Missa 07:00, 19:30 · Adoração 08:00–18:00"
  const day = serviceKindOrder
    .map((kind) => {
      const times = services
        .filter((u) => u.service.kind === kind)
        .map((u) =>
          u.service.endTime
            ? `${formatTimeOfDay(u.service.startTime)}–${formatTimeOfDay(u.service.endTime)}`
            : formatTimeOfDay(u.service.startTime),
        )
      return times.length > 0 ? `${kindLabel(kind, t)} ${times.join(', ')}` : undefined
    })
    .filter(Boolean)
    .join(' · ')

  return (
    <ChurchRow
      name={church.name}
      trailing={
        church.distanceKm === undefined ? undefined : formatDistanceKm(church.distanceKm, locale)
      }
      onPress={() => onSelect(church)}
    >
      {underway ? (
        <Typography variant="annotation" color="$colorBurgundy" numberOfLines={1}>
          {t('massTimes.onNow', {
            kind: kindLabel(underway.service.kind as ServiceKind, t),
            time: clockOf(serviceEnd(underway)),
          })}
        </Typography>
      ) : null}
      <Typography variant="annotation" numberOfLines={2}>
        {day ||
          (church.services.length > 0 ? t('massTimes.nothingThatDay') : t('massTimes.notListed'))}
      </Typography>
      {where ? (
        <Typography variant="annotation" numberOfLines={1}>
          {where}
        </Typography>
      ) : null}
    </ChurchRow>
  )
}
