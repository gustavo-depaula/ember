import type { ServiceKind } from '@ember/api'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { nextService, wallClockNow } from '@/lib/mass-times'
import { daysAway, formatDistanceKm, formatTimeOfDay, shortDayLabel } from '../format'
import { ChurchRow } from './ChurchRow'
import { clockFigures, SmallCaps, timeColumnWidth } from './SheetType'

// One church in the nearby list, timetable-style: its next service (Mass, or the filtered kind) leads
// as a time column so the list scans by "when" before "where". Today's times stand in full ink with
// the day in rubric red; later days recede to grey.
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
  const isToday = upcoming ? daysAway(upcoming.occurrence.date, now) <= 0 : false
  const where = church.address ?? church.city

  return (
    <ChurchRow
      name={church.name}
      trailing={
        church.distanceKm === undefined ? undefined : formatDistanceKm(church.distanceKm, locale)
      }
      leading={
        <YStack width={timeColumnWidth} gap={2}>
          <Typography
            variant="sacred-title"
            textAlign="left"
            fontSize={22}
            lineHeight={26}
            fontVariant={[...clockFigures]}
            color={isToday ? '$color' : '$colorSecondary'}
          >
            {upcoming ? formatTimeOfDay(upcoming.occurrence.startTime) : '—'}
          </Typography>
          {upcoming ? (
            <SmallCaps fontSize={10} color={isToday ? '$colorBurgundy' : '$colorSecondary'}>
              {shortDayLabel(upcoming.occurrence.date, now, t, locale)}
            </SmallCaps>
          ) : null}
        </YStack>
      }
      onPress={() => onSelect(church)}
    >
      {upcoming ? null : (
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
