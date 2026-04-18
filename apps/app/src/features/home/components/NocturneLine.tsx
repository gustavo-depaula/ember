import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useComplinePrayed, useIsNocturneWindow } from '@/features/nocturne'
import { getToday } from '@/hooks/useToday'
import { WhisperLine } from './WhisperLine'

export function NocturneLine() {
  const { t } = useTranslation()
  const router = useRouter()
  const night = useIsNocturneWindow()
  const prayedAt = useComplinePrayed(format(getToday(), 'yyyy-MM-dd'))

  if (!night || prayedAt) return null

  return (
    <WhisperLine
      onPress={() => router.push('/nocturne')}
      label={t('nocturne.homeLine')}
      accessibilityLabel={t('nocturne.title')}
      tone="quiet"
    />
  )
}
