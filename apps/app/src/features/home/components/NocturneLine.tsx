import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useIsNocturneWindow } from '@/features/nocturne'
import { WhisperLine } from './WhisperLine'

export function NocturneLine() {
  const { t } = useTranslation()
  const router = useRouter()
  const night = useIsNocturneWindow()

  if (!night) return null

  return (
    <WhisperLine
      onPress={() => router.push('/nocturne')}
      label={t('nocturne.homeLine')}
      accessibilityLabel={t('nocturne.title')}
      tone="quiet"
    />
  )
}
