import { CalendarCheck, Check } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useTheme, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { successBuzz } from '@/lib/haptics'
import { useCheckInsStore, useChurchAttendance } from '../checkins'
import { OutlineChip } from './OutlineChip'

// "I attended Mass here" — a quiet, on-device devotional check-in. Records a timestamped visit with a
// success haptic + a brief confirmation, and shows how many times you've prayed here.
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
  const [justChecked, setJustChecked] = useState(false)

  const onPress = () => {
    void successBuzz()
    checkIn(church)
    setJustChecked(true)
    setTimeout(() => setJustChecked(false), 1600)
  }

  return (
    <YStack gap="$xs" alignItems="flex-start">
      <AnimatedPressable onPress={onPress} accessibilityRole="button">
        <OutlineChip
          gap="$xs"
          paddingHorizontal="$md"
          paddingVertical="$sm"
          backgroundColor={justChecked ? '$accent' : 'transparent'}
        >
          {justChecked ? (
            <Check size={16} color={theme.background?.val} />
          ) : (
            <CalendarCheck size={16} color={theme.accent?.val} />
          )}
          <Typography
            variant="interface"
            fontSize="$3"
            color={justChecked ? '$background' : '$color'}
          >
            {t(justChecked ? 'massTimes.checkedIn' : 'massTimes.checkIn')}
          </Typography>
        </OutlineChip>
      </AnimatedPressable>
      {count > 0 ? (
        <Animated.View entering={FadeIn.duration(200)}>
          <Typography variant="annotation">
            {t('massTimes.attendanceCount', { count })}
            {last
              ? ` · ${t('massTimes.lastAttended', {
                  date: new Date(last).toLocaleDateString(locale, {
                    month: 'short',
                    day: 'numeric',
                  }),
                })}`
              : ''}
          </Typography>
        </Animated.View>
      ) : null}
    </YStack>
  )
}
