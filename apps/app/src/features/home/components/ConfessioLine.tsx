import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useLastConfession } from '@/features/confessio'
import { useToday } from '@/hooks/useToday'
import { WhisperLine } from './WhisperLine'

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
    <WhisperLine
      onPress={() => router.push('/confessio')}
      label={label}
      accessibilityLabel={t('confessio.title')}
      tone="quiet"
    />
  )
}
