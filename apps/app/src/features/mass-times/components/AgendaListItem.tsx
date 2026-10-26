import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { type AgendaRow, catchStatus, clockOf, type TravelMode } from '../agenda'
import { daysAway, formatDistanceKm, formatTimeOfDay } from '../format'
import { ChurchRow } from './ChurchRow'
import { clockFigures, SmallCaps, timeColumnWidth } from './SheetType'

// One occurrence in the timetable: its time leads, then the church, and — for today — whether you
// can still make it on foot or by car. A Mass you can no longer reach recedes rather than vanishing,
// so the list doesn't reshuffle as the minutes pass.
export function AgendaListItem({
  row,
  mode,
  locale,
  onSelect,
}: {
  row: AgendaRow
  mode?: TravelMode // set for today's lists; no travel advice for another day
  locale: string
  onSelect: (church: NearbyChurch) => void
}) {
  const { t } = useTranslation()
  const { church, upcoming, end, now } = row
  const isToday = daysAway(upcoming.occurrence.date, now) <= 0
  const span = upcoming.service.kind !== 'mass'
  const status = mode ? catchStatus(row, mode) : undefined
  const missed = status?.status === 'tooLate' || status?.status === 'started'
  const where = church.address ?? church.city

  const statusText = (() => {
    if (!status) return undefined
    const travel = (minutes: number) =>
      t(mode === 'car' ? 'massTimes.travelCar' : 'massTimes.travelFoot', { count: minutes })
    switch (status.status) {
      case 'leaveIn':
        // Past an hour, a clock time reads more easily than a count of minutes.
        return `${
          status.minutes < 60
            ? t('massTimes.leaveIn', { count: status.minutes })
            : t('massTimes.leaveBy', { time: status.by })
        } · ${travel(status.travel)}`
      case 'leaveNow':
        return `${t('massTimes.leaveNow')} · ${travel(status.travel)}`
      case 'tooLate':
        return t('massTimes.tooLate')
      case 'started':
        return t('massTimes.started')
      case 'underway':
        return status.travel === undefined
          ? t('massTimes.underway')
          : `${t('massTimes.underway')} · ${travel(status.travel)}`
    }
  })()
  const statusColor =
    status?.status === 'leaveIn' || status?.status === 'underway'
      ? '$colorGreen'
      : status?.status === 'leaveNow'
        ? '$accent'
        : '$colorSecondary'

  return (
    <ChurchRow
      name={church.name}
      trailing={
        church.distanceKm === undefined ? undefined : formatDistanceKm(church.distanceKm, locale)
      }
      leading={
        <YStack width={timeColumnWidth} gap={2} opacity={missed ? 0.45 : 1}>
          <Typography
            variant="sacred-title"
            textAlign="left"
            fontSize={22}
            lineHeight={26}
            fontVariant={[...clockFigures]}
            color={isToday ? '$color' : '$colorSecondary'}
          >
            {formatTimeOfDay(upcoming.occurrence.startTime)}
          </Typography>
          {/* Every row of a list shares its day, which the sentence names; a span says when it ends. */}
          {span ? (
            <SmallCaps fontSize={10}>{t('massTimes.untilShort', { time: clockOf(end) })}</SmallCaps>
          ) : null}
        </YStack>
      }
      onPress={() => onSelect(church)}
    >
      {where ? (
        <Typography variant="annotation" numberOfLines={1}>
          {where}
        </Typography>
      ) : null}
      {statusText ? (
        <Typography variant="annotation" color={statusColor} numberOfLines={1}>
          {statusText}
        </Typography>
      ) : null}
    </ChurchRow>
  )
}
