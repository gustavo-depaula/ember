import { CalendarCheck } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, YStack } from 'tamagui'
import { Typography } from '@/components'
import { useCheckInsStore, useChurchAttendance } from '../checkins'
import { OutlineChip } from './OutlineChip'

// "I attended Mass here" — a quiet, on-device devotional log. Records a timestamped visit and shows
// how many times you've prayed here.
export function CheckInButton({
  church,
  locale,
}: {
  church: { id: string; name: string }
  locale: string
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const checkIn = useCheckInsStore((s) => s.checkIn)
  const { count, last } = useChurchAttendance(church.id)

  return (
    <YStack gap="$xs" alignItems="flex-start">
      <Pressable onPress={() => checkIn(church)} accessibilityRole="button">
        <OutlineChip gap="$xs" paddingHorizontal="$md" paddingVertical="$sm">
          <CalendarCheck size={16} color={theme.accent?.val} />
          <Typography variant="interface" fontSize="$3">
            {t('massTimes.checkIn')}
          </Typography>
        </OutlineChip>
      </Pressable>
      {count > 0 ? (
        <Typography variant="annotation">
          {t('massTimes.attendanceCount', { count })}
          {last
            ? ` · ${t('massTimes.lastAttended', {
                date: new Date(last).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
              })}`
            : ''}
        </Typography>
      ) : null}
    </YStack>
  )
}
