import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text } from 'tamagui'

import { useLastConfession } from '@/features/confessio'
import { useToday } from '@/hooks/useToday'

export function ConfessioLine() {
  const { t } = useTranslation()
  const router = useRouter()
  const now = useToday()
  const last = useLastConfession()

  if (!last) return null

  const days = differenceInCalendarDays(now, parseISO(last.date))
  const label =
    days === 0
      ? t('confessio.homeToday')
      : days === 1
        ? t('confessio.homeYesterday')
        : t('confessio.homeSince', { count: days })

  return (
    <Pressable
      onPress={() => router.push('/confessio')}
      hitSlop={6}
      accessibilityRole="link"
      accessibilityLabel={t('confessio.title')}
    >
      <Text
        fontFamily="$script"
        fontSize="$2"
        color="$colorSecondary"
        fontStyle="italic"
        opacity={0.75}
        textAlign="center"
        paddingVertical="$xs"
      >
        {label}
      </Text>
    </Pressable>
  )
}
