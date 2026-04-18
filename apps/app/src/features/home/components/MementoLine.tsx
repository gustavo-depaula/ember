import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useIsMementoEvening } from '@/features/memento'
import { WhisperLine } from './WhisperLine'

export function MementoLine() {
  const { t } = useTranslation()
  const router = useRouter()
  const evening = useIsMementoEvening()

  if (!evening) return null

  return (
    <WhisperLine
      onPress={() => router.push('/memento')}
      label={t('memento.homeLine')}
      accessibilityLabel={t('memento.title')}
      tone="quiet"
    />
  )
}
