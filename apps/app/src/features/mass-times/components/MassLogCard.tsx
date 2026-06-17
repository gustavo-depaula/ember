import { Link } from 'expo-router'
import { CalendarCheck, ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { Card, Typography } from '@/components'
import { useCheckInCount } from '../checkins'

// A compact entry to the Mass log, shown above the nearby list once you've checked in at least once.
export function MassLogCard() {
  const { t } = useTranslation()
  const theme = useTheme()
  const count = useCheckInCount()
  if (count === 0) return null

  return (
    <Link href="/mass-times/log" asChild>
      <Pressable>
        <Card>
          <XStack alignItems="center" justifyContent="space-between" gap="$sm">
            <XStack alignItems="center" gap="$sm" flexShrink={1}>
              <CalendarCheck size={20} color={theme.accent?.val} />
              <YStack flexShrink={1}>
                <Typography variant="label">{t('massTimes.massLog')}</Typography>
                <Typography variant="interface" fontSize="$3">
                  {t('massTimes.attendanceCount', { count })}
                </Typography>
              </YStack>
            </XStack>
            <ChevronRight size={18} color={theme.colorSecondary?.val} />
          </XStack>
        </Card>
      </Pressable>
    </Link>
  )
}
